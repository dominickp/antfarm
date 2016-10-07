"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var job_1 = require("./job");
var file_1 = require("./file");
var FileJob = (function (_super) {
    __extends(FileJob, _super);
    /**
     * FileJob constructor.
     * @param e
     * @param path
     */
    function FileJob(e, path) {
        _super.call(this, e, path);
        this.file = new file_1.File(e, path);
    }
    /**
     * Get the file object.
     * @returns {File}
     */
    FileJob.prototype.getFile = function () {
        return this.file;
    };
    /**
     * Get the file name.
     * @returns {string}
     */
    FileJob.prototype.getName = function () {
        return this.file.getName();
    };
    /**
     * Get the file name proper.
     * @returns {string}
     */
    FileJob.prototype.getNameProper = function () {
        return this.file.getNameProper();
    };
    /**
     * Get the file directory name.
     * @returns {string}
     */
    FileJob.prototype.getDirname = function () {
        return this.file.getDirname();
    };
    /**
     * Get the file path.
     * @returns {string}
     */
    FileJob.prototype.getPath = function () {
        return this.file.getPath();
    };
    /**
     * Set a new file path.
     * @param path
     */
    FileJob.prototype.setPath = function (path) {
        this.file.setPath(path);
    };
    /**
     * Set a new file name.
     * @param filename
     */
    FileJob.prototype.setName = function (filename) {
        this.createLifeEvent("set name", this.getName(), filename);
        this.file.setName(filename);
    };
    /**
     * Get the file content type.
     * @returns {string}
     */
    FileJob.prototype.getContentType = function () {
        return this.file.getContentType();
    };
    /**
     * Get the file extension.
     * @returns {string}
     */
    FileJob.prototype.getExtension = function () {
        return this.file.getExtension();
    };
    /**
     * Get the file basename.
     * @returns {string}
     */
    FileJob.prototype.getBasename = function () {
        return this.file.getBasename();
    };
    /**
     * Check if job is a folder.
     * @returns {boolean}
     */
    FileJob.prototype.isFolder = function () {
        return false;
    };
    /**
     * Check if job is a file.
     * @returns {boolean}
     */
    FileJob.prototype.isFile = function () {
        return true;
    };
    /**
     * Moves a file to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest
     * @param callback
     */
    FileJob.prototype.move = function (destinationNest, callback) {
        var fj = this;
        try {
            destinationNest.take(fj, function (new_path) {
                fj.setPath(new_path);
                fj.e.log(1, "Job \"" + fj.getBasename() + "\" was moved to Nest \"" + destinationNest.name + "\".", fj);
                if (callback) {
                    callback();
                }
            });
        }
        catch (e) {
            fj.e.log(3, "Job \"" + fj.getBasename() + "\" was not moved to Nest \"" + destinationNest.name + "\". " + e, fj);
            if (callback) {
                callback();
            }
        }
    };
    /**
     * Rename the job file to a new name.
     * @param newName
     */
    FileJob.prototype.rename = function (newName) {
        var file = this.getFile();
        file.setName(newName);
        file.renameLocal();
    };
    return FileJob;
}(job_1.Job));
exports.FileJob = FileJob;
//# sourceMappingURL=fileJob.js.map