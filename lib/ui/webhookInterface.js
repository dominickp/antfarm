"use strict";
var shortid = require("shortid");
var WebhookInterface = (function () {
    /**
     * Constructor
     * @param {Environment} e
     * @param {WebhookNest} nest
     */
    function WebhookInterface(e, nest) {
        this.fields = [];
        this.steps = [];
        this.e = e;
        this.nest = nest;
        this.sessionId = shortid.generate();
    }
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
        this.fields.push(field);
    };
    /**
     * Overwrites fields with a clone.
     * @param fields
     */
    WebhookInterface.prototype.setFields = function (fields) {
        var newFields = [];
        fields.forEach(function (field) {
            newFields.push(field);
        });
        this.fields = newFields;
    };
    /**
     * Returns the interface for transport.
     * @returns {{fields: Array}}
     */
    WebhookInterface.prototype.getInterface = function () {
        var jobs = this.getJobs();
        var jobsArray = [];
        jobs.forEach(function (job) {
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
     * @param name      Name of the step
     * @param callback
     */
    WebhookInterface.prototype.addStep = function (name, callback) {
        this.steps.push({
            name: name,
            callback: callback
        });
    };
    /**
     * Get steps
     * @returns {Array}
     */
    WebhookInterface.prototype.getSteps = function () {
        return this.steps;
    };
    WebhookInterface.prototype.setSteps = function (steps) {
        var newSteps = [];
        steps.forEach(function (field) {
            newSteps.push(field);
        });
        this.steps = newSteps;
    };
    return WebhookInterface;
}());
exports.WebhookInterface = WebhookInterface;
