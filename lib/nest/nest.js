"use strict";
var Nest = (function () {
    function Nest(e, name) {
        this.e = e;
        this.name = name;
    }
    Nest.prototype.register = function (tunnel) {
        this.tunnel = tunnel;
    };
    Nest.prototype.arrive = function (job) {
        this.e.log(1, "Job \"" + job.getName() + "\" arrived in Nest \"" + this.name + "\".");
        job.tunnel = this.tunnel;
        this.tunnel.arrive(job, this);
    };
    return Nest;
}());
exports.Nest = Nest;
