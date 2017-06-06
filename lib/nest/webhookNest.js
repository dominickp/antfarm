"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
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
        var _this = _super.call(this, e, path.toString()) || this;
        var wh = _this;
        wh.path = path;
        wh.httpMethod = httpMethod;
        if (handleRequest) {
            wh.customHandleRequest = handleRequest;
        }
        _this._im = new interfaceManager_1.InterfaceManager(_this.e, _this);
        _this._holdResponse = false;
        return _this;
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
            return this._name;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9uZXN0L3dlYmhvb2tOZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLCtCQUE4QjtBQUk5QiwyREFBd0Q7QUFFeEQsSUFBUSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRS9CO0lBQWlDLCtCQUFJO0lBU2pDOzs7Ozs7T0FNRztJQUNILHFCQUFZLENBQWMsRUFBRSxJQUFxQixFQUFFLFVBQWtCLEVBQUUsYUFBbUI7UUFBMUYsWUFDSSxrQkFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBVTVCO1FBVEcsSUFBSSxFQUFFLEdBQUcsS0FBSSxDQUFDO1FBQ2QsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDZixFQUFFLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUMzQixFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLEVBQUUsQ0FBQyxtQkFBbUIsR0FBRyxhQUFhLENBQUM7UUFDM0MsQ0FBQztRQUVELEtBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxtQ0FBZ0IsQ0FBQyxLQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUksQ0FBQyxDQUFDO1FBQzlDLEtBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDOztJQUMvQixDQUFDO0lBT0Qsc0JBQVcscUNBQVk7UUFJdkI7OztXQUdHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUM5QixDQUFDO1FBZkQ7Ozs7V0FJRzthQUNILFVBQXdCLFlBQXFCO1lBQ3pDLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1FBQ3RDLENBQUM7OztPQUFBO0lBVUQ7Ozs7Ozs7Ozs7Ozs7Ozs7T0FnQkc7SUFDSSxxQ0FBZSxHQUF0QixVQUF1QixHQUFlLEVBQUUsT0FBZ0I7UUFDcEQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsRUFBRSxDQUFDLENBQUMsRUFBRSxD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b25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcclxuaW1wb3J0IHsgTmVzdCB9IGZyb20gXCIuL25lc3RcIjtcclxuaW1wb3J0IHsgRmlsZUpvYiB9IGZyb20gXCIuLy4uL2pvYi9maWxlSm9iXCI7XHJcbmltcG9ydCB7V2ViaG9va0pvYn0gZnJvbSBcIi4uL2pvYi93ZWJob29rSm9iXCI7XHJcbmltcG9ydCB7V2ViaG9va0ludGVyZmFjZX0gZnJvbSBcIi4uL3VpL3dlYmhvb2tJbnRlcmZhY2VcIjtcclxuaW1wb3J0IHtJbnRlcmZhY2VNYW5hZ2VyfSBmcm9tIFwiLi4vdWkvaW50ZXJmYWNlTWFuYWdlclwiO1xyXG5cclxuY29uc3QgICBodHRwID0gcmVxdWlyZShcImh0dHBcIik7XHJcblxyXG5leHBvcnQgY2xhc3MgV2ViaG9va05lc3QgZXh0ZW5kcyBOZXN0IHtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX3BhdGg6IHN0cmluZztcclxuICAgIHByb3RlY3RlZCBfaHR0cE1ldGhvZDogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIF9oYW5kbGVSZXF1ZXN0OiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgX3VpOiBXZWJob29rSW50ZXJmYWNlO1xyXG4gICAgcHJvdGVjdGVkIF9pbTogSW50ZXJmYWNlTWFuYWdlcjtcclxuICAgIHByb3RlY3RlZCBfaG9sZFJlc3BvbnNlOiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2ViaG9vayBOZXN0IGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0gZVxyXG4gICAgICogQHBhcmFtIHBhdGhcclxuICAgICAqIEBwYXJhbSBodHRwTWV0aG9kXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlUmVxdWVzdCAgICAgQ3VzdG9tIHJlcXVlc3QgaGFuZGxlciBmdW5jdGlvbi5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHBhdGg6IHN0cmluZ3xzdHJpbmdbXSwgaHR0cE1ldGhvZDogc3RyaW5nLCBoYW5kbGVSZXF1ZXN0PzogYW55KSB7XHJcbiAgICAgICAgc3VwZXIoZSwgcGF0aC50b1N0cmluZygpKTtcclxuICAgICAgICBsZXQgd2ggPSB0aGlzO1xyXG4gICAgICAgIHdoLnBhdGggPSBwYXRoO1xyXG4gICAgICAgIHdoLmh0dHBNZXRob2QgPSBodHRwTWV0aG9kO1xyXG4gICAgICAgIGlmIChoYW5kbGVSZXF1ZXN0KSB7XHJcbiAgICAgICAgICAgIHdoLmN1c3RvbUhhbmRsZVJlcXVlc3QgPSBoYW5kbGVSZXF1ZXN0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5faW0gPSBuZXcgSW50ZXJmYWNlTWFuYWdlcih0aGlzLmUsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2hvbGRSZXNwb25zZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGhvbGQgcmVzcG9uc2UgZmxhZy4gVGhpcyBhbGxvd3MgeW91IHRvIHJ1biB0dW5uZWwgbG9naWMgYW5kIHNlbmQgdGhlIHJlc3BvbnNlIGFmdGVyIGNvbXBsZXRpb24uXHJcbiAgICAgKiBZb3UgbXVzdCBjYWxsIF9yZWxlYXNlUmVzcG9uc2VfIGxhdGVyIGlmIHlvdSB1c2UgdGhpcy5cclxuICAgICAqIEBwYXJhbSBob2xkUmVzcG9uc2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBob2xkUmVzcG9uc2UoaG9sZFJlc3BvbnNlOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5faG9sZFJlc3BvbnNlID0gaG9sZFJlc3BvbnNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBob2xkUmVzcG9uc2UgZmxhZy5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGhvbGRSZXNwb25zZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faG9sZFJlc3BvbnNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVsZWFzZXMgdGhlIHdlYmhvb2sgcmVzcG9uc2Ugd2hlbiB0dW5uZWwgcnVuIGxvZ2ljIGlzIGNvbXBsZXRlLlxyXG4gICAgICogQHBhcmFtIGpvYiB7V2ViaG9va0pvYn0gICAgICBUaGUgd2ViaG9vayBqb2IgdGhhdCB0cmlnZ2VyZWQgdGhlIHdlYmhvb2sgbmVzdC5cclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIHtzdHJpbmd9ICAgICAgVGhlIG9wdGlvbmFsIHJlc3BvbnNlIG1lc3NhZ2UsIGlmIG5vdCB1c2luZyBhIGN1c3RvbSByZXF1ZXN0IGhhbmRsZXIuXHJcbiAgICAgKiAjIyMjIEV4YW1wbGVcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiB2YXIgd2ViaG9vayA9IGFmLmNyZWF0ZVdlYmhvb2tOZXN0KFtcImpvYnNcIiwgXCJzdWJtaXRcIl0sIFwicG9zdFwiKTtcclxuICAgICAqIHdlYmhvb2suaG9sZFJlc3BvbnNlID0gdHJ1ZTsgLy8gS2VlcHMgdGhlIHJlc3BvbnNlIGZyb20gYmVpbmcgc2VudCBpbW1lZGlhdGVseVxyXG4gICAgICogdmFyIHR1bm5lbCA9IGFmLmNyZWF0ZVR1bm5lbChcIkR3aWdodCdzIHRlc3QgdHVubmVsXCIpO1xyXG4gICAgICogdHVubmVsLndhdGNoKHdlYmhvb2spO1xyXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbihqb2IsIG5lc3Qpe1xyXG4gICAgICogICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgKiAgICAgICAgICBuZXN0LnJlbGVhc2VSZXNwb25zZShqb2IsIFwiV29ya2VkIVwiKTsgLy8gU2VuZHMgcmVzcG9uc2VcclxuICAgICAqICAgICAgfSwgMTUwMCk7IC8vIEFmdGVyIDEuNSBzZWNvbmRzXHJcbiAgICAgKiB9KTtcclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVsZWFzZVJlc3BvbnNlKGpvYjogV2ViaG9va0pvYiwgbWVzc2FnZT86IHN0cmluZykge1xyXG4gICAgICAgIGxldCB3biA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHduLmhvbGRSZXNwb25zZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgd24uZS5sb2coMywgYE5lc3QgcmVzcG9uc2VzIG11c3QgYmUgaGVsZCB0byByZWxlYXNlIGEgcmVzcG9uc2UuYCwgd24pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoam9iLnJlc3BvbnNlU2VudCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB3bi5lLmxvZygwLCBgTmVzdCByZXNwb25zZXMgd2FzIGFscmVhZHkgc2VudC4gU2tpcHBpbmcuYCwgd24pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHduLmUuc2VydmVyLnNlbmRIb29rUmVzcG9uc2UoZmFsc2UsIGpvYiwgd24sIGpvYi5yZXF1ZXN0LCBqb2IucmVzcG9uc2UsIHduLmN1c3RvbUhhbmRsZVJlcXVlc3QsIG1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgY3VzdG9tIGhhbmRsZVJlcXVlc3QgZnVuY3Rpb24uXHJcbiAgICAgKiBAcmV0dXJucyB7YW55fVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGN1c3RvbUhhbmRsZVJlcXVlc3QoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZVJlcXVlc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIGN1c3RvbSBoYW5kbGVyUmVxdWVzdCBmdW5jdGlvbi5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVSZXF1ZXN0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgY3VzdG9tSGFuZGxlUmVxdWVzdChoYW5kbGVSZXF1ZXN0KSB7XHJcbiAgICAgICAgaWYgKGhhbmRsZVJlcXVlc3QgIT09IG51bGwgJiYgdHlwZW9mIGhhbmRsZVJlcXVlc3QgIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICB0aHJvdyhcIkN1c3RvbSBoYW5kbGVSZXF1ZXN0IG11c3QgYmUgYSBmdW5jdGlvbi5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hhbmRsZVJlcXVlc3QgPSBoYW5kbGVSZXF1ZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBfcGF0aCBhcyBhIHN0cmluZyBvciBhIHN0cmluZyBhcnJheS4gQWxsIHBhcnRzIGFyZSBVUkkgZW5jb2RlZC5cclxuICAgICAqIENyZWF0ZSBkaXJlY3Rvcnkgc3RydWN0dXJlcyB3aXRoIGFuIGFycmF5OiBbXCJvbmVcIiwgXCJ0d29cIl0gcmVzdWx0cyBpbiBcIi9vbmUvdHdvXCIuXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0IHBhdGgocGF0aDogYW55KSB7XHJcbiAgICAgICAgbGV0IHdoID0gdGhpcztcclxuICAgICAgICBsZXQgbW9kaWZpZWRQYXRoID0gXCJcIjtcclxuICAgICAgICBpZiAodHlwZW9mKHBhdGgpID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVkUGF0aCA9IGVuY29kZVVSSUNvbXBvbmVudChwYXRoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHBhdGggaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICBwYXRoLmZvckVhY2goZnVuY3Rpb24ocGkpe1xyXG4gICAgICAgICAgICAgICAgbW9kaWZpZWRQYXRoICs9IFwiL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KHBpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgYFBhdGggc2hvdWxkIGJlIGEgc3RyaW5nIG9yIGFycmF5LCAke3R5cGVvZihwYXRoKX0gZm91bmQuYDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vZGlmaWVkUGF0aC5jaGFyQXQoMCkgIT09IFwiL1wiKSB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVkUGF0aCA9IFwiL1wiICsgbW9kaWZpZWRQYXRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aC5fcGF0aCA9IG1vZGlmaWVkUGF0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgX3BhdGguXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHBhdGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIEhUVFAgbWV0aG9kLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBodHRwTWV0aG9kKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9odHRwTWV0aG9kO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBIVFRQIG1ldGhvZC5cclxuICAgICAqIEBwYXJhbSBodHRwTWV0aG9kXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgaHR0cE1ldGhvZChodHRwTWV0aG9kKSB7XHJcbiAgICAgICAgbGV0IGxvd2VyID0gaHR0cE1ldGhvZC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGxldCBhY2NlcHRhYmxlTWV0aG9kcyA9IFsgXCJnZXRcIiwgXCJwb3N0XCIsIFwicHV0XCIsIFwiaGVhZFwiLCBcImRlbGV0ZVwiLCBcIm9wdGlvbnNcIiwgXCJ0cmFjZVwiLCBcImNvcHlcIiwgXCJsb2NrXCIsIFwibWtjb2xcIiwgXCJtb3ZlXCIsIFwicHVyZ2VcIiwgXCJwcm9wZmluZFwiLCBcInByb3BwYXRjaFwiLCBcInVubG9ja1wiLCBcInJlcG9ydFwiLCBcIm1rYWN0aXZpdHlcIiwgXCJjaGVja291dFwiLCBcIm1lcmdlXCIsIFwibS1zZWFyY2hcIiwgXCJub3RpZnlcIiwgXCJzdWJzY3JpYmVcIiwgXCJ1bnN1YnNjcmliZVwiLCBcInBhdGNoXCIsIFwic2VhcmNoXCIsIFwiY29ubmVjdFwiLCBcImFsbFwiIF07XHJcbiAgICAgICAgaWYgKGFjY2VwdGFibGVNZXRob2RzLmluZGV4T2YobG93ZXIpID09PSAtMSkge1xyXG4gICAgICAgICAgICB0aHJvdyBgSFRUUCBtZXRob2QgXCIke2xvd2VyfVwiIGlzIG5vdCBhbiBhY2NlcHRhYmxlIHZhbHVlLiAke0pTT04uc3RyaW5naWZ5KGFjY2VwdGFibGVNZXRob2RzKX1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9odHRwTWV0aG9kID0gbG93ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIF9uYW1lLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBuYW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT24gbG9hZCwgZG8gbm90aGluZy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGxvYWQoKSB7fVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIHdlYmhvb2sgdG8gc2VydmVyIHdhdGNoIGxpc3QuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB3YXRjaCgpIHtcclxuICAgICAgICBsZXQgd2ggPSB0aGlzO1xyXG4gICAgICAgIHdoLmUuYWRkV2ViaG9vayh3aCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGpvYlxyXG4gICAgICogQHBhcmFtIGpvYlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXJyaXZlKGpvYjogV2ViaG9va0pvYikge1xyXG4gICAgICAgIHN1cGVyLmFycml2ZShqb2IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBpbnRlcmZhY2UgbWFuYWdlci4gVXNlZCB0byBtYW5hZ2UgaW50ZXJmYWNlIGluc3RhbmNlcyBmb3Igc2Vzc2lvbiBoYW5kbGluZy5cclxuICAgICAqIEByZXR1cm5zIHtJbnRlcmZhY2VNYW5hZ2VyfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGludGVyZmFjZU1hbmFnZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ltO1xyXG4gICAgfVxyXG5cclxufSJdfQ==
