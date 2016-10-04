import {Environment} from "../environment/environment";
import {Job} from "./job";
import {ServerRequest} from "http";
import {ServerResponse} from "http";
import {FileJob} from "./fileJob";
import express = require("express");

const   fs = require("fs"),
        tmp = require("tmp"),
        url = require("url");

export class WebhookJob extends Job {

    protected request;
    protected response;

    /**
     * WebhookJob constructor
     * @param e
     * @param request
     * @param response
     */
    constructor(e: Environment, request, response) {
        super(e, "Webhook Job");
        this.request = request;
        this.response = response;
    }

    /**
     * Get the HTTP response object.
     * @returns {ClientResponse}
     */
    public getResponse() {
        return this.response;
    }

    /**
     * Get the HTTP request object.
     * @returns {ClientRequest}
     */
    public getRequest() {
        return this.request;
    }

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
    public getUrlParameter(parameter: string) {
        let wh = this;
        let url_parts = url.parse(wh.getRequest().url, true);
        return url_parts.query[parameter];
    }

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
    public getUrlParameters() {
        let wh = this;
        let url_parts = url.parse(wh.getRequest().url, true);
        return url_parts.query;
    }

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
    public getDataAsFileJob(callback: any) {
        let wh = this;
        let req = wh.getRequest();
        let data = [];

        req.on("data", function(chunk) {
            data.push(chunk);
        });
        req.on("end", function() {
            let buffer = Buffer.concat(data);

            let filePath = tmp.tmpNameSync();
            fs.writeFileSync(filePath, buffer);

            let fileJob = new FileJob(wh.e, filePath);

            callback(fileJob);
        });
    }

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
    public getDataAsString(callback: any) {
        let wh = this;
        let req = wh.getRequest();
        let data = "";

        req.on("data", function(chunk) {
            data += chunk;
        });
        req.on("end", function() {
            callback(data);
        });
    }

}