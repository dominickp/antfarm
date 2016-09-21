import { Environment } from "../environment/environment";
import { Job } from "./job";
export declare class FileJob extends Job {
    path: string;
    protected basename: string;
    protected contentType: string;
    protected extension: string;
    constructor(e: Environment, path: string);
    getName(): string;
    setName(filename: string): void;
    getContentType(): string;
    getExtension(): string;
    getBasename(): string;
    move(destinationNest: any): void;
}
