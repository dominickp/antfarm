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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLElBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDbEIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFDNUIsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUU5Qjs7R0FFRztBQUNIO0lBbUJJLGdCQUFZLE9BQXdCO1FBWHBDOzs7V0FHRztRQUNPLGNBQVMsR0FBRztZQUNsQixDQUFDLEVBQUUsT0FBTztZQUNWLENBQUMsRUFBRSxNQUFNO1lBQ1QsQ0FBQyxFQUFFLE1BQU07WUFDVCxDQUFDLEVBQUUsT0FBTztTQUNiLENBQUM7UUFHRSxPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDTyxpQ0FBZ0IsR0FBMUIsVUFBMkIsT0FBTztRQUU5QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFbEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVMsR0FBRyxFQUFFLEtBQUs7WUFDdkMsUUFBUSxJQUFJLEdBQUc7Z0JBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUcsS0FBTyxDQUFDO2dCQUM1QyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO2dCQUN2QyxHQUFHLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLGFBQWEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRWhELE1BQU0sQ0FBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGFB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LEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSTtTQUNoQyxDQUFDO1FBRUYsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTVELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBR00sc0JBQUssR0FBWixVQUFhLE9BQXdCLEVBQUUsUUFBYTtRQUNoRCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsVUFBQyxHQUFHLEVBQUUsT0FBTztZQUNqQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNOLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLHNCQUFvQixHQUFHLE1BQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBQ0QsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVMLGFBQUM7QUFBRCxDQXZLQSxBQXVLQyxJQUFBO0FBdktZLGNBQU0sU0F1S2xCLENBQUEiLCJmaWxlIjoibGliL2Vudmlyb25tZW50L2xvZ2dlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QW50ZmFybU9wdGlvbnN9IGZyb20gXCIuL29wdGlvbnNcIjtcblxuY29uc3QgICBmcyA9IHJlcXVpcmUoXCJmc1wiKSxcbiAgICAgICAgd2luc3RvbiA9IHJlcXVpcmUoXCJ3aW5zdG9uXCIpLFxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuLyoqXG4gKiBMb2dnaW5nIHNlcnZpY2VcbiAqL1xuZXhwb3J0IGNsYXNzIExvZ2dlciB7XG5cbiAgICBwcm90ZWN0ZWQgb3B0aW9uczogQW50ZmFybU9wdGlvbnM7XG5cbiAgICBwcm90ZWN0ZWQgbG9nZ2VyO1xuXG4gICAgcHJvdGVjdGVkIGxvZ19kaXI6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFZhbGlkIGxvZyB0aW1lc1xuICAgICAqIEB0eXBlIHt7MDogc3RyaW5nOyAxOiBzdHJpbmc7IDI6IHN0cmluZzsgMzogc3RyaW5nfX1cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgbG9nX3R5cGVzID0ge1xuICAgICAgICAwOiBcImRlYnVnXCIsXG4gICAgICAgIDE6IFwiaW5mb1wiLFxuICAgICAgICAyOiBcIndhcm5cIixcbiAgICAgICAgMzogXCJlcnJvclwiXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBBbnRmYXJtT3B0aW9ucykge1xuICAgICAgICB3aW5zdG9uLmVtaXRFcnJzID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5jcmVhdGVMb2dnZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb25zb2xlIGZvcm1hdHRpbmcgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjb25zb2xlRm9ybWF0dGVyKG9wdGlvbnMpIHtcblxuICAgICAgICBsZXQga3ZTdHJpbmcgPSBcIlwiO1xuXG4gICAgICAgIF8uZm9yRWFjaChvcHRpb25zLm1ldGEsIGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgICAgICAgICAga3ZTdHJpbmcgKz0gXCIgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luc3Rvbi5jb25maWcuY29sb3JpemUoXCJzaWxseVwiLCBgJHt2YWx1ZX1gKSArXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5zdG9uLmNvbmZpZy5jb2xvcml6ZShcImRlYnVnXCIsIFwiID4gXCIpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGZvcm1hdHRlZERhdGUgPSBuZXcgRGF0ZSgpLnRvTG9jYWxlU3RyaW5nKCk7XG5cbiAgICAgICAgcmV0dXJuICB3aW5zdG9uLmNvbmZpZy5jb2xvcml6ZShvcHRpb25zLmxldmVsLCBmb3JtYXR0ZWREYXRlKSArIFwiIFwiICtcbiAgICAgICAgICAgICAgICB3aW5zdG9uLmNvbmZpZy5jb2xvcml6ZShvcHRpb25zLmxldmVsLCBfLnBhZEVuZChvcHRpb25zLmxldmVsLCA2KSkgK1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubWVzc2FnZSArIFwiIFwiICtcbiAgICAgICAgICAgICAgICBrdlN0cmluZztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBsb2dnZXJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlTG9nZ2VyKCkge1xuICAgICAgICBsZXQgbGcgPSB0aGlzO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5sb2dfZGlyKSB7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbG9nIGRpcmVjdG9yeSBpZiBpdCBkb2VzIG5vdCBleGlzdFxuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoaXMub3B0aW9ucy5sb2dfZGlyKSkge1xuICAgICAgICAgICAgICAgIGZzLm1rZGlyU3luYyh0aGlzLm9wdGlvbnMubG9nX2Rpcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubG9nZ2VyID0gbmV3IHdpbnN0b24uTG9nZ2VyKHtcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICAgICAgICAgIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuRmlsZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXZlbDogdGhpcy5vcHRpb25zLmxvZ19maWxlX2xldmVsIHx8IFwiaW5mb1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IGAke3RoaXMub3B0aW9ucy5sb2dfZGlyfS9hbnRmYXJtLmxvZ2AsXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVFeGNlcHRpb25zOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heHNpemU6IHRoaXMub3B0aW9ucy5sb2dfbWF4X3NpemUgfHwgNTI0Mjg4MCwgLy8gNU1CXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhGaWxlczogdGhpcy5vcHRpb25zLmxvZ19tYXhfZmlsZXMgfHwgNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yaXplOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsOiB0aGlzLm9wdGlvbnMubG9nX291dF9sZXZlbCB8fCBcImluZm9cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZUV4Y2VwdGlvbnM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV0dHlQcmludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yaXplOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2lsZW50OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHsgcmV0dXJuIGxnLmNvbnNvbGVGb3JtYXR0ZXIob3B0aW9ucyk7IH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGV4aXRPbkVycm9yOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyID0gbmV3IHdpbnN0b24uTG9nZ2VyKHtcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICAgICAgICAgIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXZlbDogdGhpcy5vcHRpb25zLmxvZ19vdXRfbGV2ZWwgfHwgXCJpbmZvXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVFeGNlcHRpb25zOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldHR5UHJpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcml6ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpbGVudDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBEYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihvcHRpb25zKSB7IHJldHVybiBsZy5jb25zb2xlRm9ybWF0dGVyKG9wdGlvbnMpOyB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBleGl0T25FcnJvcjogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIGEgZm9ybWF0dGVkIGxvZ2dpbmcgZW50cnkuXG4gICAgICogQHBhcmFtIGVudHJ5XG4gICAgICogQHBhcmFtIGFjdG9yXG4gICAgICogQHBhcmFtIGluc3RhbmNlc1xuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldEVudHJ5KGVudHJ5OiBPYmplY3QsIGFjdG9yPzogYW55LCBpbnN0YW5jZXMgPSBbXSkge1xuICAgICAgICBpbnN0YW5jZXMucHVzaChhY3Rvcik7XG4gICAgICAgIGlmIChpbnN0YW5jZXMpIHtcbiAgICAgICAgICAgIGluc3RhbmNlcy5mb3JFYWNoKGZ1bmN0aW9uKGluc3RhbmNlKXtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgdHlwZW9mIGluc3RhbmNlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdXBlcl9uYW1lID0gaW5zdGFuY2UudG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlbc3VwZXJfbmFtZV0gPSBpbnN0YW5jZS5nZXROYW1lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3VwZXJfbmFtZSA9PT0gXCJKb2JcIikgZW50cnlbXCJKb2JJZFwiXSA9IGluc3RhbmNlLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnRyeTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBsb2cgZW50cnkuIFVzZWQgZm9yIGxvZyBmaWxlcyBhbmQgY29uc29sZSByZXBvcnRpbmcuXG4gICAgICogQHBhcmFtIHR5cGVcbiAgICAgKiBAcGFyYW0gbWVzc2FnZVxuICAgICAqIEBwYXJhbSBhY3RvclxuICAgICAqIEBwYXJhbSBpbnN0YW5jZXNcbiAgICAgKi9cbiAgICBwdWJsaWMgbG9nKHR5cGU6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nLCBhY3Rvcj86IGFueSwgIGluc3RhbmNlcz86IGFueSkge1xuICAgICAgICBpZiAodHlwZW9mKHRoaXMubG9nX3R5cGVzW3R5cGVdKSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgdHlwZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbG9nX3R5cGVzID0gdGhpcy5sb2dfdHlwZXM7XG5cbiAgICAgICAgbGV0IGVudHJ5ID0ge1xuICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgIGFjdG9yOiBhY3Rvci5jb25zdHJ1Y3Rvci5uYW1lXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IG1vZGlmaWVkX2VudHJ5ID0gdGhpcy5nZXRFbnRyeShlbnRyeSwgYWN0b3IsIGluc3RhbmNlcyk7XG5cbiAgICAgICAgdGhpcy5sb2dnZXIubG9nKGxvZ190eXBlc1t0eXBlXSwgbW9kaWZpZWRfZW50cnkpO1xuICAgIH1cblxuXG4gICAgcHVibGljIHF1ZXJ5KG9wdGlvbnM6IExvZ1F1ZXJ5T3B0aW9ucywgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBsZXQgbCA9IHRoaXM7XG4gICAgICAgIGwubG9nZ2VyLnF1ZXJ5KG9wdGlvbnMsIChlcnIsIHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBsLmxvZygzLCBgTG9nIHF1ZXJ5IGVycm9yOiAke2Vycn0uYCwgbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9nUXVlcnlPcHRpb25zIHtcbiAgICBmcm9tOiBEYXRlIHwgbnVtYmVyO1xuICAgIHVudGlsOiBEYXRlIHwgbnVtYmVyO1xuICAgIGxpbWl0OiBudW1iZXI7XG4gICAgc3RhcnQ6IG51bWJlcjtcbiAgICBvcmRlcjogc3RyaW5nO1xuICAgIGZpZWxkczogc3RyaW5nW107XG59Il19
