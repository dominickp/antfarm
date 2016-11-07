import { Environment } from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
import { FolderJob } from "./../job/folderJob";
/**
 * A folder nest is a nest which contains a backing folder at a specific _path. If the folder does not exist,
 * antfarm can optionally create it.
 */
export declare class FolderNest extends Nest {
    protected path: string;
    protected allowCreate: boolean;
    protected heldJobs: (FileJob | FolderJob)[];
    private _watcher;
    constructor(e: Environment, path?: string, allowCreate?: boolean);
    private readonly watcher;
    /**
     * Check if the _path for the backing folder is created. If not, optionally create it.
     * @param directory
     */
    protected checkDirectorySync(directory: any): void;
    /**
     * Function that creates and arrives new jobs. Can produce file or folder jobs.
     * @param path
     * @param arrive
     * @returns {FolderJob|FileJob}
     */
    protected createJob(path: string, arrive?: boolean): any;
    /**
     * Checks whether a _path starts with or contains a hidden file or a folder.
     * @param path {string}      The _path of the file that needs to be validated.
     * returns {boolean} - `true` if the source is blacklisted and otherwise `false`.
     */
    protected isUnixHiddenPath(path: string): boolean;
    /**
     * Initial load of the contents of the directory.
     * @param hold {boolean}    Optional flag to hold jobs found.
     */
    load(hold?: boolean): void;
    /**
     * Watches the folder.
     * @param hold {boolean}    Optional flag to hold jobs found.
     */
    watch(hold?: boolean): void;
    /**
     * Watches and holds jobs found.
     */
    watchHold(): void;
    /**
     * Arrive function that calls the super.
     * @param job
     */
    arrive(job: FileJob): void;
    /**
     * Picks up a job from another nest.
     * @param job
     * @param callback      Callback is given the job in its parameter.
     */
    take(job: (FileJob | FolderJob), callback: any): void;
    /**
     * Loads jobs that have piled up in the nest if it was not watched.
     * No longer used.
     * @returns {Array}     Array of jobs
     */
    getUnwatchedJobs(): any[];
    /**
     * Returns all held jobs.
     * @returns {(FileJob|FolderJob)[]}
     */
    getHeldJobs(): (FileJob | FolderJob)[];
    /**
     * Adds job to array of held jobs.
     * @param job
     */
    protected holdJob(job: (FileJob | FolderJob)): void;
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
    getHeldJob(jobId: string): any;
}
