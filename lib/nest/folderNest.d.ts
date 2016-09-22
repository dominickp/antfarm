import { Environment } from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
export declare class FolderNest extends Nest {
    path: string;
    constructor(e: Environment, path: string);
    checkDirectorySync(directory: any): void;
    load(): void;
    watch(): void;
    arrive(job: FileJob): void;
    take(job: FileJob): string;
}
