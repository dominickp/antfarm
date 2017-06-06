"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            2: "warn",
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
     * Initialize logger
     */
    Logger.prototype.createLogger = function () {
        var lg = this;
        if (lg.options && lg.options.log_dir) {
            // Create the log directory if it does not exist
            if (!fs.existsSync(lg.options.log_dir)) {
                fs.mkdirSync(lg.options.log_dir);
            }
            lg.logger = new winston.Logger({
                transports: [
                    new winston.transports.File({
                        level: lg.options.log_file_level || "info",
                        filename: lg.options.log_dir + "/antfarm.log",
                        handleExceptions: true,
                        json: true,
                        maxsize: lg.options.log_max_size || 5242880,
                        maxFiles: lg.options.log_max_files || 5,
                        colorize: false
                    }),
                    new winston.transports.Console({
                        level: lg.options.log_out_level || "info",
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
            lg.logger = new winston.Logger({
                transports: [
                    new winston.transports.Console({
                        level: lg.options.log_out_level || "info",
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
                        entry[super_name] = instance.name;
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
     * Create a log entry. Used for log _files and console reporting.
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
    Logger.prototype.query = function (options, callback) {
        var l = this;
        l.logger.query(options, function (err, results) {
            if (err) {
                l.log(3, "Log query error: " + err + ".", l);
            }
            callback(results);
        });
    };
    return Logger;
}());
exports.Logger = Logger;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJO1NBQ2hDLENBQUM7UUFFRixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFNUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFHTSxzQkFBSyxHQUFaLFVBQWEsT0FBd0IsRUFBRSxRQUFhO1FBQ2hELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNiLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxVQUFDLEdBQUcsRUFBRSxPQUFPO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsc0JBQW9CLEdBQUcsTUFBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLENBQUM7WUFDRCxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUwsYUFBQztBQUFELENBdktBLEFBdUtDLElBQUE7QUF2S1ksd0JBQU0iLCJmaWxlIjoibGliL2Vudmlyb25tZW50L2xvZ2dlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QW50ZmFybU9wdGlvbnN9IGZyb20gXCIuL29wdGlvbnNcIjtcclxuXHJcbmNvbnN0ICAgZnMgPSByZXF1aXJlKFwiZnNcIiksXHJcbiAgICAgICAgd2luc3RvbiA9IHJlcXVpcmUoXCJ3aW5zdG9uXCIpLFxyXG4gICAgICAgIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xyXG5cclxuLyoqXHJcbiAqIExvZ2dpbmcgc2VydmljZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIExvZ2dlciB7XHJcblxyXG4gICAgcHJvdGVjdGVkIG9wdGlvbnM6IEFudGZhcm1PcHRpb25zO1xyXG5cclxuICAgIHByb3RlY3RlZCBsb2dnZXI7XHJcblxyXG4gICAgcHJvdGVjdGVkIGxvZ19kaXI6IHN0cmluZztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFZhbGlkIGxvZyB0aW1lc1xyXG4gICAgICogQHR5cGUge3swOiBzdHJpbmc7IDE6IHN0cmluZzsgMjogc3RyaW5nOyAzOiBzdHJpbmd9fVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgbG9nX3R5cGVzID0ge1xyXG4gICAgICAgIDA6IFwiZGVidWdcIixcclxuICAgICAgICAxOiBcImluZm9cIixcclxuICAgICAgICAyOiBcIndhcm5cIixcclxuICAgICAgICAzOiBcImVycm9yXCJcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucz86IEFudGZhcm1PcHRpb25zKSB7XHJcbiAgICAgICAgd2luc3Rvbi5lbWl0RXJycyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICB0aGlzLmNyZWF0ZUxvZ2dlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uc29sZSBmb3JtYXR0aW5nIGZ1bmN0aW9uLlxyXG4gICAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjb25zb2xlRm9ybWF0dGVyKG9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgbGV0IGt2U3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICAgICAgXy5mb3JFYWNoKG9wdGlvbnMubWV0YSwgKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICAgICAga3ZTdHJpbmcgKz0gXCIgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5zdG9uLmNvbmZpZy5jb2xvcml6ZShcInNpbGx5XCIsIGAke3ZhbHVlfWApICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luc3Rvbi5jb25maWcuY29sb3JpemUoXCJkZWJ1Z1wiLCBcIiA+IFwiKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IGZvcm1hdHRlZERhdGUgPSBuZXcgRGF0ZSgpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIHJldHVybiAgd2luc3Rvbi5jb25maWcuY29sb3JpemUob3B0aW9ucy5sZXZlbCwgZm9ybWF0dGVkRGF0ZSkgKyBcIiBcIiArXHJcbiAgICAgICAgICAgICAgICB3aW5zdG9uLmNvbmZpZy5jb2xvcml6ZShvcHRpb25zLmxldmVsLCBfLnBhZEVuZChvcHRpb25zLmxldmVsLCA2KSkgK1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5tZXNzYWdlICsgXCIgXCIgK1xyXG4gICAgICAgICAgICAgICAga3ZTdHJpbmc7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZSBsb2dnZXJcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUxvZ2dlcigpIHtcclxuICAgICAgICBsZXQgbGcgPSB0aGlzO1xyXG4gICAgICAgIGlmIChsZy5vcHRpb25zICYmIGxnLm9wdGlvbnMubG9nX2Rpcikge1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBsb2cgZGlyZWN0b3J5IGlmIGl0IGRvZXMgbm90IGV4aXN0XHJcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhsZy5vcHRpb25zLmxvZ19kaXIpKSB7XHJcbiAgICAgICAgICAgICAgICBmcy5ta2RpclN5bmMobGcub3B0aW9ucy5sb2dfZGlyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGcubG9nZ2VyID0gbmV3IHdpbnN0b24uTG9nZ2VyKHtcclxuICAgICAgICAgICAgICAgIHRyYW5zcG9ydHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkZpbGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXZlbDogbGcub3B0aW9ucy5sb2dfZmlsZV9sZXZlbCB8fCBcImluZm9cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IGAke2xnLm9wdGlvbnMubG9nX2Rpcn0vYW50ZmFybS5sb2dgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVFeGNlcHRpb25zOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhzaXplOiBsZy5vcHRpb25zLmxvZ19tYXhfc2l6ZSB8fCA1MjQyODgwLCAvLyA1TUJcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4RmlsZXM6IGxnLm9wdGlvbnMubG9nX21heF9maWxlcyB8fCA1LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcml6ZTogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXZlbDogbGcub3B0aW9ucy5sb2dfb3V0X2xldmVsIHx8IFwiaW5mb1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVFeGNlcHRpb25zOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV0dHlQcmludDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3JpemU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpbGVudDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVyOiAob3B0aW9ucykgPT4geyByZXR1cm4gbGcuY29uc29sZUZvcm1hdHRlcihvcHRpb25zKTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgZXhpdE9uRXJyb3I6IGZhbHNlXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZy5sb2dnZXIgPSBuZXcgd2luc3Rvbi5Mb2dnZXIoe1xyXG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsOiBsZy5vcHRpb25zLmxvZ19vdXRfbGV2ZWwgfHwgXCJpbmZvXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZUV4Y2VwdGlvbnM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXR0eVByaW50OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcml6ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2lsZW50OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gRGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZXI6IChvcHRpb25zKSA9PiB7IHJldHVybiBsZy5jb25zb2xlRm9ybWF0dGVyKG9wdGlvbnMpOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBleGl0T25FcnJvcjogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGVzIGEgZm9ybWF0dGVkIGxvZ2dpbmcgZW50cnkuXHJcbiAgICAgKiBAcGFyYW0gZW50cnlcclxuICAgICAqIEBwYXJhbSBhY3RvclxyXG4gICAgICogQHBhcmFtIGluc3RhbmNlc1xyXG4gICAgICogQHJldHVybnMge09iamVjdH1cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldEVudHJ5KGVudHJ5OiBPYmplY3QsIGFjdG9yPzogYW55LCBpbnN0YW5jZXMgPSBbXSkge1xyXG4gICAgICAgIGluc3RhbmNlcy5wdXNoKGFjdG9yKTtcclxuICAgICAgICBpZiAoaW5zdGFuY2VzKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlcy5mb3JFYWNoKChpbnN0YW5jZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIHR5cGVvZiBpbnN0YW5jZSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdXBlcl9uYW1lID0gaW5zdGFuY2UudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlbc3VwZXJfbmFtZV0gPSBpbnN0YW5jZS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3VwZXJfbmFtZSA9PT0gXCJKb2JcIikgZW50cnlbXCJKb2JJZFwiXSA9IGluc3RhbmNlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBlbnRyeTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIGxvZyBlbnRyeS4gVXNlZCBmb3IgbG9nIF9maWxlcyBhbmQgY29uc29sZSByZXBvcnRpbmcuXHJcbiAgICAgKiBAcGFyYW0gdHlwZVxyXG4gICAgICogQHBhcmFtIG1lc3NhZ2VcclxuICAgICAqIEBwYXJhbSBhY3RvclxyXG4gICAgICogQHBhcmFtIGluc3RhbmNlc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbG9nKHR5cGU6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nLCBhY3Rvcj86IGFueSwgIGluc3RhbmNlcz86IGFueSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YodGhpcy5sb2dfdHlwZXNbdHlwZV0pID09PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgIHR5cGUgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGxvZ190eXBlcyA9IHRoaXMubG9nX3R5cGVzO1xyXG5cclxuICAgICAgICBsZXQgZW50cnkgPSB7XHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbiAgICAgICAgICAgIGFjdG9yOiBhY3Rvci5jb25zdHJ1Y3Rvci5uYW1lXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IG1vZGlmaWVkX2VudHJ5ID0gdGhpcy5nZXRFbnRyeShlbnRyeSwgYWN0b3IsIGluc3RhbmNlcyk7XHJcblxyXG4gICAgICAgIHRoaXMubG9nZ2VyLmxvZyhsb2dfdHlwZXNbdHlwZV0sIG1vZGlmaWVkX2VudHJ5KTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIHF1ZXJ5KG9wdGlvbnM6IExvZ1F1ZXJ5T3B0aW9ucywgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgIGxldCBsID0gdGhpcztcclxuICAgICAgICBsLmxvZ2dlci5xdWVyeShvcHRpb25zLCAoZXJyLCByZXN1bHRzKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGwubG9nKDMsIGBMb2cgcXVlcnkgZXJyb3I6ICR7ZXJyfS5gLCBsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHRzKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9nUXVlcnlPcHRpb25zIHtcclxuICAgIGZyb206IERhdGUgfCBudW1iZXI7XHJcbiAgICB1bnRpbDogRGF0ZSB8IG51bWJlcjtcclxuICAgIGxpbWl0OiBudW1iZXI7XHJcbiAgICBzdGFydDogbnVtYmVyO1xyXG4gICAgb3JkZXI6IHN0cmluZztcclxuICAgIGZpZWxkczogc3RyaW5nW107XHJcbn0iXX0=
