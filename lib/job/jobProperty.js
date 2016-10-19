"use strict";
var util_1 = require("util");
var JobProperty = (function () {
    function JobProperty(key, value) {
        var jp = this;
        jp.key = key;
        jp.setValue(value);
    }
    JobProperty.prototype.setValue = function (value) {
        this.value = value;
        this.resolveType();
    };
    JobProperty.prototype.resolveType = function () {
        var jp = this;
        var type = typeof (jp.value);
        if (util_1.isArray(jp.value)) {
            jp.type = "array";
        }
        else {
            jp.type = type;
        }
    };
    JobProperty.prototype.getValue = function () {
        return this.value;
    };
    JobProperty.prototype.getType = function () {
        return this.type;
    };
    return JobProperty;
}());
exports.JobProperty = JobProperty;
