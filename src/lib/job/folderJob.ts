import {Environment} from "../environment/environment";
import {Job} from "./job";
import {File} from "./file";
import {Nest} from "../nest/nest";

const   node_path = require("path"),
        fs = require("fs");

export class FolderJob extends Job {
    protected _path: string;
    protected _dirname: string;
    protected _basename: string;

    protected _files: File[];

    /**
     * FolderJob constructor
     * @param e
     * @param path
     */
    constructor(e: Environment, path: string) {
        super(e, path);
        this._type = "folder";
        this._path = path;
        this._files = [];
        this.getStatistics();

        // verify _path leads to a valid, readable file, handle error if not
    }

    protected getStatistics() {
        this._basename = node_path.basename(this.path);
        this._dirname = node_path.dirname(this.path);
    }

    /**
     * Creates file objects for folder contents. Async operation returns a callback on completion.
     * @param callback
     */
    public createFiles(callback: () => void): void {
        let fl = this;
        let folder_path = fl.path;
        fs.readdir(folder_path, (err, items) => {
            items = items.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

            items.forEach((filename) => {
                let filepath = folder_path + node_path.sep + filename;
                let file = new File(fl.e, filepath);
                fl.addFile(file);
            });

            callback();
        });
    }

    /**
     * Gets the job _name.
     * @returns {string}
     */
    public get name() {
        return this.basename;
    }

    /**
     * Get the _basename.
     * @returns {string}
     */
    public get basename() {
        return this._basename;
    }

    /**
     * Get the directory _name.
     * @returns {string}
     */
    public get dirname() {
        return this._dirname;
    }

    /**
     * Get the _path.
     * @returns {string}
     */
    public get path() {
        return this._path;
    }

    /**
     * Set a new _path.
     * @param path
     */
    public set path(path: string) {
        let fj = this;
        fj._path = path;
        fj.getStatistics();
    }

    /**
     * Add a file object to the job.
     * @param file
     */
    public addFile(file: File) {
        this._files.push(file);
        this.e.log(0, `Adding file "${file.name}" to job.`, this);
    }

    /**
     * Get a file object from the job.
     * @param index
     * @returns {File}
     */
    public getFile(index: number) {
        return this._files[index];
    }

    /**
     * Get all _files associated with the job.
     * @returns {File[]}
     */
    public get files() {
        return this._files;
    }

    /**
     * Get the number of _files in this folder.
     * @returns {number}
     */
    public count() {
        return this._files.length;
    }

    /**
     * Get the extension.
     * @returns {null}
     */
    public get extension() {
        return null;
    }

    /**
     * Check if job is a folder.
     * @returns {boolean}
     */
    public isFolder() {
        return true;
    }

    /**
     * Check if job is a file.
     * @returns {boolean}
     */
    public isFile() {
        return false;
    }

    /**
     * Moves a folder to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest
     * @param callback
     */
    public move(destinationNest: Nest, callback: (job?: Job) => void): void {
        let fj = this;

        if (!destinationNest) {
            fs.e.log(3, `Destination nest does not exist!`, fj);
        }

        try {
            destinationNest.take(fj, (job) => {
                // fj.path = new_path;
                fj.e.log(1, `Job "${fj.name}" was moved to Nest "${destinationNest.name}".`, fj);
                if (callback) {
                    callback(job);
                }
            });
        } catch (e) {
            fj.e.log(3, `Job "${fj.name}" was not moved to Nest "${destinationNest.name}". ${e}`, fj);
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
        let new_path = fj.dirname + node_path.sep + newName;

        try {
            fj.e.log(0, `Renaming folder to "${new_path}".`, fj);
            fs.renameSync(fj.path, new_path);
        } catch (err) {
            fj.e.log(3, `Rename folder error: ${err}.`, fj);
        }

        fj.path = new_path;
    }

    public remove() {
        let fj = this;
        fj.files.forEach((file) => {
            file.removeLocal();
        });
    };

}
