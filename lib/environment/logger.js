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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLElBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDbEIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFDNUIsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUU5Qjs7R0FFRztBQUNIO0lBbUJJLGdCQUFZLE9BQXdCO1FBWHBDOzs7V0FHRztRQUNPLGNBQVMsR0FBRztZQUNsQixDQUFDLEVBQUUsT0FBTztZQUNWLENBQUMsRUFBRSxNQUFNO1lBQ1QsQ0FBQyxFQUFFLE1BQU07WUFDVCxDQUFDLEVBQUUsT0FBTztTQUNiLENBQUM7UUFHRSxPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDTyxpQ0FBZ0IsR0FBMUIsVUFBMkIsT0FBTztRQUU5QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFbEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQUMsR0FBRyxFQUFFLEtBQUs7WUFDL0IsUUFBUSxJQUFJLEdBQUc7Z0JBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUcsS0FBTyxDQUFDO2dCQUM1QyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO2dCQUN2QyxHQUFHLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLGFBQWEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRWhELE1BQU0sQ0FBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGFB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LENBQUMsV0FBVyxDQUFDLElBQUk7U0FDaEMsQ0FBQztRQUVGLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUU1RCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUdNLHNCQUFLLEdBQVosVUFBYSxPQUF3QixFQUFFLFFBQWE7UUFDaEQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQUMsR0FBRyxFQUFFLE9BQU87WUFDakMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDTixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxzQkFBb0IsR0FBRyxNQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUNELFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTCxhQUFDO0FBQUQsQ0F2S0EsQUF1S0MsSUFBQTtBQXZLWSxjQUFNLFNBdUtsQixDQUFBIiwiZmlsZSI6ImxpYi9lbnZpcm9ubWVudC9sb2dnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FudGZhcm1PcHRpb25zfSBmcm9tIFwiLi9vcHRpb25zXCI7XG5cbmNvbnN0ICAgZnMgPSByZXF1aXJlKFwiZnNcIiksXG4gICAgICAgIHdpbnN0b24gPSByZXF1aXJlKFwid2luc3RvblwiKSxcbiAgICAgICAgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbi8qKlxuICogTG9nZ2luZyBzZXJ2aWNlXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2dnZXIge1xuXG4gICAgcHJvdGVjdGVkIG9wdGlvbnM6IEFudGZhcm1PcHRpb25zO1xuXG4gICAgcHJvdGVjdGVkIGxvZ2dlcjtcblxuICAgIHByb3RlY3RlZCBsb2dfZGlyOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBWYWxpZCBsb2cgdGltZXNcbiAgICAgKiBAdHlwZSB7ezA6IHN0cmluZzsgMTogc3RyaW5nOyAyOiBzdHJpbmc7IDM6IHN0cmluZ319XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGxvZ190eXBlcyA9IHtcbiAgICAgICAgMDogXCJkZWJ1Z1wiLFxuICAgICAgICAxOiBcImluZm9cIixcbiAgICAgICAgMjogXCJ3YXJuXCIsXG4gICAgICAgIDM6IFwiZXJyb3JcIlxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zPzogQW50ZmFybU9wdGlvbnMpIHtcbiAgICAgICAgd2luc3Rvbi5lbWl0RXJycyA9IHRydWU7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMuY3JlYXRlTG9nZ2VyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29uc29sZSBmb3JtYXR0aW5nIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29uc29sZUZvcm1hdHRlcihvcHRpb25zKSB7XG5cbiAgICAgICAgbGV0IGt2U3RyaW5nID0gXCJcIjtcblxuICAgICAgICBfLmZvckVhY2gob3B0aW9ucy5tZXRhLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAga3ZTdHJpbmcgKz0gXCIgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luc3Rvbi5jb25maWcuY29sb3JpemUoXCJzaWxseVwiLCBgJHt2YWx1ZX1gKSArXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5zdG9uLmNvbmZpZy5jb2xvcml6ZShcImRlYnVnXCIsIFwiID4gXCIpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGZvcm1hdHRlZERhdGUgPSBuZXcgRGF0ZSgpLnRvTG9jYWxlU3RyaW5nKCk7XG5cbiAgICAgICAgcmV0dXJuICB3aW5zdG9uLmNvbmZpZy5jb2xvcml6ZShvcHRpb25zLmxldmVsLCBmb3JtYXR0ZWREYXRlKSArIFwiIFwiICtcbiAgICAgICAgICAgICAgICB3aW5zdG9uLmNvbmZpZy5jb2xvcml6ZShvcHRpb25zLmxldmVsLCBfLnBhZEVuZChvcHRpb25zLmxldmVsLCA2KSkgK1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubWVzc2FnZSArIFwiIFwiICtcbiAgICAgICAgICAgICAgICBrdlN0cmluZztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBsb2dnZXJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlTG9nZ2VyKCkge1xuICAgICAgICBsZXQgbGcgPSB0aGlzO1xuICAgICAgICBpZiAobGcub3B0aW9ucyAmJiBsZy5vcHRpb25zLmxvZ19kaXIpIHtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBsb2cgZGlyZWN0b3J5IGlmIGl0IGRvZXMgbm90IGV4aXN0XG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMobGcub3B0aW9ucy5sb2dfZGlyKSkge1xuICAgICAgICAgICAgICAgIGZzLm1rZGlyU3luYyhsZy5vcHRpb25zLmxvZ19kaXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZy5sb2dnZXIgPSBuZXcgd2luc3Rvbi5Mb2dnZXIoe1xuICAgICAgICAgICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5GaWxlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsOiBsZy5vcHRpb25zLmxvZ19maWxlX2xldmVsIHx8IFwiaW5mb1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IGAke2xnLm9wdGlvbnMubG9nX2Rpcn0vYW50ZmFybS5sb2dgLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlRXhjZXB0aW9uczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhzaXplOiBsZy5vcHRpb25zLmxvZ19tYXhfc2l6ZSB8fCA1MjQyODgwLCAvLyA1TUJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heEZpbGVzOiBsZy5vcHRpb25zLmxvZ19tYXhfZmlsZXMgfHwgNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yaXplOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsOiBsZy5vcHRpb25zLmxvZ19vdXRfbGV2ZWwgfHwgXCJpbmZvXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVFeGNlcHRpb25zOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldHR5UHJpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcml6ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpbGVudDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlcjogKG9wdGlvbnMpID0+IHsgcmV0dXJuIGxnLmNvbnNvbGVGb3JtYXR0ZXIob3B0aW9ucyk7IH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGV4aXRPbkVycm9yOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxnLmxvZ2dlciA9IG5ldyB3aW5zdG9uLkxvZ2dlcih7XG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IGxnLm9wdGlvbnMubG9nX291dF9sZXZlbCB8fCBcImluZm9cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZUV4Y2VwdGlvbnM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV0dHlQcmludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yaXplOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2lsZW50OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBEYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVyOiAob3B0aW9ucykgPT4geyByZXR1cm4gbGcuY29uc29sZUZvcm1hdHRlcihvcHRpb25zKTsgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZXhpdE9uRXJyb3I6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyBhIGZvcm1hdHRlZCBsb2dnaW5nIGVudHJ5LlxuICAgICAqIEBwYXJhbSBlbnRyeVxuICAgICAqIEBwYXJhbSBhY3RvclxuICAgICAqIEBwYXJhbSBpbnN0YW5jZXNcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRFbnRyeShlbnRyeTogT2JqZWN0LCBhY3Rvcj86IGFueSwgaW5zdGFuY2VzID0gW10pIHtcbiAgICAgICAgaW5zdGFuY2VzLnB1c2goYWN0b3IpO1xuICAgICAgICBpZiAoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICBpbnN0YW5jZXMuZm9yRWFjaCgoaW5zdGFuY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgdHlwZW9mIGluc3RhbmNlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdXBlcl9uYW1lID0gaW5zdGFuY2UudG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlbc3VwZXJfbmFtZV0gPSBpbnN0YW5jZS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN1cGVyX25hbWUgPT09IFwiSm9iXCIpIGVudHJ5W1wiSm9iSWRcIl0gPSBpbnN0YW5jZS5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbG9nIGVudHJ5LiBVc2VkIGZvciBsb2cgX2ZpbGVzIGFuZCBjb25zb2xlIHJlcG9ydGluZy5cbiAgICAgKiBAcGFyYW0gdHlwZVxuICAgICAqIEBwYXJhbSBtZXNzYWdlXG4gICAgICogQHBhcmFtIGFjdG9yXG4gICAgICogQHBhcmFtIGluc3RhbmNlc1xuICAgICAqL1xuICAgIHB1YmxpYyBsb2codHlwZTogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcsIGFjdG9yPzogYW55LCAgaW5zdGFuY2VzPzogYW55KSB7XG4gICAgICAgIGlmICh0eXBlb2YodGhpcy5sb2dfdHlwZXNbdHlwZV0pID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICB0eXBlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsb2dfdHlwZXMgPSB0aGlzLmxvZ190eXBlcztcblxuICAgICAgICBsZXQgZW50cnkgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICAgYWN0b3I6IGFjdG9yLmNvbnN0cnVjdG9yLm5hbWVcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgbW9kaWZpZWRfZW50cnkgPSB0aGlzLmdldEVudHJ5KGVudHJ5LCBhY3RvciwgaW5zdGFuY2VzKTtcblxuICAgICAgICB0aGlzLmxvZ2dlci5sb2cobG9nX3R5cGVzW3R5cGVdLCBtb2RpZmllZF9lbnRyeSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcXVlcnkob3B0aW9uczogTG9nUXVlcnlPcHRpb25zLCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIGxldCBsID0gdGhpcztcbiAgICAgICAgbC5sb2dnZXIucXVlcnkob3B0aW9ucywgKGVyciwgcmVzdWx0cykgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGwubG9nKDMsIGBMb2cgcXVlcnkgZXJyb3I6ICR7ZXJyfS5gLCBsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2dRdWVyeU9wdGlvbnMge1xuICAgIGZyb206IERhdGUgfCBudW1iZXI7XG4gICAgdW50aWw6IERhdGUgfCBudW1iZXI7XG4gICAgbGltaXQ6IG51bWJlcjtcbiAgICBzdGFydDogbnVtYmVyO1xuICAgIG9yZGVyOiBzdHJpbmc7XG4gICAgZmllbGRzOiBzdHJpbmdbXTtcbn0iXX0=
