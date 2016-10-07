import {Environment} from "../environment/environment";
import {WebhookNest} from "../nest/webhookNest";
import {FolderNest} from "../nest/folderNest";
import {FieldOptions} from "./field";
import {Step} from "./step";
import {InterfaceMetadata} from "./interfaceMetadata";
import {InterfaceProperty} from "./InterfaceProperty";

const   shortid     = require("shortid"),
        _           = require("lodash");

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
        this.metadata = {} as InterfaceMetadata;
    }

    public getMetadata() {
        return this.metadata;
    }

    public setMetadata(metadata: InterfaceMetadata) {
        this.metadata = metadata;
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
     * Overwrites fields with a clone.
     * @param fields
     */
    public setFields(fields: FieldOptions[]) {
        let newFields = [];
        fields.forEach(field => {

            // Clone field
            let newField = {} as FieldOptions;
            newField.description = field.description;
            newField.id = field.id;
            newField.value = field.value;
            newField.required = field.required;
            newField.max_length = field.max_length;
            newField.tooltip = field.tooltip;
            newField.valueList = field.valueList;
            newField.name = field.name;
            newField.type = field.type;

            newFields.push(newField);
        });
        this.fields = newFields;
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

        let jobs = this.getJobs();
        let jobsArray = [];

        jobs.forEach(function(job){
            jobsArray.push({
                id: job.getId(),
                name: job.getName(),
                path: job.getPath()
            });
        });

        return {
            sessionId: this.sessionId,
            fields: this.fields,
            jobs: jobsArray,
            steps: this.getSteps(),
            metadata: this.getMetadata()
        };
    }

    /**
     * Adds pending jobs to the interfaces job list.
     * @param nest
     */
    public checkNest(nest: FolderNest) {
        this.checkpointNest = nest;
    }

    public getJobs() {
        if (this.checkpointNest) {
            return this.checkpointNest.getUnwatchedJobs();
        } else {
            return [];
        }
    }

    /**
     * Adds a user interface step
     * @param stepName
     * @param callback
     */
    public addStep(stepName: string, callback: any) {
        let step = {} as Step;
        step.name = stepName;
        step.callback = callback;
        step.complete = false;
        this.steps.push(step);
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
        let newSteps = [];
        steps.forEach(step => {
            let newStep = {} as Step;
            newStep.name = step.name;
            newStep.callback = step.callback;
            newStep.complete = false;
            newSteps.push(newStep);
        });
        this.steps = newSteps;
    }
}