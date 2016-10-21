import { Environment } from "../environment/environment";
import { FileJob } from "./fileJob";
import { Job } from "./job";
export declare class PackedJob extends FileJob {
    protected e: Environment;
    protected job: Job;
    constructor(e: Environment, job: Job);
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
    protected buildZip(zip: any, callback: any): void;
    /**
     * Packs the related job on construction.
     */
    pack(done: any): void;
}
