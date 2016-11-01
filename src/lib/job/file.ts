import {Environment} from "../environment/environment";

const   mime = require("mime-types"),
        fileExtension = require("file-extension"),
        node_path = require("path"),
        fs = require("fs"),
        filesize = require("filesize");

export class File {

    protected _path: string;
    protected _dirname: string;
    protected _basename: string;
    protected _contentType: string;
    protected _extension: string;
    protected _sizeBytes: number;
    protected e: Environment;

    /**
     * File constructor
     * @param e
     * @param path
     */
    constructor(e: Environment, path: string) {
        this.e = e;
        this._path = path;

        // verify _path leads to a valid, readable file, handle error if not

        this.getStatistics();
    }

    /**
     * Refresh the file statistics after a rename or modification.
     */
    protected getStatistics() {
        let f = this;
        f._contentType = mime.lookup(f.path);
        f._extension = fileExtension(f.path);
        f._basename = node_path.basename(f.path);
        f._dirname = node_path.dirname(f.path);
        try {
            f._sizeBytes = fs.statSync(f.path).size;
        } catch (err) {
            f.e.log(2, `Couldn't determine sizeBytes with statSync. ${err}`, f);
            f._sizeBytes = 0;
        }
    }

    /**
     * Get the _basename.
     * @returns {string}
     */
    public get name() {
        return this._basename;
    }

    /**
     * Set a new file _name.
     * @param filename
     */
    public set name(filename: string) {
        this._basename = filename;
    }

    /**
     * Get the file _name of the job without the file extension.
     * @returns {string}
     */
    public get nameProper() {
        return node_path.basename(this.basename, node_path.extname(this.basename));
    }

    /**
     * Get the top level directory _name.
     * @returns {string}
     */
    public get dirname() {
        return this._dirname;
    }

    /**
     * Get the complete directory _path.
     * @returns {string}
     */
    public get path() {
        return this._path;
    }

    /**
     * Set the complete directory _path.
     * @param path
     */
    public set path(path: string) {
        this._path = path;
        this.getStatistics();
    }

    /**
     * Get the content-type of the file.
     * @returns {string}
     */
    public get contentType() {
        return this._contentType;
    }

    /**
     * Get the file extension.
     * @returns {string}
     */
    public get extension() {
        return this._extension;
    }

    /**
     * Get the _basename.
     * @returns {string}
     */
    public get basename() {
        return this._basename;
    }

    public get sizeBytes() {
        return this._sizeBytes;
    }

    public get size() {
        return filesize(this.sizeBytes);
    }

    /**
     * Renames the local job file to the current _name.
     */
    public renameLocal() {
        let f = this;
        let new_path = f.dirname + node_path.sep + f.name;
        fs.renameSync(f.path, new_path);
        f.path = new_path;
        f.getStatistics();
    }

    /**
     * Deletes the local file.
     * @returns {boolean}
     */
    public removeLocal() {
        let f = this;
        try {
            fs.unlinkSync(f.path);
            return true;
        } catch (e) {
            f.e.log(3, `File "${f.path}" could not be deleted. ${e}`, f);
            return false;
        }
    }

}