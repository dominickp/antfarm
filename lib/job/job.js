"use strict";
var Job = (function () {
    function Job(name) {
        this.name = name;
    }
    Job.prototype.fail = function (reason) {
        if (!this.tunnel) {
            console.error("Failed before tunnel set on job");
        }
        this.tunnel.executeFail(this, this.nest, reason);
    };
    Job.prototype.setPath = function (path) {
        this.path = path;
    };
    return Job;
}());
exports.Job = Job;
