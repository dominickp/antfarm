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

    constructor(e: Environment, path: string) {

        this.path = path;

        this.basename = node_path.basename(this.path);
        this.dirname = node_path.dirname(this.path);

        // verify path leads to a valid, readable file, handle error if not

        this.getStatistics();
    }

    protected getStatistics() {
        this.contentType = mime.lookup(this.getPath());
        this.extension = fileExtension(this.getPath());
    }

    public getName() {
        return this.basename;
    }

    /**
     * Get the file name of the job without the file extension.
     * @returns {string}
     */
    public getNameProper() {
        return node_path.basename(this.getBasename(), node_path.extname(this.getBasename()));
    }

    public getDirname() {
        return this.dirname;
    }

    public getPath() {
        return this.path;
    }

    public setPath(path: string) {
        this.path = path;
    }

    public setName(filename: string) {
        this.basename = filename;
    }

    public getContentType() {
        return this.contentType;
    }

    public getExtension() {
        return this.extension;
    }

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