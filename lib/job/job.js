"use strict";
var Job = (function () {
    function Job(e, name) {
        this.e = e;
        this.name = name;
        this.e.log(1, "New Job \"" + name + "\" created.");
    }
    Job.prototype.fail = function (reason) {
        if (!this.tunnel) {
            this.e.log(3, "Job \"" + name + "\" failed before tunnel was set.");
        }
        this.tunnel.executeFail(this, this.nest, reason);
    };
    Job.prototype.setPath = function (path) {
        this.path = path;
    };
    return Job;
}());
exports.Job = Job;
