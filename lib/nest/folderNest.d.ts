import { Environment } from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
import { FolderJob } from "./../job/folderJob";
/**
 * A folder nest is a nest which contains a backing folder at a specific path. If the folder does not exist,
 * antfarm can optionally create it.
 */
export declare class FolderNest extends Nest {
    protected path: string;
    protected allowCreate: boolean;
    protected heldJobs: (FileJob | FolderJob)[];
    constructor(e: Environment, path?: string, allowCreate?: boolean);
    /**
     * Check if the path for the backing folder is created. If not, optionally create it.
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
    take(job: FileJob, callback: any): void;
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
    getJob(jobId: string): any;
}
