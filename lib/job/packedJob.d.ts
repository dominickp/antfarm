import { Environment } from "../environment/environment";
import { FileJob } from "./fileJob";
export declare class PackedJob extends FileJob {
    protected e: Environment;
    protected job: string;
    constructor(e: Environment, job: string);
}
