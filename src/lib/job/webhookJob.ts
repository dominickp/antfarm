import {Environment} from "../environment/environment";
import {Job} from "./job";
import {ClientRequest} from "http";
import {ClientResponse} from "http";

export class WebhookJob extends Job {

    protected request: ClientRequest;
    protected response: ClientResponse;

    /**
     * WebhookJob constructor
     * @param e
     * @param request
     * @param response
     */
    constructor(e: Environment, request: ClientRequest, response: ClientResponse) {
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
     * @returns {any}
     */
    public getRequest() {
        return this.request;
    }

}