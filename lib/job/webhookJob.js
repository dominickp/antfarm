"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var job_1 = require("./job");
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
    }
    /**
     * Get the HTTP response object.
     * @returns {ClientResponse}
     */
    WebhookJob.prototype.getResponse = function () {
        return this.response;
    };
    /**
     * Get the HTTP request object.
     * @returns {any}
     */
    WebhookJob.prototype.getRequest = function () {
        return this.request;
    };
    return WebhookJob;
}(job_1.Job));
exports.WebhookJob = WebhookJob;
