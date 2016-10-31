import { FileJob } from "./fileJob";
import { File } from "./file";
import { Environment } from "./../environment/environment";
export declare class FtpFileJob extends FileJob {
    protected _file: File;
    constructor(e: Environment, basename: any);
}
