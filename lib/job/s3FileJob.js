"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fileJob_1 = require("./fileJob");
var tmp = require("tmp");
var S3FileJob = (function (_super) {
    __extends(S3FileJob, _super);
    function S3FileJob(e, basename) {
        // Create temp file
        var tmpobj = tmp.fileSync();
        _super.call(this, e, tmpobj.name);
        this.rename(basename);
        this.setLocallyAvailable(false);
    }
    return S3FileJob;
}(fileJob_1.FileJob));
exports.S3FileJob = S3FileJob;
