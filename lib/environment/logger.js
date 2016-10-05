"use strict";
var fs = require("fs"), winston = require("winston"), _ = require("lodash");
/**
 * Logging service
 */
var Logger = (function () {
    function Logger(options) {
        /**
         * Valid log times
         * @type {{0: string; 1: string; 2: string; 3: string}}
         */
        this.log_types = {
            0: "debug",
            1: "info",
            2: "warning",
            3: "error"
        };
        winston.emitErrs = true;
        this.options = options;
        this.createLogger();
    }
    /**
     * Console formatting function.
     * @param options
     * @returns {string}
     */
    Logger.prototype.consoleFormatter = function (options) {
        var kvString = "";
        _.forEach(options.meta, function (key, value) {
            kvString += " " +
                winston.config.colorize("silly", "" + value) +
                winston.config.colorize("debug", " > ") +
                key;
        });
        var formattedDate = new Date().toLocaleString();
        return winston.config.colorize(options.level, formattedDate) + " " +
            winston.config.colorize(options.level, _.padEnd(options.level, 6)) +
            options.message + " " +
            kvString;
    };
    ;
    /**
     * Initializae logger
     */
    Logger.prototype.createLogger = function () {
        var lg = this;
        if (this.options && this.options.log_dir) {
            // Create the log directory if it does not exist
            if (!fs.existsSync(this.options.log_dir)) {
                fs.mkdirSync(this.options.log_dir);
            }
            this.logger = new winston.Logger({
                transports: [
                    new winston.transports.File({
                        level: this.options.log_file_level || "info",
                        filename: this.options.log_dir + "/antfarm.log",
                        handleExceptions: true,
                        json: true,
                        maxsize: this.options.log_max_size || 5242880,
                        maxFiles: this.options.log_max_files || 5,
                        colorize: false
                    }),
                    new winston.transports.Console({
                        level: this.options.log_out_level || "info",
                        handleExceptions: true,
                        prettyPrint: true,
                        colorize: true,
                        silent: false,
                        timestamp: function () {
                            return Date();
                        },
                        formatter: function (options) { return lg.consoleFormatter(options); }
                    })
                ],
                exitOnError: false
            });
        }
        else {
            this.logger = new winston.Logger({
                transports: [
                    new winston.transports.Console({
                        level: this.options.log_out_level || "info",
                        handleExceptions: true,
                        prettyPrint: true,
                        colorize: true,
                        silent: false,
                        timestamp: function () {
                            return Date();
                        },
                        formatter: function (options) { return lg.consoleFormatter(options); }
                    })
                ],
                exitOnError: false
            });
        }
    };
    /**
     * Generates a formatted logging entry.
     * @param entry
     * @param actor
     * @param instances
     * @returns {Object}
     */
    Logger.prototype.getEntry = function (entry, actor, instances) {
        if (instances === void 0) { instances = []; }
        instances.push(actor);
        if (instances) {
            instances.forEach(function (instance) {
                if (instance && typeof instance !== "undefined") {
                    var super_name = instance.toString();
                    try {
                        entry[super_name] = instance.getName();
                        if (super_name === "Job")
                            entry["JobId"] = instance.getId();
                    }
                    catch (e) {
                    }
                }
            });
        }
        return entry;
    };
    /**
     * Create a log entry. Used for log files and console reporting.
     * @param type
     * @param message
     * @param actor
     * @param instances
     */
    Logger.prototype.log = function (type, message, actor, instances) {
        if (typeof (this.log_types[type]) === "undefined") {
            type = 0;
        }
        var log_types = this.log_types;
        var entry = {
            message: message,
            actor: actor.constructor.name
        };
        var modified_entry = this.getEntry(entry, actor, instances);
        this.logger.log(log_types[type], modified_entry);
    };
    return Logger;
}());
exports.Logger = Logger;
