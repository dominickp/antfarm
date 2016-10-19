"use strict";
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
        jp.type = typeof (jp.value);
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
