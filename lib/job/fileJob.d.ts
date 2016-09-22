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
    /**
     * Moves a file to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest
     * @param callback
     */
    move(destinationNest: any, callback: any): void;
}
