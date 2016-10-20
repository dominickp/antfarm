import {MyFileJob} from "./fileJob";
import {MyJob} from "./job";
export class MyPackedJob extends MyFileJob {

    protected job: MyJob;

    constructor(job: MyJob) {
        super("Packedjob");
        this.job = job;
    }
}