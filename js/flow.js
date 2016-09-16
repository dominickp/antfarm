"use strict";
var Flow = (function () {
    function Flow(theName) {
        this.name = theName;
    }
    Flow.prototype.move = function (distanceInMeters) {
        if (distanceInMeters === void 0) { distanceInMeters = 0; }
        console.log(this.name + " moved " + distanceInMeters + "m.");
    };
    Flow.prototype.run = function () {
    };
    return Flow;
}());
exports.Flow = Flow;
