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
            e.server.createLogServer(e.logger);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUJBQXFCLFVBQVUsQ0FBQyxDQUFBO0FBRWhDLHVCQUFxQixVQUFVLENBQUMsQ0FBQTtBQUdoQyx3QkFBc0IsV0FBVyxDQUFDLENBQUE7QUFHbEMsSUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRTNCOzs7R0FHRztBQUNIO0lBU0kscUJBQVksT0FBdUI7UUFIekIsZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNoQix3QkFBbUIsR0FBRyxFQUFFLENBQUM7UUFHL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7O09BR0c7SUFDTyxnQ0FBVSxHQUFwQixVQUFxQixPQUF1QjtRQUN4QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFYixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQztnQkFDRCxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBQ3ZELENBQUU7WUFBQSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNYLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLDhCQUEyQixPQUFPLENBQUMsNkJBQTZCLHVCQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3hHLENBQUM7UUFDTCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDakIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN0QixDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ08sbUNBQWEsR0FBdkI7UUFDSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDYix5Q0FBeUM7UUFDekMsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztRQUM5QyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVNLGdDQUFVLEdBQWpCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLGdDQUFVLEdBQWpCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLG1EQUE2QixHQUFwQztRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDO0lBQ3RELENBQUM7SUFFRDs7T0FFRztJQUNPLGtDQUFZLEdBQXRCO1FBQ0ksSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBTUQsc0JBQVcsK0JBQU07UUFKakI7OztXQUdHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDOzs7T0FBQTtJQUVEOzs7T0FHRztJQUNJLGdDQUFVLEdBQWpCLFVBQWtCLElBQWlCO1FBQy9CLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNiLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7O09BR0c7SUFDSSx5Q0FBbUIsR0FBMUIsVUFBMkIsRUFBb0I7UUFDM0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sOEJBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxhQUFhLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSSx5QkFBRyxHQUFWLFVBQVcsSUFBWSxFQUFFLE9BQWUsRUFBRSxLQUFXLEVBQUUsU0FBYztRQUFkLHlCQUFjLEdBQWQsY0FBYztRQUNqRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBQ0wsa0JBQUM7QUFBRCxDQTFIQSxBQTBIQyxJQUFBO0FBMUhZLG1CQUFXLGNBMEh2QixDQUFBIiwiZmlsZSI6ImxpYi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TG9nZ2VyfSBmcm9tIFwiLi9sb2dnZXJcIjtcbmltcG9ydCB7V2ViaG9va05lc3R9IGZyb20gXCIuLi9uZXN0L3dlYmhvb2tOZXN0XCI7XG5pbXBvcnQge1NlcnZlcn0gZnJvbSBcIi4vc2VydmVyXCI7XG5pbXBvcnQge0ludGVyZmFjZU1hbmFnZXJ9IGZyb20gXCIuLi91aS9pbnRlcmZhY2VNYW5hZ2VyXCI7XG5pbXBvcnQge0FudGZhcm1PcHRpb25zfSBmcm9tIFwiLi9vcHRpb25zXCI7XG5pbXBvcnQge0VtYWlsZXJ9IGZyb20gXCIuL2VtYWlsZXJcIjtcbmltcG9ydCB7RW1haWxDcmVkZW50aWFsc30gZnJvbSBcIi4vZW1haWxDcmVkZW50aWFsc1wiO1xuXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpO1xuXG4vKipcbiAqIFRoZSBlbnZpcm9ubWVudCBjbGFzcyBjb250cm9scyBhbGwgYXNwZWN0cyBvZiB0aGUgYW50ZmFybSBlbnZpcm9ubWVudCwgbGlrZSBvcHRpb25zLCBsb2dnaW5nLFxuICogYW5kIGNvbnN0cnVjdGluZyBnbG9iYWxseSByZWZlcmVuY2VkIG9iamVjdHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBFbnZpcm9ubWVudCB7XG5cbiAgICBwcm90ZWN0ZWQgb3B0aW9uczogQW50ZmFybU9wdGlvbnM7XG4gICAgcHJvdGVjdGVkIGxvZ2dlcjogTG9nZ2VyO1xuICAgIHByb3RlY3RlZCBfc2VydmVyOiBTZXJ2ZXI7XG4gICAgcHJvdGVjdGVkIGVtYWlsZXI6IEVtYWlsZXI7XG4gICAgcHJvdGVjdGVkIGhvb2tSb3V0ZXMgPSBbXTtcbiAgICBwcm90ZWN0ZWQgaG9va0ludGVyZmFjZVJvdXRlcyA9IFtdO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogQW50ZmFybU9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBuZXcgTG9nZ2VyKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgb3B0aW9ucyBhbmQgY3JlYXRlcyBvdGhlciBlbnZpcm9ubWVudGFsIG9iamVjdHMgaWYgbmVjZXNzYXJ5LlxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNldE9wdGlvbnMob3B0aW9uczogQW50ZmFybU9wdGlvbnMpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmF1dG9fbWFuYWdlZF9mb2xkZXJfZGlyZWN0b3J5KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZzLnN0YXRTeW5jKG9wdGlvbnMuYXV0b19tYW5hZ2VkX2ZvbGRlcl9kaXJlY3RvcnkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZS5sb2coMywgYEF1dG8gbWFuYWdlZCBkaXJlY3RvcnkgXCIke29wdGlvbnMuYXV0b19tYW5hZ2VkX2ZvbGRlcl9kaXJlY3Rvcnl9XCIgZG9lcyBub3QgZXhpc3QuYCwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnBvcnQpIHtcbiAgICAgICAgICAgIGUuY3JlYXRlU2VydmVyKCk7XG4gICAgICAgICAgICBlLnNlcnZlci5jcmVhdGVMb2dTZXJ2ZXIoZS5sb2dnZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZW1haWxfY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgIGUuY3JlYXRlRW1haWxlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBFbWFpbGVyIG9iamVjdCB0byBzZW5kIGVtYWlscy5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlRW1haWxlcigpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzO1xuICAgICAgICAvLyBHZXQgb3B0aW9ucyBuZWVkZWQgYW5kIHBhc3MgdG8gZW1haWxlclxuICAgICAgICBsZXQgY3JlZGVudGlhbHMgPSBlLm9wdGlvbnMuZW1haWxfY3JlZGVudGlhbHM7XG4gICAgICAgIGUuZW1haWxlciA9IG5ldyBFbWFpbGVyKGUsIGNyZWRlbnRpYWxzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RW1haWxlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW1haWxlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIEFudGZhcm0gb3B0aW9ucy5cbiAgICAgKiBAcmV0dXJucyB7QW50ZmFybU9wdGlvbnN9XG4gICAgICovXG4gICAgcHVibGljIGdldE9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBhdXRvIG1hbmFnZWQgZm9sZGVyIGRpcmVjdG9yeSwgaWYgc2V0LlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldEF1dG9NYW5hZ2VkRm9sZGVyRGlyZWN0b3J5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmF1dG9fbWFuYWdlZF9mb2xkZXJfZGlyZWN0b3J5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIHNlcnZlci5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlU2VydmVyKCkge1xuICAgICAgICB0aGlzLl9zZXJ2ZXIgPSBuZXcgU2VydmVyKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgc2VydmVyIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm5zIHtTZXJ2ZXJ9XG4gICAgICovXG4gICAgcHVibGljIGdldCBzZXJ2ZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXJ2ZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHdlYmhvb2sgdG8gdGhlIHdlYmhvb2sgc2VydmVyLlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHVibGljIGFkZFdlYmhvb2sobmVzdDogV2ViaG9va05lc3QpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzO1xuICAgICAgICBlLnNlcnZlci5hZGRXZWJob29rKG5lc3QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSB3ZWJob29rIGludGVyZmFjZSB0byB0aGUgd2ViaG9vayBzZXJ2ZXIuXG4gICAgICogQHBhcmFtIGltXG4gICAgICovXG4gICAgcHVibGljIGFkZFdlYmhvb2tJbnRlcmZhY2UoaW06IEludGVyZmFjZU1hbmFnZXIpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzO1xuICAgICAgICBlLnNlcnZlci5hZGRXZWJob29rSW50ZXJmYWNlKGltKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBcIkVudmlyb25tZW50XCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxvZyBlbnRyeSB0byB0aGUgTG9nZ2VyIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB0eXBlIHtudW1iZXJ9ICAgICAgICAgIFRoZSBsb2cgbGV2ZWwuIDAgPSBkZWJ1ZywgMSA9IGluZm8sIDIgPSB3YXJuaW5nLCAzID0gZXJyb3JcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSB7c3RyaW5nfSAgICAgICBMb2cgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gYWN0b3IgIHthbnl9ICAgICAgICAgICBJbnN0YW5jZSB3aGljaCB0cmlnZ2VycyB0aGUgYWN0aW9uIGJlaW5nIGxvZ2dlZC5cbiAgICAgKiBAcGFyYW0gaW5zdGFuY2VzIHthbnlbXX0gICAgICBBcnJheSBvZiBvZiBvdGhlciBpbnZvbHZlZCBpbnN0YW5jZXMuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBqb2IuZS5sb2coMSwgYFRyYW5zZmVycmVkIHRvIFR1bm5lbCBcIiR7dHVubmVsLmdldE5hbWUoKX1cIi5gLCBqb2IsIFtvbGRUdW5uZWxdKTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgbG9nKHR5cGU6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nLCBhY3Rvcj86IGFueSwgaW5zdGFuY2VzID0gW10pIHtcbiAgICAgICAgdGhpcy5sb2dnZXIubG9nKHR5cGUsIG1lc3NhZ2UsIGFjdG9yLCBpbnN0YW5jZXMpO1xuICAgIH1cbn0iXX0=
