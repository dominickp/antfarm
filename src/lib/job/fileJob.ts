import {Environment} from "../environment/environment";
import {Job} from "./job";
import {File} from "./file";

const   node_path = require("path"),
        fs = require("fs");

export class FileJob extends Job {

    protected file: File;

    constructor(e: Environment, path: string) {
        super(e, path);
        this.file = new File(e, path);
    }

    getFile() {
        return this.file;
    }

    getName() {
        return this.file.getName();
    }

    getNameProper() {
        return this.file.getNameProper();
    }

    getDirname() {
        return this.file.getDirname();
    }

    getPath() {
        return this.file.getPath();
    }

    setPath(path: string) {
        this.file.setPath(path);
    }

    setName(filename: string) {
        this.createLifeEvent("set name", this.getName(), filename);
        this.file.setName(filename);
    }

    getContentType() {
        return this.file.getContentType();
    }

    getExtension() {
        return this.file.getExtension();
    }

    getBasename() {
        return this.file.getBasename();
    }

    isFolder() {
        return false;
    }

    isFile() {
        return true;
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
                fj.e.log(1, `Job "${fj.getBasename()}" was moved to Nest "${destinationNest.name}".`, fj);
                if (callback) {
                    callback();
                }
            });
        } catch (e) {
            fj.e.log(3, `Job "${fj.getBasename()}" was not moved to Nest "${destinationNest.name}". ${e}`, fj);
            if (callback) {
                callback();
            }
        }
    }

    rename(newName: string) {
        let file = this.getFile();
        file.setName(newName);
        file.renameLocal();
    }

}