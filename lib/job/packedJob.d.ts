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
    execPack(done: any): void;
    protected restoreJobTicket(jsonTicket: any): any;
    execUnpack(done: any): void;
    protected restoreFiles(job: Job, zip: any, callback: any): void;
    protected extractFiles(zip: any, single: boolean, zipPath: string, callback: any, totalFiles?: number): void;
}
