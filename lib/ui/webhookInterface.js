"use strict";
var WebhookInterface = (function () {
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
    WebhookInterface.prototype.getName = function () {
        return "Webhook interface";
    };
    WebhookInterface.prototype.getNest = function () {
        return this.nest;
    };
    WebhookInterface.prototype.addField = function (field) {
        this.fields.push(field);
    };
    WebhookInterface.prototype.getInterface = function () {
        return {
            fields: this.fields
        };
    };
    WebhookInterface.prototype.getPath = function () {
        return this.nest.getPath();
    };
    return WebhookInterface;
}());
exports.WebhookInterface = WebhookInterface;
