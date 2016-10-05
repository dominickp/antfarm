"use strict";
var webhookJob_1 = require("../job/webhookJob");
var express = require("express");
var cors = require("cors"), multer = require("multer"), path = require("path"), tmp = require("tmp");
var Server = (function () {
    function Server(e) {
        this.hookRoutes = [];
        this.hookInterfaceRoutes = [];
        this.config = {
            hooks_prefix: "/hooks",
            hooks_ui_prefix: "/hooks-ui"
        };
        /**
         * Handles request and response of the web hook, creates a new job, as well as calling the nest's arrive.
         * @param nest
         * @param req
         * @param res
         * @param customHandler     Custom request handler.
         */
        this.handleHookRequest = function (nest, req, res, customHandler) {
            var s = this;
            // Job arrive
            var job = new webhookJob_1.WebhookJob(s.e, req, res);
            nest.arrive(job);
            if (customHandler) {
                customHandler(req, res, job, nest);
            }
            else {
                var response = {
                    message: "Job " + job.getId() + " was created!",
                    job: {
                        id: job.getId(),
                        name: job.getName()
                    },
                    nest: {
                        name: nest.getName()
                    }
                };
                res.json(response);
            }
        };
        /**
         * Handles request and response of the web hook interface.
         * @param im
         * @param req
         * @param res
         * @param customHandler     Custom request handler.
         */
        this.handleHookInterfaceRequest = function (im, req, res, customHandler) {
            var s = this;
            // Job arrive
            var job = new webhookJob_1.WebhookJob(s.e, req, res);
            // Fill in default values
            var params = job.getQueryStringValues();
            // If session not set, return a fresh ui somehow
            var sessionId = params["sessionId"] || job.getFormDataValue("sessionId");
            var ui = im.getInterface(sessionId);
            if (ui.getSessionId() === sessionId) {
                // Fill in default values
                var fields = ui.getInterface().fields;
                fields.forEach(function (field) {
                    if (field.id in params && params[field.id] !== "undefined") {
                        field.value = params[field.id];
                    }
                });
                // Do steps
                ui.getSteps().forEach(function (step) {
                    s.e.log(1, "Running UI step \"" + step.name + "\".", s);
                    step.callback(job, ui);
                });
            }
            if (customHandler) {
                customHandler(req, res, ui);
            }
            else {
                res.json(ui.getInterface());
            }
        };
        this.e = e;
        this.server = express();
        this.createServer();
        // let tmpDir = tmp.dirSync().name;
        var tmpDir = "./example";
        this.upload = multer({
            destination: tmpDir,
            storage: multer.diskStorage({
                filename: function (req, file, cb) {
                    console.log(req.headers);
                    cb(null, file.fieldname + "-" + Date.now());
                }
            })
        });
    }
    /**
     * Creates the server.
     */
    Server.prototype.createServer = function () {
        var s = this;
        var port = s.e.getOptions().port;
        s.server.use(cors());
        // Add index routes
        s.server.get(s.config.hooks_prefix, function (req, res) {
            res.json(s.hookRoutes);
        });
        s.server.get(s.config.hooks_ui_prefix, function (req, res) {
            res.json(s.hookInterfaceRoutes);
        });
        s.server.listen(port, function () { return s.e.log(1, "Server up and listening on port " + port + ".", s); });
    };
    Server.prototype.toString = function () {
        return "Server";
    };
    Server.prototype.addWebhook = function (nest) {
        var s = this;
        var e = s.e;
        var httpMethod = nest.getHttpMethod();
        var hook_path = s.config.hooks_prefix + nest.getPath();
        var hook_ui_path;
        var im = nest.getInterfaceManager();
        var wi = im.getInterface();
        hook_ui_path = s.config.hooks_ui_prefix + im.getPath();
        s.e.log(1, "Watching webhook " + httpMethod.toUpperCase() + " " + hook_path, s);
        s.hookRoutes.push({
            id: nest.getId(),
            path: hook_path,
            nest: nest.getName(),
            tunnel: nest.getTunnel().getName(),
            method: httpMethod,
            interface_path: hook_ui_path
        });
        s.server[httpMethod](hook_path, s.upload.any(), function (req, res) {
            // console.log(req.body, req.files, req.file);
            var customHandler = nest.getCustomHandleRequest();
            s.handleHookRequest(nest, req, res, customHandler);
        });
    };
    /**
     * Adds a webhook interface to the webhook server.
     * @param im
     */
    Server.prototype.addWebhookInterface = function (im) {
        var s = this;
        var nest = im.getNest();
        var hook_path = s.config.hooks_prefix + nest.getPath();
        var hook_ui_path = s.config.hooks_ui_prefix + im.getPath();
        s.e.log(1, "Watching webhook interface GET " + hook_ui_path, s);
        this.hookInterfaceRoutes.push({
            id: nest.getId(),
            path: hook_ui_path,
            nest: nest.getName(),
            target: hook_path
        });
        s.server.get(hook_ui_path, function (req, res) {
            var customHandler = im.getCustomHandleRequest();
            s.handleHookInterfaceRequest(im, req, res, customHandler);
        });
    };
    return Server;
}());
exports.Server = Server;
