import { Environment } from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
export declare class FolderNest extends Nest {
    protected path: string;
    protected allowCreate: boolean;
    constructor(e: Environment, path?: string, allowCreate?: boolean);
    /**
     * Check if the path for the backing folder is created. If not, optionally create it.
     * @param directory
     */
    protected checkDirectorySync(directory: any): void;
    protected createJob(path: string): any;
    load(): void;
    watch(): void;
    arrive(job: FileJob): void;
    take(job: FileJob, callback: any): void;
}
