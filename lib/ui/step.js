"use strict";
/**
 * An interface step which allows GET requests to be made against the interface itself.
 */
var Step = (function () {
    function Step() {
    }
    /**
     * Set complete and wipe out any failure
     * @param complete
     */
    Step.prototype.setComplete = function (complete) {
        var s = this;
        if (complete === true) {
            s.complete = true;
            s.failure = null;
        }
        else {
            s.complete = false;
        }
    };
    return Step;
}());
exports.Step = Step;
