import {Environment} from "../environment/environment";
import {FileJob} from "./fileJob";
import {Job} from "./job";

export class PackedJob extends FileJob {

    protected e: Environment;
    protected job: Job;

    constructor(e: Environment, job: Job) {
        // let job_name = job.getName();
        super(e, job.getName());
        this.e = e;
        this.job = job;

        console.log("PACKED JOB");

        this.pack();
    }

    /**
     *
     * @returns {string}
     */
    public getJob() {
        return this.job;
    }

    /**
     * Packs the related job on construction.
     */
    protected pack() {
        let pj = this;
        let job = pj.getJob();

        let json = job.getJSON();



        console.log(json);
    }

}