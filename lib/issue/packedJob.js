"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fileJob_1 = require("./fileJob");
var MyPackedJob = (function (_super) {
    __extends(MyPackedJob, _super);
    function MyPackedJob(job) {
        _super.call(this, "Packedjob");
        this.job = job;
    }
    return MyPackedJob;
}(fileJob_1.MyFileJob));
exports.MyPackedJob = MyPackedJob;
