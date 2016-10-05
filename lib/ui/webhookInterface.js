"use strict";
var shortid = require("shortid"), _ = require("lodash");
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
var WebhookInterface = (function () {
    /**
     * Constructor
     * @param {Environment} e
     * @param {WebhookNest} nest
     */
    function WebhookInterface(e, nest) {
        this.e = e;
        this.nest = nest;
        this.sessionId = shortid.generate();
        this.steps = [];
        this.fields = [];
    }
    /**
     * Return the session id. Used to match to interface instanced within the manager.
     * @returns {string}
     */
    WebhookInterface.prototype.getSessionId = function () {
        return this.sessionId;
    };
    /**
     * Get the nest
     * @returns {WebhookNest}
     */
    WebhookInterface.prototype.getNest = function () {
        return this.nest;
    };
    /**
     * Adds an interface field to the interface.
     * @param {FieldOptions} field
     */
    WebhookInterface.prototype.addField = function (field) {
        var wi = this;
        var existingField = _.find(wi.fields, function (f) { return f.id === field.id; });
        if (existingField) {
            wi.e.log(3, "Field id \"" + field.id + "\" already exists. It cannot be added again.", wi);
            return false;
        }
        this.fields.push(field);
    };
    /**
     * Overwrites fields with a clone.
     * @param fields
     */
    WebhookInterface.prototype.setFields = function (fields) {
        var newFields = [];
        fields.forEach(function (field) {
            // Clone field
            var newField = {};
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
    };
    /**
     * Get an array of all of the fields.
     * @returns {FieldOptions[]}
     */
    WebhookInterface.prototype.getFields = function () {
        return this.fields;
    };
    /**
     * Returns the interface for transport.
     * @returns {{fields: Array}}
     */
    WebhookInterface.prototype.getTransportInterface = function () {
        var jobs = this.getJobs();
        var jobsArray = [];
        jobs.forEach(function (job) {
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
            steps: this.getSteps()
        };
    };
    /**
     * Adds pending jobs to the interfaces job list.
     * @param nest
     */
    WebhookInterface.prototype.checkNest = function (nest) {
        this.checkpointNest = nest;
    };
    WebhookInterface.prototype.getJobs = function () {
        if (this.checkpointNest) {
            return this.checkpointNest.getUnwatchedJobs();
        }
        else {
            return [];
        }
    };
    /**
     * Adds a user interface step
     * @param stepName
     * @param callback
     */
    WebhookInterface.prototype.addStep = function (stepName, callback) {
        var step = {};
        step.name = stepName;
        step.callback = callback;
        step.complete = false;
        this.steps.push(step);
    };
    /**
     * Get an array of instance steps.
     * @returns {Step[]}
     */
    WebhookInterface.prototype.getSteps = function () {
        return this.steps;
    };
    /**
     * Overwrite the instant steps.
     * @param steps
     */
    WebhookInterface.prototype.setSteps = function (steps) {
        var newSteps = [];
        steps.forEach(function (step) {
            var newStep = {};
            newStep.name = step.name;
            newStep.callback = step.callback;
            newStep.complete = false;
            newSteps.push(newStep);
        });
        this.steps = newSteps;
    };
    return WebhookInterface;
}());
exports.WebhookInterface = WebhookInterface;
