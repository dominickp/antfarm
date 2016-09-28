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

    public getFile() {
        return this.file;
    }

    public getName() {
        return this.file.getName();
    }

    public getNameProper() {
        return this.file.getNameProper();
    }

    public getDirname() {
        return this.file.getDirname();
    }

    public getPath() {
        return this.file.getPath();
    }

    public setPath(path: string) {
        this.file.setPath(path);
    }

    public setName(filename: string) {
        this.createLifeEvent("set name", this.getName(), filename);
        this.file.setName(filename);
    }

    public getContentType() {
        return this.file.getContentType();
    }

    public getExtension() {
        return this.file.getExtension();
    }

    public getBasename() {
        return this.file.getBasename();
    }

    public isFolder() {
        return false;
    }

    public isFile() {
        return true;
    }

    /**
     * Moves a file to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest
     * @param callback
     */
    public move(destinationNest, callback) {

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

    public rename(newName: string) {
        let file = this.getFile();
        file.setName(newName);
        file.renameLocal();
    }

}