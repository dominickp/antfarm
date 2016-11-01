import { Environment } from "../environment/environment";
import { Nest } from "./nest";
import { WebhookJob } from "../job/webhookJob";
import { WebhookInterface } from "../ui/webhookInterface";
import { InterfaceManager } from "../ui/interfaceManager";
export declare class WebhookNest extends Nest {
    protected _path: string;
    protected _httpMethod: string;
    protected _handleRequest: any;
    protected _ui: WebhookInterface;
    protected _im: InterfaceManager;
    protected _holdResponse: boolean;
    /**
     * Webhook Nest constructor
     * @param e
     * @param path
     * @param httpMethod
     * @param handleRequest     Custom request handler function.
     */
    constructor(e: Environment, path: string | string[], httpMethod: string, handleRequest?: any);
    /**
     * Get the holdResponse flag.
     * @returns {boolean}
     */
    /**
     * Set hold response flag. This allows you to run tunnel logic and send the response after completion.
     * You must call _releaseResponse_ later if you use this.
     * @param holdResponse
     */
    holdResponse: boolean;
    /**
     * Releases the webhook response when tunnel run logic is complete.
     * @param job {WebhookJob}      The webhook job that triggered the webhook nest.
     * @param message {string}      The optional response message, if not using a custom request handler.
     * #### Example
     * ```js
     * var webhook = af.createWebhookNest(["jobs", "submit"], "post");
     * webhook.holdResponse = true; // Keeps the response from being sent immediately
     * var tunnel = af.createTunnel("Dwight's test tunnel");
     * tunnel.watch(webhook);
     * tunnel.run(function(job, nest){
     *      setTimeout(function(){
     *          nest.releaseResponse(job, "Worked!"); // Sends response
     *      }, 1500); // After 1.5 seconds
     * });
     * ```
     */
    releaseResponse(job: WebhookJob, message?: string): void;
    /**
     * Get the custom handleRequest function.
     * @returns {any}
     */
    /**
     * Set the custom handlerRequest function.
     * @param handleRequest
     */
    customHandleRequest: any;
    /**
     * Get the _path.
     * @returns {string}
     */
    /**
     * Set the _path as a string or a string array. All parts are URI encoded.
     * Create directory structures with an array: ["one", "two"] results in "/one/two".
     * @param path
     */
    path: any;
    /**
     * Get the HTTP method.
     * @returns {string}
     */
    /**
     * Set the HTTP method.
     * @param httpMethod
     */
    httpMethod: string;
    /**
     * Get the _name.
     * @returns {string}
     */
    readonly name: string;
    /**
     * On load, do nothing.
     */
    load(): void;
    /**
     * Add webhook to server watch list.
     */
    watch(): void;
    /**
     * Creates a new job
     * @param job
     */
    arrive(job: WebhookJob): void;
    /**
     * Get the interface manager. Used to manage interface instances for session handling.
     * @returns {InterfaceManager}
     */
    readonly interfaceManager: InterfaceManager;
}
