"use strict";
var logger_1 = require("./logger");
var webhookJob_1 = require("../job/webhookJob");
var http = require("http"), finalhandler = require("finalhandler"), Router = require("router"), fs = require("fs");
var Environment = (function () {
    function Environment(options) {
        this.hookRoutes = [];
        this.hookInterfaceRoutes = [];
        /**
         * Handles request and response of the web hook, creates a new job, as well as calling the nest's arrive.
         * @param nest
         * @param req
         * @param res
         * @param customHandler     Custom request handler.
         */
        this.handleHookRequest = function (nest, req, res, customHandler) {
            var e = this;
            console.log("method", req.method);
            // Handle CORS
            if (req.method === "OPTIONS") {
                // add needed headers
                var headers = {};
                headers["Access-Control-Allow-Origin"] = "*";
                headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
                headers["Access-Control-Allow-Credentials"] = true;
                headers["Access-Control-Max-Age"] = "86400"; // 24 hours
                headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
                // respond to the request
                console.log(headers);
                res.writeHead(200, headers);
                res.end();
            }
            var job = new webhookJob_1.WebhookJob(e, req, res);
            nest.arrive(job);
            if (customHandler) {
                customHandler(req, res, job, nest);
            }
            else {
                var responseString = JSON.stringify({
                    message: "Job " + job.getId() + " was created!",
                    job: {
                        id: job.getId(),
                        name: job.getName()
                    },
                    nest: {
                        name: nest.getName()
                    }
                });
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(responseString);
            }
        };
        /**
         * Handles request and response of the web hook interface.
         * @param ui
         * @param req
         * @param res
         * @param customHandler     Custom request handler.
         */
        this.handleHookInterfaceRequest = function (ui, req, res, customHandler) {
            var e = this;
            if (customHandler) {
                customHandler(req, res, ui);
            }
            else {
                var responseString = JSON.stringify(ui.getInterface());
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(responseString);
            }
        };
        this.router = Router({});
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
    Environment.prototype.getAutoManagedFolderDirectory = function () {
        return this.options.auto_managed_folder_directory;
    };
    /**
     * Creates the server.
     */
    Environment.prototype.createServer = function () {
        var e = this;
        e.server = http.createServer(function (request, response) {
            try {
                response.setHeader("Access-Control-Allow-Origin", "*");
                e.router(request, response, finalhandler(request, response));
            }
            catch (err) {
                e.log(3, err, e);
            }
        });
        e.server.listen(e.options.port, function () {
            // Callback triggered when server is successfully listening. Hurray!
            e.log(1, "Server listening on: http://localhost:" + e.options.port, e);
        });
        e.router.get("/hooks", function (req, res) {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify(e.hookRoutes));
        });
        e.router.get("/hooks-ui", function (req, res) {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify(e.hookInterfaceRoutes));
        });
    };
    /**
     * Adds a webhook to the webhook server.
     * @param nest
     */
    Environment.prototype.addWebhook = function (nest) {
        var e = this;
        var httpMethod = nest.getHttpMethod();
        var path = nest.getPath();
        var hook = e.router.route("/hooks" + path);
        e.log(1, "Watching webhook " + httpMethod.toUpperCase() + " /hooks" + path, e);
        var ui_path;
        if (nest.getInterface()) {
            ui_path = "/hooks-ui" + nest.getInterface().getPath();
        }
        this.hookRoutes.push({
            id: nest.getId(),
            path: hook.path,
            nest: nest.getName(),
            tunnel: nest.getTunnel().getName(),
            methods: hook.methods,
            interface_path: ui_path
        });
        hook[httpMethod](function (req, res) {
            var customHandler = nest.getCustomHandleRequest();
            e.handleHookRequest(nest, req, res, customHandler);
        });
    };
    /**
     * Adds a webhook interface to the webhook server.
     * @param webhook_interface
     */
    Environment.prototype.addWebhookInterface = function (webhook_interface) {
        var e = this;
        var nest = webhook_interface.getNest();
        var path = webhook_interface.getPath();
        var hook = e.router.route("/hooks-ui" + path);
        e.log(1, "Watching webhook interface GET /hooks-ui" + path, e);
        this.hookInterfaceRoutes.push({
            id: nest.getId(),
            path: hook.path,
            nest: nest.getName(),
            target: "/hooks" + nest.getPath()
        });
        hook["get"](function (req, res) {
            var customHandler = webhook_interface.getCustomHandleRequest();
            e.handleHookInterfaceRequest(webhook_interface, req, res, customHandler);
        });
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
