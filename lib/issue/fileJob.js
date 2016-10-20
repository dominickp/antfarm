"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var job_1 = require("./job");
var MyFileJob = (function (_super) {
    __extends(MyFileJob, _super);
    function MyFileJob(name) {
        _super.call(this, name);
    }
    return MyFileJob;
}(job_1.MyJob));
exports.MyFileJob = MyFileJob;
