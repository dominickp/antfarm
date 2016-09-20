import { Environment } from "../environment/environment";
import { Job } from "./job";
export declare class FileJob extends Job {
    path: string;
    protected contentType: string;
    protected extension: string;
    constructor(e: Environment, path: string);
    getContentType(): string;
    getExtension(): string;
}
