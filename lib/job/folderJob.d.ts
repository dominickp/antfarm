import { Environment } from "../environment/environment";
import { Job } from "./job";
import { File } from "./file";
export declare class FolderJob extends Job {
    protected path: string;
    protected dirname: string;
    protected basename: string;
    protected files: File[];
    /**
     * FolderJob constructor
     * @param e
     * @param path
     */
    constructor(e: Environment, path: string);
    protected getStatistics(): void;
    /**
     * Creates file objects for folder contents. Async operation returns a callback on completion.
     * @param callback
     */
    createFiles(callback: any): void;
    /**
     * Gets the job name.
     * @returns {string}
     */
    getName(): string;
    /**
     * Get the basename.
     * @returns {string}
     */
    getBasename(): string;
    /**
     * Get the directory name.
     * @returns {string}
     */
    getDirname(): string;
    /**
     * Get the path.
     * @returns {string}
     */
    getPath(): string;
    /**
     * Set a new path.
     * @param path
     */
    setPath(path: string): void;
    /**
     * Add a file object to the job.
     * @param file
     */
    addFile(file: File): void;
    /**
     * Get a file object from the job.
     * @param index
     * @returns {File}
     */
    getFile(index: number): File;
    /**
     * Get all files associated with the job.
     * @returns {File[]}
     */
    getFiles(): File[];
    /**
     * Get the number of files in this folder.
     * @returns {number}
     */
    count(): number;
    /**
     * Get the extension.
     * @returns {null}
     */
    getExtension(): any;
    /**
     * Check if job is a folder.
     * @returns {boolean}
     */
    isFolder(): boolean;
    /**
     * Check if job is a file.
     * @returns {boolean}
     */
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
