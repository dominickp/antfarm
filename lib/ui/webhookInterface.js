"use strict";
var WebhookInterface = (function () {
    /**
     * Constructor
     * @param {Environment} e
     * @param {WebhookNest} nest
     * @param handleRequest
     */
    function WebhookInterface(e, nest, handleRequest) {
        this.fields = [];
        this.e = e;
        this.nest = nest;
        this.handleRequest = handleRequest;
    }
    /**
     * Get the custom handleRequest function.
     * @returns {any}
     */
    WebhookInterface.prototype.getCustomHandleRequest = function () {
        return this.handleRequest;
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
     * Returns the interface for transport.
     * @returns {{fields: Array}}
     */
    WebhookInterface.prototype.getInterface = function () {
        return {
            fields: this.fields
        };
    };
    /**
     * Get the nest path.
     * @returns {string}
     */
    WebhookInterface.prototype.getPath = function () {
        return this.nest.getPath();
    };
    return WebhookInterface;
}());
exports.WebhookInterface = WebhookInterface;
