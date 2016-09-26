import { Environment } from "../environment/environment";
import { Job } from "./job";
import { File } from "./file";
export declare class FolderJob extends Job {
    protected path: string;
    protected dirname: string;
    protected basename: string;
    protected files: File[];
    constructor(e: Environment, path: string);
    /**
     * Creates file objects for folder contents. Async operation returns a callback on completion.
     * @param callback
     */
    createFiles(callback: any): void;
    getPath(): string;
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
}
