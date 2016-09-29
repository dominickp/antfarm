import { Environment } from "../environment/environment";
import { Job } from "./job";
import { ClientRequest } from "http";
import { ClientResponse } from "http";
export declare class WebhookJob extends Job {
    protected request: ClientRequest;
    protected response: ClientResponse;
    /**
     * WebhookJob constructor
     * @param e
     * @param request
     * @param response
     */
    constructor(e: Environment, request: ClientRequest, response: ClientResponse);
    /**
     * Get the HTTP response object.
     * @returns {ClientResponse}
     */
    getResponse(): ClientResponse;
    /**
     * Get the HTTP request object.
     * @returns {any}
     */
    getRequest(): ClientRequest;
}
