import { Environment } from "../environment/environment";
import { Job } from "./job";
import { ServerRequest } from "http";
import { ServerResponse } from "http";
export declare class WebhookJob extends Job {
    protected request: ServerRequest;
    protected response: ServerResponse;
    /**
     * WebhookJob constructor
     * @param e
     * @param request
     * @param response
     */
    constructor(e: Environment, request: ServerRequest, response: ServerResponse);
    /**
     * Get the HTTP response object.
     * @returns {ClientResponse}
     */
    getResponse(): ServerResponse;
    /**
     * Get the HTTP request object.
     * @returns {ClientRequest}
     */
    getRequest(): ServerRequest;
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
    getUrlParameter(parameter: string): any;
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
    getUrlParameters(): any;
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
    getDataAsFileJob(callback: any): void;
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
}
