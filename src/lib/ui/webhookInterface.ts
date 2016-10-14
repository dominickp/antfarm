import {Environment} from "../environment/environment";
import {WebhookNest} from "../nest/webhookNest";
import {FolderNest} from "../nest/folderNest";
import {FieldOptions} from "./field";
import {Step} from "./step";
import {InterfaceMetadata} from "./interfaceMetadata";
import {InterfaceProperty} from "./InterfaceProperty";
import {FileJob} from "../job/fileJob";
import {FolderJob} from "../job/folderJob";

const   shortid     = require("shortid"),
        _           = require("lodash"),
        clone       = require("clone");

/**
 * A webhook interface instance, tied to a particular session.
 * Within interface steps, you can use these methods directly to alter the schema being returned to the user interface.
 * #### Example
 * ```js
 * var manager = webhook.getInterfaceManager();
 * manager.addStep("Check job number", function(webhookJob, webhookInterface, step){
 *      if(webhookJob.getQueryStringValue("job_number")){
 *          webhookInterface.addField({
 *              id: "something_else",
 *              name: "Some other field",
 *              type: "text",
 *              description: "Thanks for adding a job number!"
 *          });
 *          step.complete = true; // Mark step as complete
 *      }
 * });
 * ```
 */
export class WebhookInterface {

    protected fields: FieldOptions[];
    protected e: Environment;
    protected nest: WebhookNest;
    protected checkpointNest: FolderNest;
    protected steps: Step[];
    protected sessionId: string;
    protected metadata: InterfaceMetadata;

    /**
     * Constructor
     * @param {Environment} e
     * @param {WebhookNest} nest
     */
    constructor(e: Environment, nest: WebhookNest) {
        this.e = e;
        this.nest = nest;
        this.sessionId = shortid.generate();
        this.steps = [];
        this.fields = [];
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

    /**
     * Sets a cloned instance of metadata.
     * @param metadata
     */
    public setMetadata(metadata: InterfaceMetadata) {
        let clonedMetadata = clone(metadata);
        // let clonedMetadata = _.clone(metadata) as InterfaceMetadata;
        if (_.has(clonedMetadata, "interfaceProperties") && clonedMetadata.interfaceProperties.constructor === Array) {
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
        this.metadata.interfaceProperties.push(clone(property));
    }

    public setInterfaceProperties(properties: InterfaceProperty[]) {
        this.metadata.interfaceProperties = clone(properties);
    }

    /**
     * Return the session id. Used to match to interface instanced within the manager.
     * @returns {string}
     */
    public getSessionId() {
        return this.sessionId;
    }

    /**
     * Get the nest
     * @returns {WebhookNest}
     */
    public getNest() {
        return this.nest;
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
     * Get an existing field from the interface to modify its properties.
     * @param fieldId
     * @returns {FieldOptions}
     * #### Example
     * ```js
     * im.addStep("Check job number", function(webhookJob, webhookInterface, step, done) {
     *      if(webhookJob.getParameter("job_number").length == 6) {
     *          // Make job number read only
     *          var jobNumberField = webhookInterface.getField("job_number");
     *          jobNumberField.readonly = true;
     *          // Complete step
     *          webhookInterface.completeStep(step);
     *      } else {
     *          step.failure = "Job number was not 6 characters.";
     *      }
     *      done();
     * });
     * ```
     */
    public getField(fieldId: string) {
        let wi = this;
        return _.find(wi.fields, function(f) { return f.id === fieldId; });
    }

    /**
     * Overwrites fields with a clone.
     * @param fields
     */
    public setFields(fields: FieldOptions[]) {
        this.fields = clone(fields);
    }

    /**
     * Get an array of all of the fields.
     * @returns {FieldOptions[]}
     */
    public getFields() {
        return this.fields;
    }

    /**
     * Returns the interface for transport.
     * @returns {{fields: Array}}
     */
    public getTransportInterface() {
        let wi = this;
        let jobs = wi.getJobs();
        let jobsArray = [];

        jobs.forEach((job) => {
            jobsArray.push({
                id: job.getId(),
                name: job.getName(),
                path: job.getPath()
            });
        });

        return {
            sessionId: wi.sessionId,
            fields: wi.fields,
            heldJobs: jobsArray,
            steps: wi.getSteps(),
            metadata: wi.getMetadata()
        };
    }

    /**
     * Returns checked jobs.
     * @returns {(FileJob|FolderJob)[]}
     */
    public getJobs() {
        let wi = this;
        if (wi.checkpointNest) {
            return wi.checkpointNest.getHeldJobs();
        } else {
            return [];
        }
    }

    /**
     * Sets the checkpoint nest.
     * @param nest
     */
    public setCheckpointNest(nest: FolderNest) {
        this.checkpointNest = nest;
    }

    /**
     * Adds a user interface step
     * @param stepName
     * @param callback
     */
    public addStep(stepName: string, callback: any) {
        let step = new Step();
        step.name = stepName;
        step.callback = callback;
        step.complete = false;
        this.steps.push(step);
    }

    /**
     * Mark a step as complete and remove it from the interface.
     * @param step {Step}
     */
    public completeStep(step: Step): boolean {
        let wi = this;
        let steps = wi.getSteps();
        let matchedIndex = _.findIndex(steps, (s) => { return s.name === step.name; });
        if (steps[matchedIndex]) {
            wi.steps.splice(matchedIndex, 1);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Alias of completeStep.
     * @param step {Step}
     */
    public removeStep(step: Step) {
        this.completeStep(step);
    }

    /**
     * Get an array of instance steps.
     * @returns {Step[]}
     */
    public getSteps() {
        return this.steps;
    }

    /**
     * Overwrite the instant steps.
     * @param steps
     */
    public setSteps(steps: any) {
        this.steps = clone(steps);
    }
}