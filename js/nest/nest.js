"use strict";
var Nest = (function () {
    function Nest(name) {
        this.name = name;
    }
    Nest.prototype.register = function (tunnel) {
        this.tunnel = tunnel;
    };
    Nest.prototype.arrive = function (job) {
        this.tunnel.arrive(job, this);
    };
    return Nest;
}());
exports.Nest = Nest;
