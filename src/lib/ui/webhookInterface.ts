import {Environment} from "../environment/environment";
import {WebhookNest} from "../nest/webhookNest";
import {FolderNest} from "../nest/folderNest";

const   shortid     = require("shortid"),
        _           = require("lodash");


export class WebhookInterface {

    protected fields = [];
    protected e: Environment;
    protected nest: WebhookNest;
    protected checkpointNest: FolderNest;
    protected steps = [];
    protected sessionId: string;

    /**
     * Constructor
     * @param {Environment} e
     * @param {WebhookNest} nest
     */
    constructor(e: Environment, nest: WebhookNest) {
        this.e = e;
        this.nest = nest;
        this.sessionId = shortid.generate();
    }


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
            newFields.push(field);
        });
        this.fields = newFields;
    }

    /**
     * Returns the interface for transport.
     * @returns {{fields: Array}}
     */
    public getInterface() {

        let jobs = this.getJobs();
        let jobsArray = [];

        jobs.forEach(function(job){
            jobsArray.push({
                id: job.getId(),
                name: job.getName(),
                path: job.getPath()
            });
        });

        // console.log(jobs as JobsInterface[]);

        return {
            sessionId: this.sessionId,
            fields: this.fields,
            jobs: jobsArray,
            steps: this.getSteps()
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
     * @param name      Name of the step
     * @param callback
     */
    public addStep(name: string, callback: any) {
        this.steps.push({
            name: name,
            callback: callback
        });
    }

    /**
     * Get steps
     * @returns {Array}
     */
    public getSteps() {
        return this.steps;
    }

    public setSteps(steps: any) {
        let newSteps = [];
        steps.forEach(field => {
            newSteps.push(field);
        });
        this.steps = newSteps;
    }
}