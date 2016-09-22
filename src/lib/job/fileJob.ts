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

    move(destinationNest) {
        let path = destinationNest.take(this);
        this.path = path;

        this.e.log(1, `Job "${this.basename}" was moved to Nest "${destinationNest.name}".`, this);
    }
}