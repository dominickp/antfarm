import { Environment } from "../environment/environment";
import { FileJob } from "./fileJob";
import { Job } from "./job";
export declare class PackedJob extends FileJob {
    protected e: Environment;
    protected job: Job;
    constructor(e: Environment, job: Job, callback: any);
    /**
     *
     * @returns {Job}
     */
    getJob(): Job;
    /**
     * Makes job ticket and returns the path to the temporary file.
     * @param job
     * @returns {string}
     */
    protected getJobTicket(job: Job): string;
    /**
     * Packs the related job on construction.
     */
    protected pack(callback: any): void;
}
