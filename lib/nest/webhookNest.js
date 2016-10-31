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
     * Set the _path as a string or a string array. All parts are URI encoded.
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
     * Get the _path.
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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ZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4vbmVzdFwiO1xuaW1wb3J0IHsgRmlsZUpvYiB9IGZyb20gXCIuLy4uL2pvYi9maWxlSm9iXCI7XG5pbXBvcnQge1dlYmhvb2tKb2J9IGZyb20gXCIuLi9qb2Ivd2ViaG9va0pvYlwiO1xuaW1wb3J0IHtXZWJob29rSW50ZXJmYWNlfSBmcm9tIFwiLi4vdWkvd2ViaG9va0ludGVyZmFjZVwiO1xuaW1wb3J0IHtJbnRlcmZhY2VNYW5hZ2VyfSBmcm9tIFwiLi4vdWkvaW50ZXJmYWNlTWFuYWdlclwiO1xuXG5jb25zdCAgIGh0dHAgPSByZXF1aXJlKFwiaHR0cFwiKTtcblxuZXhwb3J0IGNsYXNzIFdlYmhvb2tOZXN0IGV4dGVuZHMgTmVzdCB7XG5cbiAgICBwcm90ZWN0ZWQgcGF0aDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBodHRwTWV0aG9kOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGhhbmRsZVJlcXVlc3Q6IGFueTtcbiAgICBwcm90ZWN0ZWQgdWk6IFdlYmhvb2tJbnRlcmZhY2U7XG4gICAgcHJvdGVjdGVkIGltOiBJbnRlcmZhY2VNYW5hZ2VyO1xuICAgIHByb3RlY3RlZCBfaG9sZFJlc3BvbnNlOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogV2ViaG9vayBOZXN0IGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIGVcbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqIEBwYXJhbSBodHRwTWV0aG9kXG4gICAgICogQHBhcmFtIGhhbmRsZVJlcXVlc3QgICAgIEN1c3RvbSByZXF1ZXN0IGhhbmRsZXIgZnVuY3Rpb24uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHBhdGg6IHN0cmluZ3xzdHJpbmdbXSwgaHR0cE1ldGhvZDogc3RyaW5nLCBoYW5kbGVSZXF1ZXN0PzogYW55KSB7XG4gICAgICAgIHN1cGVyKGUsIHBhdGgudG9TdHJpbmcoKSk7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIHdoLnNldFBhdGgocGF0aCk7XG4gICAgICAgIHdoLnNldEh0dHBNZXRob2QoaHR0cE1ldGhvZCk7XG4gICAgICAgIGlmIChoYW5kbGVSZXF1ZXN0KSB7XG4gICAgICAgICAgICB3aC5zZXRDdXN0b21IYW5kbGVSZXF1ZXN0KGhhbmRsZVJlcXVlc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbSA9IG5ldyBJbnRlcmZhY2VNYW5hZ2VyKHRoaXMuZSwgdGhpcyk7XG4gICAgICAgIHRoaXMuX2hvbGRSZXNwb25zZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBob2xkIHJlc3BvbnNlIGZsYWcuIFRoaXMgYWxsb3dzIHlvdSB0byBydW4gdHVubmVsIGxvZ2ljIGFuZCBzZW5kIHRoZSByZXNwb25zZSBhZnRlciBjb21wbGV0aW9uLlxuICAgICAqIFlvdSBtdXN0IGNhbGwgX3JlbGVhc2VSZXNwb25zZV8gbGF0ZXIgaWYgeW91IHVzZSB0aGlzLlxuICAgICAqIEBwYXJhbSBob2xkUmVzcG9uc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGhvbGRSZXNwb25zZShob2xkUmVzcG9uc2U6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5faG9sZFJlc3BvbnNlID0gaG9sZFJlc3BvbnNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgaG9sZFJlc3BvbnNlIGZsYWcuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGdldCBob2xkUmVzcG9uc2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ob2xkUmVzcG9uc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVsZWFzZXMgdGhlIHdlYmhvb2sgcmVzcG9uc2Ugd2hlbiB0dW5uZWwgcnVuIGxvZ2ljIGlzIGNvbXBsZXRlLlxuICAgICAqIEBwYXJhbSBqb2Ige1dlYmhvb2tKb2J9ICAgICAgVGhlIHdlYmhvb2sgam9iIHRoYXQgdHJpZ2dlcmVkIHRoZSB3ZWJob29rIG5lc3QuXG4gICAgICogQHBhcmFtIG1lc3NhZ2Uge3N0cmluZ30gICAgICBUaGUgb3B0aW9uYWwgcmVzcG9uc2UgbWVzc2FnZSwgaWYgbm90IHVzaW5nIGEgY3VzdG9tIHJlcXVlc3QgaGFuZGxlci5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIHZhciB3ZWJob29rID0gYWYuY3JlYXRlV2ViaG9va05lc3QoW1wiam9ic1wiLCBcInN1Ym1pdFwiXSwgXCJwb3N0XCIpO1xuICAgICAqIHdlYmhvb2suaG9sZFJlc3BvbnNlID0gdHJ1ZTsgLy8gS2VlcHMgdGhlIHJlc3BvbnNlIGZyb20gYmVpbmcgc2VudCBpbW1lZGlhdGVseVxuICAgICAqIHZhciB0dW5uZWwgPSBhZi5jcmVhdGVUdW5uZWwoXCJEd2lnaHQncyB0ZXN0IHR1bm5lbFwiKTtcbiAgICAgKiB0dW5uZWwud2F0Y2god2ViaG9vayk7XG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbihqb2IsIG5lc3Qpe1xuICAgICAqICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAqICAgICAgICAgIG5lc3QucmVsZWFzZVJlc3BvbnNlKGpvYiwgXCJXb3JrZWQhXCIpOyAvLyBTZW5kcyByZXNwb25zZVxuICAgICAqICAgICAgfSwgMTUwMCk7IC8vIEFmdGVyIDEuNSBzZWNvbmRzXG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIHJlbGVhc2VSZXNwb25zZShqb2I6IFdlYmhvb2tKb2IsIG1lc3NhZ2U/OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHduID0gdGhpcztcbiAgICAgICAgaWYgKHduLmhvbGRSZXNwb25zZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHduLmUubG9nKDMsIGBOZXN0IHJlc3BvbnNlcyBtdXN0IGJlIGhlbGQgdG8gcmVsZWFzZSBhIHJlc3BvbnNlLmAsIHduKTtcbiAgICAgICAgfSBlbHNlIGlmIChqb2IucmVzcG9uc2VTZW50ID09PSB0cnVlKSB7XG4gICAgICAgICAgICB3bi5lLmxvZygwLCBgTmVzdCByZXNwb25zZXMgd2FzIGFscmVhZHkgc2VudC4gU2tpcHBpbmcuYCwgd24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd24uZS5zZXJ2ZXIuc2VuZEhvb2tSZXNwb25zZShmYWxzZSwgam9iLCB3biwgam9iLmdldFJlcXVlc3QoKSwgam9iLmdldFJlc3BvbnNlKCksIHduLmdldEN1c3RvbUhhbmRsZVJlcXVlc3QoKSwgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1c3RvbSBoYW5kbGVSZXF1ZXN0IGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIGdldEN1c3RvbUhhbmRsZVJlcXVlc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVJlcXVlc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBjdXN0b20gaGFuZGxlclJlcXVlc3QgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIGhhbmRsZVJlcXVlc3RcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0Q3VzdG9tSGFuZGxlUmVxdWVzdChoYW5kbGVSZXF1ZXN0KSB7XG4gICAgICAgIGlmIChoYW5kbGVSZXF1ZXN0ICE9PSBudWxsICYmIHR5cGVvZiBoYW5kbGVSZXF1ZXN0ICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93KFwiQ3VzdG9tIGhhbmRsZVJlcXVlc3QgbXVzdCBiZSBhIGZ1bmN0aW9uLlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhhbmRsZVJlcXVlc3QgPSBoYW5kbGVSZXF1ZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgX3BhdGggYXMgYSBzdHJpbmcgb3IgYSBzdHJpbmcgYXJyYXkuIEFsbCBwYXJ0cyBhcmUgVVJJIGVuY29kZWQuXG4gICAgICogQ3JlYXRlIGRpcmVjdG9yeSBzdHJ1Y3R1cmVzIHdpdGggYW4gYXJyYXk6IFtcIm9uZVwiLCBcInR3b1wiXSByZXN1bHRzIGluIFwiL29uZS90d29cIi5cbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRQYXRoKHBhdGg6IGFueSkge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICBsZXQgbW9kaWZpZWRQYXRoID0gXCJcIjtcbiAgICAgICAgaWYgKHR5cGVvZihwYXRoKSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgbW9kaWZpZWRQYXRoID0gZW5jb2RlVVJJQ29tcG9uZW50KHBhdGgpO1xuICAgICAgICB9IGVsc2UgaWYgKHBhdGggaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgcGF0aC5mb3JFYWNoKGZ1bmN0aW9uKHBpKXtcbiAgICAgICAgICAgICAgICBtb2RpZmllZFBhdGggKz0gXCIvXCIgKyBlbmNvZGVVUklDb21wb25lbnQocGkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBgUGF0aCBzaG91bGQgYmUgYSBzdHJpbmcgb3IgYXJyYXksICR7dHlwZW9mKHBhdGgpfSBmb3VuZC5gO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb2RpZmllZFBhdGguY2hhckF0KDApICE9PSBcIi9cIikge1xuICAgICAgICAgICAgbW9kaWZpZWRQYXRoID0gXCIvXCIgKyBtb2RpZmllZFBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgd2gucGF0aCA9IG1vZGlmaWVkUGF0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIF9wYXRoLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldFBhdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBIVFRQIG1ldGhvZC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRIdHRwTWV0aG9kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwTWV0aG9kO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgSFRUUCBtZXRob2QuXG4gICAgICogQHBhcmFtIGh0dHBNZXRob2RcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0SHR0cE1ldGhvZChodHRwTWV0aG9kKSB7XG4gICAgICAgIGxldCBsb3dlciA9IGh0dHBNZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgbGV0IGFjY2VwdGFibGVNZXRob2RzID0gWyBcImdldFwiLCBcInBvc3RcIiwgXCJwdXRcIiwgXCJoZWFkXCIsIFwiZGVsZXRlXCIsIFwib3B0aW9uc1wiLCBcInRyYWNlXCIsIFwiY29weVwiLCBcImxvY2tcIiwgXCJta2NvbFwiLCBcIm1vdmVcIiwgXCJwdXJnZVwiLCBcInByb3BmaW5kXCIsIFwicHJvcHBhdGNoXCIsIFwidW5sb2NrXCIsIFwicmVwb3J0XCIsIFwibWthY3Rpdml0eVwiLCBcImNoZWNrb3V0XCIsIFwibWVyZ2VcIiwgXCJtLXNlYXJjaFwiLCBcIm5vdGlmeVwiLCBcInN1YnNjcmliZVwiLCBcInVuc3Vic2NyaWJlXCIsIFwicGF0Y2hcIiwgXCJzZWFyY2hcIiwgXCJjb25uZWN0XCIsIFwiYWxsXCIgXTtcbiAgICAgICAgaWYgKGFjY2VwdGFibGVNZXRob2RzLmluZGV4T2YobG93ZXIpID09PSAtMSkge1xuICAgICAgICAgICAgdGhyb3cgYEhUVFAgbWV0aG9kIFwiJHtsb3dlcn1cIiBpcyBub3QgYW4gYWNjZXB0YWJsZSB2YWx1ZS4gJHtKU09OLnN0cmluZ2lmeShhY2NlcHRhYmxlTWV0aG9kcyl9YDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmh0dHBNZXRob2QgPSBsb3dlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIF9uYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9uIGxvYWQsIGRvIG5vdGhpbmcuXG4gICAgICovXG4gICAgcHVibGljIGxvYWQoKSB7fVxuXG4gICAgLyoqXG4gICAgICogQWRkIHdlYmhvb2sgdG8gc2VydmVyIHdhdGNoIGxpc3QuXG4gICAgICovXG4gICAgcHVibGljIHdhdGNoKCkge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICB3aC5lLmFkZFdlYmhvb2sod2gpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgam9iXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqL1xuICAgIHB1YmxpYyBhcnJpdmUoam9iOiBXZWJob29rSm9iKSB7XG4gICAgICAgIHN1cGVyLmFycml2ZShqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgaW50ZXJmYWNlIG1hbmFnZXIuIFVzZWQgdG8gbWFuYWdlIGludGVyZmFjZSBpbnN0YW5jZXMgZm9yIHNlc3Npb24gaGFuZGxpbmcuXG4gICAgICogQHJldHVybnMge0ludGVyZmFjZU1hbmFnZXJ9XG4gICAgICovXG4gICAgcHVibGljIGdldEludGVyZmFjZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmltO1xuICAgIH1cblxufSJdfQ==
