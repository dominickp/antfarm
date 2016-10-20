"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fileJob_1 = require("./fileJob");
var PackedJob = (function (_super) {
    __extends(PackedJob, _super);
    function PackedJob(e, job) {
        // let job_name = job.getName();
        _super.call(this, e, job);
        this.e = e;
        console.log("PACKED JOB");
    }
    return PackedJob;
}(fileJob_1.FileJob));
exports.PackedJob = PackedJob;
