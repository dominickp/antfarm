"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var job_1 = require("./job");
var mime = require("mime-types"), fileExtension = require("file-extension"), node_path = require("path");
var FileJob = (function (_super) {
    __extends(FileJob, _super);
    function FileJob(e, path) {
        _super.call(this, e, path);
        this.path = path;
        this.basename = node_path.basename(this.path);
        // verify path leads to a valid, readable file, handle error if not
        this.contentType = mime.lookup(this.path);
        this.extension = fileExtension(this.path);
    }
    FileJob.prototype.getName = function () {
        return this.basename;
    };
    FileJob.prototype.getPath = function () {
        return this.path;
    };
    FileJob.prototype.setPath = function (path) {
        this.path = path;
    };
    FileJob.prototype.setName = function (filename) {
        this.basename = filename;
    };
    FileJob.prototype.getContentType = function () {
        return this.contentType;
    };
    FileJob.prototype.getExtension = function () {
        return this.extension;
    };
    FileJob.prototype.getBasename = function () {
        return this.basename;
    };
    FileJob.prototype.move = function (destinationNest) {
        var fj = this;
        try {
            destinationNest.take(fj, function (new_path) {
                fj.setPath(new_path);
                fj.e.log(1, "Job \"" + fj.basename + "\" was moved to Nest \"" + destinationNest.name + "\".", fj);
            });
        }
        catch (e) {
            fj.e.log(3, "Job \"" + fj.basename + "\" was not moved to Nest \"" + destinationNest.name + "\". " + e, fj);
        }
    };
    return FileJob;
}(job_1.Job));
exports.FileJob = FileJob;
