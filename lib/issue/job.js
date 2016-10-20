"use strict";
var packedJob_1 = require("./packedJob");
var MyJob = (function () {
    function MyJob(name) {
        this.name = name;
    }
    MyJob.prototype.pack = function () {
        return new packedJob_1.MyPackedJob(this);
    };
    return MyJob;
}());
exports.MyJob = MyJob;
