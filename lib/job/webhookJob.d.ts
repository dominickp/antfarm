import { Environment } from "../environment/environment";
import { Job } from "./job";
/**
 * A job that is triggered when a webhook receives a request.
 */
export declare class WebhookJob extends Job {
    protected _request: any;
    protected _response: any;
    protected _responseSent: boolean;
    /**
     * WebhookJob constructor
     * @param e
     * @param request
     * @param response
     */
    constructor(e: Environment, request: any, response: any);
    /**
     * Get if the response to the webhook was already sent or not.
     * @returns {boolean}
     */
    /**
     * Set if the response to the webhook was already sent or not.
     * @param sent
     */
    responseSent: boolean;
    /**
     * Get the HTTP response object.
     * @returns {ClientResponse}
     */
    readonly response: any;
    /**
     * Get the HTTP request object.
     * @returns {ClientRequest}
     */
    readonly request: any;
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
    getQueryStringValue(parameter: string): any;
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
    getQueryStringValues(): any;
    /**
     * Returns FileJobs made from _files sent via FormData to the webhook.
     * @returns {FileJob[]}
     */
    getFormDataFiles(): any[];
    /**
     * Get all FormData values.
     * @returns {any}
     */
    getFormDataValues(): any;
    /**
     * Get a single FormData value.
     * @param key
     * @returns {any}
     */
    getFormDataValue(key: string): any;
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
    getDataAsString(callback: (data: string) => void): void;
    /**
     * Returns an array of parameters from both the query string and form-data.
     */
    getParameters(): any;
    /**
     * Returns a parameter from both the query string and form-data.
     * @param key
     * @returns {any}
     */
    getParameter(key: string): any;
}
