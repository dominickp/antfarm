"use strict";
var logger_1 = require("./logger");
var server_1 = require("./server");
var fs = require("fs");
var Environment = (function () {
    function Environment(options) {
        this.hookRoutes = [];
        this.hookInterfaceRoutes = [];
        this.logger = new logger_1.Logger(options);
        this.setOptions(options);
    }
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
    Environment.prototype.getAutoManagedFolderDirectory = function () {
        return this.options.auto_managed_folder_directory;
    };
    /**
     * Creates the server.
     */
    // protected createServer() {
    //     let e = this;
    //     e.server = http.createServer(function(request, response) {
    //         try {
    //             response.setHeader("Access-Control-Allow-Headers", "Content-Type,Accept");
    //             response.setHeader("Access-Control-Allow-Origin", "*");
    //             e.router(request, response, finalhandler(request, response));
    //         } catch (err) {
    //             e.log(3, err, e);
    //         }
    //     });
    //
    //     e.server.listen(e.options.port, function(){
    //         // Callback triggered when server is successfully listening. Hurray!
    //         e.log(1, "Server listening on: http://localhost:" +  e.options.port, e);
    //     });
    //
    //     e.router.get("/hooks", function (req, res) {
    //         res.setHeader("Content-Type", "application/json; charset=utf-8");
    //         res.setHeader("Access-Control-Allow-Origin", "*");
    //         res.end(JSON.stringify(e.hookRoutes));
    //     });
    //     e.router.get("/hooks-ui", function (req, res) {
    //         res.setHeader("Content-Type", "application/json; charset=utf-8");
    //         res.setHeader("Access-Control-Allow-Origin", "*");
    //         res.end(JSON.stringify(e.hookInterfaceRoutes));
    //     });
    // }
    Environment.prototype.createServer = function () {
        var server = new server_1.Server(this);
        this.server2 = server;
    };
    /**
     * Adds a webhook to the webhook server.
     * @param nest
     */
    Environment.prototype.addWebhook = function (nest) {
        var e = this;
        e.server2.addWebhook(nest);
    };
    /**
     * Adds a webhook interface to the webhook server.
     * @param im
     */
    Environment.prototype.addWebhookInterface = function (im) {
        var e = this;
        e.server2.addWebhookInterface(im);
    };
    Environment.prototype.toString = function () {
        return "Environment";
    };
    Environment.prototype.log = function (type, message, actor, instances) {
        if (instances === void 0) { instances = []; }
        // try {
        //     this.logger.log(type, message, actor, instances);
        // } catch (e) {
        //     console.log(e);
        // }
        this.logger.log(type, message, actor, instances);
    };
    return Environment;
}());
exports.Environment = Environment;
