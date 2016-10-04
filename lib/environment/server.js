"use strict";
var webhookJob_1 = require("../job/webhookJob");
var express = require('express');
var express = require("express"), cors = require("cors"), multer = require("multer"), path = require("path");
var Server = (function () {
    function Server(e) {
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
            // Job arrive
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
                res.json(responseString);
            }
        };
        this.e = e;
        this.server = express();
        this.createServer();
    }
    /**
     * Creates the server.
     */
    Server.prototype.createServer = function () {
        var s = this;
        var port = s.e.getOptions().port;
        s.server.use(cors());
        s.server.listen(port, function () { return s.e.log(1, "Server up and listening on port " + port + ".", s); });
    };
    Server.prototype.toString = function () {
        return "Server";
    };
    Server.prototype.handleHookRequest = function () {
        var s = this;
    };
    Server.prototype.addWebhook = function (nest) {
        var s = this;
        var e = s.e;
        var hooks_prefix = "/hooks", hooks_ui_prefix = "/hooks-ui";
        var httpMethod = nest.getHttpMethod();
        var hook_path = hooks_prefix + nest.getPath();
        var hook_ui_path;
        if (nest.getInterface()) {
            hook_ui_path = hooks_ui_prefix + nest.getInterface().getPath();
        }
        s.hookRoutes.push({
            id: nest.getId(),
            path: hook_path,
            nest: nest.getName(),
            tunnel: nest.getTunnel().getName(),
            methods: httpMethod,
            interface_path: hook_ui_path
        });
        s.server[httpMethod](function (req, res) {
            var customHandler = nest.getCustomHandleRequest();
            s.handleHookRequest(nest, req, res, customHandler);
        });
    };
    return Server;
}());
exports.Server = Server;
