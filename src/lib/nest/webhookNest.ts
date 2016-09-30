import {Environment} from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
import {WebhookJob} from "../job/webhookJob";

const   http = require("http");

export class WebhookNest extends Nest {

    protected path: string;

    protected httpMethod: string;

    protected handleRequest: any;

    /**
     * Webhook Nest constructor
     * @param e
     * @param path
     * @param httpMethod
     * @param handleRequest     Custom request handler function.
     */
    constructor(e: Environment, path: string|string[], httpMethod: string, handleRequest?: any) {
        super(e, path.toString());
        let wh = this;
        wh.setPath(path);
        wh.setHttpMethod(httpMethod);
        if (handleRequest) {
            wh.setCustomHandleRequest(handleRequest);
        }
    }

    /**
     * Get the custom handleRequest function.
     * @returns {any}
     */
    public getCustomHandleRequest() {
        return this.handleRequest;
    }

    /**
     * Set the custom handlerRequest function.
     * @param handleRequest
     */
    protected setCustomHandleRequest(handleRequest) {
        if (handleRequest !== null && typeof handleRequest !== "function") {
            throw("Custom handleRequest must be a function.");
        }
        this.handleRequest = handleRequest;
    }

    /**
     * Set the path as a string or a string array. All parts are URI encoded.
     * Create directory structures with an array: ["one", "two"] results in "/one/two".
     * @param path
     */
    public setPath(path: any) {
        let wh = this;
        let modifiedPath = "";
        if (typeof(path) === "string") {
            modifiedPath = encodeURIComponent(path);
        } else if (path instanceof Array) {
            path.forEach(function(pi){
                modifiedPath += "/" + encodeURIComponent(pi);
            });
        } else {
            throw `Path should be a string or array, ${typeof(path)} found.`;
        }
        if (modifiedPath.charAt(0) !== "/") {
            modifiedPath = "/" + modifiedPath;
        }
        wh.path = modifiedPath;
    }

    /**
     * Get the path.
     * @returns {string}
     */
    public getPath() {
        return this.path;
    }

    /**
     * Get the HTTP method.
     * @returns {string}
     */
    public getHttpMethod() {
        return this.httpMethod;
    }

    /**
     * Set the HTTP method.
     * @param httpMethod
     */
    protected setHttpMethod(httpMethod) {
        let lower = httpMethod.toLowerCase();
        let acceptableMethods = [ "get", "post", "put", "head", "delete", "options", "trace", "copy", "lock", "mkcol", "move", "purge", "propfind", "proppatch", "unlock", "report", "mkactivity", "checkout", "merge", "m-search", "notify", "subscribe", "unsubscribe", "patch", "search", "connect", "all" ];
        if (acceptableMethods.indexOf(lower) === -1) {
            throw `HTTP method "${lower}" is not an acceptable value. ${JSON.stringify(acceptableMethods)}`;
        }
        this.httpMethod = lower;
    }

    /**
     * Get the name.
     * @returns {string}
     */
    public getName() {
        return this.name;
    }

    /**
     * On load, do nothing.
     */
    public load() {}

    /**
     * Add webhook to server watch list.
     */
    public watch() {
        let wh = this;
        wh.e.addWebhook(wh);
    }

    /**
     * Creates a new job
     * @param job
     */
    public arrive(job: WebhookJob) {
        super.arrive(job);
    }

}