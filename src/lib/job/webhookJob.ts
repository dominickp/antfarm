import {Environment} from "../environment/environment";
import {Job} from "./job";
import {FileJob} from "./fileJob";
import express = require("express");

const   fs = require("fs"),
        tmp = require("tmp"),
        url = require("url"),
        path = require("path"),
        _ = require("lodash");

/**
 * A job that is triggered when a webhook receives a request.
 */
export class WebhookJob extends Job {

    protected _request;
    protected _response;
    protected _responseSent: boolean;

    /**
     * WebhookJob constructor
     * @param e
     * @param request
     * @param response
     */
    constructor(e: Environment, request, response) {
        super(e, "Webhook Job");
        this._request = request;
        this._response = response;
        this._responseSent = false;
    }

    /**
     * Set if the response to the webhook was already sent or not.
     * @param sent
     */
    public set responseSent(sent: boolean) {
        this._responseSent = sent;
    }

    /**
     * Get if the response to the webhook was already sent or not.
     * @returns {boolean}
     */
    public get responseSent() {
        return this._responseSent;
    }

    /**
     * Get the HTTP response object.
     * @returns {ClientResponse}
     */
    public get response() {
        return this._response;
    }

    /**
     * Get the HTTP request object.
     * @returns {ClientRequest}
     */
    public get request() {
        return this._request;
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
        let url_parts = url.parse(wh.request.url, true);
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
        let url_parts = url.parse(wh.request.url, true);
        return url_parts.query;
    }

    /**
     * Returns FileJobs made from _files sent via FormData to the webhook.
     * @returns {FileJob[]}
     */
    public getFormDataFiles() {
        let wh = this;
        let files = wh.request.files;
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
        let body = wh.request.body;

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
        let req = wh.request;
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