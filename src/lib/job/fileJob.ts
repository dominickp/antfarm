import {Environment} from "../environment/environment";
import {Job} from "./job";
import {File} from "./file";

export class FileJob extends Job {

    protected _file: File;

    /**
     * FileJob constructor.
     * @param e
     * @param path
     */
    constructor(e: Environment, path: string) {
        super(e, path);
        this._type = "file";
        this._file = new File(e, path);
    }

    /**
     * Get the file object.
     * @returns {File}
     */
    public get file() {
        return this._file;
    }

    /**
     * Get the file _name.
     * @returns {string}
     */
    public get name() {
        return this.file.name;
    }

    /**
     * Get the file _name proper.
     * @returns {string}
     */
    public get nameProper() {
        return this.file.nameProper;
    }

    /**
     * Get the file directory _name.
     * @returns {string}
     */
    public get dirname() {
        return this.file.dirname;
    }

    /**
     * Get the file _path.
     * @returns {string}
     */
    public get path() {
        return this.file.path;
    }

    /**
     * Set a new file _path.
     * @param path
     */
    public set path(path: string) {
        this.e.log(0, `New path set: "${path}".`, this);
        this.file.path = path;
    }

    /**
     * Set a new file _name.
     * @param filename
     */
    public set name(filename: string) {
        this.createLifeEvent("set name", this.name, filename);
        this.file.name = filename;
    }

    /**
     * Get the file content type.
     * @returns {string}
     */
    public get contentType() {
        return this.file.contentType;
    }

    /**
     * Get the file extension.
     * @returns {string}
     */
    public get extension() {
        return this.file.extension;
    }

    /**
     * Get the file _basename.
     * @returns {string}
     */
    public get basename() {
        return this.file.basename;
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
     * @param destinationNest       The nest object the job will be sent to.
     * @param callback              The callback provides the updated instance of the job. Depending on the nest it was sent to, it may have been cast to a new job type. This is helpful in case you need the remote _path to the job once it has been uploaded to S3, for example.
     * #### Example
     * ```js
     * tunnel.run((job, nest) => {
     *      console.log("Found job " + job.getName());
     *      job.move(my_s3_bucket, (s3_job) => {
     *          // Uploaded
     *          console.log("Uploaded to " + s3_job.getPath());
     *      });
     * });
     * ```
     */
    public move(destinationNest, callback) {

        let fj = this;

        try {
            destinationNest.take(fj, function(newJob){
                // fj.setPath(new_path);
                fj.e.log(1, `Job "${fj.basename}" was moved to Nest "${destinationNest.name}".`, fj, [fj.tunnel]);
                if (callback) {
                    callback(newJob);
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
     * Rename the job file to a new _name.
     * @param newName
     */
    public rename(newName: string) {
        let fj = this;
        let file = this.file;
        file.name = newName;
        file.renameLocal();
    }

    /**
     * Deletes the local file.
     */
    public remove() {
        return this.file.removeLocal();
    }

}