"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var mime = require('mime-types'), fileExtension = require('file-extension');
var job_1 = require("./job");
var FileJob = (function (_super) {
    __extends(FileJob, _super);
    function FileJob(e, path) {
        _super.call(this, e, path);
        this.path = path;
        // verify path leads to a valid, readable file, handle error if not
        this.contentType = mime.lookup(this.path);
        this.extension = fileExtension(this.path);
    }
    FileJob.prototype.getContentType = function () {
        return this.contentType;
    };
    FileJob.prototype.getExtension = function () {
        return this.extension;
    };
    return FileJob;
}(job_1.Job));
exports.FileJob = FileJob;
