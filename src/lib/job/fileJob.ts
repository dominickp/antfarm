import {Environment} from "../environment/environment";
import {Job} from "./job";

const   mime = require("mime-types"),
        fileExtension = require("file-extension"),
        node_path = require("path");

export class FileJob extends Job {
    protected path: string;
    protected basename: string;
    protected contentType: string;
    protected extension: string;

    constructor(e: Environment, path: string) {
        super(e, path);

        this.path = path;

        this.basename = node_path.basename(this.path);

        // verify path leads to a valid, readable file, handle error if not

        this.contentType = mime.lookup(this.path);

        this.extension = fileExtension(this.path);
    }

    getName() {
        return this.basename;
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
}