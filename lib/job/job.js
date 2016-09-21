"use strict";
var Job = (function () {
    function Job(e, name) {
        this.e = e;
        this.name = name;
        this.e.log(1, "New Job \"" + name + "\" created.", this);
    }
    Job.prototype.getName = function () {
        return this.name;
    };
    Job.prototype.fail = function (reason) {
        if (!this.tunnel) {
            this.e.log(3, "Job \"" + this.getName() + "\" failed before tunnel was set.", this);
        }
        this.tunnel.executeFail(this, this.nest, reason);
    };
    return Job;
}());
exports.Job = Job;
