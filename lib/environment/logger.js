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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLElBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDbEIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFDNUIsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUU5Qjs7R0FFRztBQUNIO0lBbUJJLGdCQUFZLE9BQXdCO1FBWHBDOzs7V0FHRztRQUNPLGNBQVMsR0FBRztZQUNsQixDQUFDLEVBQUUsT0FBTztZQUNWLENBQUMsRUFBRSxNQUFNO1lBQ1QsQ0FBQyxFQUFFLE1BQU07WUFDVCxDQUFDLEVBQUUsT0FBTztTQUNiLENBQUM7UUFHRSxPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDTyxpQ0FBZ0IsR0FBMUIsVUFBMkIsT0FBTztRQUU5QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFbEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVMsR0FBRyxFQUFFLEtBQUs7WUFDdkMsUUFBUSxJQUFJLEdBQUc7Z0JBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUcsS0FBTyxDQUFDO2dCQUM1QyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO2dCQUN2QyxHQUFHLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLGFBQWEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRWhELE1BQU0sQ0FBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGFB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LEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSTtTQUNoQyxDQUFDO1FBRUYsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTVELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUwsYUFBQztBQUFELENBNUpBLEFBNEpDLElBQUE7QUE1SlksY0FBTSxTQTRKbEIsQ0FBQSIsImZpbGUiOiJsaWIvZW52aXJvbm1lbnQvbG9nZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBbnRmYXJtT3B0aW9uc30gZnJvbSBcIi4vb3B0aW9uc1wiO1xuXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxuICAgICAgICB3aW5zdG9uID0gcmVxdWlyZShcIndpbnN0b25cIiksXG4gICAgICAgIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xuXG4vKipcbiAqIExvZ2dpbmcgc2VydmljZVxuICovXG5leHBvcnQgY2xhc3MgTG9nZ2VyIHtcblxuICAgIHByb3RlY3RlZCBvcHRpb25zOiBBbnRmYXJtT3B0aW9ucztcblxuICAgIHByb3RlY3RlZCBsb2dnZXI7XG5cbiAgICBwcm90ZWN0ZWQgbG9nX2Rpcjogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVmFsaWQgbG9nIHRpbWVzXG4gICAgICogQHR5cGUge3swOiBzdHJpbmc7IDE6IHN0cmluZzsgMjogc3RyaW5nOyAzOiBzdHJpbmd9fVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBsb2dfdHlwZXMgPSB7XG4gICAgICAgIDA6IFwiZGVidWdcIixcbiAgICAgICAgMTogXCJpbmZvXCIsXG4gICAgICAgIDI6IFwid2FyblwiLFxuICAgICAgICAzOiBcImVycm9yXCJcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucz86IEFudGZhcm1PcHRpb25zKSB7XG4gICAgICAgIHdpbnN0b24uZW1pdEVycnMgPSB0cnVlO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLmNyZWF0ZUxvZ2dlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnNvbGUgZm9ybWF0dGluZyBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNvbnNvbGVGb3JtYXR0ZXIob3B0aW9ucykge1xuXG4gICAgICAgIGxldCBrdlN0cmluZyA9IFwiXCI7XG5cbiAgICAgICAgXy5mb3JFYWNoKG9wdGlvbnMubWV0YSwgZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gICAgICAgICAgICBrdlN0cmluZyArPSBcIiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5zdG9uLmNvbmZpZy5jb2xvcml6ZShcInNpbGx5XCIsIGAke3ZhbHVlfWApICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbnN0b24uY29uZmlnLmNvbG9yaXplKFwiZGVidWdcIiwgXCIgPiBcIikgK1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5O1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZm9ybWF0dGVkRGF0ZSA9IG5ldyBEYXRlKCkudG9Mb2NhbGVTdHJpbmcoKTtcblxuICAgICAgICByZXR1cm4gIHdpbnN0b24uY29uZmlnLmNvbG9yaXplKG9wdGlvbnMubGV2ZWwsIGZvcm1hdHRlZERhdGUpICsgXCIgXCIgK1xuICAgICAgICAgICAgICAgIHdpbnN0b24uY29uZmlnLmNvbG9yaXplKG9wdGlvbnMubGV2ZWwsIF8ucGFkRW5kKG9wdGlvbnMubGV2ZWwsIDYpKSArXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5tZXNzYWdlICsgXCIgXCIgK1xuICAgICAgICAgICAgICAgIGt2U3RyaW5nO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIGxvZ2dlclxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVMb2dnZXIoKSB7XG4gICAgICAgIGxldCBsZyA9IHRoaXM7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLmxvZ19kaXIpIHtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBsb2cgZGlyZWN0b3J5IGlmIGl0IGRvZXMgbm90IGV4aXN0XG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhpcy5vcHRpb25zLmxvZ19kaXIpKSB7XG4gICAgICAgICAgICAgICAgZnMubWtkaXJTeW5jKHRoaXMub3B0aW9ucy5sb2dfZGlyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5sb2dnZXIgPSBuZXcgd2luc3Rvbi5Mb2dnZXIoe1xuICAgICAgICAgICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5GaWxlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLm9wdGlvbnMubG9nX2ZpbGVfbGV2ZWwgfHwgXCJpbmZvXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogYCR7dGhpcy5vcHRpb25zLmxvZ19kaXJ9L2FudGZhcm0ubG9nYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZUV4Y2VwdGlvbnM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4c2l6ZTogdGhpcy5vcHRpb25zLmxvZ19tYXhfc2l6ZSB8fCA1MjQyODgwLCAvLyA1TUJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heEZpbGVzOiB0aGlzLm9wdGlvbnMubG9nX21heF9maWxlcyB8fCA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3JpemU6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IHRoaXMub3B0aW9ucy5sb2dfb3V0X2xldmVsIHx8IFwiaW5mb1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlRXhjZXB0aW9uczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXR0eVByaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3JpemU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWxlbnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24ob3B0aW9ucykgeyByZXR1cm4gbGcuY29uc29sZUZvcm1hdHRlcihvcHRpb25zKTsgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZXhpdE9uRXJyb3I6IGZhbHNlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIgPSBuZXcgd2luc3Rvbi5Mb2dnZXIoe1xuICAgICAgICAgICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLm9wdGlvbnMubG9nX291dF9sZXZlbCB8fCBcImluZm9cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZUV4Y2VwdGlvbnM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV0dHlQcmludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yaXplOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2lsZW50OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHsgcmV0dXJuIGxnLmNvbnNvbGVGb3JtYXR0ZXIob3B0aW9ucyk7IH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGV4aXRPbkVycm9yOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgYSBmb3JtYXR0ZWQgbG9nZ2luZyBlbnRyeS5cbiAgICAgKiBAcGFyYW0gZW50cnlcbiAgICAgKiBAcGFyYW0gYWN0b3JcbiAgICAgKiBAcGFyYW0gaW5zdGFuY2VzXG4gICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0RW50cnkoZW50cnk6IE9iamVjdCwgYWN0b3I/OiBhbnksIGluc3RhbmNlcyA9IFtdKSB7XG4gICAgICAgIGluc3RhbmNlcy5wdXNoKGFjdG9yKTtcbiAgICAgICAgaWYgKGluc3RhbmNlcykge1xuICAgICAgICAgICAgaW5zdGFuY2VzLmZvckVhY2goZnVuY3Rpb24oaW5zdGFuY2Upe1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiB0eXBlb2YgaW5zdGFuY2UgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1cGVyX25hbWUgPSBpbnN0YW5jZS50b1N0cmluZygpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRyeVtzdXBlcl9uYW1lXSA9IGluc3RhbmNlLmdldE5hbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdXBlcl9uYW1lID09PSBcIkpvYlwiKSBlbnRyeVtcIkpvYklkXCJdID0gaW5zdGFuY2UuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudHJ5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGxvZyBlbnRyeS4gVXNlZCBmb3IgbG9nIGZpbGVzIGFuZCBjb25zb2xlIHJlcG9ydGluZy5cbiAgICAgKiBAcGFyYW0gdHlwZVxuICAgICAqIEBwYXJhbSBtZXNzYWdlXG4gICAgICogQHBhcmFtIGFjdG9yXG4gICAgICogQHBhcmFtIGluc3RhbmNlc1xuICAgICAqL1xuICAgIHB1YmxpYyBsb2codHlwZTogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcsIGFjdG9yPzogYW55LCAgaW5zdGFuY2VzPzogYW55KSB7XG4gICAgICAgIGlmICh0eXBlb2YodGhpcy5sb2dfdHlwZXNbdHlwZV0pID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICB0eXBlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsb2dfdHlwZXMgPSB0aGlzLmxvZ190eXBlcztcblxuICAgICAgICBsZXQgZW50cnkgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICAgYWN0b3I6IGFjdG9yLmNvbnN0cnVjdG9yLm5hbWVcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgbW9kaWZpZWRfZW50cnkgPSB0aGlzLmdldEVudHJ5KGVudHJ5LCBhY3RvciwgaW5zdGFuY2VzKTtcblxuICAgICAgICB0aGlzLmxvZ2dlci5sb2cobG9nX3R5cGVzW3R5cGVdLCBtb2RpZmllZF9lbnRyeSk7XG4gICAgfVxuXG59Il19
