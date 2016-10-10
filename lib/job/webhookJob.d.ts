import { Environment } from "../environment/environment";
import { Job } from "./job";
export declare class WebhookJob extends Job {
    protected request: any;
    protected response: any;
    /**
     * WebhookJob constructor
     * @param e
     * @param request
     * @param response
     */
    constructor(e: Environment, request: any, response: any);
    /**
     * Get the HTTP response object.
     * @returns {ClientResponse}
     */
    getResponse(): any;
    /**
     * Get the HTTP request object.
     * @returns {ClientRequest}
     */
    getRequest(): any;
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
    /**
     * Returns FileJobs made from files sent via FormData to the webhook.
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
    getDataAsString(callback: any): void;
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
