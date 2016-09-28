import {Environment} from "../environment/environment";
import {Job} from "./job";
import {File} from "./file";

const   node_path = require("path"),
        fs = require("fs");

export class FolderJob extends Job {
    protected path: string;
    protected dirname: string;
    protected basename: string;

    protected files: File[];

    constructor(e: Environment, path: string) {
        super(e, path);

        this.path = path;

        this.files = [];


        this.getStatistics();

        // verify path leads to a valid, readable file, handle error if not
    }

    protected getStatistics() {
        this.basename = node_path.basename(this.getPath());
        this.dirname = node_path.dirname(this.getPath());
    }


    /**
     * Creates file objects for folder contents. Async operation returns a callback on completion.
     * @param callback
     */
    public createFiles(callback: any) {
        let fl = this;
        let folder_path = this.getPath();
        fs.readdir(folder_path, function(err, items) {
            items = items.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

            items.forEach(function(filename){
                let filepath = folder_path + node_path.sep + filename;
                let file = new File(fl.e, filepath);
                fl.addFile(file);
            });

            callback();
        });
    }

    public getName() {
        return this.getBasename();
    }

    public getBasename() {
        return this.basename;
    }

    public getDirname() {
        return this.dirname;
    }

    public getPath() {
        return this.path;
    }

    public setPath(path: string) {
        this.path = path;
        this.getStatistics();
    }

    public addFile(file: File) {
        this.files.push(file);
        this.e.log(0, `Adding file "${file.getName()}" to job.`, this);
    }

    public getFile(index: number) {
        return this.files[index];
    }

    public getFiles() {
        return this.files;
    }

    /**
     * Get the number of files in this folder.
     * @returns {number}
     */
    public count() {
        return this.files.length;
    }

    public getExtension() {
        return null;
    }

    public isFolder() {
        return true;
    }

    public isFile() {
        return false;
    }


    /**
     * Moves a folder to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest
     * @param callback
     */
    public move(destinationNest, callback) {
        let fj = this;
        try {
            destinationNest.take(fj, function(new_path){
                fj.setPath(new_path);
                fj.e.log(1, `Job "${fj.getName()}" was moved to Nest "${destinationNest.name}".`, fj);
                if (callback) {
                    callback();
                }
            });
        } catch (e) {
            fj.e.log(3, `Job "${fj.getName()}" was not moved to Nest "${destinationNest.name}". ${e}`, fj);
            if (callback) {
                callback();
            }
        }
    }

    /**
     * Renames the job folder, leaving its content's names alone.
     * @param newName
     */
    public rename(newName: string) {
        let fj = this;
        let new_path = fj.getDirname() + node_path.sep + newName;
        fs.renameSync(fj.getPath(), new_path);

        fj.setPath(new_path);
    }

}