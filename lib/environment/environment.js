"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFnQztBQUVoQyxtQ0FBZ0M7QUFHaEMscUNBQWtDO0FBR2xDLElBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUUzQjs7O0dBR0c7QUFDSDtJQVNJLHFCQUFZLE9BQXVCO1FBSHpCLGVBQVUsR0FBRyxFQUFFLENBQUM7UUFDaEIsd0JBQW1CLEdBQUcsRUFBRSxDQUFDO1FBRy9CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQU1ELHNCQUFXLGdDQUFPO1FBdUJsQjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7UUFqQ0Q7OztXQUdHO2FBQ0gsVUFBbUIsT0FBdUI7WUFDdEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBRWIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxDQUFDO29CQUNELEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUM7Z0JBQ3ZELENBQUM7Z0JBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDWCxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSw4QkFBMkIsT0FBTyxDQUFDLDZCQUE2Qix1QkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDeEcsQ0FBQztZQUNMLENBQUM7WUFFRCxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUV4QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDZixDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ2pCLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDNUIsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3RCLENBQUM7UUFDTCxDQUFDOzs7T0FBQTtJQVVEOztPQUVHO0lBQ08sbUNBQWEsR0FBdkI7UUFDSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDYix5Q0FBeUM7UUFDekMsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztRQUM5QyxDQUFDLENBQUMsUUFBUSxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELHNCQUFXLGdDQUFPO2FBQWxCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQzs7O09BQUE7SUFNRCxzQkFBVyxtREFBMEI7UUFKckM7OztXQUdHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQztRQUN0RCxDQUFDOzs7T0FBQTtJQUVEOztPQUVHO0lBQ08sa0NBQVksR0FBdEI7UUFDSSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksZUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFNRCxzQkFBVywrQkFBTTtRQUpqQjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3hCLENBQUM7OztPQUFBO0lBRUQ7OztPQUdHO0lBQ0ksZ0NBQVUsR0FBakIsVUFBa0IsSUFBaUI7UUFDL0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLHlDQUFtQixHQUExQixVQUEyQixFQUFvQjtRQUMzQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFTSw4QkFBUSxHQUFmO1FBQ0ksTUFBTSxDQUFDLGFBQWEsQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNJLHlCQUFHLEdBQVYsVUFBVyxJQUFZLEVBQUUsT0FBZSxFQUFFLEtBQVcsRUFBRSxTQUFjO1FBQWQsMEJBQUEsRUFBQSxjQUFjO1FBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFDTCxrQkFBQztBQUFELENBMUhBLEFBMEhDLElBQUE7QUExSFksa0NBQVciLCJmaWxlIjoibGliL2Vudmlyb25tZW50L2Vudmlyb25tZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMb2dnZXJ9IGZyb20gXCIuL2xvZ2dlclwiO1xyXG5pbXBvcnQge1dlYmhvb2tOZXN0fSBmcm9tIFwiLi4vbmVzdC93ZWJob29rTmVzdFwiO1xyXG5pbXBvcnQge1NlcnZlcn0gZnJvbSBcIi4vc2VydmVyXCI7XHJcbmltcG9ydCB7SW50ZXJmYWNlTWFuYWdlcn0gZnJvbSBcIi4uL3VpL2ludGVyZmFjZU1hbmFnZXJcIjtcclxuaW1wb3J0IHtBbnRmYXJtT3B0aW9uc30gZnJvbSBcIi4vb3B0aW9uc1wiO1xyXG5pbXBvcnQge0VtYWlsZXJ9IGZyb20gXCIuL2VtYWlsZXJcIjtcclxuaW1wb3J0IHtFbWFpbENyZWRlbnRpYWxzfSBmcm9tIFwiLi9lbWFpbENyZWRlbnRpYWxzXCI7XHJcblxyXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBlbnZpcm9ubWVudCBjbGFzcyBjb250cm9scyBhbGwgYXNwZWN0cyBvZiB0aGUgYW50ZmFybSBlbnZpcm9ubWVudCwgbGlrZSBvcHRpb25zLCBsb2dnaW5nLFxyXG4gKiBhbmQgY29uc3RydWN0aW5nIGdsb2JhbGx5IHJlZmVyZW5jZWQgb2JqZWN0cy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBFbnZpcm9ubWVudCB7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9vcHRpb25zOiBBbnRmYXJtT3B0aW9ucztcclxuICAgIHByb3RlY3RlZCBsb2dnZXI6IExvZ2dlcjtcclxuICAgIHByb3RlY3RlZCBfc2VydmVyOiBTZXJ2ZXI7XHJcbiAgICBwcm90ZWN0ZWQgX2VtYWlsZXI6IEVtYWlsZXI7XHJcbiAgICBwcm90ZWN0ZWQgaG9va1JvdXRlcyA9IFtdO1xyXG4gICAgcHJvdGVjdGVkIGhvb2tJbnRlcmZhY2VSb3V0ZXMgPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBBbnRmYXJtT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyID0gbmV3IExvZ2dlcihvcHRpb25zKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgb3B0aW9ucyBhbmQgY3JlYXRlcyBvdGhlciBlbnZpcm9ubWVudGFsIG9iamVjdHMgaWYgbmVjZXNzYXJ5LlxyXG4gICAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBvcHRpb25zKG9wdGlvbnM6IEFudGZhcm1PcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IGUgPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5hdXRvX21hbmFnZWRfZm9sZGVyX2RpcmVjdG9yeSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZnMuc3RhdFN5bmMob3B0aW9ucy5hdXRvX21hbmFnZWRfZm9sZGVyX2RpcmVjdG9yeSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgZS5sb2coMywgYEF1dG8gbWFuYWdlZCBkaXJlY3RvcnkgXCIke29wdGlvbnMuYXV0b19tYW5hZ2VkX2ZvbGRlcl9kaXJlY3Rvcnl9XCIgZG9lcyBub3QgZXhpc3QuYCwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5wb3J0KSB7XHJcbiAgICAgICAgICAgIGUuY3JlYXRlU2VydmVyKCk7XHJcbiAgICAgICAgICAgIGUuc2VydmVyLmNyZWF0ZUxvZ1NlcnZlcihlLmxvZ2dlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5lbWFpbF9jcmVkZW50aWFscykge1xyXG4gICAgICAgICAgICBlLmNyZWF0ZUVtYWlsZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIEFudGZhcm0gb3B0aW9ucy5cclxuICAgICAqIEByZXR1cm5zIHtBbnRmYXJtT3B0aW9uc31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBvcHRpb25zKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhbiBFbWFpbGVyIG9iamVjdCB0byBzZW5kIGVtYWlscy5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUVtYWlsZXIoKSB7XHJcbiAgICAgICAgbGV0IGUgPSB0aGlzO1xyXG4gICAgICAgIC8vIEdldCBvcHRpb25zIG5lZWRlZCBhbmQgcGFzcyB0byBlbWFpbGVyXHJcbiAgICAgICAgbGV0IGNyZWRlbnRpYWxzID0gZS5vcHRpb25zLmVtYWlsX2NyZWRlbnRpYWxzO1xyXG4gICAgICAgIGUuX2VtYWlsZXIgPSBuZXcgRW1haWxlcihlLCBjcmVkZW50aWFscyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBlbWFpbGVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9lbWFpbGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSBhdXRvIG1hbmFnZWQgZm9sZGVyIGRpcmVjdG9yeSwgaWYgc2V0LlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBhdXRvTWFuYWdlZEZvbGRlckRpcmVjdG9yeSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmF1dG9fbWFuYWdlZF9mb2xkZXJfZGlyZWN0b3J5O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyB0aGUgc2VydmVyLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlU2VydmVyKCkge1xyXG4gICAgICAgIHRoaXMuX3NlcnZlciA9IG5ldyBTZXJ2ZXIodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIHNlcnZlciBpbnN0YW5jZS5cclxuICAgICAqIEByZXR1cm5zIHtTZXJ2ZXJ9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgc2VydmVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXJ2ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgd2ViaG9vayB0byB0aGUgd2ViaG9vayBzZXJ2ZXIuXHJcbiAgICAgKiBAcGFyYW0gbmVzdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYWRkV2ViaG9vayhuZXN0OiBXZWJob29rTmVzdCkge1xyXG4gICAgICAgIGxldCBlID0gdGhpcztcclxuICAgICAgICBlLnNlcnZlci5hZGRXZWJob29rKG5lc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIHdlYmhvb2sgaW50ZXJmYWNlIHRvIHRoZSB3ZWJob29rIHNlcnZlci5cclxuICAgICAqIEBwYXJhbSBpbVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYWRkV2ViaG9va0ludGVyZmFjZShpbTogSW50ZXJmYWNlTWFuYWdlcikge1xyXG4gICAgICAgIGxldCBlID0gdGhpcztcclxuICAgICAgICBlLnNlcnZlci5hZGRXZWJob29rSW50ZXJmYWNlKGltKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiRW52aXJvbm1lbnRcIjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBsb2cgZW50cnkgdG8gdGhlIExvZ2dlciBpbnN0YW5jZS5cclxuICAgICAqIEBwYXJhbSB0eXBlIHtudW1iZXJ9ICAgICAgICAgIFRoZSBsb2cgbGV2ZWwuIDAgPSBkZWJ1ZywgMSA9IGluZm8sIDIgPSB3YXJuaW5nLCAzID0gZXJyb3JcclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIHtzdHJpbmd9ICAgICAgIExvZyBtZXNzYWdlLlxyXG4gICAgICogQHBhcmFtIGFjdG9yICB7YW55fSAgICAgICAgICAgSW5zdGFuY2Ugd2hpY2ggdHJpZ2dlcnMgdGhlIGFjdGlvbiBiZWluZyBsb2dnZWQuXHJcbiAgICAgKiBAcGFyYW0gaW5zdGFuY2VzIHthbnlbXX0gICAgICBBcnJheSBvZiBvZiBvdGhlciBpbnZvbHZlZCBpbnN0YW5jZXMuXHJcbiAgICAgKiAjIyMjIEV4YW1wbGVcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiBqb2IuZS5sb2coMSwgYFRyYW5zZmVycmVkIHRvIFR1bm5lbCBcIiR7dHVubmVsLmdldE5hbWUoKX1cIi5gLCBqb2IsIFtvbGRUdW5uZWxdKTtcclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbG9nKHR5cGU6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nLCBhY3Rvcj86IGFueSwgaW5zdGFuY2VzID0gW10pIHtcclxuICAgICAgICB0aGlzLmxvZ2dlci5sb2codHlwZSwgbWVzc2FnZSwgYWN0b3IsIGluc3RhbmNlcyk7XHJcbiAgICB9XHJcbn0iXX0=
