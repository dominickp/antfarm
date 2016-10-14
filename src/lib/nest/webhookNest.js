"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nest_1 = require("./nest");
var interfaceManager_1 = require("../ui/interfaceManager");
var http = require("http");
var WebhookNest = (function (_super) {
    __extends(WebhookNest, _super);
    /**
     * Webhook Nest constructor
     * @param e
     * @param path
     * @param httpMethod
     * @param handleRequest     Custom request handler function.
     */
    function WebhookNest(e, path, httpMethod, handleRequest) {
        _super.call(this, e, path.toString());
        var wh = this;
        wh.setPath(path);
        wh.setHttpMethod(httpMethod);
        if (handleRequest) {
            wh.setCustomHandleRequest(handleRequest);
        }
        this.im = new interfaceManager_1.InterfaceManager(this.e, this);
        this._holdResponse = false;
    }
    Object.defineProperty(WebhookNest.prototype, "holdResponse", {
        /**
         * Get the holdResponse flag.
         * @returns {boolean}
         */
        get: function () {
            return this._holdResponse;
        },
        /**
         * Set hold response flag. This allows you to run tunnel logic and send the response after completion.
         * You must call _releaseResponse_ later if you use this.
         * @param holdResponse
         */
        set: function (holdResponse) {
            this._holdResponse = holdResponse;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Releases the webhook response when tunnel run logic is complete.
     * @param job {WebhookJob}      The webhook job that triggered the webhook nest.
     * @param message {string}      The optional response message, if not using a custom request handler.
     * #### Example
     * ```js
     * var webhook = af.createWebhookNest(["jobs", "submit"], "post");
     * webhook.holdResponse = true; // Keeps the response from being sent immediately
     * var tunnel = af.createTunnel("Dwight's test tunnel");
     * tunnel.watch(webhook);
     * tunnel.run(function(job, nest){
     *      setTimeout(function(){
     *          nest.releaseResponse(job, "Worked!"); // Sends response
     *      }, 1500); // After 1.5 seconds
     * });
     * ```
     */
    WebhookNest.prototype.releaseResponse = function (job, message) {
        var wn = this;
        if (wn.holdResponse === false) {
            wn.e.log(3, "Nest responses must be held to release a response.", wn);
        }
        else if (job.responseSent === true) {
            wn.e.log(0, "Nest responses was already sent. Skipping.", wn);
        }
        else {
            wn.e.server.sendHookResponse(false, job, wn, job.getRequest(), job.getResponse(), wn.getCustomHandleRequest(), message);
        }
    };
    /**
     * Get the custom handleRequest function.
     * @returns {any}
     */
    WebhookNest.prototype.getCustomHandleRequest = function () {
        return this.handleRequest;
    };
    /**
     * Set the custom handlerRequest function.
     * @param handleRequest
     */
    WebhookNest.prototype.setCustomHandleRequest = function (handleRequest) {
        if (handleRequest !== null && typeof handleRequest !== "function") {
            throw ("Custom handleRequest must be a function.");
        }
        this.handleRequest = handleRequest;
    };
    /**
     * Set the path as a string or a string array. All parts are URI encoded.
     * Create directory structures with an array: ["one", "two"] results in "/one/two".
     * @param path
     */
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
    /**
     * Get the path.
     * @returns {string}
     */
    WebhookNest.prototype.getPath = function () {
        return this.path;
    };
    /**
     * Get the HTTP method.
     * @returns {string}
     */
    WebhookNest.prototype.getHttpMethod = function () {
        return this.httpMethod;
    };
    /**
     * Set the HTTP method.
     * @param httpMethod
     */
    WebhookNest.prototype.setHttpMethod = function (httpMethod) {
        var lower = httpMethod.toLowerCase();
        var acceptableMethods = ["get", "post", "put", "head", "delete", "options", "trace", "copy", "lock", "mkcol", "move", "purge", "propfind", "proppatch", "unlock", "report", "mkactivity", "checkout", "merge", "m-search", "notify", "subscribe", "unsubscribe", "patch", "search", "connect", "all"];
        if (acceptableMethods.indexOf(lower) === -1) {
            throw "HTTP method \"" + lower + "\" is not an acceptable value. " + JSON.stringify(acceptableMethods);
        }
        this.httpMethod = lower;
    };
    /**
     * Get the name.
     * @returns {string}
     */
    WebhookNest.prototype.getName = function () {
        return this.name;
    };
    /**
     * On load, do nothing.
     */
    WebhookNest.prototype.load = function () { };
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
    /**
     * Get the interface manager. Used to manage interface instances for session handling.
     * @returns {InterfaceManager}
     */
    WebhookNest.prototype.getInterfaceManager = function () {
        return this.im;
    };
    return WebhookNest;
}(nest_1.Nest));
exports.WebhookNest = WebhookNest;
//# sourceMappingURL=webhookNest.js.map