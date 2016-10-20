import { MyFileJob } from "./fileJob";
import { MyJob } from "./job";
export declare class MyPackedJob extends MyFileJob {
    protected job: MyJob;
    constructor(job: MyJob);
}
