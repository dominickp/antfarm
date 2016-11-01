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
        wh.path = path;
        wh.httpMethod = httpMethod;
        if (handleRequest) {
            wh.customHandleRequest = handleRequest;
        }
        this._im = new interfaceManager_1.InterfaceManager(this.e, this);
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
            wn.e.server.sendHookResponse(false, job, wn, job.request, job.response, wn.customHandleRequest, message);
        }
    };
    Object.defineProperty(WebhookNest.prototype, "customHandleRequest", {
        /**
         * Get the custom handleRequest function.
         * @returns {any}
         */
        get: function () {
            return this._handleRequest;
        },
        /**
         * Set the custom handlerRequest function.
         * @param handleRequest
         */
        set: function (handleRequest) {
            if (handleRequest !== null && typeof handleRequest !== "function") {
                throw ("Custom handleRequest must be a function.");
            }
            this._handleRequest = handleRequest;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebhookNest.prototype, "path", {
        /**
         * Get the _path.
         * @returns {string}
         */
        get: function () {
            return this._path;
        },
        /**
         * Set the _path as a string or a string array. All parts are URI encoded.
         * Create directory structures with an array: ["one", "two"] results in "/one/two".
         * @param path
         */
        set: function (path) {
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
            wh._path = modifiedPath;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebhookNest.prototype, "httpMethod", {
        /**
         * Get the HTTP method.
         * @returns {string}
         */
        get: function () {
            return this._httpMethod;
        },
        /**
         * Set the HTTP method.
         * @param httpMethod
         */
        set: function (httpMethod) {
            var lower = httpMethod.toLowerCase();
            var acceptableMethods = ["get", "post", "put", "head", "delete", "options", "trace", "copy", "lock", "mkcol", "move", "purge", "propfind", "proppatch", "unlock", "report", "mkactivity", "checkout", "merge", "m-search", "notify", "subscribe", "unsubscribe", "patch", "search", "connect", "all"];
            if (acceptableMethods.indexOf(lower) === -1) {
                throw "HTTP method \"" + lower + "\" is not an acceptable value. " + JSON.stringify(acceptableMethods);
            }
            this._httpMethod = lower;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebhookNest.prototype, "name", {
        /**
         * Get the _name.
         * @returns {string}
         */
        get: function () {
            return this.name;
        },
        enumerable: true,
        configurable: true
    });
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
    Object.defineProperty(WebhookNest.prototype, "interfaceManager", {
        /**
         * Get the interface manager. Used to manage interface instances for session handling.
         * @returns {InterfaceManager}
         */
        get: function () {
            return this._im;
        },
        enumerable: true,
        configurable: true
    });
    return WebhookNest;
}(nest_1.Nest));
exports.WebhookNest = WebhookNest;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4vbmVzdFwiO1xuaW1wb3J0IHsgRmlsZUpvYiB9IGZyb20gXCIuLy4uL2pvYi9maWxlSm9iXCI7XG5pbXBvcnQge1dlYmhvb2tKb2J9IGZyb20gXCIuLi9qb2Ivd2ViaG9va0pvYlwiO1xuaW1wb3J0IHtXZWJob29rSW50ZXJmYWNlfSBmcm9tIFwiLi4vdWkvd2ViaG9va0ludGVyZmFjZVwiO1xuaW1wb3J0IHtJbnRlcmZhY2VNYW5hZ2VyfSBmcm9tIFwiLi4vdWkvaW50ZXJmYWNlTWFuYWdlclwiO1xuXG5jb25zdCAgIGh0dHAgPSByZXF1aXJlKFwiaHR0cFwiKTtcblxuZXhwb3J0IGNsYXNzIFdlYmhvb2tOZXN0IGV4dGVuZHMgTmVzdCB7XG5cbiAgICBwcm90ZWN0ZWQgX3BhdGg6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX2h0dHBNZXRob2Q6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX2hhbmRsZVJlcXVlc3Q6IGFueTtcbiAgICBwcm90ZWN0ZWQgX3VpOiBXZWJob29rSW50ZXJmYWNlO1xuICAgIHByb3RlY3RlZCBfaW06IEludGVyZmFjZU1hbmFnZXI7XG4gICAgcHJvdGVjdGVkIF9ob2xkUmVzcG9uc2U6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBXZWJob29rIE5lc3QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICogQHBhcmFtIGh0dHBNZXRob2RcbiAgICAgKiBAcGFyYW0gaGFuZGxlUmVxdWVzdCAgICAgQ3VzdG9tIHJlcXVlc3QgaGFuZGxlciBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aDogc3RyaW5nfHN0cmluZ1tdLCBodHRwTWV0aG9kOiBzdHJpbmcsIGhhbmRsZVJlcXVlc3Q/OiBhbnkpIHtcbiAgICAgICAgc3VwZXIoZSwgcGF0aC50b1N0cmluZygpKTtcbiAgICAgICAgbGV0IHdoID0gdGhpcztcbiAgICAgICAgd2gucGF0aCA9IHBhdGg7XG4gICAgICAgIHdoLmh0dHBNZXRob2QgPSBodHRwTWV0aG9kO1xuICAgICAgICBpZiAoaGFuZGxlUmVxdWVzdCkge1xuICAgICAgICAgICAgd2guY3VzdG9tSGFuZGxlUmVxdWVzdCA9IGhhbmRsZVJlcXVlc3Q7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pbSA9IG5ldyBJbnRlcmZhY2VNYW5hZ2VyKHRoaXMuZSwgdGhpcyk7XG4gICAgICAgIHRoaXMuX2hvbGRSZXNwb25zZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBob2xkIHJlc3BvbnNlIGZsYWcuIFRoaXMgYWxsb3dzIHlvdSB0byBydW4gdHVubmVsIGxvZ2ljIGFuZCBzZW5kIHRoZSByZXNwb25zZSBhZnRlciBjb21wbGV0aW9uLlxuICAgICAqIFlvdSBtdXN0IGNhbGwgX3JlbGVhc2VSZXNwb25zZV8gbGF0ZXIgaWYgeW91IHVzZSB0aGlzLlxuICAgICAqIEBwYXJhbSBob2xkUmVzcG9uc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGhvbGRSZXNwb25zZShob2xkUmVzcG9uc2U6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5faG9sZFJlc3BvbnNlID0gaG9sZFJlc3BvbnNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgaG9sZFJlc3BvbnNlIGZsYWcuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGdldCBob2xkUmVzcG9uc2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ob2xkUmVzcG9uc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVsZWFzZXMgdGhlIHdlYmhvb2sgcmVzcG9uc2Ugd2hlbiB0dW5uZWwgcnVuIGxvZ2ljIGlzIGNvbXBsZXRlLlxuICAgICAqIEBwYXJhbSBqb2Ige1dlYmhvb2tKb2J9ICAgICAgVGhlIHdlYmhvb2sgam9iIHRoYXQgdHJpZ2dlcmVkIHRoZSB3ZWJob29rIG5lc3QuXG4gICAgICogQHBhcmFtIG1lc3NhZ2Uge3N0cmluZ30gICAgICBUaGUgb3B0aW9uYWwgcmVzcG9uc2UgbWVzc2FnZSwgaWYgbm90IHVzaW5nIGEgY3VzdG9tIHJlcXVlc3QgaGFuZGxlci5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIHZhciB3ZWJob29rID0gYWYuY3JlYXRlV2ViaG9va05lc3QoW1wiam9ic1wiLCBcInN1Ym1pdFwiXSwgXCJwb3N0XCIpO1xuICAgICAqIHdlYmhvb2suaG9sZFJlc3BvbnNlID0gdHJ1ZTsgLy8gS2VlcHMgdGhlIHJlc3BvbnNlIGZyb20gYmVpbmcgc2VudCBpbW1lZGlhdGVseVxuICAgICAqIHZhciB0dW5uZWwgPSBhZi5jcmVhdGVUdW5uZWwoXCJEd2lnaHQncyB0ZXN0IHR1bm5lbFwiKTtcbiAgICAgKiB0dW5uZWwud2F0Y2god2ViaG9vayk7XG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbihqb2IsIG5lc3Qpe1xuICAgICAqICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAqICAgICAgICAgIG5lc3QucmVsZWFzZVJlc3BvbnNlKGpvYiwgXCJXb3JrZWQhXCIpOyAvLyBTZW5kcyByZXNwb25zZVxuICAgICAqICAgICAgfSwgMTUwMCk7IC8vIEFmdGVyIDEuNSBzZWNvbmRzXG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIHJlbGVhc2VSZXNwb25zZShqb2I6IFdlYmhvb2tKb2IsIG1lc3NhZ2U/OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHduID0gdGhpcztcbiAgICAgICAgaWYgKHduLmhvbGRSZXNwb25zZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHduLmUubG9nKDMsIGBOZXN0IHJlc3BvbnNlcyBtdXN0IGJlIGhlbGQgdG8gcmVsZWFzZSBhIHJlc3BvbnNlLmAsIHduKTtcbiAgICAgICAgfSBlbHNlIGlmIChqb2IucmVzcG9uc2VTZW50ID09PSB0cnVlKSB7XG4gICAgICAgICAgICB3bi5lLmxvZygwLCBgTmVzdCByZXNwb25zZXMgd2FzIGFscmVhZHkgc2VudC4gU2tpcHBpbmcuYCwgd24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd24uZS5zZXJ2ZXIuc2VuZEhvb2tSZXNwb25zZShmYWxzZSwgam9iLCB3biwgam9iLnJlcXVlc3QsIGpvYi5yZXNwb25zZSwgd24uY3VzdG9tSGFuZGxlUmVxdWVzdCwgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1c3RvbSBoYW5kbGVSZXF1ZXN0IGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIGdldCBjdXN0b21IYW5kbGVSZXF1ZXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxlUmVxdWVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGN1c3RvbSBoYW5kbGVyUmVxdWVzdCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0gaGFuZGxlUmVxdWVzdFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgY3VzdG9tSGFuZGxlUmVxdWVzdChoYW5kbGVSZXF1ZXN0KSB7XG4gICAgICAgIGlmIChoYW5kbGVSZXF1ZXN0ICE9PSBudWxsICYmIHR5cGVvZiBoYW5kbGVSZXF1ZXN0ICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93KFwiQ3VzdG9tIGhhbmRsZVJlcXVlc3QgbXVzdCBiZSBhIGZ1bmN0aW9uLlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9oYW5kbGVSZXF1ZXN0ID0gaGFuZGxlUmVxdWVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIF9wYXRoIGFzIGEgc3RyaW5nIG9yIGEgc3RyaW5nIGFycmF5LiBBbGwgcGFydHMgYXJlIFVSSSBlbmNvZGVkLlxuICAgICAqIENyZWF0ZSBkaXJlY3Rvcnkgc3RydWN0dXJlcyB3aXRoIGFuIGFycmF5OiBbXCJvbmVcIiwgXCJ0d29cIl0gcmVzdWx0cyBpbiBcIi9vbmUvdHdvXCIuXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHBhdGgocGF0aDogYW55KSB7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIGxldCBtb2RpZmllZFBhdGggPSBcIlwiO1xuICAgICAgICBpZiAodHlwZW9mKHBhdGgpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBtb2RpZmllZFBhdGggPSBlbmNvZGVVUklDb21wb25lbnQocGF0aCk7XG4gICAgICAgIH0gZWxzZSBpZiAocGF0aCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBwYXRoLmZvckVhY2goZnVuY3Rpb24ocGkpe1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkUGF0aCArPSBcIi9cIiArIGVuY29kZVVSSUNvbXBvbmVudChwaSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGBQYXRoIHNob3VsZCBiZSBhIHN0cmluZyBvciBhcnJheSwgJHt0eXBlb2YocGF0aCl9IGZvdW5kLmA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vZGlmaWVkUGF0aC5jaGFyQXQoMCkgIT09IFwiL1wiKSB7XG4gICAgICAgICAgICBtb2RpZmllZFBhdGggPSBcIi9cIiArIG1vZGlmaWVkUGF0aDtcbiAgICAgICAgfVxuICAgICAgICB3aC5fcGF0aCA9IG1vZGlmaWVkUGF0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIF9wYXRoLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBwYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGF0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIEhUVFAgbWV0aG9kLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBodHRwTWV0aG9kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faHR0cE1ldGhvZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIEhUVFAgbWV0aG9kLlxuICAgICAqIEBwYXJhbSBodHRwTWV0aG9kXG4gICAgICovXG4gICAgcHVibGljIHNldCBodHRwTWV0aG9kKGh0dHBNZXRob2QpIHtcbiAgICAgICAgbGV0IGxvd2VyID0gaHR0cE1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBsZXQgYWNjZXB0YWJsZU1ldGhvZHMgPSBbIFwiZ2V0XCIsIFwicG9zdFwiLCBcInB1dFwiLCBcImhlYWRcIiwgXCJkZWxldGVcIiwgXCJvcHRpb25zXCIsIFwidHJhY2VcIiwgXCJjb3B5XCIsIFwibG9ja1wiLCBcIm1rY29sXCIsIFwibW92ZVwiLCBcInB1cmdlXCIsIFwicHJvcGZpbmRcIiwgXCJwcm9wcGF0Y2hcIiwgXCJ1bmxvY2tcIiwgXCJyZXBvcnRcIiwgXCJta2FjdGl2aXR5XCIsIFwiY2hlY2tvdXRcIiwgXCJtZXJnZVwiLCBcIm0tc2VhcmNoXCIsIFwibm90aWZ5XCIsIFwic3Vic2NyaWJlXCIsIFwidW5zdWJzY3JpYmVcIiwgXCJwYXRjaFwiLCBcInNlYXJjaFwiLCBcImNvbm5lY3RcIiwgXCJhbGxcIiBdO1xuICAgICAgICBpZiAoYWNjZXB0YWJsZU1ldGhvZHMuaW5kZXhPZihsb3dlcikgPT09IC0xKSB7XG4gICAgICAgICAgICB0aHJvdyBgSFRUUCBtZXRob2QgXCIke2xvd2VyfVwiIGlzIG5vdCBhbiBhY2NlcHRhYmxlIHZhbHVlLiAke0pTT04uc3RyaW5naWZ5KGFjY2VwdGFibGVNZXRob2RzKX1gO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2h0dHBNZXRob2QgPSBsb3dlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIF9uYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9uIGxvYWQsIGRvIG5vdGhpbmcuXG4gICAgICovXG4gICAgcHVibGljIGxvYWQoKSB7fVxuXG4gICAgLyoqXG4gICAgICogQWRkIHdlYmhvb2sgdG8gc2VydmVyIHdhdGNoIGxpc3QuXG4gICAgICovXG4gICAgcHVibGljIHdhdGNoKCkge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICB3aC5lLmFkZFdlYmhvb2sod2gpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgam9iXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqL1xuICAgIHB1YmxpYyBhcnJpdmUoam9iOiBXZWJob29rSm9iKSB7XG4gICAgICAgIHN1cGVyLmFycml2ZShqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgaW50ZXJmYWNlIG1hbmFnZXIuIFVzZWQgdG8gbWFuYWdlIGludGVyZmFjZSBpbnN0YW5jZXMgZm9yIHNlc3Npb24gaGFuZGxpbmcuXG4gICAgICogQHJldHVybnMge0ludGVyZmFjZU1hbmFnZXJ9XG4gICAgICovXG4gICAgcHVibGljIGdldCBpbnRlcmZhY2VNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW07XG4gICAgfVxuXG59Il19
