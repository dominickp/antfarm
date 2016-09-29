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
    function WebhookNest(e, name) {
        _super.call(this, e, name);
        var wh = this;
        wh.name = name;
    }
    WebhookNest.prototype.getName = function () {
        return this.name;
    };
    WebhookNest.prototype.load = function () {
    };
    /**
     * Add webhook to server watch list.
     */
    WebhookNest.prototype.watch = function () {
        var wh = this;
        wh.e.addWebhook(wh, wh.getName());
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
