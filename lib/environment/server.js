"use strict";
var webhookJob_1 = require("../job/webhookJob");
var express = require("express");
var cors = require("cors"), multer = require("multer"), path = require("path"), tmp = require("tmp"), async = require("async");
/**
 * Webhook and logging server.
 */
var Server = (function () {
    function Server(e) {
        this.hookRoutes = [];
        this.hookInterfaceRoutes = [];
        this.config = {
            hooks_prefix: "/hooks",
            hooks_ui_prefix: "/hooks-ui"
        };
        /**
         * Handles request and response of the web hook interface.
         * @param im {InterfaceManager}
         * @param req {express.Request}
         * @param res {express.Response}
         * @param customHandler             Custom request handler.
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
                // let fields = ui.getInterface().fields;
                var fields = ui.getFields();
                fields.forEach(function (field) {
                    if (field.id in params && params[field.id] !== "undefined") {
                        field.value = params[field.id];
                    }
                });
                // Do steps
                // NEEDS TO BE ASYNCHRONOUS, HAVE A DONE CALBACK
                // ui.getSteps().forEach(function(step){
                //     s.e.log(0, `Running UI step "${step.name}".`, s);
                //     step.callback(job, ui, step);
                // });
                async.each(ui.getSteps(), function (step, cb) {
                    s.e.log(0, "Running UI step \"" + step.name + "\".", s);
                    step.callback(job, ui, step, function () {
                        cb();
                    });
                }, function (err) {
                    if (err) {
                        s.e.log(3, "Error running UI steps. " + err, s);
                    }
                    else {
                        s.e.log(0, "Done running all UI steps.", s);
                    }
                    if (customHandler) {
                        customHandler(req, res, ui);
                    }
                    else {
                        res.json(ui.getTransportInterface());
                    }
                });
            }
            else {
                if (customHandler) {
                    customHandler(req, res, ui);
                }
                else {
                    res.json(ui.getTransportInterface());
                }
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
    /**
     * Log name
     * @returns {string}
     */
    Server.prototype.toString = function () {
        return "Server";
    };
    /**
     * Adds a webhook to the server.
     * @param nest {WebhookNest}
     */
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
            var customHandler = nest.getCustomHandleRequest();
            s.handleHookRequest(nest, req, res, customHandler);
        });
    };
    /**
     * Handles request and response of the web hook, creates a new job, as well as calling the nest's arrive.
     * @param nest {WebhookNest}
     * @param req {express.Request}
     * @param res {express.Response}
     * @param customHandler     Custom request handler.
     */
    Server.prototype.handleHookRequest = function (nest, req, res, customHandler) {
        var s = this;
        // Job arrive
        var job = new webhookJob_1.WebhookJob(s.e, req, res);
        nest.arrive(job);
        s.sendHookResponse(nest.holdResponse, job, nest, req, res, customHandler);
    };
    ;
    /**
     * Sends the actual hook response.
     * @param holdResponse      Flag to bypass sending now for held responses.
     * @param job               Webhook job
     * @param nest              Webhook nest
     * @param req
     * @param res
     * @param customHandler
     * @param message
     */
    Server.prototype.sendHookResponse = function (holdResponse, job, nest, req, res, customHandler, message) {
        if (holdResponse === true) {
        }
        else if (customHandler) {
            job.responseSent = true;
            customHandler(req, res, job, nest);
        }
        else {
            job.responseSent = true;
            var response = {
                message: message || "Job " + job.getId() + " was created!",
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
     * Adds a webhook interface to the webhook server.
     * @param im {InterfaceManager}
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
