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
    function FolderJob(e, path) {
        _super.call(this, e, path);
        this.path = path;
        this.files = [];
        this.basename = node_path.basename(this.path);
        this.dirname = node_path.dirname(this.path);
        // verify path leads to a valid, readable file, handle error if not
    }
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
    FolderJob.prototype.getPath = function () {
        return this.path;
    };
    FolderJob.prototype.addFile = function (file) {
        this.files.push(file);
        this.e.log(0, "Adding file \"" + file.getName() + "\" to job.", this);
    };
    FolderJob.prototype.getFile = function (index) {
        return this.files[index];
    };
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
    FolderJob.prototype.getExtension = function () {
        return null;
    };
    FolderJob.prototype.isFolder = function () {
        return true;
    };
    FolderJob.prototype.isFile = function () {
        return false;
    };
    return FolderJob;
}(job_1.Job));
exports.FolderJob = FolderJob;
