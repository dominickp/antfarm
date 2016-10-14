import {Environment} from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
import { FolderJob } from "./../job/folderJob";
import {Job} from "../job/job";

const   node_watch = require("node-watch"),
        fs = require("fs"),
        path_mod = require("path"),
        tmp = require("tmp"),
        mkdirp = require("mkdirp");

/**
 * A folder nest is a nest which contains a backing folder at a specific path. If the folder does not exist,
 * antfarm can optionally create it.
 */
export class FolderNest extends Nest {

    protected path: string;
    protected allowCreate: boolean;

    constructor(e: Environment, path?: string, allowCreate?: boolean) {
        let nest_name = path_mod.basename(path);
        super(e, nest_name);

        this.allowCreate = allowCreate;
        this.checkDirectorySync(path);
        this.path = path;
    }

    /**
     * Check if the path for the backing folder is created. If not, optionally create it.
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
                job.createFiles(function(){
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
     * Initial load of the contents of the directory.
     */
    public load(): void {
        let fl = this;
        fs.readdir(fl.path, (err, items) => {
            items = items.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

            items.forEach((filename) => {
                let filepath = fl.path + path_mod.sep + filename;
                fl.createJob(filepath); // Arrives as well
            });
        });
    }

    /**
     * Watches the folder.
     */
    public watch(): void {
        let fl = this;
        let watch_options = {
            recursive: false
        };

        node_watch(fl.path, watch_options, function (filepath) {
            let job = fl.createJob(filepath); // Arrives as well
        });
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
    public take(job: FileJob, callback: any) {
        // the other nest that this is taking from should provide a temporary location or local path of the job
        let new_path = `${this.path}/${job.getBasename()}`;

        fs.renameSync(job.getPath(), new_path);
        job.setPath(new_path);

        callback(job);
    }

    /**
     * Loads jobs that have piled up in the nest if it was not watched.
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
        });

        return jobs;
    }

    // Need to fix the fact that new jobs are created every time. That means the ID is different and it isn't predictable.
    public getJob(jobId: string) {

    }
}