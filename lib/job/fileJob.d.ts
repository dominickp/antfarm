import { Environment } from "../environment/environment";
import { Job } from "./job";
import { File } from "./file";
export declare class FileJob extends Job {
    protected file: File;
    constructor(e: Environment, path: string);
    getFile(): File;
    getName(): string;
    getDirname(): string;
    getPath(): string;
    setPath(path: string): void;
    setName(filename: string): void;
    getContentType(): string;
    getExtension(): string;
    getBasename(): string;
    isFolder(): boolean;
    isFile(): boolean;
    /**
     * Moves a file to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest
     * @param callback
     */
    move(destinationNest: any, callback: any): void;
    rename(newName: string): void;
}
