"use strict";
var Nest = (function () {
    function Nest(e, name) {
        this.e = e;
        this.name = name;
    }
    Nest.prototype.toString = function () {
        return "Nest";
    };
    Nest.prototype.getName = function () {
        return this.name;
    };
    Nest.prototype.getTunnel = function () {
        return this.tunnel;
    };
    Nest.prototype.register = function (tunnel) {
        this.tunnel = tunnel;
    };
    Nest.prototype.arrive = function (job) {
        this.e.log(1, "Job \"" + job.getName() + "\" arrived in Nest \"" + this.name + "\".", this);
        job.setTunnel(this.tunnel);
        this.tunnel.arrive(job, this);
    };
    return Nest;
}());
exports.Nest = Nest;
