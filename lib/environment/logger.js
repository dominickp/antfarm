"use strict";
var fs = require('fs'), winston = require('winston');
winston.emitErrs = true;
var Logger = (function () {
    function Logger(options) {
        this.log_types = {
            0: "debug",
            1: "info",
            2: "warning",
            3: "error"
        };
        this.options = options;
        this.createLogger();
    }
    Logger.prototype.createLogger = function () {
        if (this.options) {
            if (this.options.log_dir) {
                // Create the log directory if it does not exist
                if (!fs.existsSync(this.options.log_dir)) {
                    fs.mkdirSync(this.options.log_dir);
                }
                this.logger = new winston.Logger({
                    transports: [
                        new winston.transports.File({
                            level: this.options.log_file_level || 'info',
                            filename: this.options.log_dir + "/somefile.log",
                            handleExceptions: true,
                            json: true,
                            maxsize: this.options.log_max_size || 5242880,
                            maxFiles: this.options.log_max_files || 5,
                            colorize: false
                        }),
                        new winston.transports.Console({
                            level: this.options.log_out_level || 'debug',
                            handleExceptions: true,
                            json: false,
                            colorize: true
                        })
                    ],
                    exitOnError: false
                });
            }
        }
        else {
            this.logger = new winston.Logger({
                transports: [
                    new winston.transports.Console({
                        level: 'debug',
                        handleExceptions: true,
                        json: false,
                        colorize: true
                    })
                ],
                exitOnError: false
            });
        }
    };
    Logger.prototype.log = function (type, message) {
        if (typeof (this.log_types[type]) == "undefined") {
            type = 0;
        }
        var log_types = this.log_types;
        if (log_types[type] == "debug") {
            this.logger.debug(message);
        }
        else if (log_types[type] == "info") {
            this.logger.info(message);
        }
        else if (log_types[type] == "warning") {
            this.logger.warn(message);
        }
        else if (log_types[type] == "error") {
            this.logger.error(message);
        }
    };
    return Logger;
}());
exports.Logger = Logger;
