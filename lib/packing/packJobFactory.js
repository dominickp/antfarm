"use strict";
var packedJob_1 = require("../job/packedJob");
var PackJobFactory = (function () {
    function PackJobFactory(e, job) {
        return new packedJob_1.PackedJob(e, job);
    }
    return PackJobFactory;
}());
exports.PackJobFactory = PackJobFactory;
