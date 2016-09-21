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
        nest.load();
        nest.watch();
        this.nests.push(nest);
    };
    Tunnel.prototype.arrive = function (job, nest) {
        this.e.log(1, "Job \"" + job.getName() + "\" arrival in Nest \"" + nest.name + "\" triggered Tunnel \"" + this.name + "\" run.", this);
        this.executeRun(job, nest);
    };
    Tunnel.prototype.run = function (callback) {
        this.run_list.push(callback);
    };
    Tunnel.prototype.fail = function (callback) {
        this.run_fail = callback;
    };
    Tunnel.prototype.executeRun = function (job, nest) {
        var tn = this;
        this.run_list.forEach(function (callback) {
            try {
                callback(job, nest);
            }
            catch (e) {
                // Fail if an error is thrown
                tn.executeFail(job, nest, e);
            }
        });
    };
    Tunnel.prototype.executeFail = function (job, nest, reason) {
        this.e.log(3, "Job \"" + job.name + "\" failed for reason \"" + reason + "\".");
        this.run_fail(job, nest, reason);
    };
    return Tunnel;
}());
exports.Tunnel = Tunnel;
