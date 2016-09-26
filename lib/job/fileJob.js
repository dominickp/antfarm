"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var job_1 = require("./job");
var file_1 = require("./file");
var node_path = require("path"), fs = require("fs");
var FileJob = (function (_super) {
    __extends(FileJob, _super);
    function FileJob(e, path) {
        _super.call(this, e, path);
        this.file = new file_1.File(e, path);
    }
    FileJob.prototype.getFile = function () {
        return this.file;
    };
    FileJob.prototype.getName = function () {
        return this.file.getName();
    };
    FileJob.prototype.getDirname = function () {
        return this.file.getDirname();
    };
    FileJob.prototype.getPath = function () {
        return this.file.getPath();
    };
    FileJob.prototype.setPath = function (path) {
        this.file.setPath(path);
    };
    FileJob.prototype.setName = function (filename) {
        this.file.setName(filename);
    };
    FileJob.prototype.getContentType = function () {
        return this.file.getContentType();
    };
    FileJob.prototype.getExtension = function () {
        return this.file.getExtension();
    };
    FileJob.prototype.getBasename = function () {
        return this.file.getBasename();
    };
    FileJob.prototype.isFolder = function () {
        return false;
    };
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
    FileJob.prototype.rename = function (newName) {
        var file = this.getFile();
        file.setName(newName);
        file.renameLocal();
    };
    return FileJob;
}(job_1.Job));
exports.FileJob = FileJob;
