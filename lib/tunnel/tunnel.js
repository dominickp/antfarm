"use strict";
var Tunnel = (function () {
    function Tunnel(theName) {
        this.name = theName;
    }
    Tunnel.prototype.move = function (distanceInMeters) {
        if (distanceInMeters === void 0) { distanceInMeters = 0; }
        console.log(this.name + " moved " + distanceInMeters + "m.");
    };
    Tunnel.prototype.watch = function (nest) {
        nest.register(this);
    };
    Tunnel.prototype.arrive = function (job, nest) {
        console.log("New job arrived. " + job.name);
    };
    Tunnel.prototype.run = function () {
    };
    return Tunnel;
}());
exports.Tunnel = Tunnel;
