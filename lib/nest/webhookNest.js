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
    function WebhookNest(e, path, httpMethod) {
        _super.call(this, e, path.toString());
        var wh = this;
        wh.setPath(path);
        wh.setHttpMethod(httpMethod);
    }
    WebhookNest.prototype.setPath = function (path) {
        var wh = this;
        var modifiedPath = "";
        if (typeof (path) === "string") {
            modifiedPath = encodeURIComponent(path);
        }
        else if (path instanceof Array) {
            path.forEach(function (pi) {
                modifiedPath += "/" + encodeURIComponent(pi);
            });
        }
        else {
            throw "Path should be a string or array, " + typeof (path) + " found.";
        }
        if (modifiedPath.charAt(0) !== "/") {
            modifiedPath = "/" + modifiedPath;
        }
        wh.path = modifiedPath;
    };
    WebhookNest.prototype.getPath = function () {
        return this.path;
    };
    WebhookNest.prototype.getHttpMethod = function () {
        return this.httpMethod;
    };
    WebhookNest.prototype.setHttpMethod = function (httpMethod) {
        var lower = httpMethod.toLowerCase();
        var acceptableMethods = ["get", "post", "put", "head", "delete", "options", "trace", "copy", "lock", "mkcol", "move", "purge", "propfind", "proppatch", "unlock", "report", "mkactivity", "checkout", "merge", "m-search", "notify", "subscribe", "unsubscribe", "patch", "search", "connect", "all"];
        if (acceptableMethods.indexOf(lower) === -1) {
            throw "HTTP method \"" + lower + "\" is not an acceptable value. " + JSON.stringify(acceptableMethods);
        }
        this.httpMethod = lower;
    };
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
        wh.e.addWebhook(wh);
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
