"use strict";
var Nest = (function () {
    function Nest(theName) {
        this.name = theName;
    }
    Nest.prototype.move = function (distanceInMeters) {
        if (distanceInMeters === void 0) { distanceInMeters = 0; }
        console.log(this.name + " moved " + distanceInMeters + "m.");
    };
    return Nest;
}());
exports.Nest = Nest;
