import { Environment } from "../environment/environment";
import { FileJob } from "./fileJob";
import { Job } from "./job";
export declare class PackedJob extends FileJob {
    protected e: Environment;
    protected job: Job;
    constructor(e: Environment, job: Job);
    /**
     *
     * @returns {string}
     */
    getJob(): Job;
    /**
     * Packs the related job on construction.
     */
    protected pack(): void;
}
