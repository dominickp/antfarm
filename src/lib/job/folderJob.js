"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var job_1 = require("./job");
var file_1 = require("./file");
var node_path = require("path"), fs = require("fs");
var FolderJob = (function (_super) {
    __extends(FolderJob, _super);
    /**
     * FolderJob constructor
     * @param e
     * @param path
     */
    function FolderJob(e, path) {
        _super.call(this, e, path);
        this.path = path;
        this.files = [];
        this.getStatistics();
        // verify path leads to a valid, readable file, handle error if not
    }
    FolderJob.prototype.getStatistics = function () {
        this.basename = node_path.basename(this.getPath());
        this.dirname = node_path.dirname(this.getPath());
    };
    /**
     * Creates file objects for folder contents. Async operation returns a callback on completion.
     * @param callback
     */
    FolderJob.prototype.createFiles = function (callback) {
        var fl = this;
        var folder_path = this.getPath();
        fs.readdir(folder_path, function (err, items) {
            items = items.filter(function (item) { return !(/(^|\/)\.[^\/\.]/g).test(item); });
            items.forEach(function (filename) {
                var filepath = folder_path + node_path.sep + filename;
                var file = new file_1.File(fl.e, filepath);
                fl.addFile(file);
            });
            callback();
        });
    };
    /**
     * Gets the job name.
     * @returns {string}
     */
    FolderJob.prototype.getName = function () {
        return this.getBasename();
    };
    /**
     * Get the basename.
     * @returns {string}
     */
    FolderJob.prototype.getBasename = function () {
        return this.basename;
    };
    /**
     * Get the directory name.
     * @returns {string}
     */
    FolderJob.prototype.getDirname = function () {
        return this.dirname;
    };
    /**
     * Get the path.
     * @returns {string}
     */
    FolderJob.prototype.getPath = function () {
        return this.path;
    };
    /**
     * Set a new path.
     * @param path
     */
    FolderJob.prototype.setPath = function (path) {
        this.path = path;
        this.getStatistics();
    };
    /**
     * Add a file object to the job.
     * @param file
     */
    FolderJob.prototype.addFile = function (file) {
        this.files.push(file);
        this.e.log(0, "Adding file \"" + file.getName() + "\" to job.", this);
    };
    /**
     * Get a file object from the job.
     * @param index
     * @returns {File}
     */
    FolderJob.prototype.getFile = function (index) {
        return this.files[index];
    };
    /**
     * Get all files associated with the job.
     * @returns {File[]}
     */
    FolderJob.prototype.getFiles = function () {
        return this.files;
    };
    /**
     * Get the number of files in this folder.
     * @returns {number}
     */
    FolderJob.prototype.count = function () {
        return this.files.length;
    };
    /**
     * Get the extension.
     * @returns {null}
     */
    FolderJob.prototype.getExtension = function () {
        return null;
    };
    /**
     * Check if job is a folder.
     * @returns {boolean}
     */
    FolderJob.prototype.isFolder = function () {
        return true;
    };
    /**
     * Check if job is a file.
     * @returns {boolean}
     */
    FolderJob.prototype.isFile = function () {
        return false;
    };
    /**
     * Moves a folder to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest
     * @param callback
     */
    FolderJob.prototype.move = function (destinationNest, callback) {
        var fj = this;
        try {
            destinationNest.take(fj, function (new_path) {
                fj.setPath(new_path);
                fj.e.log(1, "Job \"" + fj.getName() + "\" was moved to Nest \"" + destinationNest.name + "\".", fj);
                if (callback) {
                    callback();
                }
            });
        }
        catch (e) {
            fj.e.log(3, "Job \"" + fj.getName() + "\" was not moved to Nest \"" + destinationNest.name + "\". " + e, fj);
            if (callback) {
                callback();
            }
        }
    };
    /**
     * Renames the job folder, leaving its content's names alone.
     * @param newName
     */
    FolderJob.prototype.rename = function (newName) {
        var fj = this;
        var new_path = fj.getDirname() + node_path.sep + newName;
        fs.renameSync(fj.getPath(), new_path);
        fj.setPath(new_path);
    };
    return FolderJob;
}(job_1.Job));
exports.FolderJob = FolderJob;
//# sourceMappingURL=folderJob.js.map