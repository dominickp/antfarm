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
        var _this = _super.call(this, e, "Webhook Job") || this;
        _this._request = request;
        _this._response = response;
        _this._responseSent = false;
        return _this;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2Ivd2ViaG9va0pvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSw2QkFBMEI7QUFDMUIscUNBQWtDO0FBR2xDLElBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDbEIsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFDcEIsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFDcEIsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFDdEIsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUU5Qjs7R0FFRztBQUNIO0lBQWdDLDhCQUFHO0lBTS9COzs7OztPQUtHO0lBQ0gsb0JBQVksQ0FBYyxFQUFFLE9BQU8sRUFBRSxRQUFRO1FBQTdDLFlBQ0ksa0JBQU0sQ0FBQyxFQUFFLGFBQWEsQ0FBQyxTQUkxQjtRQUhHLEtBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLEtBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLEtBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDOztJQUMvQixDQUFDO0lBTUQsc0JBQVcsb0NBQVk7UUFJdkI7OztXQUdHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUM5QixDQUFDO1FBZEQ7OztXQUdHO2FBQ0gsVUFBd0IsSUFBYTtZQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUM5QixDQUFDOzs7T0FBQTtJQWNELHNCQUFXLGdDQUFRO1FBSm5COzs7V0FHRzthQUNIO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQzs7O09BQUE7SUFNRCxzQkFBVywrQkFBTztRQUpsQjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7OztPQUFBO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNJLHdDQUFtQixHQUExQixVQUEyQixTQUFpQjtRQUN4QyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSSx5Q0FBb0IsR0FBM0I7UUFDSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxxQ0FBZ0IsR0FBdkI7UUFDSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUM3QixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFFZCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ1IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFTLElBQUk7Z0JBQ3ZCLElBQUksR0FBRyxHQUFHLElBQUksaUJBQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdkMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksc0NBQWlCLEdBQXhCO1FBQ0ksSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFFM0IsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLHFDQUFnQixHQUF2QixVQUF3QixHQUFXO1FBQy9CLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXRDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0ksb0NBQWUsR0FBdEIsVUFBdUIsUUFBZ0M7UUFDbkQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztRQUNyQixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFFZCxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFTLEtBQUs7WUFDekIsSUFBSSxJQUFJLEtBQUssQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztRQUNILEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFO1lBQ1YsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOztPQUVHO0lBQ0ksa0NBQWEsR0FBcEI7UUFDSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksaUNBQVksR0FBbkIsVUFBb0IsR0FBVztRQUMzQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7SUFDTCxDQUFDO0lBRUwsaUJBQUM7QUFBRCxDQWpMQSxBQWlMQyxDQWpMK0IsU0FBRyxHQWlMbEM7QUFqTFksZ0NBQVUiLCJmaWxlIjoibGliL2pvYi93ZWJob29rSm9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XHJcbmltcG9ydCB7Sm9ifSBmcm9tIFwiLi9qb2JcIjtcclxuaW1wb3J0IHtGaWxlSm9ifSBmcm9tIFwiLi9maWxlSm9iXCI7XHJcbmltcG9ydCBleHByZXNzID0gcmVxdWlyZShcImV4cHJlc3NcIik7XHJcblxyXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxyXG4gICAgICAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIiksXHJcbiAgICAgICAgdXJsID0gcmVxdWlyZShcInVybFwiKSxcclxuICAgICAgICBwYXRoID0gcmVxdWlyZShcInBhdGhcIiksXHJcbiAgICAgICAgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XHJcblxyXG4vKipcclxuICogQSBqb2IgdGhhdCBpcyB0cmlnZ2VyZWQgd2hlbiBhIHdlYmhvb2sgcmVjZWl2ZXMgYSByZXF1ZXN0LlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFdlYmhvb2tKb2IgZXh0ZW5kcyBKb2Ige1xyXG5cclxuICAgIHByb3RlY3RlZCBfcmVxdWVzdDtcclxuICAgIHByb3RlY3RlZCBfcmVzcG9uc2U7XHJcbiAgICBwcm90ZWN0ZWQgX3Jlc3BvbnNlU2VudDogYm9vbGVhbjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdlYmhvb2tKb2IgY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSBlXHJcbiAgICAgKiBAcGFyYW0gcmVxdWVzdFxyXG4gICAgICogQHBhcmFtIHJlc3BvbnNlXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCByZXF1ZXN0LCByZXNwb25zZSkge1xyXG4gICAgICAgIHN1cGVyKGUsIFwiV2ViaG9vayBKb2JcIik7XHJcbiAgICAgICAgdGhpcy5fcmVxdWVzdCA9IHJlcXVlc3Q7XHJcbiAgICAgICAgdGhpcy5fcmVzcG9uc2UgPSByZXNwb25zZTtcclxuICAgICAgICB0aGlzLl9yZXNwb25zZVNlbnQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBpZiB0aGUgcmVzcG9uc2UgdG8gdGhlIHdlYmhvb2sgd2FzIGFscmVhZHkgc2VudCBvciBub3QuXHJcbiAgICAgKiBAcGFyYW0gc2VudFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0IHJlc3BvbnNlU2VudChzZW50OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fcmVzcG9uc2VTZW50ID0gc2VudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBpZiB0aGUgcmVzcG9uc2UgdG8gdGhlIHdlYmhvb2sgd2FzIGFscmVhZHkgc2VudCBvciBub3QuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCByZXNwb25zZVNlbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jlc3BvbnNlU2VudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgSFRUUCByZXNwb25zZSBvYmplY3QuXHJcbiAgICAgKiBAcmV0dXJucyB7Q2xpZW50UmVzcG9uc2V9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgcmVzcG9uc2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jlc3BvbnNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBIVFRQIHJlcXVlc3Qgb2JqZWN0LlxyXG4gICAgICogQHJldHVybnMge0NsaWVudFJlcXVlc3R9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgcmVxdWVzdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIHNwZWNpZmljIFVSTCBwYXJhbWV0ZXIuXHJcbiAgICAgKiAjIyMjIEV4YW1wbGVcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiAvLyBXZWJob29rIFVSTDogL2hvb2tzL215L2hvb2s/Y3VzdG9tZXJfaWQ9TXlDdXN0XHJcbiAgICAgKiB2YXIgY3VzdG9tZXJfaWQgPSB3ZWJob29rSm9iLmdldFVybFBhcmFtZXRlcihcImN1c3RvbWVyX2lkXCIpO1xyXG4gICAgICogLy8gY3VzdG9tZXJfaWQgPT4gTXlDdXN0XHJcbiAgICAgKiBgYGBcclxuICAgICAqIEBwYXJhbSBwYXJhbWV0ZXJcclxuICAgICAqIEByZXR1cm5zIHthbnl9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRRdWVyeVN0cmluZ1ZhbHVlKHBhcmFtZXRlcjogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IHdoID0gdGhpcztcclxuICAgICAgICBsZXQgdXJsX3BhcnRzID0gdXJsLnBhcnNlKHdoLnJlcXVlc3QudXJsLCB0cnVlKTtcclxuICAgICAgICByZXR1cm4gdXJsX3BhcnRzLnF1ZXJ5W3BhcmFtZXRlcl07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYWxsIFVSbCBwYXJhbWV0ZXJzLlxyXG4gICAgICogKiAjIyMjIEV4YW1wbGVcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiAvLyBXZWJob29rIFVSTDogL2hvb2tzL215L2hvb2s/Y3VzdG9tZXJfaWQ9TXlDdXN0JmZpbGVfbmFtZT1NeUZpbGUuemlwXHJcbiAgICAgKiB2YXIgcXVlcnkgPSB3ZWJob29rSm9iLmdldFVybFBhcmFtZXRlcnMoKTtcclxuICAgICAqIC8vIHF1ZXJ5ID0+IHtjdXN0b21lcl9pZDogXCJNeUN1c3RcIiwgZmlsZV9uYW1lOiBcIk15RmlsZS56aXBcIn1cclxuICAgICAqIGBgYFxyXG4gICAgICogQHJldHVybnMge2FueX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFF1ZXJ5U3RyaW5nVmFsdWVzKCkge1xyXG4gICAgICAgIGxldCB3aCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHVybF9wYXJ0cyA9IHVybC5wYXJzZSh3aC5yZXF1ZXN0LnVybCwgdHJ1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHVybF9wYXJ0cy5xdWVyeTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgRmlsZUpvYnMgbWFkZSBmcm9tIF9maWxlcyBzZW50IHZpYSBGb3JtRGF0YSB0byB0aGUgd2ViaG9vay5cclxuICAgICAqIEByZXR1cm5zIHtGaWxlSm9iW119XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRGb3JtRGF0YUZpbGVzKCkge1xyXG4gICAgICAgIGxldCB3aCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGZpbGVzID0gd2gucmVxdWVzdC5maWxlcztcclxuICAgICAgICBsZXQgam9icyA9IFtdO1xyXG5cclxuICAgICAgICBpZiAoZmlsZXMpIHtcclxuICAgICAgICAgICAgZmlsZXMuZm9yRWFjaChmdW5jdGlvbihmaWxlKXtcclxuICAgICAgICAgICAgICAgIGxldCBqb2IgPSBuZXcgRmlsZUpvYih3aC5lLCBmaWxlLnBhdGgpO1xyXG4gICAgICAgICAgICAgICAgam9iLnJlbmFtZShmaWxlLm9yaWdpbmFsbmFtZSk7XHJcbiAgICAgICAgICAgICAgICBqb2JzLnB1c2goam9iKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gam9icztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBhbGwgRm9ybURhdGEgdmFsdWVzLlxyXG4gICAgICogQHJldHVybnMge2FueX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEZvcm1EYXRhVmFsdWVzKCkge1xyXG4gICAgICAgIGxldCB3aCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGJvZHkgPSB3aC5yZXF1ZXN0LmJvZHk7XHJcblxyXG4gICAgICAgIHJldHVybiBib2R5O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGEgc2luZ2xlIEZvcm1EYXRhIHZhbHVlLlxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHJldHVybnMge2FueX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEZvcm1EYXRhVmFsdWUoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgd2ggPSB0aGlzO1xyXG4gICAgICAgIGxldCBmb3JtRGF0YSA9IHdoLmdldEZvcm1EYXRhVmFsdWVzKCk7XHJcblxyXG4gICAgICAgIGlmIChmb3JtRGF0YSAmJiBrZXkgaW4gZm9ybURhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1EYXRhW2tleV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBhIHN0cmluZyBmcm9tIHRoZSByZXF1ZXN0IGJvZHkuXHJcbiAgICAgKiBUaGUgZ2l2ZW4gY2FsbGJhY2sgaXMgZ2l2ZW4gYSBzdHJpbmcgcGFyYW1ldGVyLlxyXG4gICAgICogIyMjIyBFeGFtcGxlXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogd2ViaG9va0pvYi5nZXREYXRhQXNTdHJpbmcoZnVuY3Rpb24ocmVxdWVzdEJvZHkpe1xyXG4gICAgICogICAgIGNvbnNvbGUubG9nKHJlcXVlc3RCb2R5KTtcclxuICAgICAqIH0pO1xyXG4gICAgICogYGBgXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldERhdGFBc1N0cmluZyhjYWxsYmFjazogKGRhdGE6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICAgIGxldCB3aCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHJlcSA9IHdoLnJlcXVlc3Q7XHJcbiAgICAgICAgbGV0IGRhdGEgPSBcIlwiO1xyXG5cclxuICAgICAgICByZXEub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGNodW5rKSB7XHJcbiAgICAgICAgICAgIGRhdGEgKz0gY2h1bms7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVxLm9uKFwiZW5kXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgb2YgcGFyYW1ldGVycyBmcm9tIGJvdGggdGhlIHF1ZXJ5IHN0cmluZyBhbmQgZm9ybS1kYXRhLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0UGFyYW1ldGVycygpIHtcclxuICAgICAgICBsZXQgd2ggPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBfLm1lcmdlKHdoLmdldFF1ZXJ5U3RyaW5nVmFsdWVzKCksIHdoLmdldEZvcm1EYXRhVmFsdWVzKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHBhcmFtZXRlciBmcm9tIGJvdGggdGhlIHF1ZXJ5IHN0cmluZyBhbmQgZm9ybS1kYXRhLlxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHJldHVybnMge2FueX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFBhcmFtZXRlcihrZXk6IHN0cmluZykge1xyXG4gICAgICAgIGxldCB3aCA9IHRoaXM7XHJcbiAgICAgICAgaWYgKF8uaGFzKHdoLmdldFBhcmFtZXRlcnMoKSwga2V5KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gd2guZ2V0UGFyYW1ldGVycygpW2tleV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0iXX0=
