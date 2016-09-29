import {Environment} from "../environment/environment";
import {Job} from "./job";
import {File} from "./file";

export class FileJob extends Job {

    protected file: File;

    /**
     * FileJob constructor.
     * @param e
     * @param path
     */
    constructor(e: Environment, path: string) {
        super(e, path);
        this.file = new File(e, path);
    }

    /**
     * Get the file object.
     * @returns {File}
     */
    public getFile() {
        return this.file;
    }

    /**
     * Get the file name.
     * @returns {string}
     */
    public getName() {
        return this.file.getName();
    }

    /**
     * Get the file name proper.
     * @returns {string}
     */
    public getNameProper() {
        return this.file.getNameProper();
    }

    /**
     * Get the file directory name.
     * @returns {string}
     */
    public getDirname() {
        return this.file.getDirname();
    }

    /**
     * Get the file path.
     * @returns {string}
     */
    public getPath() {
        return this.file.getPath();
    }

    /**
     * Set a new file path.
     * @param path
     */
    public setPath(path: string) {
        this.file.setPath(path);
    }

    /**
     * Set a new file name.
     * @param filename
     */
    public setName(filename: string) {
        this.createLifeEvent("set name", this.getName(), filename);
        this.file.setName(filename);
    }

    /**
     * Get the file content type.
     * @returns {string}
     */
    public getContentType() {
        return this.file.getContentType();
    }

    /**
     * Get the file extension.
     * @returns {string}
     */
    public getExtension() {
        return this.file.getExtension();
    }

    /**
     * Get the file basename.
     * @returns {string}
     */
    public getBasename() {
        return this.file.getBasename();
    }

    /**
     * Check if job is a folder.
     * @returns {boolean}
     */
    public isFolder() {
        return false;
    }

    /**
     * Check if job is a file.
     * @returns {boolean}
     */
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

    /**
     * Rename the job file to a new name.
     * @param newName
     */
    public rename(newName: string) {
        let file = this.getFile();
        file.setName(newName);
        file.renameLocal();
    }

}