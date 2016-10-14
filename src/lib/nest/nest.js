"use strict";
var shortid = require("shortid");
/**
 * A nest is a resource that holds or produces jobs.
 */
var Nest = (function () {
    function Nest(e, name) {
        this.e = e;
        this.id = shortid.generate();
        this.name = name;
    }
    Nest.prototype.getId = function () {
        return this.id;
    };
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
        var ns = this;
        ns.e.log(1, "Job \"" + job.getName() + "\" arrived in Nest \"" + ns.name + "\".", ns);
        job.setTunnel(ns.tunnel);
        job.setNest(ns);
        ns.tunnel.arrive(job, ns);
    };
    return Nest;
}());
exports.Nest = Nest;
//# sourceMappingURL=nest.js.map