import {Environment} from "../environment/environment";
import {FileJob} from "./fileJob";

export class PackedJob extends FileJob {

    protected e: Environment;
    protected job: string;

    constructor(e: Environment, job: string) {
        // let job_name = job.getName();
        super(e, job);
        this.e = e;

        console.log("PACKED JOB");
    }

}