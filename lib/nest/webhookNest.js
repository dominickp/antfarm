"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nest_1 = require("./nest");
var http = require("http");
var WebhookNest = (function (_super) {
    __extends(WebhookNest, _super);
    function WebhookNest(e, port) {
        _super.call(this, e, port.toString());
        this.port = port;
        this.server = http.createServer(this.handleRequest);
    }
    /**
     * Handles request and sends a response.
     * @param request
     * @param response
     */
    WebhookNest.prototype.handleRequest = function (request, response) {
        response.end("It Works!! Path Hit: " + request.url);
    };
    WebhookNest.prototype.load = function () {
    };
    WebhookNest.prototype.watch = function () {
        var wh = this;
        wh.server.listen(wh.port, function () {
            // Callback triggered when server is successfully listening.
            wh.e.log(1, "Server listening on: http://localhost:" + wh.port + ".", wh);
        });
    };
    return WebhookNest;
}(nest_1.Nest));
exports.WebhookNest = WebhookNest;
