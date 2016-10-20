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
        this.setOptions(options);
    }
    /**
     * Sets the options and creates other environmental objects if necessary.
     * @param options
     */
    Environment.prototype.setOptions = function (options) {
        var e = this;
        if (options.auto_managed_folder_directory) {
            try {
                fs.statSync(options.auto_managed_folder_directory);
            }
            catch (err) {
                e.log(3, "Auto managed directory \"" + options.auto_managed_folder_directory + "\" does not exist.", this);
            }
        }
        this.options = options;
        if (options.port) {
            e.createServer();
        }
        if (options.email_credentials) {
            e.createEmailer();
        }
    };
    /**
     * Creates an Emailer object to send emails.
     */
    Environment.prototype.createEmailer = function () {
        var e = this;
        // Get options needed and pass to emailer
        var credentials = e.options.email_credentials;
        e.emailer = new emailer_1.Emailer(e, credentials);
    };
    Environment.prototype.getEmailer = function () {
        return this.emailer;
    };
    /**
     * Get the Antfarm options.
     * @returns {AntfarmOptions}
     */
    Environment.prototype.getOptions = function () {
        return this.options;
    };
    /**
     * Return the auto managed folder directory, if set.
     * @returns {string}
     */
    Environment.prototype.getAutoManagedFolderDirectory = function () {
        return this.options.auto_managed_folder_directory;
    };
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUJBQXFCLFVBQVUsQ0FBQyxDQUFBO0FBRWhDLHVCQUFxQixVQUFVLENBQUMsQ0FBQTtBQUdoQyx3QkFBc0IsV0FBVyxDQUFDLENBQUE7QUFHbEMsSUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRTNCOzs7R0FHRztBQUNIO0lBU0kscUJBQVksT0FBdUI7UUFIekIsZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNoQix3QkFBbUIsR0FBRyxFQUFFLENBQUM7UUFHL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7O09BR0c7SUFDTyxnQ0FBVSxHQUFwQixVQUFxQixPQUF1QjtRQUN4QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFYixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQztnQkFDRCxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBQ3ZELENBQUU7WUFBQSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNYLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLDhCQUEyQixPQUFPLENBQUMsNkJBQTZCLHVCQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3hHLENBQUM7UUFDTCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDckIsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDNUIsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3RCLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDTyxtQ0FBYSxHQUF2QjtRQUNJLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNiLHlDQUF5QztRQUN6QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO1FBQzlDLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU0sZ0NBQVUsR0FBakI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksZ0NBQVUsR0FBakI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksbURBQTZCLEdBQXBDO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUM7SUFDdEQsQ0FBQztJQUVEOztPQUVHO0lBQ08sa0NBQVksR0FBdEI7UUFDSSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksZUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFNRCxzQkFBVywrQkFBTTtRQUpqQjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3hCLENBQUM7OztPQUFBO0lBRUQ7OztPQUdHO0lBQ0ksZ0NBQVUsR0FBakIsVUFBa0IsSUFBaUI7UUFDL0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLHlDQUFtQixHQUExQixVQUEyQixFQUFvQjtRQUMzQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFTSw4QkFBUSxHQUFmO1FBQ0ksTUFBTSxDQUFDLGFBQWEsQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNJLHlCQUFHLEdBQVYsVUFBVyxJQUFZLEVBQUUsT0FBZSxFQUFFLEtBQVcsRUFBRSxTQUFjO1FBQWQseUJBQWMsR0FBZCxjQUFjO1FBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFDTCxrQkFBQztBQUFELENBekhBLEFBeUhDLElBQUE7QUF6SFksbUJBQVcsY0F5SHZCLENBQUEiLCJmaWxlIjoibGliL2Vudmlyb25tZW50L2Vudmlyb25tZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMb2dnZXJ9IGZyb20gXCIuL2xvZ2dlclwiO1xuaW1wb3J0IHtXZWJob29rTmVzdH0gZnJvbSBcIi4uL25lc3Qvd2ViaG9va05lc3RcIjtcbmltcG9ydCB7U2VydmVyfSBmcm9tIFwiLi9zZXJ2ZXJcIjtcbmltcG9ydCB7SW50ZXJmYWNlTWFuYWdlcn0gZnJvbSBcIi4uL3VpL2ludGVyZmFjZU1hbmFnZXJcIjtcbmltcG9ydCB7QW50ZmFybU9wdGlvbnN9IGZyb20gXCIuL29wdGlvbnNcIjtcbmltcG9ydCB7RW1haWxlcn0gZnJvbSBcIi4vZW1haWxlclwiO1xuaW1wb3J0IHtFbWFpbENyZWRlbnRpYWxzfSBmcm9tIFwiLi9lbWFpbENyZWRlbnRpYWxzXCI7XG5cbmNvbnN0ICAgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5cbi8qKlxuICogVGhlIGVudmlyb25tZW50IGNsYXNzIGNvbnRyb2xzIGFsbCBhc3BlY3RzIG9mIHRoZSBhbnRmYXJtIGVudmlyb25tZW50LCBsaWtlIG9wdGlvbnMsIGxvZ2dpbmcsXG4gKiBhbmQgY29uc3RydWN0aW5nIGdsb2JhbGx5IHJlZmVyZW5jZWQgb2JqZWN0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIEVudmlyb25tZW50IHtcblxuICAgIHByb3RlY3RlZCBvcHRpb25zOiBBbnRmYXJtT3B0aW9ucztcbiAgICBwcm90ZWN0ZWQgbG9nZ2VyOiBMb2dnZXI7XG4gICAgcHJvdGVjdGVkIF9zZXJ2ZXI6IFNlcnZlcjtcbiAgICBwcm90ZWN0ZWQgZW1haWxlcjogRW1haWxlcjtcbiAgICBwcm90ZWN0ZWQgaG9va1JvdXRlcyA9IFtdO1xuICAgIHByb3RlY3RlZCBob29rSW50ZXJmYWNlUm91dGVzID0gW107XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBBbnRmYXJtT3B0aW9ucykge1xuICAgICAgICB0aGlzLmxvZ2dlciA9IG5ldyBMb2dnZXIob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBvcHRpb25zIGFuZCBjcmVhdGVzIG90aGVyIGVudmlyb25tZW50YWwgb2JqZWN0cyBpZiBuZWNlc3NhcnkuXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0T3B0aW9ucyhvcHRpb25zOiBBbnRmYXJtT3B0aW9ucykge1xuICAgICAgICBsZXQgZSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuYXV0b19tYW5hZ2VkX2ZvbGRlcl9kaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZnMuc3RhdFN5bmMob3B0aW9ucy5hdXRvX21hbmFnZWRfZm9sZGVyX2RpcmVjdG9yeSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBlLmxvZygzLCBgQXV0byBtYW5hZ2VkIGRpcmVjdG9yeSBcIiR7b3B0aW9ucy5hdXRvX21hbmFnZWRfZm9sZGVyX2RpcmVjdG9yeX1cIiBkb2VzIG5vdCBleGlzdC5gLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMucG9ydCkge1xuICAgICAgICAgICAgZS5jcmVhdGVTZXJ2ZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLmVtYWlsX2NyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICBlLmNyZWF0ZUVtYWlsZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gRW1haWxlciBvYmplY3QgdG8gc2VuZCBlbWFpbHMuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUVtYWlsZXIoKSB7XG4gICAgICAgIGxldCBlID0gdGhpcztcbiAgICAgICAgLy8gR2V0IG9wdGlvbnMgbmVlZGVkIGFuZCBwYXNzIHRvIGVtYWlsZXJcbiAgICAgICAgbGV0IGNyZWRlbnRpYWxzID0gZS5vcHRpb25zLmVtYWlsX2NyZWRlbnRpYWxzO1xuICAgICAgICBlLmVtYWlsZXIgPSBuZXcgRW1haWxlcihlLCBjcmVkZW50aWFscyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEVtYWlsZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVtYWlsZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBBbnRmYXJtIG9wdGlvbnMuXG4gICAgICogQHJldHVybnMge0FudGZhcm1PcHRpb25zfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRPcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgYXV0byBtYW5hZ2VkIGZvbGRlciBkaXJlY3RvcnksIGlmIHNldC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRBdXRvTWFuYWdlZEZvbGRlckRpcmVjdG9yeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5hdXRvX21hbmFnZWRfZm9sZGVyX2RpcmVjdG9yeTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBzZXJ2ZXIuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVNlcnZlcigpIHtcbiAgICAgICAgdGhpcy5fc2VydmVyID0gbmV3IFNlcnZlcih0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHNlcnZlciBpbnN0YW5jZS5cbiAgICAgKiBAcmV0dXJucyB7U2VydmVyfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgc2VydmVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VydmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSB3ZWJob29rIHRvIHRoZSB3ZWJob29rIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gbmVzdFxuICAgICAqL1xuICAgIHB1YmxpYyBhZGRXZWJob29rKG5lc3Q6IFdlYmhvb2tOZXN0KSB7XG4gICAgICAgIGxldCBlID0gdGhpcztcbiAgICAgICAgZS5zZXJ2ZXIuYWRkV2ViaG9vayhuZXN0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgd2ViaG9vayBpbnRlcmZhY2UgdG8gdGhlIHdlYmhvb2sgc2VydmVyLlxuICAgICAqIEBwYXJhbSBpbVxuICAgICAqL1xuICAgIHB1YmxpYyBhZGRXZWJob29rSW50ZXJmYWNlKGltOiBJbnRlcmZhY2VNYW5hZ2VyKSB7XG4gICAgICAgIGxldCBlID0gdGhpcztcbiAgICAgICAgZS5zZXJ2ZXIuYWRkV2ViaG9va0ludGVyZmFjZShpbSk7XG4gICAgfVxuXG4gICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gXCJFbnZpcm9ubWVudFwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsb2cgZW50cnkgdG8gdGhlIExvZ2dlciBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0gdHlwZSB7bnVtYmVyfSAgICAgICAgICBUaGUgbG9nIGxldmVsLiAwID0gZGVidWcsIDEgPSBpbmZvLCAyID0gd2FybmluZywgMyA9IGVycm9yXG4gICAgICogQHBhcmFtIG1lc3NhZ2Uge3N0cmluZ30gICAgICAgTG9nIG1lc3NhZ2UuXG4gICAgICogQHBhcmFtIGFjdG9yICB7YW55fSAgICAgICAgICAgSW5zdGFuY2Ugd2hpY2ggdHJpZ2dlcnMgdGhlIGFjdGlvbiBiZWluZyBsb2dnZWQuXG4gICAgICogQHBhcmFtIGluc3RhbmNlcyB7YW55W119ICAgICAgQXJyYXkgb2Ygb2Ygb3RoZXIgaW52b2x2ZWQgaW5zdGFuY2VzLlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogam9iLmUubG9nKDEsIGBUcmFuc2ZlcnJlZCB0byBUdW5uZWwgXCIke3R1bm5lbC5nZXROYW1lKCl9XCIuYCwgam9iLCBbb2xkVHVubmVsXSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGxvZyh0eXBlOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZywgYWN0b3I/OiBhbnksIGluc3RhbmNlcyA9IFtdKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmxvZyh0eXBlLCBtZXNzYWdlLCBhY3RvciwgaW5zdGFuY2VzKTtcbiAgICB9XG59Il19
