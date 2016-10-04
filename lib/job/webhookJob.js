"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var job_1 = require("./job");
var fileJob_1 = require("./fileJob");
var fs = require("fs"), tmp = require("tmp"), url = require("url"), multer = require("multer"), path = require("path");
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
    WebhookJob.prototype.getUrlParameter = function (parameter) {
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
    WebhookJob.prototype.getUrlParameters = function () {
        var wh = this;
        var url_parts = url.parse(wh.getRequest().url, true);
        return url_parts.query;
    };
    /**
     * Gets a FileJob from the request body with a temporary file name.
     * The callback will be given the job as its parameter.
     * #### Example
     * ```js
     *  webhookJob.getDataAsFileJob(function(fileJob){
     *      fileJob.rename("myfile.zip");
     *      fileJob.move(af.createFolderNest("/var/out/webhook"));
     *  });
     * ```
     * @returns {any}
     */
    WebhookJob.prototype.getDataAsFileJob = function (callback) {
        var wh = this;
        var req = wh.getRequest();
        var res = wh.getResponse();
        var data = [];
        console.log("ctype", req.headers);
        req.on("data", function (chunk) {
            data.push(chunk);
        });
        req.on("end", function () {
            var buffer = Buffer.concat(data);
            var filePath = tmp.tmpNameSync();
            fs.writeFileSync(filePath, buffer);
            var fileJob = new fileJob_1.FileJob(wh.e, filePath);
            callback(fileJob);
        });
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
    return WebhookJob;
}(job_1.Job));
exports.WebhookJob = WebhookJob;
