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
        this.request = request;
        this.response = response;
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
    /**
     * Get the HTTP response object.
     * @returns {ClientResponse}
     */
    WebhookJob.prototype.getResponse = function () {
        return this.response;
    };
    /**
     * Get the HTTP request object.
     * @returns {ClientRequest}
     */
    WebhookJob.prototype.getRequest = function () {
        return this.request;
    };
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
        var url_parts = url.parse(wh.getRequest().url, true);
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
        var url_parts = url.parse(wh.getRequest().url, true);
        return url_parts.query;
    };
    /**
     * Returns FileJobs made from files sent via FormData to the webhook.
     * @returns {FileJob[]}
     */
    WebhookJob.prototype.getFormDataFiles = function () {
        var wh = this;
        var files = wh.getRequest().files;
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
        var body = wh.getRequest().body;
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
        var req = wh.getRequest();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2Ivd2ViaG9va0pvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxvQkFBa0IsT0FBTyxDQUFDLENBQUE7QUFDMUIsd0JBQXNCLFdBQVcsQ0FBQyxDQUFBO0FBR2xDLElBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDbEIsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFDcEIsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFDcEIsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFDdEIsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUU5Qjs7R0FFRztBQUNIO0lBQWdDLDhCQUFHO0lBTS9COzs7OztPQUtHO0lBQ0gsb0JBQVksQ0FBYyxFQUFFLE9BQU8sRUFBRSxRQUFRO1FBQ3pDLGtCQUFNLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUMvQixDQUFDO0lBTUQsc0JBQVcsb0NBQVk7UUFJdkI7OztXQUdHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUM5QixDQUFDO1FBZEQ7OztXQUdHO2FBQ0gsVUFBd0IsSUFBYTtZQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUM5QixDQUFDOzs7T0FBQTtJQVVEOzs7T0FHRztJQUNJLGdDQUFXLEdBQWxCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLCtCQUFVLEdBQWpCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSSx3Q0FB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QixFQUFFLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLGlDQUFZLEdBQW5CLFVBQW9CLEdBQVc7UUFDM0IsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO0lBQ0wsQ0FBQztJQUVMLGlCQUFDO0FBQUQsQ0FqTEEsQUFpTEMsQ0FqTCtCLFNBQUcsR0FpTGxDO0FBakxZLGtCQUFVLGFBaUx0QixDQUFBIiwiZmlsZSI6ImxpYi9qb2Ivd2ViaG9va0pvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtKb2J9IGZyb20gXCIuL2pvYlwiO1xuaW1wb3J0IHtGaWxlSm9ifSBmcm9tIFwiLi9maWxlSm9iXCI7XG5pbXBvcnQgZXhwcmVzcyA9IHJlcXVpcmUoXCJleHByZXNzXCIpO1xuXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxuICAgICAgICB0bXAgPSByZXF1aXJlKFwidG1wXCIpLFxuICAgICAgICB1cmwgPSByZXF1aXJlKFwidXJsXCIpLFxuICAgICAgICBwYXRoID0gcmVxdWlyZShcInBhdGhcIiksXG4gICAgICAgIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xuXG4vKipcbiAqIEEgam9iIHRoYXQgaXMgdHJpZ2dlcmVkIHdoZW4gYSB3ZWJob29rIHJlY2VpdmVzIGEgcmVxdWVzdC5cbiAqL1xuZXhwb3J0IGNsYXNzIFdlYmhvb2tKb2IgZXh0ZW5kcyBKb2Ige1xuXG4gICAgcHJvdGVjdGVkIHJlcXVlc3Q7XG4gICAgcHJvdGVjdGVkIHJlc3BvbnNlO1xuICAgIHByb3RlY3RlZCBfcmVzcG9uc2VTZW50OiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogV2ViaG9va0pvYiBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIHJlcXVlc3RcbiAgICAgKiBAcGFyYW0gcmVzcG9uc2VcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgICAgICAgc3VwZXIoZSwgXCJXZWJob29rIEpvYlwiKTtcbiAgICAgICAgdGhpcy5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgICAgICAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgICB0aGlzLl9yZXNwb25zZVNlbnQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgaWYgdGhlIHJlc3BvbnNlIHRvIHRoZSB3ZWJob29rIHdhcyBhbHJlYWR5IHNlbnQgb3Igbm90LlxuICAgICAqIEBwYXJhbSBzZW50XG4gICAgICovXG4gICAgcHVibGljIHNldCByZXNwb25zZVNlbnQoc2VudDogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9yZXNwb25zZVNlbnQgPSBzZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBpZiB0aGUgcmVzcG9uc2UgdG8gdGhlIHdlYmhvb2sgd2FzIGFscmVhZHkgc2VudCBvciBub3QuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGdldCByZXNwb25zZVNlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZXNwb25zZVNlbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBIVFRQIHJlc3BvbnNlIG9iamVjdC5cbiAgICAgKiBAcmV0dXJucyB7Q2xpZW50UmVzcG9uc2V9XG4gICAgICovXG4gICAgcHVibGljIGdldFJlc3BvbnNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXNwb25zZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIEhUVFAgcmVxdWVzdCBvYmplY3QuXG4gICAgICogQHJldHVybnMge0NsaWVudFJlcXVlc3R9XG4gICAgICovXG4gICAgcHVibGljIGdldFJlcXVlc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgc3BlY2lmaWMgVVJMIHBhcmFtZXRlci5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIC8vIFdlYmhvb2sgVVJMOiAvaG9va3MvbXkvaG9vaz9jdXN0b21lcl9pZD1NeUN1c3RcbiAgICAgKiB2YXIgY3VzdG9tZXJfaWQgPSB3ZWJob29rSm9iLmdldFVybFBhcmFtZXRlcihcImN1c3RvbWVyX2lkXCIpO1xuICAgICAqIC8vIGN1c3RvbWVyX2lkID0+IE15Q3VzdFxuICAgICAqIGBgYFxuICAgICAqIEBwYXJhbSBwYXJhbWV0ZXJcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRRdWVyeVN0cmluZ1ZhbHVlKHBhcmFtZXRlcjogc3RyaW5nKSB7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIGxldCB1cmxfcGFydHMgPSB1cmwucGFyc2Uod2guZ2V0UmVxdWVzdCgpLnVybCwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB1cmxfcGFydHMucXVlcnlbcGFyYW1ldGVyXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYWxsIFVSbCBwYXJhbWV0ZXJzLlxuICAgICAqICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiAvLyBXZWJob29rIFVSTDogL2hvb2tzL215L2hvb2s/Y3VzdG9tZXJfaWQ9TXlDdXN0JmZpbGVfbmFtZT1NeUZpbGUuemlwXG4gICAgICogdmFyIHF1ZXJ5ID0gd2ViaG9va0pvYi5nZXRVcmxQYXJhbWV0ZXJzKCk7XG4gICAgICogLy8gcXVlcnkgPT4ge2N1c3RvbWVyX2lkOiBcIk15Q3VzdFwiLCBmaWxlX25hbWU6IFwiTXlGaWxlLnppcFwifVxuICAgICAqIGBgYFxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIGdldFF1ZXJ5U3RyaW5nVmFsdWVzKCkge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICBsZXQgdXJsX3BhcnRzID0gdXJsLnBhcnNlKHdoLmdldFJlcXVlc3QoKS51cmwsIHRydWUpO1xuICAgICAgICByZXR1cm4gdXJsX3BhcnRzLnF1ZXJ5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgRmlsZUpvYnMgbWFkZSBmcm9tIGZpbGVzIHNlbnQgdmlhIEZvcm1EYXRhIHRvIHRoZSB3ZWJob29rLlxuICAgICAqIEByZXR1cm5zIHtGaWxlSm9iW119XG4gICAgICovXG4gICAgcHVibGljIGdldEZvcm1EYXRhRmlsZXMoKSB7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIGxldCBmaWxlcyA9IHdoLmdldFJlcXVlc3QoKS5maWxlcztcbiAgICAgICAgbGV0IGpvYnMgPSBbXTtcblxuICAgICAgICBpZiAoZmlsZXMpIHtcbiAgICAgICAgICAgIGZpbGVzLmZvckVhY2goZnVuY3Rpb24oZmlsZSl7XG4gICAgICAgICAgICAgICAgbGV0IGpvYiA9IG5ldyBGaWxlSm9iKHdoLmUsIGZpbGUucGF0aCk7XG4gICAgICAgICAgICAgICAgam9iLnJlbmFtZShmaWxlLm9yaWdpbmFsbmFtZSk7XG4gICAgICAgICAgICAgICAgam9icy5wdXNoKGpvYik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBqb2JzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgRm9ybURhdGEgdmFsdWVzLlxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIGdldEZvcm1EYXRhVmFsdWVzKCkge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICBsZXQgYm9keSA9IHdoLmdldFJlcXVlc3QoKS5ib2R5O1xuXG4gICAgICAgIHJldHVybiBib2R5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIHNpbmdsZSBGb3JtRGF0YSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Rm9ybURhdGFWYWx1ZShrZXk6IHN0cmluZykge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICBsZXQgZm9ybURhdGEgPSB3aC5nZXRGb3JtRGF0YVZhbHVlcygpO1xuXG4gICAgICAgIGlmIChmb3JtRGF0YSAmJiBrZXkgaW4gZm9ybURhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBmb3JtRGF0YVtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGEgc3RyaW5nIGZyb20gdGhlIHJlcXVlc3QgYm9keS5cbiAgICAgKiBUaGUgZ2l2ZW4gY2FsbGJhY2sgaXMgZ2l2ZW4gYSBzdHJpbmcgcGFyYW1ldGVyLlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogd2ViaG9va0pvYi5nZXREYXRhQXNTdHJpbmcoZnVuY3Rpb24ocmVxdWVzdEJvZHkpe1xuICAgICAqICAgICBjb25zb2xlLmxvZyhyZXF1ZXN0Qm9keSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIGdldERhdGFBc1N0cmluZyhjYWxsYmFjazogYW55KSB7XG4gICAgICAgIGxldCB3aCA9IHRoaXM7XG4gICAgICAgIGxldCByZXEgPSB3aC5nZXRSZXF1ZXN0KCk7XG4gICAgICAgIGxldCBkYXRhID0gXCJcIjtcblxuICAgICAgICByZXEub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGNodW5rKSB7XG4gICAgICAgICAgICBkYXRhICs9IGNodW5rO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVxLm9uKFwiZW5kXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgb2YgcGFyYW1ldGVycyBmcm9tIGJvdGggdGhlIHF1ZXJ5IHN0cmluZyBhbmQgZm9ybS1kYXRhLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQYXJhbWV0ZXJzKCkge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICByZXR1cm4gXy5tZXJnZSh3aC5nZXRRdWVyeVN0cmluZ1ZhbHVlcygpLCB3aC5nZXRGb3JtRGF0YVZhbHVlcygpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgcGFyYW1ldGVyIGZyb20gYm90aCB0aGUgcXVlcnkgc3RyaW5nIGFuZCBmb3JtLWRhdGEuXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIGdldFBhcmFtZXRlcihrZXk6IHN0cmluZykge1xuICAgICAgICBsZXQgd2ggPSB0aGlzO1xuICAgICAgICBpZiAoXy5oYXMod2guZ2V0UGFyYW1ldGVycygpLCBrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gd2guZ2V0UGFyYW1ldGVycygpW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbn0iXX0=
