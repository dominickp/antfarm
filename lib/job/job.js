"use strict";
var Job = (function () {
    function Job(name) {
        this.name = name;
    }
    Job.prototype.setPath = function (path) {
        this.path = path;
    };
    return Job;
}());
exports.Job = Job;
