"use strict";
var logger_1 = require("./logger");
var server_1 = require("./server");
var emailer_1 = require("./emailer");
var fs = require("fs");
/**
 * The environment class controls all aspects of the antfarm environment, like options, logging,
 * and constructing globally referenced objects.
 */
var Environment = (function () {
    function Environment(options) {
        this.hookRoutes = [];
        this.hookInterfaceRoutes = [];
        this.logger = new logger_1.Logger(options);
        this.options = options;
    }
    Object.defineProperty(Environment.prototype, "options", {
        /**
         * Get the Antfarm options.
         * @returns {AntfarmOptions}
         */
        get: function () {
            return this._options;
        },
        /**
         * Sets the options and creates other environmental objects if necessary.
         * @param options
         */
        set: function (options) {
            var e = this;
            if (options.auto_managed_folder_directory) {
                try {
                    fs.statSync(options.auto_managed_folder_directory);
                }
                catch (err) {
                    e.log(3, "Auto managed directory \"" + options.auto_managed_folder_directory + "\" does not exist.", this);
                }
            }
            this._options = options;
            if (options.port) {
                e.createServer();
                e.server.createLogServer(e.logger);
            }
            if (options.email_credentials) {
                e.createEmailer();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates an Emailer object to send emails.
     */
    Environment.prototype.createEmailer = function () {
        var e = this;
        // Get options needed and pass to emailer
        var credentials = e.options.email_credentials;
        e._emailer = new emailer_1.Emailer(e, credentials);
    };
    Object.defineProperty(Environment.prototype, "emailer", {
        get: function () {
            return this._emailer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Environment.prototype, "autoManagedFolderDirectory", {
        /**
         * Return the auto managed folder directory, if set.
         * @returns {string}
         */
        get: function () {
            return this.options.auto_managed_folder_directory;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates the server.
     */
    Environment.prototype.createServer = function () {
        this._server = new server_1.Server(this);
    };
    Object.defineProperty(Environment.prototype, "server", {
        /**
         * Get the server instance.
         * @returns {Server}
         */
        get: function () {
            return this._server;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds a webhook to the webhook server.
     * @param nest
     */
    Environment.prototype.addWebhook = function (nest) {
        var e = this;
        e.server.addWebhook(nest);
    };
    /**
     * Adds a webhook interface to the webhook server.
     * @param im
     */
    Environment.prototype.addWebhookInterface = function (im) {
        var e = this;
        e.server.addWebhookInterface(im);
    };
    Environment.prototype.toString = function () {
        return "Environment";
    };
    /**
     * Adds a log entry to the Logger instance.
     * @param type {number}          The log level. 0 = debug, 1 = info, 2 = warning, 3 = error
     * @param message {string}       Log message.
     * @param actor  {any}           Instance which triggers the action being logged.
     * @param instances {any[]}      Array of of other involved instances.
     * #### Example
     * ```js
     * job.e.log(1, `Transferred to Tunnel "${tunnel.getName()}".`, job, [oldTunnel]);
     * ```
     */
    Environment.prototype.log = function (type, message, actor, instances) {
        if (instances === void 0) { instances = []; }
        this.logger.log(type, message, actor, instances);
    };
    return Environment;
}());
exports.Environment = Environment;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUJBQXFCLFVBQVUsQ0FBQyxDQUFBO0FBRWhDLHVCQUFxQixVQUFVLENBQUMsQ0FBQTtBQUdoQyx3QkFBc0IsV0FBVyxDQUFDLENBQUE7QUFHbEMsSUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRTNCOzs7R0FHRztBQUNIO0lBU0kscUJBQVksT0FBdUI7UUFIekIsZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNoQix3QkFBbUIsR0FBRyxFQUFFLENBQUM7UUFHL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBTUQsc0JBQVcsZ0NBQU87UUF1QmxCOzs7V0FHRzthQUNIO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQztRQWpDRDs7O1dBR0c7YUFDSCxVQUFtQixPQUF1QjtZQUN0QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7WUFFYixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUM7b0JBQ0QsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQztnQkFDdkQsQ0FBRTtnQkFBQSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNYLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLDhCQUEyQixPQUFPLENBQUMsNkJBQTZCLHVCQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN4RyxDQUFDO1lBQ0wsQ0FBQztZQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBRXhCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNmLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDakIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdEIsQ0FBQztRQUNMLENBQUM7OztPQUFBO0lBVUQ7O09BRUc7SUFDTyxtQ0FBYSxHQUF2QjtRQUNJLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNiLHlDQUF5QztRQUN6QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO1FBQzlDLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsc0JBQVcsZ0NBQU87YUFBbEI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDOzs7T0FBQTtJQU1ELHNCQUFXLG1EQUEwQjtRQUpyQzs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDO1FBQ3RELENBQUM7OztPQUFBO0lBRUQ7O09BRUc7SUFDTyxrQ0FBWSxHQUF0QjtRQUNJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxlQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQU1ELHNCQUFXLCtCQUFNO1FBSmpCOzs7V0FHRzthQUNIO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQzs7O09BQUE7SUFFRDs7O09BR0c7SUFDSSxnQ0FBVSxHQUFqQixVQUFrQixJQUFpQjtRQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0kseUNBQW1CLEdBQTFCLFVBQTJCLEVBQW9CO1FBQzNDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNiLENBQUMsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVNLDhCQUFRLEdBQWY7UUFDSSxNQUFNLENBQUMsYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0kseUJBQUcsR0FBVixVQUFXLElBQVksRUFBRSxPQUFlLEVBQUUsS0FBVyxFQUFFLFNBQWM7UUFBZCx5QkFBYyxHQUFkLGNBQWM7UUFDakUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUNMLGtCQUFDO0FBQUQsQ0ExSEEsQUEwSEMsSUFBQTtBQTFIWSxtQkFBVyxjQTBIdkIsQ0FBQSIsImZpbGUiOiJsaWIvZW52aXJvbm1lbnQvZW52aXJvbm1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xvZ2dlcn0gZnJvbSBcIi4vbG9nZ2VyXCI7XG5pbXBvcnQge1dlYmhvb2tOZXN0fSBmcm9tIFwiLi4vbmVzdC93ZWJob29rTmVzdFwiO1xuaW1wb3J0IHtTZXJ2ZXJ9IGZyb20gXCIuL3NlcnZlclwiO1xuaW1wb3J0IHtJbnRlcmZhY2VNYW5hZ2VyfSBmcm9tIFwiLi4vdWkvaW50ZXJmYWNlTWFuYWdlclwiO1xuaW1wb3J0IHtBbnRmYXJtT3B0aW9uc30gZnJvbSBcIi4vb3B0aW9uc1wiO1xuaW1wb3J0IHtFbWFpbGVyfSBmcm9tIFwiLi9lbWFpbGVyXCI7XG5pbXBvcnQge0VtYWlsQ3JlZGVudGlhbHN9IGZyb20gXCIuL2VtYWlsQ3JlZGVudGlhbHNcIjtcblxuY29uc3QgICBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcblxuLyoqXG4gKiBUaGUgZW52aXJvbm1lbnQgY2xhc3MgY29udHJvbHMgYWxsIGFzcGVjdHMgb2YgdGhlIGFudGZhcm0gZW52aXJvbm1lbnQsIGxpa2Ugb3B0aW9ucywgbG9nZ2luZyxcbiAqIGFuZCBjb25zdHJ1Y3RpbmcgZ2xvYmFsbHkgcmVmZXJlbmNlZCBvYmplY3RzLlxuICovXG5leHBvcnQgY2xhc3MgRW52aXJvbm1lbnQge1xuXG4gICAgcHJvdGVjdGVkIF9vcHRpb25zOiBBbnRmYXJtT3B0aW9ucztcbiAgICBwcm90ZWN0ZWQgbG9nZ2VyOiBMb2dnZXI7XG4gICAgcHJvdGVjdGVkIF9zZXJ2ZXI6IFNlcnZlcjtcbiAgICBwcm90ZWN0ZWQgX2VtYWlsZXI6IEVtYWlsZXI7XG4gICAgcHJvdGVjdGVkIGhvb2tSb3V0ZXMgPSBbXTtcbiAgICBwcm90ZWN0ZWQgaG9va0ludGVyZmFjZVJvdXRlcyA9IFtdO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogQW50ZmFybU9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBuZXcgTG9nZ2VyKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIG9wdGlvbnMgYW5kIGNyZWF0ZXMgb3RoZXIgZW52aXJvbm1lbnRhbCBvYmplY3RzIGlmIG5lY2Vzc2FyeS5cbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgb3B0aW9ucyhvcHRpb25zOiBBbnRmYXJtT3B0aW9ucykge1xuICAgICAgICBsZXQgZSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuYXV0b19tYW5hZ2VkX2ZvbGRlcl9kaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZnMuc3RhdFN5bmMob3B0aW9ucy5hdXRvX21hbmFnZWRfZm9sZGVyX2RpcmVjdG9yeSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBlLmxvZygzLCBgQXV0byBtYW5hZ2VkIGRpcmVjdG9yeSBcIiR7b3B0aW9ucy5hdXRvX21hbmFnZWRfZm9sZGVyX2RpcmVjdG9yeX1cIiBkb2VzIG5vdCBleGlzdC5gLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnBvcnQpIHtcbiAgICAgICAgICAgIGUuY3JlYXRlU2VydmVyKCk7XG4gICAgICAgICAgICBlLnNlcnZlci5jcmVhdGVMb2dTZXJ2ZXIoZS5sb2dnZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZW1haWxfY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgIGUuY3JlYXRlRW1haWxlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBBbnRmYXJtIG9wdGlvbnMuXG4gICAgICogQHJldHVybnMge0FudGZhcm1PcHRpb25zfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBFbWFpbGVyIG9iamVjdCB0byBzZW5kIGVtYWlscy5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlRW1haWxlcigpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzO1xuICAgICAgICAvLyBHZXQgb3B0aW9ucyBuZWVkZWQgYW5kIHBhc3MgdG8gZW1haWxlclxuICAgICAgICBsZXQgY3JlZGVudGlhbHMgPSBlLm9wdGlvbnMuZW1haWxfY3JlZGVudGlhbHM7XG4gICAgICAgIGUuX2VtYWlsZXIgPSBuZXcgRW1haWxlcihlLCBjcmVkZW50aWFscyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBlbWFpbGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZW1haWxlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGF1dG8gbWFuYWdlZCBmb2xkZXIgZGlyZWN0b3J5LCBpZiBzZXQuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGF1dG9NYW5hZ2VkRm9sZGVyRGlyZWN0b3J5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmF1dG9fbWFuYWdlZF9mb2xkZXJfZGlyZWN0b3J5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIHNlcnZlci5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlU2VydmVyKCkge1xuICAgICAgICB0aGlzLl9zZXJ2ZXIgPSBuZXcgU2VydmVyKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgc2VydmVyIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm5zIHtTZXJ2ZXJ9XG4gICAgICovXG4gICAgcHVibGljIGdldCBzZXJ2ZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXJ2ZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHdlYmhvb2sgdG8gdGhlIHdlYmhvb2sgc2VydmVyLlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHVibGljIGFkZFdlYmhvb2sobmVzdDogV2ViaG9va05lc3QpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzO1xuICAgICAgICBlLnNlcnZlci5hZGRXZWJob29rKG5lc3QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSB3ZWJob29rIGludGVyZmFjZSB0byB0aGUgd2ViaG9vayBzZXJ2ZXIuXG4gICAgICogQHBhcmFtIGltXG4gICAgICovXG4gICAgcHVibGljIGFkZFdlYmhvb2tJbnRlcmZhY2UoaW06IEludGVyZmFjZU1hbmFnZXIpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzO1xuICAgICAgICBlLnNlcnZlci5hZGRXZWJob29rSW50ZXJmYWNlKGltKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBcIkVudmlyb25tZW50XCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxvZyBlbnRyeSB0byB0aGUgTG9nZ2VyIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB0eXBlIHtudW1iZXJ9ICAgICAgICAgIFRoZSBsb2cgbGV2ZWwuIDAgPSBkZWJ1ZywgMSA9IGluZm8sIDIgPSB3YXJuaW5nLCAzID0gZXJyb3JcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSB7c3RyaW5nfSAgICAgICBMb2cgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gYWN0b3IgIHthbnl9ICAgICAgICAgICBJbnN0YW5jZSB3aGljaCB0cmlnZ2VycyB0aGUgYWN0aW9uIGJlaW5nIGxvZ2dlZC5cbiAgICAgKiBAcGFyYW0gaW5zdGFuY2VzIHthbnlbXX0gICAgICBBcnJheSBvZiBvZiBvdGhlciBpbnZvbHZlZCBpbnN0YW5jZXMuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBqb2IuZS5sb2coMSwgYFRyYW5zZmVycmVkIHRvIFR1bm5lbCBcIiR7dHVubmVsLmdldE5hbWUoKX1cIi5gLCBqb2IsIFtvbGRUdW5uZWxdKTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgbG9nKHR5cGU6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nLCBhY3Rvcj86IGFueSwgaW5zdGFuY2VzID0gW10pIHtcbiAgICAgICAgdGhpcy5sb2dnZXIubG9nKHR5cGUsIG1lc3NhZ2UsIGFjdG9yLCBpbnN0YW5jZXMpO1xuICAgIH1cbn0iXX0=
