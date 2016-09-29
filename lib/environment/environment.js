"use strict";
var logger_1 = require("./logger");
var webhookJob_1 = require("../job/webhookJob");
var http = require("http"), 
// Router = require("router"),
finalhandler = require("finalhandler"), Router = require("router");
// const router = Router({});
var Environment = (function () {
    function Environment(options) {
        this.routes = [];
        /**
         * Handles request and response of the web hook, creates a new job, as well as calling the nest's arrive.
         * @param nest
         * @param req
         * @param res
         */
        this.handleHookRequest = function (nest, req, res) {
            var e = this;
            var job = new webhookJob_1.WebhookJob(e, req, res);
            nest.arrive(job);
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
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(responseString);
        };
        this.options = options;
        this.router = Router({});
        if (this.options.port) {
            this.createServer();
        }
        this.logger = new logger_1.Logger(this.options);
    }
    /**
     * Creates the server.
     */
    Environment.prototype.createServer = function () {
        var e = this;
        e.server = http.createServer(function (request, response) {
            try {
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
            res.end(JSON.stringify(e.routes));
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
        this.routes.push({
            path: hook.path,
            nest: nest.getName(),
            tunnel: nest.getTunnel().getName(),
            methods: hook.methods
        });
        hook[httpMethod](function (req, res) {
            e.handleHookRequest(nest, req, res);
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
