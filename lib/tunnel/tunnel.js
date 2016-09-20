"use strict";
var Tunnel = (function () {
    function Tunnel(e, theName) {
        this.e = e;
        this.nests = [];
        this.name = theName;
        this.run_list = [];
    }
    Tunnel.prototype.watch = function (nest) {
        nest.register(this);
        this.nests.push(nest);
    };
    Tunnel.prototype.arrive = function (job, nest) {
        this.e.log(1, "Job \"" + job.name + "\" arrival in Nest \"" + nest.name + "\" triggered Tunnel \"" + this.name + "\" run.");
        this.executeRun(job, nest);
    };
    Tunnel.prototype.run = function (callback) {
        this.run_list.push(callback);
    };
    Tunnel.prototype.fail = function (callback) {
        this.run_fail = callback;
    };
    Tunnel.prototype.executeRun = function (job, nest) {
        this.run_list.forEach(function (callback) {
            callback(job, nest);
        });
    };
    Tunnel.prototype.executeFail = function (job, nest, reason) {
        this.e.log(3, "Job failed " + job.name);
        this.run_fail(job, nest, reason);
    };
    return Tunnel;
}());
exports.Tunnel = Tunnel;
