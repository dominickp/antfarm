import {Environment} from "../environment/environment";
import {WebhookNest} from "../nest/webhookNest";

export class WebhookInterface {

    protected fields = [];

    protected e: Environment;

    protected nest: WebhookNest;

    protected handleRequest: any;

    constructor(e: Environment, nest: WebhookNest, handleRequest?: any) {
        this.e = e;
        this.nest = nest;
        this.handleRequest = handleRequest;
    }

    /**
     * Get the custom handleRequest function.
     * @returns {any}
     */
    public getCustomHandleRequest() {
        return this.handleRequest;
    }

    public getName () {
        return "Webhook interface";
    }

    public getNest() {
        return this.nest;
    }

    public addField(field: FieldOptions) {
        this.fields.push(field);
    }

    public getInterface() {
        return {
            fields: this.fields
        };
    }

    public getPath() {
        return this.nest.getPath();
    }
}