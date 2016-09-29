import { Environment } from "../environment/environment";
export declare class File {
    protected path: string;
    protected dirname: string;
    protected basename: string;
    protected contentType: string;
    protected extension: string;
    /**
     * File constructor
     * @param e
     * @param path
     */
    constructor(e: Environment, path: string);
    /**
     * Refresh the file statistics after a rename or modification.
     */
    protected getStatistics(): void;
    /**
     * Get the basename.
     * @returns {string}
     */
    getName(): string;
    /**
     * Set a new file name.
     * @param filename
     */
    setName(filename: string): void;
    /**
     * Get the file name of the job without the file extension.
     * @returns {string}
     */
    getNameProper(): any;
    /**
     * Get the top level directory name.
     * @returns {string}
     */
    getDirname(): string;
    /**
     * Get the complete directory path.
     * @returns {string}
     */
    getPath(): string;
    /**
     * Set the complete directory path.
     * @param path
     */
    setPath(path: string): void;
    /**
     * Get the content-type of the file.
     * @returns {string}
     */
    getContentType(): string;
    /**
     * Get the file extension.
     * @returns {string}
     */
    getExtension(): string;
    /**
     * Get the basename.
     * @returns {string}
     */
    getBasename(): string;
    /**
     * Renames the local job file to the current name.
     */
    renameLocal(): void;
}
