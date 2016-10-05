import {WebhookNest} from "../nest/webhookNest";
import {WebhookInterface} from "./webhookInterface";
import {Environment} from "../environment/environment";

const _     = require("lodash");

export class InterfaceManager {

    protected e: Environment;
    protected nest: WebhookNest;
    protected fields: FieldOptions[];
    protected steps = [];
    protected interfaceInstances: WebhookInterface[];
    protected handleRequest: any;

    constructor(e: Environment, webhookNest: WebhookNest, handleRequest?: any) {
        this.e = e;
        this.nest = webhookNest;
        this.interfaceInstances = [];
        this.fields = [];
        this.handleRequest = handleRequest;
    }

    /**
     * Get the custom handleRequest function.
     * @returns {any}
     */
    public getCustomHandleRequest() {
        return this.handleRequest;
    }

    /**
     * Get the nest
     * @returns {WebhookNest}
     */
    public getNest() {
        return this.nest;
    }


    /**
     * Get the nest path.
     * @returns {string}
     */
    public getPath() {
        return this.nest.getPath();
    }


    /**
     * Adds an interface field to the interface.
     * @param {FieldOptions} field
     */
    public addField(field: FieldOptions) {
        this.fields.push(field);
    }

    public getFields() {
        return this.fields;
    }

    /**
     * Adds a user interface step
     * @param name      Name of the step
     * @param callback
     */
    public addStep(name: string, callback: any) {
        this.steps.push({
            name: name,
            callback: callback
        });
    }

    public getSteps() {
        return this.steps;
    }

    /**
     * Find or return a new interface instance.
     * @param sessionId
     * @returns {WebhookInterface}
     */
    public getInterface(sessionId?: string) {
        let im = this;
        let wi;
        // Find in this.interfaceInstances
        if (sessionId) {
            wi = _.find(im.interfaceInstances, function(i) { return i.getSessionId() === sessionId; });
        }

        if (!wi) {
            // Make new interface if not found
            wi = new WebhookInterface(im.e, im.nest);
            wi.setFields(im.getFields());
            wi.setSteps(im.getSteps());

            if (im.interfaceInstances.length === 0) {
                im.e.addWebhookInterface(this);
            } else {
                im.e.log(0, `${im.interfaceInstances.length} interface sessions already exist.`, im);
            }

            im.interfaceInstances.push(wi);
        } else {
            im.e.log(0, `Restored interface session ${wi.getSessionId()}.`, im);
        }

        return wi;
    }
}