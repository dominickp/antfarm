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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLElBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDbEIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFDNUIsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUU5Qjs7R0FFRztBQUNIO0lBbUJJLGdCQUFZLE9BQXdCO1FBWHBDOzs7V0FHRztRQUNPLGNBQVMsR0FBRztZQUNsQixDQUFDLEVBQUUsT0FBTztZQUNWLENBQUMsRUFBRSxNQUFNO1lBQ1QsQ0FBQyxFQUFFLE1BQU07WUFDVCxDQUFDLEVBQUUsT0FBTztTQUNiLENBQUM7UUFHRSxPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDTyxpQ0FBZ0IsR0FBMUIsVUFBMkIsT0FBTztRQUU5QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFbEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVMsR0FBRyxFQUFFLEtBQUs7WUFDdkMsUUFBUSxJQUFJLEdBQUc7Z0JBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUcsS0FBTyxDQUFDO2dCQUM1QyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO2dCQUN2QyxHQUFHLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLGFBQWEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRWhELE1BQU0sQ0FBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGFB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LENBQUMsV0FBVyxDQUFDLElBQUk7U0FDaEMsQ0FBQztRQUVGLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUU1RCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUdNLHNCQUFLLEdBQVosVUFBYSxPQUF3QixFQUFFLFFBQWE7UUFDaEQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQUMsR0FBRyxFQUFFLE9BQU87WUFDakMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDTixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxzQkFBb0IsR0FBRyxNQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUNELFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTCxhQUFDO0FBQUQsQ0F2S0EsQUF1S0MsSUFBQTtBQXZLWSxjQUFNLFNBdUtsQixDQUFBIiwiZmlsZSI6ImxpYi9lbnZpcm9ubWVudC9sb2dnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FudGZhcm1PcHRpb25zfSBmcm9tIFwiLi9vcHRpb25zXCI7XG5cbmNvbnN0ICAgZnMgPSByZXF1aXJlKFwiZnNcIiksXG4gICAgICAgIHdpbnN0b24gPSByZXF1aXJlKFwid2luc3RvblwiKSxcbiAgICAgICAgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbi8qKlxuICogTG9nZ2luZyBzZXJ2aWNlXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2dnZXIge1xuXG4gICAgcHJvdGVjdGVkIG9wdGlvbnM6IEFudGZhcm1PcHRpb25zO1xuXG4gICAgcHJvdGVjdGVkIGxvZ2dlcjtcblxuICAgIHByb3RlY3RlZCBsb2dfZGlyOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBWYWxpZCBsb2cgdGltZXNcbiAgICAgKiBAdHlwZSB7ezA6IHN0cmluZzsgMTogc3RyaW5nOyAyOiBzdHJpbmc7IDM6IHN0cmluZ319XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGxvZ190eXBlcyA9IHtcbiAgICAgICAgMDogXCJkZWJ1Z1wiLFxuICAgICAgICAxOiBcImluZm9cIixcbiAgICAgICAgMjogXCJ3YXJuXCIsXG4gICAgICAgIDM6IFwiZXJyb3JcIlxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zPzogQW50ZmFybU9wdGlvbnMpIHtcbiAgICAgICAgd2luc3Rvbi5lbWl0RXJycyA9IHRydWU7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMuY3JlYXRlTG9nZ2VyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29uc29sZSBmb3JtYXR0aW5nIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29uc29sZUZvcm1hdHRlcihvcHRpb25zKSB7XG5cbiAgICAgICAgbGV0IGt2U3RyaW5nID0gXCJcIjtcblxuICAgICAgICBfLmZvckVhY2gob3B0aW9ucy5tZXRhLCBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICAgICAgICAgIGt2U3RyaW5nICs9IFwiIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbnN0b24uY29uZmlnLmNvbG9yaXplKFwic2lsbHlcIiwgYCR7dmFsdWV9YCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luc3Rvbi5jb25maWcuY29sb3JpemUoXCJkZWJ1Z1wiLCBcIiA+IFwiKSArXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBmb3JtYXR0ZWREYXRlID0gbmV3IERhdGUoKS50b0xvY2FsZVN0cmluZygpO1xuXG4gICAgICAgIHJldHVybiAgd2luc3Rvbi5jb25maWcuY29sb3JpemUob3B0aW9ucy5sZXZlbCwgZm9ybWF0dGVkRGF0ZSkgKyBcIiBcIiArXG4gICAgICAgICAgICAgICAgd2luc3Rvbi5jb25maWcuY29sb3JpemUob3B0aW9ucy5sZXZlbCwgXy5wYWRFbmQob3B0aW9ucy5sZXZlbCwgNikpICtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm1lc3NhZ2UgKyBcIiBcIiArXG4gICAgICAgICAgICAgICAga3ZTdHJpbmc7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgbG9nZ2VyXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUxvZ2dlcigpIHtcbiAgICAgICAgbGV0IGxnID0gdGhpcztcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMubG9nX2Rpcikge1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIGxvZyBkaXJlY3RvcnkgaWYgaXQgZG9lcyBub3QgZXhpc3RcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLm9wdGlvbnMubG9nX2RpcikpIHtcbiAgICAgICAgICAgICAgICBmcy5ta2RpclN5bmModGhpcy5vcHRpb25zLmxvZ19kaXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmxvZ2dlciA9IG5ldyB3aW5zdG9uLkxvZ2dlcih7XG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkZpbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IHRoaXMub3B0aW9ucy5sb2dfZmlsZV9sZXZlbCB8fCBcImluZm9cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgJHt0aGlzLm9wdGlvbnMubG9nX2Rpcn0vYW50ZmFybS5sb2dgLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlRXhjZXB0aW9uczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhzaXplOiB0aGlzLm9wdGlvbnMubG9nX21heF9zaXplIHx8IDUyNDI4ODAsIC8vIDVNQlxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4RmlsZXM6IHRoaXMub3B0aW9ucy5sb2dfbWF4X2ZpbGVzIHx8IDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcml6ZTogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXZlbDogdGhpcy5vcHRpb25zLmxvZ19vdXRfbGV2ZWwgfHwgXCJpbmZvXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVFeGNlcHRpb25zOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldHR5UHJpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcml6ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpbGVudDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBEYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihvcHRpb25zKSB7IHJldHVybiBsZy5jb25zb2xlRm9ybWF0dGVyKG9wdGlvbnMpOyB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBleGl0T25FcnJvcjogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlciA9IG5ldyB3aW5zdG9uLkxvZ2dlcih7XG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IHRoaXMub3B0aW9ucy5sb2dfb3V0X2xldmVsIHx8IFwiaW5mb1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlRXhjZXB0aW9uczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXR0eVByaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3JpemU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWxlbnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24ob3B0aW9ucykgeyByZXR1cm4gbGcuY29uc29sZUZvcm1hdHRlcihvcHRpb25zKTsgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZXhpdE9uRXJyb3I6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyBhIGZvcm1hdHRlZCBsb2dnaW5nIGVudHJ5LlxuICAgICAqIEBwYXJhbSBlbnRyeVxuICAgICAqIEBwYXJhbSBhY3RvclxuICAgICAqIEBwYXJhbSBpbnN0YW5jZXNcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRFbnRyeShlbnRyeTogT2JqZWN0LCBhY3Rvcj86IGFueSwgaW5zdGFuY2VzID0gW10pIHtcbiAgICAgICAgaW5zdGFuY2VzLnB1c2goYWN0b3IpO1xuICAgICAgICBpZiAoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICBpbnN0YW5jZXMuZm9yRWFjaChmdW5jdGlvbihpbnN0YW5jZSl7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIHR5cGVvZiBpbnN0YW5jZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3VwZXJfbmFtZSA9IGluc3RhbmNlLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5W3N1cGVyX25hbWVdID0gaW5zdGFuY2UubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdXBlcl9uYW1lID09PSBcIkpvYlwiKSBlbnRyeVtcIkpvYklkXCJdID0gaW5zdGFuY2UuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudHJ5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGxvZyBlbnRyeS4gVXNlZCBmb3IgbG9nIGZpbGVzIGFuZCBjb25zb2xlIHJlcG9ydGluZy5cbiAgICAgKiBAcGFyYW0gdHlwZVxuICAgICAqIEBwYXJhbSBtZXNzYWdlXG4gICAgICogQHBhcmFtIGFjdG9yXG4gICAgICogQHBhcmFtIGluc3RhbmNlc1xuICAgICAqL1xuICAgIHB1YmxpYyBsb2codHlwZTogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcsIGFjdG9yPzogYW55LCAgaW5zdGFuY2VzPzogYW55KSB7XG4gICAgICAgIGlmICh0eXBlb2YodGhpcy5sb2dfdHlwZXNbdHlwZV0pID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICB0eXBlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsb2dfdHlwZXMgPSB0aGlzLmxvZ190eXBlcztcblxuICAgICAgICBsZXQgZW50cnkgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICAgYWN0b3I6IGFjdG9yLmNvbnN0cnVjdG9yLm5hbWVcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgbW9kaWZpZWRfZW50cnkgPSB0aGlzLmdldEVudHJ5KGVudHJ5LCBhY3RvciwgaW5zdGFuY2VzKTtcblxuICAgICAgICB0aGlzLmxvZ2dlci5sb2cobG9nX3R5cGVzW3R5cGVdLCBtb2RpZmllZF9lbnRyeSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcXVlcnkob3B0aW9uczogTG9nUXVlcnlPcHRpb25zLCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIGxldCBsID0gdGhpcztcbiAgICAgICAgbC5sb2dnZXIucXVlcnkob3B0aW9ucywgKGVyciwgcmVzdWx0cykgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGwubG9nKDMsIGBMb2cgcXVlcnkgZXJyb3I6ICR7ZXJyfS5gLCBsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2dRdWVyeU9wdGlvbnMge1xuICAgIGZyb206IERhdGUgfCBudW1iZXI7XG4gICAgdW50aWw6IERhdGUgfCBudW1iZXI7XG4gICAgbGltaXQ6IG51bWJlcjtcbiAgICBzdGFydDogbnVtYmVyO1xuICAgIG9yZGVyOiBzdHJpbmc7XG4gICAgZmllbGRzOiBzdHJpbmdbXTtcbn0iXX0=
