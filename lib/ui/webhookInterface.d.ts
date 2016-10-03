import { Environment } from "../environment/environment";
import { WebhookNest } from "../nest/webhookNest";
export declare class WebhookInterface {
    protected fields: any[];
    protected e: Environment;
    protected nest: WebhookNest;
    protected handleRequest: any;
    constructor(e: Environment, nest: WebhookNest, handleRequest?: any);
    /**
     * Get the custom handleRequest function.
     * @returns {any}
     */
    getCustomHandleRequest(): any;
    getName(): string;
    getNest(): WebhookNest;
    addField(field: FieldOptions): void;
    getInterface(): {
        fields: any[];
    };
    getPath(): string;
}
