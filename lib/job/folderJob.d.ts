import { Environment } from "../environment/environment";
import { Job } from "./job";
import { File } from "./file";
export declare class FolderJob extends Job {
    protected path: string;
    protected dirname: string;
    protected basename: string;
    protected files: File[];
    constructor(e: Environment, path: string);
    protected getStatistics(): void;
    /**
     * Creates file objects for folder contents. Async operation returns a callback on completion.
     * @param callback
     */
    createFiles(callback: any): void;
    getName(): string;
    getBasename(): string;
    getDirname(): string;
    getPath(): string;
    setPath(path: string): void;
    addFile(file: File): void;
    getFile(index: number): File;
    getFiles(): File[];
    /**
     * Get the number of files in this folder.
     * @returns {number}
     */
    count(): number;
    getExtension(): any;
    isFolder(): boolean;
    isFile(): boolean;
    /**
     * Moves a folder to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest
     * @param callback
     */
    move(destinationNest: any, callback: any): void;
    /**
     * Renames the job folder, leaving its content's names alone.
     * @param newName
     */
    rename(newName: string): void;
}
