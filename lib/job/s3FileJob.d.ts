import { FileJob } from "./fileJob";
import { File } from "./file";
import { Environment } from "./../environment/environment";
export declare class S3FileJob extends FileJob {
    protected file: File;
    constructor(e: Environment, basename: any);
}
