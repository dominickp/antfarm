"use strict";
var chalk = require('chalk');
var fs = require('fs');
var winston = require('winston');
winston.emitErrs = true;
var logger_1 = require("./logger");
var Environment = (function () {
    function Environment(options) {
        this.options = options;
        this.logger = new logger_1.Logger(this.options);
    }
    Environment.prototype.log = function (type, message, instance) {
        this.logger.log(type, message, instance);
    };
    return Environment;
}());
exports.Environment = Environment;
