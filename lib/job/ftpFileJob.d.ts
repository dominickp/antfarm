import { FileJob } from "./fileJob";
import { Environment } from "./../environment/environment";
export declare class FtpFileJob extends FileJob {
    protected downloaded: boolean;
    constructor(e: Environment, basename: any);
    getDownloaded(): boolean;
    setDownloaded(downloaded: boolean): void;
}
