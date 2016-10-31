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
    protected e: Environment;

    /**
     * File constructor
     * @param e
     * @param path
     */
    constructor(e: Environment, path: string) {
        this.e = e;
        this.path = path;

        // verify path leads to a valid, readable file, handle error if not

        this.getStatistics();
    }

    /**
     * Refresh the file statistics after a rename or modification.
     */
    protected getStatistics() {
        let f = this;
        f.contentType = mime.lookup(f.getPath());
        f.extension = fileExtension(f.getPath());
        f.basename = node_path.basename(f.getPath());
        f.dirname = node_path.dirname(f.getPath());
    }

    /**
     * Get the basename.
     * @returns {string}
     */
    public get name() {
        return this.basename;
    }

    /**
     * Set a new file _name.
     * @param filename
     */
    public set name(filename: string) {
        this.basename = filename;
    }

    /**
     * Get the file _name of the job without the file extension.
     * @returns {string}
     */
    public getNameProper() {
        return node_path.basename(this.getBasename(), node_path.extname(this.getBasename()));
    }

    /**
     * Get the top level directory _name.
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
        this.getStatistics();
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
     * Renames the local job file to the current _name.
     */
    public renameLocal() {
        let f = this;
        let new_path = f.getDirname() + node_path.sep + f.name;
        fs.renameSync(f.getPath(), new_path);
        f.setPath(new_path);
        f.getStatistics();
    }

    /**
     * Deletes the local file.
     * @returns {boolean}
     */
    public removeLocal() {
        let f = this;
        try {
            fs.unlinkSync(f.getPath());
            return true;
        } catch (e) {
            f.e.log(3, `File "${f.getPath()}" could not be deleted. ${e}`, f);
            return false;
        }
    }

}