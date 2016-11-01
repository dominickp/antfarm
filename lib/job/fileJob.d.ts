import { Environment } from "../environment/environment";
import { Job } from "./job";
import { File } from "./file";
export declare class FileJob extends Job {
    protected _file: File;
    /**
     * FileJob constructor.
     * @param e
     * @param path
     */
    constructor(e: Environment, path: string);
    /**
     * Get the file object.
     * @returns {File}
     */
    readonly file: File;
    /**
     * Get the file _name.
     * @returns {string}
     */
    /**
     * Set a new file _name.
     * @param filename
     */
    name: string;
    /**
     * Get the file _name proper.
     * @returns {string}
     */
    readonly nameProper: any;
    /**
     * Get the file directory _name.
     * @returns {string}
     */
    readonly dirname: string;
    /**
     * Get the file _path.
     * @returns {string}
     */
    /**
     * Set a new file _path.
     * @param path
     */
    path: string;
    /**
     * Get the file content type.
     * @returns {string}
     */
    readonly contentType: string;
    /**
     * Get the file extension.
     * @returns {string}
     */
    readonly extension: string;
    /**
     * Get the file _basename.
     * @returns {string}
     */
    readonly basename: string;
    /**
     * Check if job is a folder.
     * @returns {boolean}
     */
    isFolder(): boolean;
    /**
     * Check if job is a file.
     * @returns {boolean}
     */
    isFile(): boolean;
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
    move(destinationNest: any, callback: any): void;
    /**
     * Rename the job file to a new _name.
     * @param newName
     */
    rename(newName: string): void;
    /**
     * Deletes the local file.
     */
    remove(): boolean;
    readonly size: any;
    readonly sizeBytes: number;
}
