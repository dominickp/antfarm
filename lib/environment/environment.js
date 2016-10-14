"use strict";
var logger_1 = require("./logger");
var server_1 = require("./server");
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
            this.createServer();
        }
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
