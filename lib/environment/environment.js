"use strict";
var chalk = require('chalk');
var Environment = (function () {
    function Environment() {
        this.log_types = {
            0: "debug",
            1: "info",
            2: "warning",
            3: "error"
        };
    }
    Environment.prototype.log = function (type, message) {
        if (typeof (this.log_types[type]) == "undefined") {
            type = 0;
        }
        var log_string = "» ";
        var log_types = this.log_types;
        if (log_types[type] == "debug") {
            log_string += chalk.cyan(log_types[type] + ": " + message);
        }
        else if (log_types[type] == "info") {
            log_string += chalk.white(log_types[type] + ": " + message);
        }
        else if (log_types[type] == "warning") {
            log_string += chalk.yellow(log_types[type] + ": " + message);
        }
        else if (log_types[type] == "error") {
            log_string += chalk.red(log_types[type] + ": " + message);
        }
        console.log(log_string);
    };
    return Environment;
}());
exports.Environment = Environment;
