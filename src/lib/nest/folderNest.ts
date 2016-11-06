import {Environment} from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
import { FolderJob } from "./../job/folderJob";
import {Job} from "../job/job";

const   node_watch = require("node-watch"),
        fs = require("fs"),
        path_mod = require("path"),
        tmp = require("tmp"),
        mkdirp = require("mkdirp"),
        _ = require("lodash");

/**
 * A folder nest is a nest which contains a backing folder at a specific _path. If the folder does not exist,
 * antfarm can optionally create it.
 */
export class FolderNest extends Nest {

    protected path: string;
    protected allowCreate: boolean;
    protected heldJobs: (FileJob|FolderJob)[];

    constructor(e: Environment, path?: string, allowCreate?: boolean) {
        let nest_name = path_mod.basename(path);
        super(e, nest_name);

        this.allowCreate = allowCreate;
        this.checkDirectorySync(path);
        this.path = path;
        this.heldJobs = [];
    }

    /**
     * Check if the _path for the backing folder is created. If not, optionally create it.
     * @param directory
     */
    protected checkDirectorySync(directory) {
        let fn = this;
        try {
            fs.statSync(directory);
        } catch (e) {
            if (fn.allowCreate) {
                mkdirp.sync(directory);
                fn.e.log(1, `Directory "${directory}" was created since it did not already exist.`, this);
            } else {
                fn.e.log(3, `Directory "${directory}" did not exist and was not created.`, this);
            }
        }
    }

    /**
     * Function that creates and arrives new jobs. Can produce file or folder jobs.
     * @param path
     * @param arrive
     * @returns {FolderJob|FileJob}
     */
    protected createJob(path: string, arrive = true) {

        let fl = this;
        let job;
        // Verify file still exists, node-watch fires on any change, even delete
        try {
            fs.accessSync(path, fs.F_OK);

            // Check job is folder
            let path_stats = fs.lstatSync(path);

            if (path_stats.isDirectory()) {
                job = new FolderJob(fl.e, path);
                job.createFiles(() => {
                    if (arrive) {
                        // Trigger arrived
                        fl.arrive(job);
                    }
                });
            } else if (path_stats.isFile()) {
                job = new FileJob(fl.e, path);
                if (arrive) {
                    // Trigger arrived
                    fl.arrive(job);
                }
            } else {
                throw "Path is not a file or folder!";
            }
        } catch (e) {
            // It isn't accessible
            fl.e.log(0, "Job creation ignored because file did not exist.", fl);
        }

        return job;
    }

    /**
     * Checks whether a _path starts with or contains a hidden file or a folder.
     * @param path {string}      The _path of the file that needs to be validated.
     * returns {boolean} - `true` if the source is blacklisted and otherwise `false`.
     */
    protected isUnixHiddenPath (path: string) {
        return (/(^|\/)\.[^\/\.]/g).test(path);
    };

    /**
     * Initial load of the contents of the directory.
     * @param hold {boolean}    Optional flag to hold jobs found.
     */
    public load(hold: boolean = false): void {
        let fl = this;
        fs.readdir(fl.path, (err, items) => {
            if (items) {
                items = items.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

                items.forEach((filename) => {
                    let filepath = fl.path + path_mod.sep + filename;
                    let job;
                    if (hold === false) {
                        fl.createJob(filepath, true); // Arrives as well
                    } else {
                        job = fl.createJob(filepath, false);
                        fl.holdJob(job);
                    }
                });
            }
        });
    }

    /**
     * Watches the folder.
     * @param hold {boolean}    Optional flag to hold jobs found.
     */
    public watch(hold: boolean = false): void {
        let fl = this;
        let watch_options = {
            recursive: false
        };

        fl.e.log(0, `Watching ${fl.path}`, fl, [fl.tunnel]);

        node_watch(fl.path, watch_options, filepath => {
            if (!fl.isUnixHiddenPath(filepath)) {
                let job;
                if (hold === false) {
                    job = fl.createJob(filepath, true); // Arrives as well
                } else {
                    job = fl.createJob(filepath, false);
                    fl.holdJob(job);
                }
            } else {
                fl.e.log(2, `Hidden file "${filepath}" ignored.`, fl);
            }
        });
    }

    /**
     * Watches and holds jobs found.
     */
    public watchHold(): void {
        let fl = this;
        fl.load(true);
        fl.watch(true);
    }

    /**
     * Arrive function that calls the super.
     * @param job
     */
    public arrive(job: FileJob) {
        super.arrive(job);
    }

    /**
     * Picks up a job from another nest.
     * @param job
     * @param callback      Callback is given the job in its parameter.
     */
    public take(job: (FileJob|FolderJob), callback: any) {
        let fn = this;
        // the other nest that this is taking from should provide a temporary location or local _path of the job
        let new_path = `${fn.path}/${job.name}`;

        try {
            fs.renameSync(job.path, new_path);
        } catch (err) {
            fn.e.log(3, `Job ${job.name} could not be renamed in take method.`, fn);
        }
        job.path = new_path;
        // job.nest = fn;

        callback(job);
    }

    /**
     * Loads jobs that have piled up in the nest if it was not watched.
     * No longer used.
     * @returns {Array}     Array of jobs
     */
    public getUnwatchedJobs() {
        let fl = this;
        let jobs = [];
        let fileArray = fs.readdirSync(fl.path);

        let items = fileArray.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

        items.forEach((filename) => {
            let filepath = fl.path + path_mod.sep + filename;
            let job = fl.createJob(filepath, false);
            jobs.push(job);
            // fl.holdJob(job);
        });

        return jobs;
    }

    /**
     * Returns all held jobs.
     * @returns {(FileJob|FolderJob)[]}
     */
    public getHeldJobs() {
        return this.heldJobs;
    }

    /**
     * Adds job to array of held jobs.
     * @param job
     */
    protected holdJob(job: (FileJob|FolderJob)) {
        this.heldJobs.push(job);
    }

    /**
     * Get a held job with a job id. Removes it from the held job queue,
     * so you should move it out of the folder after using this.
     * @param jobId
     * @returns {FileJob|FolderJob}
     * #### Example
     * ```js
     * var tunnel = af.createTunnel("Checkpoint example");
     * var webhook = af.createWebhookNest(["test", "example"], "get");
     * var holding_folder = af.createAutoFolderNest(["test", "checkpoint"]);
     *
     * var im = webhook.getInterfaceManager();
     *
     * // Watch for jobs, hold, and provide to the interface.
     * im.checkNest(holding_folder);
     * tunnel.watch(webhook);
     *
     * tunnel.run(function(job, nest){
     *      // Get the job_id from the webhook request
     *      var job_id = job.getParameter("job_id");
     *      // Get the held job from the holding folder
     *      var checkpoint_job = holding_folder.getHeldJob(job_id);
     *      // Move somewhere else
     *      checkpoint_job.move(af.createAutoFolderNest(["test", "outfolder"]));
     * });
     * ```
     */
    public getHeldJob(jobId: string) {
        let f = this;
        let job = _.find(f.getHeldJobs(), (j) => j.getId() === jobId );
        let jobIndex = _.findIndex(f.getHeldJobs(), (j) => j.getId() === jobId );

        if (!job) {
            f.e.log(3, `Job ID ${jobId} could not be found in the ${f.getHeldJobs().length} pending held jobs.`, f);
        } else {
            f.heldJobs.splice(jobIndex, 1);
        }
        return job;
    }
}