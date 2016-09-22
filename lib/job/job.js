"use strict";
var Job = (function () {
    function Job(e, name) {
        this.e = e;
        this.name = name;
        this.e.log(1, "New Job \"" + name + "\" created.", this);
    }
    Job.prototype.getIsLocallyAvailable = function () {
        return this.isLocallyAvailable;
    };
    Job.prototype.setIsLocallyAvailable = function (available) {
        this.isLocallyAvailable = available;
    };
    Job.prototype.setName = function (name) {
        this.name = name;
    };
    Job.prototype.getName = function () {
        return this.name;
    };
    Job.prototype.setNest = function (nest) {
        this.nest = nest;
    };
    Job.prototype.getNest = function () {
        return this.nest;
    };
    Job.prototype.setTunnel = function (tunnel) {
        this.tunnel = tunnel;
    };
    Job.prototype.getTunnel = function () {
        return this.tunnel;
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
