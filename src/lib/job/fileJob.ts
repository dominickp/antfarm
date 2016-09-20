const   mime = require('mime-types'),
        fileExtension = require('file-extension');

import {Environment} from "../environment/environment";
import {Job} from "./job";

export class FileJob extends Job {

    path: string;

    protected contentType: string;

    protected extension: string;

    constructor(e: Environment, path: string) {
        super(e, path);

        this.path = path;

        // verify path leads to a valid, readable file, handle error if not

        this.contentType = mime.lookup(this.path);

        this.extension = fileExtension(this.path);
    }

    getContentType(){
        return this.contentType;
    }

    getExtension(){
        return this.extension;
    }
}