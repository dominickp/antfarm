"use strict";
var logger_1 = require("./logger");
var Environment = (function () {
    function Environment(options) {
        this.options = options;
        this.logger = new logger_1.Logger(this.options);
    }
    Environment.prototype.toString = function () {
        return "Environment";
    };
    Environment.prototype.log = function (type, message, actor, instances) {
        // try {
        //     this.logger.log(type, message, actor, instances);
        // } catch (e) {
        //     console.log(e);
        // }
        if (instances === void 0) { instances = []; }
        this.logger.log(type, message, actor, instances);
    };
    return Environment;
}());
exports.Environment = Environment;
