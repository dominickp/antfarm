"use strict";
/**
 * The LifeEvent class provides a lifecycle that can be provided to debug job failures.
 */
var LifeEvent = (function () {
    function LifeEvent(verb, start, finish) {
        var le = this;
        le.date = new Date();
        le.verb = verb;
        le.start = start;
        le.finish = finish;
    }
    LifeEvent.prototype.getStatement = function () {
        var le = this;
        return le.verb + " from " + le.start + " to " + le.finish;
    };
    ;
    return LifeEvent;
}());
exports.LifeEvent = LifeEvent;
//# sourceMappingURL=lifeEvent.js.map