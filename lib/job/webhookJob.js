"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var job_1 = require("./job");
var fileJob_1 = require("./fileJob");
var fs = require("fs"), tmp = require("tmp"), url = require("url"), path = require("path"), _ = require("lodash");
/**
 * A job that is triggered when a webhook receives a request.
 */
var WebhookJob = (function (_super) {
    __extends(WebhookJob, _super);
    /**
     * WebhookJob constructor
     * @param e
     * @param request
     * @param response
     */
    function WebhookJob(e, request, response) {
        _super.call(this, e, "Webhook Job");
        this._request = request;
        this._response = response;
        this._responseSent = false;
    }
    Object.defineProperty(WebhookJob.prototype, "responseSent", {
        /**
         * Get if the response to the webhook was already sent or not.
         * @returns {boolean}
         */
        get: function () {
            return this._responseSent;
        },
        /**
         * Set if the response to the webhook was already sent or not.
         * @param sent
         */
        set: function (sent) {
            this._responseSent = sent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebhookJob.prototype, "response", {
        /**
         * Get the HTTP response object.
         * @returns {ClientResponse}
         */
        get: function () {
            return this._response;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebhookJob.prototype, "request", {
        /**
         * Get the HTTP request object.
         * @returns {ClientRequest}
         */
        get: function () {
            return this._request;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Return a specific URL parameter.
     * #### Example
     * ```js
     * // Webhook URL: /hooks/my/hook?customer_id=MyCust
     * var customer_id = webhookJob.getUrlParameter("customer_id");
     * // customer_id => MyCust
     * ```
     * @param parameter
     * @returns {any}
     */
    WebhookJob.prototype.getQueryStringValue = function (parameter) {
        var wh = this;
        var url_parts = url.parse(wh.request.url, true);
        return url_parts.query[parameter];
    };
    /**
     * Return all URl parameters.
     * * #### Example
     * ```js
     * // Webhook URL: /hooks/my/hook?customer_id=MyCust&file_name=MyFile.zip
     * var query = webhookJob.getUrlParameters();
     * // query => {customer_id: "MyCust", file_name: "MyFile.zip"}
     * ```
     * @returns {any}
     */
    WebhookJob.prototype.getQueryStringValues = function () {
        var wh = this;
        var url_parts = url.parse(wh.request.url, true);
        return url_parts.query;
    };
    /**
     * Returns FileJobs made from _files sent via FormData to the webhook.
     * @returns {FileJob[]}
     */
    WebhookJob.prototype.getFormDataFiles = function () {
        var wh = this;
        var files = wh.request.files;
        var jobs = [];
        if (files) {
            files.forEach(function (file) {
                var job = new fileJob_1.FileJob(wh.e, file.path);
                job.rename(file.originalname);
                jobs.push(job);
            });
        }
        return jobs;
    };
    /**
     * Get all FormData values.
     * @returns {any}
     */
    WebhookJob.prototype.getFormDataValues = function () {
        var wh = this;
        var body = wh.request.body;
        return body;
    };
    /**
     * Get a single FormData value.
     * @param key
     * @returns {any}
     */
    WebhookJob.prototype.getFormDataValue = function (key) {
        var wh = this;
        var formData = wh.getFormDataValues();
        if (formData && key in formData) {
            return formData[key];
        }
        else {
            return false;
        }
    };
    /**
     * Get a string from the request body.
     * The given callback is given a string parameter.
     * #### Example
     * ```js
     * webhookJob.getDataAsString(function(requestBody){
     *     console.log(requestBody);
     * });
     * ```
     * @param callback
     */
    WebhookJob.prototype.getDataAsString = function (callback) {
        var wh = this;
        var req = wh.request;
        var data = "";
        req.on("data", function (chunk) {
            data += chunk;
        });
        req.on("end", function () {
            callback(data);
        });
    };
    /**
     * Returns an array of parameters from both the query string and form-data.
     */
    WebhookJob.prototype.getParameters = function () {
        var wh = this;
        return _.merge(wh.getQueryStringValues(), wh.getFormDataValues());
    };
    /**
     * Returns a parameter from both the query string and form-data.
     * @param key
     * @returns {any}
     */
    WebhookJob.prototype.getParameter = function (key) {
        var wh = this;
        if (_.has(wh.getParameters(), key)) {
            return wh.getParameters()[key];
        }
        else {
            return false;
        }
    };
    return WebhookJob;
}(job_1.Job));
exports.WebhookJob = WebhookJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QWlCLEVBQUUsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksaUNBQVksR0FBbkIsVUFBb0IsR0FBVztRQUMzQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7SUFDTCxDQUFDO0lBRUwsaUJBQUM7QUFBRCxDQWpMQSxBQWlMQyxDQWpMK0IsU0FBRyxHQWlMbEM7QUFqTFksa0JBQVUsYUFpTHRCLENBQUEiLCJmaWxlIjoibGliL2pvYi93ZWJob29rSm9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0pvYn0gZnJvbSBcIi4vam9iXCI7XG5pbXBvcnQge0ZpbGVKb2J9IGZyb20gXCIuL2ZpbGVKb2JcIjtcbmltcG9ydCBleHByZXNzID0gcmVxdWlyZShcImV4cHJlc3NcIik7XG5cbmNvbnN0ICAgZnMgPSByZXF1aXJlKFwiZnNcIiksXG4gICAgICAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIiksXG4gICAgICAgIHVybCA9IHJlcXVpcmUoXCJ1cmxcIiksXG4gICAgICAgIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKSxcbiAgICAgICAgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbi8qKlxuICogQSBqb2IgdGhhdCBpcyB0cmlnZ2VyZWQgd2hlbiBhIHdlYmhvb2sgcmVjZWl2ZXMgYSByZXF1ZXN0LlxuICovXG5leHBvcnQgY2xhc3MgV2ViaG9va0pvYiBleHRlbmRzIEpvYiB7XG5cbiAgICBwcm90ZWN0ZWQgX3JlcXVlc3Q7XG4gICAgcHJvdGVjdGVkIF9yZXNwb25zZTtcbiAgICBwcm90ZWN0ZWQgX3Jlc3BvbnNlU2VudDogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIFdlYmhvb2tKb2IgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSByZXF1ZXN0XG4gICAgICogQHBhcmFtIHJlc3BvbnNlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gICAgICAgIHN1cGVyKGUsIFwiV2ViaG9vayBKb2JcIik7XG4gICAgICAgIHRoaXMuX3JlcXVlc3QgPSByZXF1ZXN0O1xuICAgICAgICB0aGlzLl9yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgICB0aGlzLl9yZXNwb25zZVNlbnQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgaWYgdGhlIHJlc3BvbnNlIHRvIHRoZSB3ZWJob29rIHdhcyBhbHJlYWR5IHNlbnQgb3Igbm90LlxuICAgICAqIEBwYXJhbSBzZW50XG4gICAgICovXG4gICAgcHVibGljIHNldCByZXNwb25zZVNlbnQoc2VudDogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9yZXNwb25zZVNlbnQgPSBzZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBpZiB0aGUgcmVzcG9uc2UgdG8gdGhlIHdlYmhvb2sgd2FzIGFscmVhZHkgc2VudCBvciBub3QuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGdldCByZXNwb25zZVNlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZXNwb25zZVNlbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBIVFRQIHJlc3BvbnNlIG9iamVjdC5cbiAgICAgKiBAcmV0dXJucyB7Q2xpZW50UmVzcG9uc2V9XG4gICAgICovXG4gICAgcHVibGljIGdldCByZXNwb25zZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jlc3BvbnNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgSFRUUCByZXF1ZXN0IG9iamVjdC5cbiAgICAgKiBAcmV0dXJucyB7Q2xpZW50UmVxdWVzdH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHJlcXVlc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIHNwZWNpZmljIFVSTCBwYXJhbWV0ZXIuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiAvLyBXZWJob29rIFVSTDogL2hvb2tzL215L2hvb2s/Y3VzdG9tZXJfaWQ9TXlDdXN0XG4gICAgICogdmFyIGN1c3RvbWVyX2lkID0gd2ViaG9va0pvYi5nZXRVcmxQYXJhbWV0ZXIoXCJjdXN0b21lcl9pZFwiKTtcbiAgICAgKiAvLyBjdXN0b21lcl9pZCA9PiBNeUN1c3RcbiAgICAgKiBgYGBcbiAgICAgKiBAcGFyYW0gcGFyYW1ldGVyXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UXVlcnlTdHJpbmdWYWx1ZShwYXJhbWV0ZXI6IHN0cmluZykge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICBsZXQgdXJsX3BhcnRzID0gdXJsLnBhcnNlKHdoLnJlcXVlc3QudXJsLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIHVybF9wYXJ0cy5xdWVyeVtwYXJhbWV0ZXJdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhbGwgVVJsIHBhcmFtZXRlcnMuXG4gICAgICogKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIC8vIFdlYmhvb2sgVVJMOiAvaG9va3MvbXkvaG9vaz9jdXN0b21lcl9pZD1NeUN1c3QmZmlsZV9uYW1lPU15RmlsZS56aXBcbiAgICAgKiB2YXIgcXVlcnkgPSB3ZWJob29rSm9iLmdldFVybFBhcmFtZXRlcnMoKTtcbiAgICAgKiAvLyBxdWVyeSA9PiB7Y3VzdG9tZXJfaWQ6IFwiTXlDdXN0XCIsIGZpbGVfbmFtZTogXCJNeUZpbGUuemlwXCJ9XG4gICAgICogYGBgXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UXVlcnlTdHJpbmdWYWx1ZXMoKSB7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIGxldCB1cmxfcGFydHMgPSB1cmwucGFyc2Uod2gucmVxdWVzdC51cmwsIHRydWUpO1xuICAgICAgICByZXR1cm4gdXJsX3BhcnRzLnF1ZXJ5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgRmlsZUpvYnMgbWFkZSBmcm9tIF9maWxlcyBzZW50IHZpYSBGb3JtRGF0YSB0byB0aGUgd2ViaG9vay5cbiAgICAgKiBAcmV0dXJucyB7RmlsZUpvYltdfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRGb3JtRGF0YUZpbGVzKCkge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICBsZXQgZmlsZXMgPSB3aC5yZXF1ZXN0LmZpbGVzO1xuICAgICAgICBsZXQgam9icyA9IFtdO1xuXG4gICAgICAgIGlmIChmaWxlcykge1xuICAgICAgICAgICAgZmlsZXMuZm9yRWFjaChmdW5jdGlvbihmaWxlKXtcbiAgICAgICAgICAgICAgICBsZXQgam9iID0gbmV3IEZpbGVKb2Iod2guZSwgZmlsZS5wYXRoKTtcbiAgICAgICAgICAgICAgICBqb2IucmVuYW1lKGZpbGUub3JpZ2luYWxuYW1lKTtcbiAgICAgICAgICAgICAgICBqb2JzLnB1c2goam9iKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpvYnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBGb3JtRGF0YSB2YWx1ZXMuXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Rm9ybURhdGFWYWx1ZXMoKSB7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIGxldCBib2R5ID0gd2gucmVxdWVzdC5ib2R5O1xuXG4gICAgICAgIHJldHVybiBib2R5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIHNpbmdsZSBGb3JtRGF0YSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Rm9ybURhdGFWYWx1ZShrZXk6IHN0cmluZykge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICBsZXQgZm9ybURhdGEgPSB3aC5nZXRGb3JtRGF0YVZhbHVlcygpO1xuXG4gICAgICAgIGlmIChmb3JtRGF0YSAmJiBrZXkgaW4gZm9ybURhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBmb3JtRGF0YVtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGEgc3RyaW5nIGZyb20gdGhlIHJlcXVlc3QgYm9keS5cbiAgICAgKiBUaGUgZ2l2ZW4gY2FsbGJhY2sgaXMgZ2l2ZW4gYSBzdHJpbmcgcGFyYW1ldGVyLlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogd2ViaG9va0pvYi5nZXREYXRhQXNTdHJpbmcoZnVuY3Rpb24ocmVxdWVzdEJvZHkpe1xuICAgICAqICAgICBjb25zb2xlLmxvZyhyZXF1ZXN0Qm9keSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIGdldERhdGFBc1N0cmluZyhjYWxsYmFjazogKGRhdGE6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICBsZXQgcmVxID0gd2gucmVxdWVzdDtcbiAgICAgICAgbGV0IGRhdGEgPSBcIlwiO1xuXG4gICAgICAgIHJlcS5vbihcImRhdGFcIiwgZnVuY3Rpb24oY2h1bmspIHtcbiAgICAgICAgICAgIGRhdGEgKz0gY2h1bms7XG4gICAgICAgIH0pO1xuICAgICAgICByZXEub24oXCJlbmRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBvZiBwYXJhbWV0ZXJzIGZyb20gYm90aCB0aGUgcXVlcnkgc3RyaW5nIGFuZCBmb3JtLWRhdGEuXG4gICAgICovXG4gICAgcHVibGljIGdldFBhcmFtZXRlcnMoKSB7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIHJldHVybiBfLm1lcmdlKHdoLmdldFF1ZXJ5U3RyaW5nVmFsdWVzKCksIHdoLmdldEZvcm1EYXRhVmFsdWVzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBwYXJhbWV0ZXIgZnJvbSBib3RoIHRoZSBxdWVyeSBzdHJpbmcgYW5kIGZvcm0tZGF0YS5cbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UGFyYW1ldGVyKGtleTogc3RyaW5nKSB7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIGlmIChfLmhhcyh3aC5nZXRQYXJhbWV0ZXJzKCksIGtleSkpIHtcbiAgICAgICAgICAgIHJldHVybiB3aC5nZXRQYXJhbWV0ZXJzKClba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxufSJdfQ==
