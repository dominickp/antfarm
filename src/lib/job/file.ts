import {Environment} from "../environment/environment";

const   mime = require("mime-types"),
        fileExtension = require("file-extension"),
        node_path = require("path"),
        fs = require("fs");

export class File {

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
    constructor(e: Environment, path: string) {

        this.path = path;

        this.basename = node_path.basename(this.path);
        this.dirname = node_path.dirname(this.path);

        // verify path leads to a valid, readable file, handle error if not

        this.getStatistics();
    }

    /**
     * Refresh the file statistics after a rename or modification.
     */
    protected getStatistics() {
        this.contentType = mime.lookup(this.getPath());
        this.extension = fileExtension(this.getPath());
    }

    /**
     * Get the basename.
     * @returns {string}
     */
    public getName() {
        return this.basename;
    }

    /**
     * Set a new file name.
     * @param filename
     */
    public setName(filename: string) {
        this.basename = filename;
    }

    /**
     * Get the file name of the job without the file extension.
     * @returns {string}
     */
    public getNameProper() {
        return node_path.basename(this.getBasename(), node_path.extname(this.getBasename()));
    }

    /**
     * Get the top level directory name.
     * @returns {string}
     */
    public getDirname() {
        return this.dirname;
    }

    /**
     * Get the complete directory path.
     * @returns {string}
     */
    public getPath() {
        return this.path;
    }

    /**
     * Set the complete directory path.
     * @param path
     */
    public setPath(path: string) {
        this.path = path;
    }

    /**
     * Get the content-type of the file.
     * @returns {string}
     */
    public getContentType() {
        return this.contentType;
    }

    /**
     * Get the file extension.
     * @returns {string}
     */
    public getExtension() {
        return this.extension;
    }

    /**
     * Get the basename.
     * @returns {string}
     */
    public getBasename() {
        return this.basename;
    }

    /**
     * Renames the local job file to the current name.
     */
    public renameLocal() {
        let new_path = this.getDirname() + node_path.sep + this.getName();
        fs.renameSync(this.getPath(), new_path);
        this.setPath(new_path);
        this.getStatistics();
    }

}