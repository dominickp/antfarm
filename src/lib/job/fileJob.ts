import {Environment} from "../environment/environment";
import {Job} from "./job";

const   mime = require("mime-types"),
        fileExtension = require("file-extension"),
        node_path = require("path"),
        fs = require("fs");

export class FileJob extends Job {
    protected path: string;
    protected dirname: string;
    protected basename: string;
    protected contentType: string;
    protected extension: string;

    constructor(e: Environment, path: string) {
        super(e, path);

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
     * Moves a file to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest
     * @param callback
     */
    move(destinationNest, callback) {

        let fj = this;

        try {
            destinationNest.take(fj, function(new_path){
                fj.setPath(new_path);
                fj.e.log(1, `Job "${fj.basename}" was moved to Nest "${destinationNest.name}".`, fj);
                if (callback) {
                    callback();
                }
            });
        } catch (e) {
            fj.e.log(3, `Job "${fj.basename}" was not moved to Nest "${destinationNest.name}". ${e}`, fj);
            if (callback) {
                callback();
            }
        }
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