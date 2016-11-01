import {WebhookNest} from "../nest/webhookNest";
import {WebhookInterface} from "./webhookInterface";
import {Environment} from "../environment/environment";
import {FieldOptions} from "./field";
import {Step} from "./step";
import {InterfaceMetadata} from "./interfaceMetadata";
import {InterfaceProperty} from "./InterfaceProperty";
import {FolderNest} from "../nest/folderNest";

const   _           = require("lodash"),
        clone       = require("clone");

/**
 * The interface manager allows you to separate your interface fields for stepped user interfaces.
 * It's a factory that handles the construction and session handling of WebhookInterface instances.
 * #### Example
 * ```js
 * var manager = webhook.getInterfaceManager();
 * manager.addField({
 *      id: "job_number",
 *      _name: "Job Number";
 *      type: "text"
 * });
 * ```
 */
export class InterfaceManager {

    protected e: Environment;
    protected nest: WebhookNest;
    protected fields: FieldOptions[];
    protected steps: Step[];
    protected interfaceInstances: WebhookInterface[];
    protected handleRequest: any;
    protected metadata: InterfaceMetadata;
    protected checkpointNest: FolderNest;

    /**
     *
     * @param e
     * @param webhookNest
     * @param handleRequest     Optional custom request handler for webhooks.
     */
    constructor(e: Environment, webhookNest: WebhookNest, handleRequest?: any) {
        this.e = e;
        this.nest = webhookNest;
        this.interfaceInstances = [];
        this.fields = [];
        this.steps = [];
        this.handleRequest = handleRequest;
        this.initMetadata();
    }

    protected initMetadata() {
        this.metadata = {
            interfaceProperties: []
        } as InterfaceMetadata;
    }

    public getMetadata() {
        return this.metadata;
    }

    public setMetadata(metadata: InterfaceMetadata) {

        let clonedMetadata = clone(metadata);

        if (_.has(clonedMetadata, "interfaceProperties") && typeof (clonedMetadata.interfaceProperties) !== "undefined" && clonedMetadata.interfaceProperties.constructor === Array) {
        } else {
            clonedMetadata.interfaceProperties = [];
        }
        this.metadata = clonedMetadata;
    }

    public setDescription(description: string) {
        this.metadata.description = description;
    }

    public setTooltip(tooltip: string) {
        this.metadata.tooltip = tooltip;
    }

    public addInterfaceProperty(property: InterfaceProperty) {
        this.metadata.interfaceProperties.push(property);
    }

    public setInterfaceProperties(properties: InterfaceProperty[]) {
        this.metadata.interfaceProperties = properties;
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
     * Get the nest _path.
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
        let wi = this;

        let existingField = _.find(wi.fields, function(f) { return f.id === field.id; });

        if (existingField) {
            wi.e.log(3, `Field id "${field.id}" already exists. It cannot be added again.`, wi);
            return false;
        }

        this.fields.push(field);
    }

    /**
     * Gets an array of interface fields.
     * @returns {FieldOptions[]}
     */
    public getFields() {
        return this.fields;
    }

    /**
     * Adds a user interface step.
     * @param stepName
     * @param callback          Parameters: WebhookJob, WebhookInterface, Step, Done callback
     * #### Example
     * ```js
     *  manager.addStep("Check job number", function(webhookJob, webhookInterface, step, done){
     *      if(webhookJob.getQueryStringValue("job_number")){
     *          webhookInterface.addField({
     *              id: "something_else",
     *              _name: "Some other field",
     *              type: "text",
     *              description: "Thanks for adding a job number!"
     *          });
     *          step.complete = true; // Mark step as complete
     *          done(); // Callback to do next step or send response if complete
     *      }
     * });
     * ```
     */
    public addStep(stepName: string, callback: any) {
        let step = new Step();
        step.name = stepName;
        step.callback = callback;
        step.complete = false;
        this.steps.push(step);
    }

    /**
     * Get an array of user interface steps.
     * @returns {Step[]}
     */
    public getSteps() {
        return this.steps;
    }

    protected addInterfaceInstance(wi: WebhookInterface) {
        let im = this;
        im.interfaceInstances.push(wi);

        // Destruct
        let sessionExpiration = (im.e.options.webhook_interface_session_timeout * 60000) || 300000;

        setTimeout(() => {
            im.removeInterfaceInstance(wi);
        }, sessionExpiration);

    }

    protected removeInterfaceInstance(wi: WebhookInterface) {
        let im = this;
        let removeSuccess = _.remove(this.interfaceInstances, (i) => {
            return i.getSessionId() === wi.getSessionId();
        });

        if (removeSuccess) {
            im.e.log(0, `Removed webhook interface session ${wi.getSessionId()}`, im);
        } else {
            im.e.log(3, `Unable to remove webhook interface session ${wi.getSessionId()}`, im);
        }
    };

    /**
     * Find or return a new webhook interface instance.
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
            wi.setMetadata(im.getMetadata());
            wi.setCheckpointNest(im.checkpointNest);

            if (im.interfaceInstances.length === 0) {
                im.e.addWebhookInterface(this);
            } else {
                im.e.log(0, `${im.interfaceInstances.length} interface sessions already exist.`, im);
            }
            im.addInterfaceInstance(wi);
        } else {
            im.e.log(0, `Restored interface session ${wi.getSessionId()}.`, im);
        }

        return wi;
    }

    /**
     * Adds pending jobs to the interfaces job list.
     * @param nest
     */
    public checkNest(nest: FolderNest) {
        this.checkpointNest = nest;
        nest.watchHold();
    }
}