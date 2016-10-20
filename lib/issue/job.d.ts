import { MyPackedJob } from "./packedJob";
export declare abstract class MyJob {
    protected name: string;
    constructor(name: string);
    pack(): MyPackedJob;
}
