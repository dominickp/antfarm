import { Environment } from "../environment/environment";
import { WebhookNest } from "../nest/webhookNest";
export declare class WebhookInterface {
    protected fields: any[];
    protected e: Environment;
    protected nest: WebhookNest;
    protected handleRequest: any;
    /**
     * Constructor
     * @param {Environment} e
     * @param {WebhookNest} nest
     * @param handleRequest
     */
    constructor(e: Environment, nest: WebhookNest, handleRequest?: any);
    /**
     * Get the custom handleRequest function.
     * @returns {any}
     */
    getCustomHandleRequest(): any;
    /**
     * Get the nest
     * @returns {WebhookNest}
     */
    getNest(): WebhookNest;
    /**
     * Adds an interface field to the interface.
     * @param {FieldOptions} field
     */
    addField(field: FieldOptions): void;
    /**
     * Returns the interface for transport.
     * @returns {{fields: Array}}
     */
    getInterface(): {
        fields: any[];
    };
    /**
     * Get the nest path.
     * @returns {string}
     */
    getPath(): string;
}
