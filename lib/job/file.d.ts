import { Environment } from "../environment/environment";
export declare class File {
    protected path: string;
    protected dirname: string;
    protected basename: string;
    protected contentType: string;
    protected extension: string;
    constructor(e: Environment, path: string);
    protected getStatistics(): void;
    getName(): string;
    /**
     * Get the file name of the job without the file extension.
     * @returns {string}
     */
    getNameProper(): any;
    getDirname(): string;
    getPath(): string;
    setPath(path: string): void;
    setName(filename: string): void;
    getContentType(): string;
    getExtension(): string;
    getBasename(): string;
    /**
     * Renames the local job file to the current name.
     */
    renameLocal(): void;
}
