"use strict";
var webhookInterface_1 = require("./webhookInterface");
var step_1 = require("./step");
var _ = require("lodash"), clone = require("clone");
/**
 * The interface manager allows you to separate your interface fields for stepped user interfaces.
 * It's a factory that handles the construction and session handling of WebhookInterface instances.
 * #### Example
 * ```js
 * var manager = webhook.getInterfaceManager();
 * manager.addField({
 *      id: "job_number",
 *      name: "Job Number";
 *      type: "text"
 * });
 * ```
 */
var InterfaceManager = (function () {
    /**
     *
     * @param e
     * @param webhookNest
     * @param handleRequest     Optional custom request handler for webhooks.
     */
    function InterfaceManager(e, webhookNest, handleRequest) {
        this.e = e;
        this.nest = webhookNest;
        this.interfaceInstances = [];
        this.fields = [];
        this.steps = [];
        this.handleRequest = handleRequest;
        this.initMetadata();
    }
    InterfaceManager.prototype.initMetadata = function () {
        this.metadata = {
            interfaceProperties: []
        };
    };
    InterfaceManager.prototype.getMetadata = function () {
        return this.metadata;
    };
    InterfaceManager.prototype.setMetadata = function (metadata) {
        var clonedMetadata = clone(metadata);
        if (_.has(clonedMetadata, "interfaceProperties") && typeof (clonedMetadata.interfaceProperties) !== "undefined" && clonedMetadata.interfaceProperties.constructor === Array) {
        }
        else {
            clonedMetadata.interfaceProperties = [];
        }
        this.metadata = clonedMetadata;
    };
    InterfaceManager.prototype.setDescription = function (description) {
        this.metadata.description = description;
    };
    InterfaceManager.prototype.setTooltip = function (tooltip) {
        this.metadata.tooltip = tooltip;
    };
    InterfaceManager.prototype.addInterfaceProperty = function (property) {
        this.metadata.interfaceProperties.push(property);
    };
    InterfaceManager.prototype.setInterfaceProperties = function (properties) {
        this.metadata.interfaceProperties = properties;
    };
    /**
     * Get the custom handleRequest function.
     * @returns {any}
     */
    InterfaceManager.prototype.getCustomHandleRequest = function () {
        return this.handleRequest;
    };
    /**
     * Get the nest
     * @returns {WebhookNest}
     */
    InterfaceManager.prototype.getNest = function () {
        return this.nest;
    };
    /**
     * Get the nest path.
     * @returns {string}
     */
    InterfaceManager.prototype.getPath = function () {
        return this.nest.getPath();
    };
    /**
     * Adds an interface field to the interface.
     * @param {FieldOptions} field
     */
    InterfaceManager.prototype.addField = function (field) {
        var wi = this;
        var existingField = _.find(wi.fields, function (f) { return f.id === field.id; });
        if (existingField) {
            wi.e.log(3, "Field id \"" + field.id + "\" already exists. It cannot be added again.", wi);
            return false;
        }
        this.fields.push(field);
    };
    /**
     * Gets an array of interface fields.
     * @returns {FieldOptions[]}
     */
    InterfaceManager.prototype.getFields = function () {
        return this.fields;
    };
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
     *              name: "Some other field",
     *              type: "text",
     *              description: "Thanks for adding a job number!"
     *          });
     *          step.complete = true; // Mark step as complete
     *          done(); // Callback to do next step or send response if complete
     *      }
     * });
     * ```
     */
    InterfaceManager.prototype.addStep = function (stepName, callback) {
        var step = new step_1.Step();
        step.name = stepName;
        step.callback = callback;
        step.complete = false;
        this.steps.push(step);
    };
    /**
     * Get an array of user interface steps.
     * @returns {Step[]}
     */
    InterfaceManager.prototype.getSteps = function () {
        return this.steps;
    };
    InterfaceManager.prototype.addInterfaceInstance = function (wi) {
        var im = this;
        im.interfaceInstances.push(wi);
        // Destruct
        var sessionExpiration = (im.e.getOptions().webhook_interface_session_timeout * 60000) || 300000;
        setTimeout(function () {
            im.removeInterfaceInstance(wi);
        }, sessionExpiration);
    };
    InterfaceManager.prototype.removeInterfaceInstance = function (wi) {
        var im = this;
        var removeSuccess = _.remove(this.interfaceInstances, function (i) {
            return i.getSessionId() === wi.getSessionId();
        });
        if (removeSuccess) {
            im.e.log(0, "Removed webhook interface session " + wi.getSessionId(), im);
        }
        else {
            im.e.log(3, "Unable to remove webhook interface session " + wi.getSessionId(), im);
        }
    };
    ;
    /**
     * Find or return a new webhook interface instance.
     * @param sessionId
     * @returns {WebhookInterface}
     */
    InterfaceManager.prototype.getInterface = function (sessionId) {
        var im = this;
        var wi;
        // Find in this.interfaceInstances
        if (sessionId) {
            wi = _.find(im.interfaceInstances, function (i) { return i.getSessionId() === sessionId; });
        }
        if (!wi) {
            // Make new interface if not found
            wi = new webhookInterface_1.WebhookInterface(im.e, im.nest);
            wi.setFields(im.getFields());
            wi.setSteps(im.getSteps());
            wi.setMetadata(im.getMetadata());
            wi.setCheckpointNest(im.checkpointNest);
            if (im.interfaceInstances.length === 0) {
                im.e.addWebhookInterface(this);
            }
            else {
                im.e.log(0, im.interfaceInstances.length + " interface sessions already exist.", im);
            }
            im.addInterfaceInstance(wi);
        }
        else {
            im.e.log(0, "Restored interface session " + wi.getSessionId() + ".", im);
        }
        return wi;
    };
    /**
     * Adds pending jobs to the interfaces job list.
     * @param nest
     */
    InterfaceManager.prototype.checkNest = function (nest) {
        this.checkpointNest = nest;
        nest.watchHold();
    };
    return InterfaceManager;
}());
exports.InterfaceManager = InterfaceManager;
//# sourceMappingURL=interfaceManager.js.map