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
        var files = wh.request._files;
        var jobs = [];
        if (files) {
            files.forEach(function (file) {
                var job = new fileJob_1.FileJob(wh.e, file._path);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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aUIsRUFBRSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxpQ0FBWSxHQUFuQixVQUFvQixHQUFXO1FBQzNCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7SUFFTCxpQkFBQztBQUFELENBakxBLEFBaUxDLENBakwrQixTQUFHLEdBaUxsQztBQWpMWSxrQkFBVSxhQWlMdEIsQ0FBQSIsImZpbGUiOiJsaWIvam9iL3dlYmhvb2tKb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7Sm9ifSBmcm9tIFwiLi9qb2JcIjtcbmltcG9ydCB7RmlsZUpvYn0gZnJvbSBcIi4vZmlsZUpvYlwiO1xuaW1wb3J0IGV4cHJlc3MgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTtcblxuY29uc3QgICBmcyA9IHJlcXVpcmUoXCJmc1wiKSxcbiAgICAgICAgdG1wID0gcmVxdWlyZShcInRtcFwiKSxcbiAgICAgICAgdXJsID0gcmVxdWlyZShcInVybFwiKSxcbiAgICAgICAgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuLyoqXG4gKiBBIGpvYiB0aGF0IGlzIHRyaWdnZXJlZCB3aGVuIGEgd2ViaG9vayByZWNlaXZlcyBhIHJlcXVlc3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBXZWJob29rSm9iIGV4dGVuZHMgSm9iIHtcblxuICAgIHByb3RlY3RlZCBfcmVxdWVzdDtcbiAgICBwcm90ZWN0ZWQgX3Jlc3BvbnNlO1xuICAgIHByb3RlY3RlZCBfcmVzcG9uc2VTZW50OiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogV2ViaG9va0pvYiBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIHJlcXVlc3RcbiAgICAgKiBAcGFyYW0gcmVzcG9uc2VcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgICAgICAgc3VwZXIoZSwgXCJXZWJob29rIEpvYlwiKTtcbiAgICAgICAgdGhpcy5fcmVxdWVzdCA9IHJlcXVlc3Q7XG4gICAgICAgIHRoaXMuX3Jlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgICAgIHRoaXMuX3Jlc3BvbnNlU2VudCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBpZiB0aGUgcmVzcG9uc2UgdG8gdGhlIHdlYmhvb2sgd2FzIGFscmVhZHkgc2VudCBvciBub3QuXG4gICAgICogQHBhcmFtIHNlbnRcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHJlc3BvbnNlU2VudChzZW50OiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3Jlc3BvbnNlU2VudCA9IHNlbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGlmIHRoZSByZXNwb25zZSB0byB0aGUgd2ViaG9vayB3YXMgYWxyZWFkeSBzZW50IG9yIG5vdC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHJlc3BvbnNlU2VudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jlc3BvbnNlU2VudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIEhUVFAgcmVzcG9uc2Ugb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHtDbGllbnRSZXNwb25zZX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHJlc3BvbnNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVzcG9uc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBIVFRQIHJlcXVlc3Qgb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHtDbGllbnRSZXF1ZXN0fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcmVxdWVzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgc3BlY2lmaWMgVVJMIHBhcmFtZXRlci5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIC8vIFdlYmhvb2sgVVJMOiAvaG9va3MvbXkvaG9vaz9jdXN0b21lcl9pZD1NeUN1c3RcbiAgICAgKiB2YXIgY3VzdG9tZXJfaWQgPSB3ZWJob29rSm9iLmdldFVybFBhcmFtZXRlcihcImN1c3RvbWVyX2lkXCIpO1xuICAgICAqIC8vIGN1c3RvbWVyX2lkID0+IE15Q3VzdFxuICAgICAqIGBgYFxuICAgICAqIEBwYXJhbSBwYXJhbWV0ZXJcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRRdWVyeVN0cmluZ1ZhbHVlKHBhcmFtZXRlcjogc3RyaW5nKSB7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIGxldCB1cmxfcGFydHMgPSB1cmwucGFyc2Uod2gucmVxdWVzdC51cmwsIHRydWUpO1xuICAgICAgICByZXR1cm4gdXJsX3BhcnRzLnF1ZXJ5W3BhcmFtZXRlcl07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGFsbCBVUmwgcGFyYW1ldGVycy5cbiAgICAgKiAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogLy8gV2ViaG9vayBVUkw6IC9ob29rcy9teS9ob29rP2N1c3RvbWVyX2lkPU15Q3VzdCZmaWxlX25hbWU9TXlGaWxlLnppcFxuICAgICAqIHZhciBxdWVyeSA9IHdlYmhvb2tKb2IuZ2V0VXJsUGFyYW1ldGVycygpO1xuICAgICAqIC8vIHF1ZXJ5ID0+IHtjdXN0b21lcl9pZDogXCJNeUN1c3RcIiwgZmlsZV9uYW1lOiBcIk15RmlsZS56aXBcIn1cbiAgICAgKiBgYGBcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRRdWVyeVN0cmluZ1ZhbHVlcygpIHtcbiAgICAgICAgbGV0IHdoID0gdGhpcztcbiAgICAgICAgbGV0IHVybF9wYXJ0cyA9IHVybC5wYXJzZSh3aC5yZXF1ZXN0LnVybCwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB1cmxfcGFydHMucXVlcnk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBGaWxlSm9icyBtYWRlIGZyb20gX2ZpbGVzIHNlbnQgdmlhIEZvcm1EYXRhIHRvIHRoZSB3ZWJob29rLlxuICAgICAqIEByZXR1cm5zIHtGaWxlSm9iW119XG4gICAgICovXG4gICAgcHVibGljIGdldEZvcm1EYXRhRmlsZXMoKSB7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIGxldCBmaWxlcyA9IHdoLnJlcXVlc3QuX2ZpbGVzO1xuICAgICAgICBsZXQgam9icyA9IFtdO1xuXG4gICAgICAgIGlmIChmaWxlcykge1xuICAgICAgICAgICAgZmlsZXMuZm9yRWFjaChmdW5jdGlvbihmaWxlKXtcbiAgICAgICAgICAgICAgICBsZXQgam9iID0gbmV3IEZpbGVKb2Iod2guZSwgZmlsZS5fcGF0aCk7XG4gICAgICAgICAgICAgICAgam9iLnJlbmFtZShmaWxlLm9yaWdpbmFsbmFtZSk7XG4gICAgICAgICAgICAgICAgam9icy5wdXNoKGpvYik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBqb2JzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgRm9ybURhdGEgdmFsdWVzLlxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIGdldEZvcm1EYXRhVmFsdWVzKCkge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICBsZXQgYm9keSA9IHdoLnJlcXVlc3QuYm9keTtcblxuICAgICAgICByZXR1cm4gYm9keTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBzaW5nbGUgRm9ybURhdGEgdmFsdWUuXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIGdldEZvcm1EYXRhVmFsdWUoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHdoID0gdGhpcztcbiAgICAgICAgbGV0IGZvcm1EYXRhID0gd2guZ2V0Rm9ybURhdGFWYWx1ZXMoKTtcblxuICAgICAgICBpZiAoZm9ybURhdGEgJiYga2V5IGluIGZvcm1EYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gZm9ybURhdGFba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIHN0cmluZyBmcm9tIHRoZSByZXF1ZXN0IGJvZHkuXG4gICAgICogVGhlIGdpdmVuIGNhbGxiYWNrIGlzIGdpdmVuIGEgc3RyaW5nIHBhcmFtZXRlci5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIHdlYmhvb2tKb2IuZ2V0RGF0YUFzU3RyaW5nKGZ1bmN0aW9uKHJlcXVlc3RCb2R5KXtcbiAgICAgKiAgICAgY29uc29sZS5sb2cocmVxdWVzdEJvZHkpO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXREYXRhQXNTdHJpbmcoY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICBsZXQgcmVxID0gd2gucmVxdWVzdDtcbiAgICAgICAgbGV0IGRhdGEgPSBcIlwiO1xuXG4gICAgICAgIHJlcS5vbihcImRhdGFcIiwgZnVuY3Rpb24oY2h1bmspIHtcbiAgICAgICAgICAgIGRhdGEgKz0gY2h1bms7XG4gICAgICAgIH0pO1xuICAgICAgICByZXEub24oXCJlbmRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBvZiBwYXJhbWV0ZXJzIGZyb20gYm90aCB0aGUgcXVlcnkgc3RyaW5nIGFuZCBmb3JtLWRhdGEuXG4gICAgICovXG4gICAgcHVibGljIGdldFBhcmFtZXRlcnMoKSB7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIHJldHVybiBfLm1lcmdlKHdoLmdldFF1ZXJ5U3RyaW5nVmFsdWVzKCksIHdoLmdldEZvcm1EYXRhVmFsdWVzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBwYXJhbWV0ZXIgZnJvbSBib3RoIHRoZSBxdWVyeSBzdHJpbmcgYW5kIGZvcm0tZGF0YS5cbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UGFyYW1ldGVyKGtleTogc3RyaW5nKSB7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIGlmIChfLmhhcyh3aC5nZXRQYXJhbWV0ZXJzKCksIGtleSkpIHtcbiAgICAgICAgICAgIHJldHVybiB3aC5nZXRQYXJhbWV0ZXJzKClba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxufSJdfQ==
