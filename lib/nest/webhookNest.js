"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nest_1 = require("./nest");
var webhookJob_1 = require("../job/webhookJob");
var http = require("http");
var WebhookNest = (function (_super) {
    __extends(WebhookNest, _super);
    function WebhookNest(e, port) {
        _super.call(this, e, "Webhook " + port.toString());
        var wh = this;
        wh.port = port;
        wh.createServer();
    }
    /**
     * Creates the server.
     */
    WebhookNest.prototype.createServer = function () {
        var wh = this;
        wh.server = http.createServer(function (request, response) {
            response.end("It Works!! Path Hit: " + request.url);
            var job = new webhookJob_1.WebhookJob(wh.e, request, response);
            wh.arrive(job);
            wh.e.log(1, "Request received. Sent " + request.url + ".", wh);
        });
    };
    WebhookNest.prototype.load = function () {
    };
    /**
     * Start server listening
     */
    WebhookNest.prototype.watch = function () {
        var wh = this;
        wh.server.listen(wh.port, function () {
            // Callback triggered when server is successfully listening.
            wh.e.log(1, "Server listening on: http://localhost:" + wh.port + "/.", wh);
        });
    };
    /**
     * Creates a new job
     * @param job
     */
    WebhookNest.prototype.arrive = function (job) {
        _super.prototype.arrive.call(this, job);
    };
    return WebhookNest;
}(nest_1.Nest));
exports.WebhookNest = WebhookNest;
