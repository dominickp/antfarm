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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Y2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7IE5lc3QgfSBmcm9tIFwiLi9uZXN0XCI7XG5pbXBvcnQgeyBGaWxlSm9iIH0gZnJvbSBcIi4vLi4vam9iL2ZpbGVKb2JcIjtcbmltcG9ydCB7V2ViaG9va0pvYn0gZnJvbSBcIi4uL2pvYi93ZWJob29rSm9iXCI7XG5pbXBvcnQge1dlYmhvb2tJbnRlcmZhY2V9IGZyb20gXCIuLi91aS93ZWJob29rSW50ZXJmYWNlXCI7XG5pbXBvcnQge0ludGVyZmFjZU1hbmFnZXJ9IGZyb20gXCIuLi91aS9pbnRlcmZhY2VNYW5hZ2VyXCI7XG5cbmNvbnN0ICAgaHR0cCA9IHJlcXVpcmUoXCJodHRwXCIpO1xuXG5leHBvcnQgY2xhc3MgV2ViaG9va05lc3QgZXh0ZW5kcyBOZXN0IHtcblxuICAgIHByb3RlY3RlZCBwYXRoOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGh0dHBNZXRob2Q6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgaGFuZGxlUmVxdWVzdDogYW55O1xuICAgIHByb3RlY3RlZCB1aTogV2ViaG9va0ludGVyZmFjZTtcbiAgICBwcm90ZWN0ZWQgaW06IEludGVyZmFjZU1hbmFnZXI7XG4gICAgcHJvdGVjdGVkIF9ob2xkUmVzcG9uc2U6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBXZWJob29rIE5lc3QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICogQHBhcmFtIGh0dHBNZXRob2RcbiAgICAgKiBAcGFyYW0gaGFuZGxlUmVxdWVzdCAgICAgQ3VzdG9tIHJlcXVlc3QgaGFuZGxlciBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aDogc3RyaW5nfHN0cmluZ1tdLCBodHRwTWV0aG9kOiBzdHJpbmcsIGhhbmRsZVJlcXVlc3Q/OiBhbnkpIHtcbiAgICAgICAgc3VwZXIoZSwgcGF0aC50b1N0cmluZygpKTtcbiAgICAgICAgbGV0IHdoID0gdGhpcztcbiAgICAgICAgd2guc2V0UGF0aChwYXRoKTtcbiAgICAgICAgd2guc2V0SHR0cE1ldGhvZChodHRwTWV0aG9kKTtcbiAgICAgICAgaWYgKGhhbmRsZVJlcXVlc3QpIHtcbiAgICAgICAgICAgIHdoLnNldEN1c3RvbUhhbmRsZVJlcXVlc3QoaGFuZGxlUmVxdWVzdCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmltID0gbmV3IEludGVyZmFjZU1hbmFnZXIodGhpcy5lLCB0aGlzKTtcbiAgICAgICAgdGhpcy5faG9sZFJlc3BvbnNlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGhvbGQgcmVzcG9uc2UgZmxhZy4gVGhpcyBhbGxvd3MgeW91IHRvIHJ1biB0dW5uZWwgbG9naWMgYW5kIHNlbmQgdGhlIHJlc3BvbnNlIGFmdGVyIGNvbXBsZXRpb24uXG4gICAgICogWW91IG11c3QgY2FsbCBfcmVsZWFzZVJlc3BvbnNlXyBsYXRlciBpZiB5b3UgdXNlIHRoaXMuXG4gICAgICogQHBhcmFtIGhvbGRSZXNwb25zZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgaG9sZFJlc3BvbnNlKGhvbGRSZXNwb25zZTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9ob2xkUmVzcG9uc2UgPSBob2xkUmVzcG9uc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBob2xkUmVzcG9uc2UgZmxhZy5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGhvbGRSZXNwb25zZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hvbGRSZXNwb25zZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWxlYXNlcyB0aGUgd2ViaG9vayByZXNwb25zZSB3aGVuIHR1bm5lbCBydW4gbG9naWMgaXMgY29tcGxldGUuXG4gICAgICogQHBhcmFtIGpvYiB7V2ViaG9va0pvYn0gICAgICBUaGUgd2ViaG9vayBqb2IgdGhhdCB0cmlnZ2VyZWQgdGhlIHdlYmhvb2sgbmVzdC5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSB7c3RyaW5nfSAgICAgIFRoZSBvcHRpb25hbCByZXNwb25zZSBtZXNzYWdlLCBpZiBub3QgdXNpbmcgYSBjdXN0b20gcmVxdWVzdCBoYW5kbGVyLlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogdmFyIHdlYmhvb2sgPSBhZi5jcmVhdGVXZWJob29rTmVzdChbXCJqb2JzXCIsIFwic3VibWl0XCJdLCBcInBvc3RcIik7XG4gICAgICogd2ViaG9vay5ob2xkUmVzcG9uc2UgPSB0cnVlOyAvLyBLZWVwcyB0aGUgcmVzcG9uc2UgZnJvbSBiZWluZyBzZW50IGltbWVkaWF0ZWx5XG4gICAgICogdmFyIHR1bm5lbCA9IGFmLmNyZWF0ZVR1bm5lbChcIkR3aWdodCdzIHRlc3QgdHVubmVsXCIpO1xuICAgICAqIHR1bm5lbC53YXRjaCh3ZWJob29rKTtcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uKGpvYiwgbmVzdCl7XG4gICAgICogICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICogICAgICAgICAgbmVzdC5yZWxlYXNlUmVzcG9uc2Uoam9iLCBcIldvcmtlZCFcIik7IC8vIFNlbmRzIHJlc3BvbnNlXG4gICAgICogICAgICB9LCAxNTAwKTsgLy8gQWZ0ZXIgMS41IHNlY29uZHNcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVsZWFzZVJlc3BvbnNlKGpvYjogV2ViaG9va0pvYiwgbWVzc2FnZT86IHN0cmluZykge1xuICAgICAgICBsZXQgd24gPSB0aGlzO1xuICAgICAgICBpZiAod24uaG9sZFJlc3BvbnNlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgd24uZS5sb2coMywgYE5lc3QgcmVzcG9uc2VzIG11c3QgYmUgaGVsZCB0byByZWxlYXNlIGEgcmVzcG9uc2UuYCwgd24pO1xuICAgICAgICB9IGVsc2UgaWYgKGpvYi5yZXNwb25zZVNlbnQgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHduLmUubG9nKDAsIGBOZXN0IHJlc3BvbnNlcyB3YXMgYWxyZWFkeSBzZW50LiBTa2lwcGluZy5gLCB3bik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3bi5lLnNlcnZlci5zZW5kSG9va1Jlc3BvbnNlKGZhbHNlLCBqb2IsIHduLCBqb2IuZ2V0UmVxdWVzdCgpLCBqb2IuZ2V0UmVzcG9uc2UoKSwgd24uZ2V0Q3VzdG9tSGFuZGxlUmVxdWVzdCgpLCBtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY3VzdG9tIGhhbmRsZVJlcXVlc3QgZnVuY3Rpb24uXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q3VzdG9tSGFuZGxlUmVxdWVzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlUmVxdWVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGN1c3RvbSBoYW5kbGVyUmVxdWVzdCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0gaGFuZGxlUmVxdWVzdFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzZXRDdXN0b21IYW5kbGVSZXF1ZXN0KGhhbmRsZVJlcXVlc3QpIHtcbiAgICAgICAgaWYgKGhhbmRsZVJlcXVlc3QgIT09IG51bGwgJiYgdHlwZW9mIGhhbmRsZVJlcXVlc3QgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhyb3coXCJDdXN0b20gaGFuZGxlUmVxdWVzdCBtdXN0IGJlIGEgZnVuY3Rpb24uXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGFuZGxlUmVxdWVzdCA9IGhhbmRsZVJlcXVlc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBwYXRoIGFzIGEgc3RyaW5nIG9yIGEgc3RyaW5nIGFycmF5LiBBbGwgcGFydHMgYXJlIFVSSSBlbmNvZGVkLlxuICAgICAqIENyZWF0ZSBkaXJlY3Rvcnkgc3RydWN0dXJlcyB3aXRoIGFuIGFycmF5OiBbXCJvbmVcIiwgXCJ0d29cIl0gcmVzdWx0cyBpbiBcIi9vbmUvdHdvXCIuXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UGF0aChwYXRoOiBhbnkpIHtcbiAgICAgICAgbGV0IHdoID0gdGhpcztcbiAgICAgICAgbGV0IG1vZGlmaWVkUGF0aCA9IFwiXCI7XG4gICAgICAgIGlmICh0eXBlb2YocGF0aCkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIG1vZGlmaWVkUGF0aCA9IGVuY29kZVVSSUNvbXBvbmVudChwYXRoKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXRoIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHBhdGguZm9yRWFjaChmdW5jdGlvbihwaSl7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWRQYXRoICs9IFwiL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KHBpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgYFBhdGggc2hvdWxkIGJlIGEgc3RyaW5nIG9yIGFycmF5LCAke3R5cGVvZihwYXRoKX0gZm91bmQuYDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW9kaWZpZWRQYXRoLmNoYXJBdCgwKSAhPT0gXCIvXCIpIHtcbiAgICAgICAgICAgIG1vZGlmaWVkUGF0aCA9IFwiL1wiICsgbW9kaWZpZWRQYXRoO1xuICAgICAgICB9XG4gICAgICAgIHdoLnBhdGggPSBtb2RpZmllZFBhdGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBwYXRoLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldFBhdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBIVFRQIG1ldGhvZC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRIdHRwTWV0aG9kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwTWV0aG9kO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgSFRUUCBtZXRob2QuXG4gICAgICogQHBhcmFtIGh0dHBNZXRob2RcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0SHR0cE1ldGhvZChodHRwTWV0aG9kKSB7XG4gICAgICAgIGxldCBsb3dlciA9IGh0dHBNZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgbGV0IGFjY2VwdGFibGVNZXRob2RzID0gWyBcImdldFwiLCBcInBvc3RcIiwgXCJwdXRcIiwgXCJoZWFkXCIsIFwiZGVsZXRlXCIsIFwib3B0aW9uc1wiLCBcInRyYWNlXCIsIFwiY29weVwiLCBcImxvY2tcIiwgXCJta2NvbFwiLCBcIm1vdmVcIiwgXCJwdXJnZVwiLCBcInByb3BmaW5kXCIsIFwicHJvcHBhdGNoXCIsIFwidW5sb2NrXCIsIFwicmVwb3J0XCIsIFwibWthY3Rpdml0eVwiLCBcImNoZWNrb3V0XCIsIFwibWVyZ2VcIiwgXCJtLXNlYXJjaFwiLCBcIm5vdGlmeVwiLCBcInN1YnNjcmliZVwiLCBcInVuc3Vic2NyaWJlXCIsIFwicGF0Y2hcIiwgXCJzZWFyY2hcIiwgXCJjb25uZWN0XCIsIFwiYWxsXCIgXTtcbiAgICAgICAgaWYgKGFjY2VwdGFibGVNZXRob2RzLmluZGV4T2YobG93ZXIpID09PSAtMSkge1xuICAgICAgICAgICAgdGhyb3cgYEhUVFAgbWV0aG9kIFwiJHtsb3dlcn1cIiBpcyBub3QgYW4gYWNjZXB0YWJsZSB2YWx1ZS4gJHtKU09OLnN0cmluZ2lmeShhY2NlcHRhYmxlTWV0aG9kcyl9YDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmh0dHBNZXRob2QgPSBsb3dlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG5hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPbiBsb2FkLCBkbyBub3RoaW5nLlxuICAgICAqL1xuICAgIHB1YmxpYyBsb2FkKCkge31cblxuICAgIC8qKlxuICAgICAqIEFkZCB3ZWJob29rIHRvIHNlcnZlciB3YXRjaCBsaXN0LlxuICAgICAqL1xuICAgIHB1YmxpYyB3YXRjaCgpIHtcbiAgICAgICAgbGV0IHdoID0gdGhpcztcbiAgICAgICAgd2guZS5hZGRXZWJob29rKHdoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGpvYlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKi9cbiAgICBwdWJsaWMgYXJyaXZlKGpvYjogV2ViaG9va0pvYikge1xuICAgICAgICBzdXBlci5hcnJpdmUoam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGludGVyZmFjZSBtYW5hZ2VyLiBVc2VkIHRvIG1hbmFnZSBpbnRlcmZhY2UgaW5zdGFuY2VzIGZvciBzZXNzaW9uIGhhbmRsaW5nLlxuICAgICAqIEByZXR1cm5zIHtJbnRlcmZhY2VNYW5hZ2VyfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRJbnRlcmZhY2VNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbTtcbiAgICB9XG5cbn0iXX0=
