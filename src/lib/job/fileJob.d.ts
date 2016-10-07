import { Environment } from "../environment/environment";
import { Job } from "./job";
import { File } from "./file";
export declare class FileJob extends Job {
    protected file: File;
    /**
     * FileJob constructor.
     * @param e
     * @param path
     */
    constructor(e: Environment, path: string);
    /**
     * Get the file object.
     * @returns {File}
     */
    getFile(): File;
    /**
     * Get the file name.
     * @returns {string}
     */
    getName(): string;
    /**
     * Get the file name proper.
     * @returns {string}
     */
    getNameProper(): any;
    /**
     * Get the file directory name.
     * @returns {string}
     */
    getDirname(): string;
    /**
     * Get the file path.
     * @returns {string}
     */
    getPath(): string;
    /**
     * Set a new file path.
     * @param path
     */
    setPath(path: string): void;
    /**
     * Set a new file name.
     * @param filename
     */
    setName(filename: string): void;
    /**
     * Get the file content type.
     * @returns {string}
     */
    getContentType(): string;
    /**
     * Get the file extension.
     * @returns {string}
     */
    getExtension(): string;
    /**
     * Get the file basename.
     * @returns {string}
     */
    getBasename(): string;
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
     * Moves a file to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest
     * @param callback
     */
    move(destinationNest: any, callback: any): void;
    /**
     * Rename the job file to a new name.
     * @param newName
     */
    rename(newName: string): void;
}
