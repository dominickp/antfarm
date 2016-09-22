import { Environment } from "../environment/environment";
import { Job } from "./job";
export declare class FileJob extends Job {
    protected path: string;
    protected basename: string;
    protected contentType: string;
    protected extension: string;
    constructor(e: Environment, path: string);
    getName(): string;
    getPath(): string;
    setPath(path: string): void;
    setName(filename: string): void;
    getContentType(): string;
    getExtension(): string;
    getBasename(): string;
    move(destinationNest: any): void;
}
