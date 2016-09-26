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


    getName() {
        return this.basename;
    }

    getDirname() {
        return this.dirname;
    }

    getPath() {
        return this.path;
    }

    setPath(path: string) {
        this.path = path;
    }

    setName(filename: string) {
        this.basename = filename;
    }

    getContentType() {
        return this.contentType;
    }

    getExtension() {
        return this.extension;
    }

    getBasename() {
        return this.basename;
    }


    /**
     * Renames the local job file to the current name.
     */
    renameLocal() {
        let new_path = this.getDirname() + node_path.sep + this.getName();
        fs.renameSync(this.getPath(), new_path);
        this.setPath(new_path);
        this.getStatistics();
    }

}