import {Environment} from "../environment/environment";
import {Job} from "./job";
import {FileJob} from "./fileJob";
import express = require("express");

const   fs = require("fs"),
        tmp = require("tmp"),
        url = require("url"),
        path = require("path"),
        _ = require("lodash");

export class WebhookJob extends Job {

    protected request;
    protected response;
    protected _responseSent: boolean;

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
        this._responseSent = false;
    }

    public set responseSent(sent: boolean) {
        this._responseSent = sent;
    }

    public get responseSent() {
        return this._responseSent;
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
    public getQueryStringValue(parameter: string) {
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
    public getQueryStringValues() {
        let wh = this;
        let url_parts = url.parse(wh.getRequest().url, true);
        return url_parts.query;
    }

    /**
     * Returns FileJobs made from files sent via FormData to the webhook.
     * @returns {FileJob[]}
     */
    public getFormDataFiles() {
        let wh = this;
        let files = wh.getRequest().files;
        let jobs = [];

        if (files) {
            files.forEach(function(file){
                let job = new FileJob(wh.e, file.path);
                job.rename(file.originalname);
                jobs.push(job);
            });
        }

        return jobs;
    }

    /**
     * Get all FormData values.
     * @returns {any}
     */
    public getFormDataValues() {
        let wh = this;
        let body = wh.getRequest().body;

        return body;
    }

    /**
     * Get a single FormData value.
     * @param key
     * @returns {any}
     */
    public getFormDataValue(key: string) {
        let wh = this;
        let formData = wh.getFormDataValues();

        if (formData && key in formData) {
            return formData[key];
        } else {
            return false;
        }
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

    /**
     * Returns an array of parameters from both the query string and form-data.
     */
    public getParameters() {
        let wh = this;
        return _.merge(wh.getQueryStringValues(), wh.getFormDataValues());
    }

    /**
     * Returns a parameter from both the query string and form-data.
     * @param key
     * @returns {any}
     */
    public getParameter(key: string) {
        let wh = this;
        if (_.has(wh.getParameters(), key)) {
            return wh.getParameters()[key];
        } else {
            return false;
        }
    }

}