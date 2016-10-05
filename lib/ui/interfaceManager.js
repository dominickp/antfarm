"use strict";
var webhookInterface_1 = require("./webhookInterface");
var _ = require("lodash");
var InterfaceManager = (function () {
    function InterfaceManager(e, webhookNest, handleRequest) {
        this.steps = [];
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
        this.fields.push(field);
    };
    InterfaceManager.prototype.getFields = function () {
        return this.fields;
    };
    /**
     * Adds a user interface step
     * @param name      Name of the step
     * @param callback
     */
    InterfaceManager.prototype.addStep = function (name, callback) {
        this.steps.push({
            name: name,
            callback: callback
        });
    };
    InterfaceManager.prototype.getSteps = function () {
        return this.steps;
    };
    /**
     * Find or return a new interface instance.
     * @param sessionId
     * @returns {WebhookInterface}
     */
    InterfaceManager.prototype.getInterface = function (sessionId) {
        var im = this;
        var wi;
        // Find in this.interfaceInstances
        console.log("looking for", sessionId);
        if (sessionId) {
            wi = _.find(im.interfaceInstances, function (i) { return i.getSessionId() === sessionId; });
        }
        if (!wi) {
            // Make new interface if not found
            wi = new webhookInterface_1.WebhookInterface(im.e, im.nest);
            wi.setFields(im.getFields());
            wi.setSteps(im.getSteps());
            if (im.interfaceInstances.length === 0) {
                im.e.addWebhookInterface(this);
            }
            else {
                im.e.log(0, im.interfaceInstances.length + " interface sessions already exist.", im);
            }
            im.interfaceInstances.push(wi);
        }
        return wi;
    };
    return InterfaceManager;
}());
exports.InterfaceManager = InterfaceManager;
