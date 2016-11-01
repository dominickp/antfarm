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
 *      _name: "Job Number";
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
     * Get the nest _path.
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
        var sessionExpiration = (im.e.options.webhook_interface_session_timeout * 60000) || 300000;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS9pbnRlcmZhY2VNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxpQ0FBK0Isb0JBQW9CLENBQUMsQ0FBQTtBQUdwRCxxQkFBbUIsUUFBUSxDQUFDLENBQUE7QUFLNUIsSUFBUSxDQUFDLEdBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUMvQixLQUFLLEdBQVMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXZDOzs7Ozs7Ozs7Ozs7R0FZRztBQUNIO0lBV0k7Ozs7O09BS0c7SUFDSCwwQkFBWSxDQUFjLEVBQUUsV0FBd0IsRUFBRSxhQUFtQjtRQUNyRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFUyx1Q0FBWSxHQUF0QjtRQUNJLElBQUksQ0FBQyxRQUFRLEdBQUc7WUFDWixtQkFBbUIsRUFBRSxFQUFFO1NBQ0wsQ0FBQztJQUMzQixDQUFDO0lBRU0sc0NBQVcsR0FBbEI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBRU0sc0NBQVcsR0FBbEIsVUFBbUIsUUFBMkI7UUFFMUMsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXJDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLFdBQVcsSUFBSSxjQUFjLENB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O0lBRUQ7OztPQUdHO0lBQ0ksb0NBQVMsR0FBaEIsVUFBaUIsSUFBZ0I7UUFDN0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFDTCx1QkFBQztBQUFELENBMU5BLEFBME5DLElBQUE7QUExTlksd0JBQWdCLG1CQTBONUIsQ0FBQSIsImZpbGUiOiJsaWIvdWkvaW50ZXJmYWNlTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7V2ViaG9va05lc3R9IGZyb20gXCIuLi9uZXN0L3dlYmhvb2tOZXN0XCI7XG5pbXBvcnQge1dlYmhvb2tJbnRlcmZhY2V9IGZyb20gXCIuL3dlYmhvb2tJbnRlcmZhY2VcIjtcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtGaWVsZE9wdGlvbnN9IGZyb20gXCIuL2ZpZWxkXCI7XG5pbXBvcnQge1N0ZXB9IGZyb20gXCIuL3N0ZXBcIjtcbmltcG9ydCB7SW50ZXJmYWNlTWV0YWRhdGF9IGZyb20gXCIuL2ludGVyZmFjZU1ldGFkYXRhXCI7XG5pbXBvcnQge0ludGVyZmFjZVByb3BlcnR5fSBmcm9tIFwiLi9JbnRlcmZhY2VQcm9wZXJ0eVwiO1xuaW1wb3J0IHtGb2xkZXJOZXN0fSBmcm9tIFwiLi4vbmVzdC9mb2xkZXJOZXN0XCI7XG5cbmNvbnN0ICAgXyAgICAgICAgICAgPSByZXF1aXJlKFwibG9kYXNoXCIpLFxuICAgICAgICBjbG9uZSAgICAgICA9IHJlcXVpcmUoXCJjbG9uZVwiKTtcblxuLyoqXG4gKiBUaGUgaW50ZXJmYWNlIG1hbmFnZXIgYWxsb3dzIHlvdSB0byBzZXBhcmF0ZSB5b3VyIGludGVyZmFjZSBmaWVsZHMgZm9yIHN0ZXBwZWQgdXNlciBpbnRlcmZhY2VzLlxuICogSXQncyBhIGZhY3RvcnkgdGhhdCBoYW5kbGVzIHRoZSBjb25zdHJ1Y3Rpb24gYW5kIHNlc3Npb24gaGFuZGxpbmcgb2YgV2ViaG9va0ludGVyZmFjZSBpbnN0YW5jZXMuXG4gKiAjIyMjIEV4YW1wbGVcbiAqIGBgYGpzXG4gKiB2YXIgbWFuYWdlciA9IHdlYmhvb2suZ2V0SW50ZXJmYWNlTWFuYWdlcigpO1xuICogbWFuYWdlci5hZGRGaWVsZCh7XG4gKiAgICAgIGlkOiBcImpvYl9udW1iZXJcIixcbiAqICAgICAgX25hbWU6IFwiSm9iIE51bWJlclwiO1xuICogICAgICB0eXBlOiBcInRleHRcIlxuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIEludGVyZmFjZU1hbmFnZXIge1xuXG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuICAgIHByb3RlY3RlZCBuZXN0OiBXZWJob29rTmVzdDtcbiAgICBwcm90ZWN0ZWQgZmllbGRzOiBGaWVsZE9wdGlvbnNbXTtcbiAgICBwcm90ZWN0ZWQgc3RlcHM6IFN0ZXBbXTtcbiAgICBwcm90ZWN0ZWQgaW50ZXJmYWNlSW5zdGFuY2VzOiBXZWJob29rSW50ZXJmYWNlW107XG4gICAgcHJvdGVjdGVkIGhhbmRsZVJlcXVlc3Q6IGFueTtcbiAgICBwcm90ZWN0ZWQgbWV0YWRhdGE6IEludGVyZmFjZU1ldGFkYXRhO1xuICAgIHByb3RlY3RlZCBjaGVja3BvaW50TmVzdDogRm9sZGVyTmVzdDtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGVcbiAgICAgKiBAcGFyYW0gd2ViaG9va05lc3RcbiAgICAgKiBAcGFyYW0gaGFuZGxlUmVxdWVzdCAgICAgT3B0aW9uYWwgY3VzdG9tIHJlcXVlc3QgaGFuZGxlciBmb3Igd2ViaG9va3MuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHdlYmhvb2tOZXN0OiBXZWJob29rTmVzdCwgaGFuZGxlUmVxdWVzdD86IGFueSkge1xuICAgICAgICB0aGlzLmUgPSBlO1xuICAgICAgICB0aGlzLm5lc3QgPSB3ZWJob29rTmVzdDtcbiAgICAgICAgdGhpcy5pbnRlcmZhY2VJbnN0YW5jZXMgPSBbXTtcbiAgICAgICAgdGhpcy5maWVsZHMgPSBbXTtcbiAgICAgICAgdGhpcy5zdGVwcyA9IFtdO1xuICAgICAgICB0aGlzLmhhbmRsZVJlcXVlc3QgPSBoYW5kbGVSZXF1ZXN0O1xuICAgICAgICB0aGlzLmluaXRNZXRhZGF0YSgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBpbml0TWV0YWRhdGEoKSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEgPSB7XG4gICAgICAgICAgICBpbnRlcmZhY2VQcm9wZXJ0aWVzOiBbXVxuICAgICAgICB9IGFzIEludGVyZmFjZU1ldGFkYXRhO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRNZXRhZGF0YSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWV0YWRhdGE7XG4gICAgfVxuXG4gICAgcHVibGljIHNldE1ldGFkYXRhKG1ldGFkYXRhOiBJbnRlcmZhY2VNZXRhZGF0YSkge1xuXG4gICAgICAgIGxldCBjbG9uZWRNZXRhZGF0YSA9IGNsb25lKG1ldGFkYXRhKTtcblxuICAgICAgICBpZiAoXy5oYXMoY2xvbmVkTWV0YWRhdGEsIFwiaW50ZXJmYWNlUHJvcGVydGllc1wiKSAmJiB0eXBlb2YgKGNsb25lZE1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMpICE9PSBcInVuZGVmaW5lZFwiICYmIGNsb25lZE1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbG9uZWRNZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tZXRhZGF0YSA9IGNsb25lZE1ldGFkYXRhO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXREZXNjcmlwdGlvbihkZXNjcmlwdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VG9vbHRpcCh0b29sdGlwOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YS50b29sdGlwID0gdG9vbHRpcDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkSW50ZXJmYWNlUHJvcGVydHkocHJvcGVydHk6IEludGVyZmFjZVByb3BlcnR5KSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcy5wdXNoKHByb3BlcnR5KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0SW50ZXJmYWNlUHJvcGVydGllcyhwcm9wZXJ0aWVzOiBJbnRlcmZhY2VQcm9wZXJ0eVtdKSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcyA9IHByb3BlcnRpZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjdXN0b20gaGFuZGxlUmVxdWVzdCBmdW5jdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRDdXN0b21IYW5kbGVSZXF1ZXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVSZXF1ZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmVzdFxuICAgICAqIEByZXR1cm5zIHtXZWJob29rTmVzdH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TmVzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG5lc3QgX3BhdGguXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmVzdC5nZXRQYXRoKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBpbnRlcmZhY2UgZmllbGQgdG8gdGhlIGludGVyZmFjZS5cbiAgICAgKiBAcGFyYW0ge0ZpZWxkT3B0aW9uc30gZmllbGRcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkRmllbGQoZmllbGQ6IEZpZWxkT3B0aW9ucykge1xuICAgICAgICBsZXQgd2kgPSB0aGlzO1xuXG4gICAgICAgIGxldCBleGlzdGluZ0ZpZWxkID0gXy5maW5kKHdpLmZpZWxkcywgZnVuY3Rpb24oZikgeyByZXR1cm4gZi5pZCA9PT0gZmllbGQuaWQ7IH0pO1xuXG4gICAgICAgIGlmIChleGlzdGluZ0ZpZWxkKSB7XG4gICAgICAgICAgICB3aS5lLmxvZygzLCBgRmllbGQgaWQgXCIke2ZpZWxkLmlkfVwiIGFscmVhZHkgZXhpc3RzLiBJdCBjYW5ub3QgYmUgYWRkZWQgYWdhaW4uYCwgd2kpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5maWVsZHMucHVzaChmaWVsZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbiBhcnJheSBvZiBpbnRlcmZhY2UgZmllbGRzLlxuICAgICAqIEByZXR1cm5zIHtGaWVsZE9wdGlvbnNbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RmllbGRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWVsZHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHVzZXIgaW50ZXJmYWNlIHN0ZXAuXG4gICAgICogQHBhcmFtIHN0ZXBOYW1lXG4gICAgICogQHBhcmFtIGNhbGxiYWNrICAgICAgICAgIFBhcmFtZXRlcnM6IFdlYmhvb2tKb2IsIFdlYmhvb2tJbnRlcmZhY2UsIFN0ZXAsIERvbmUgY2FsbGJhY2tcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqICBtYW5hZ2VyLmFkZFN0ZXAoXCJDaGVjayBqb2IgbnVtYmVyXCIsIGZ1bmN0aW9uKHdlYmhvb2tKb2IsIHdlYmhvb2tJbnRlcmZhY2UsIHN0ZXAsIGRvbmUpe1xuICAgICAqICAgICAgaWYod2ViaG9va0pvYi5nZXRRdWVyeVN0cmluZ1ZhbHVlKFwiam9iX251bWJlclwiKSl7XG4gICAgICogICAgICAgICAgd2ViaG9va0ludGVyZmFjZS5hZGRGaWVsZCh7XG4gICAgICogICAgICAgICAgICAgIGlkOiBcInNvbWV0aGluZ19lbHNlXCIsXG4gICAgICogICAgICAgICAgICAgIF9uYW1lOiBcIlNvbWUgb3RoZXIgZmllbGRcIixcbiAgICAgKiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICogICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoYW5rcyBmb3IgYWRkaW5nIGEgam9iIG51bWJlciFcIlxuICAgICAqICAgICAgICAgIH0pO1xuICAgICAqICAgICAgICAgIHN0ZXAuY29tcGxldGUgPSB0cnVlOyAvLyBNYXJrIHN0ZXAgYXMgY29tcGxldGVcbiAgICAgKiAgICAgICAgICBkb25lKCk7IC8vIENhbGxiYWNrIHRvIGRvIG5leHQgc3RlcCBvciBzZW5kIHJlc3BvbnNlIGlmIGNvbXBsZXRlXG4gICAgICogICAgICB9XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGFkZFN0ZXAoc3RlcE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBsZXQgc3RlcCA9IG5ldyBTdGVwKCk7XG4gICAgICAgIHN0ZXAubmFtZSA9IHN0ZXBOYW1lO1xuICAgICAgICBzdGVwLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHN0ZXAuY29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zdGVwcy5wdXNoKHN0ZXApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBhcnJheSBvZiB1c2VyIGludGVyZmFjZSBzdGVwcy5cbiAgICAgKiBAcmV0dXJucyB7U3RlcFtdfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTdGVwcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RlcHM7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFkZEludGVyZmFjZUluc3RhbmNlKHdpOiBXZWJob29rSW50ZXJmYWNlKSB7XG4gICAgICAgIGxldCBpbSA9IHRoaXM7XG4gICAgICAgIGltLmludGVyZmFjZUluc3RhbmNlcy5wdXNoKHdpKTtcblxuICAgICAgICAvLyBEZXN0cnVjdFxuICAgICAgICBsZXQgc2Vzc2lvbkV4cGlyYXRpb24gPSAoaW0uZS5vcHRpb25zLndlYmhvb2tfaW50ZXJmYWNlX3Nlc3Npb25fdGltZW91dCAqIDYwMDAwKSB8fCAzMDAwMDA7XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpbS5yZW1vdmVJbnRlcmZhY2VJbnN0YW5jZSh3aSk7XG4gICAgICAgIH0sIHNlc3Npb25FeHBpcmF0aW9uKTtcblxuICAgIH1cblxuICAgIHByb3RlY3RlZCByZW1vdmVJbnRlcmZhY2VJbnN0YW5jZSh3aTogV2ViaG9va0ludGVyZmFjZSkge1xuICAgICAgICBsZXQgaW0gPSB0aGlzO1xuICAgICAgICBsZXQgcmVtb3ZlU3VjY2VzcyA9IF8ucmVtb3ZlKHRoaXMuaW50ZXJmYWNlSW5zdGFuY2VzLCAoaSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGkuZ2V0U2Vzc2lvbklkKCkgPT09IHdpLmdldFNlc3Npb25JZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVtb3ZlU3VjY2Vzcykge1xuICAgICAgICAgICAgaW0uZS5sb2coMCwgYFJlbW92ZWQgd2ViaG9vayBpbnRlcmZhY2Ugc2Vzc2lvbiAke3dpLmdldFNlc3Npb25JZCgpfWAsIGltKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGltLmUubG9nKDMsIGBVbmFibGUgdG8gcmVtb3ZlIHdlYmhvb2sgaW50ZXJmYWNlIHNlc3Npb24gJHt3aS5nZXRTZXNzaW9uSWQoKX1gLCBpbSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRmluZCBvciByZXR1cm4gYSBuZXcgd2ViaG9vayBpbnRlcmZhY2UgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHNlc3Npb25JZFxuICAgICAqIEByZXR1cm5zIHtXZWJob29rSW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRJbnRlcmZhY2Uoc2Vzc2lvbklkPzogc3RyaW5nKSB7XG4gICAgICAgIGxldCBpbSA9IHRoaXM7XG4gICAgICAgIGxldCB3aTtcbiAgICAgICAgLy8gRmluZCBpbiB0aGlzLmludGVyZmFjZUluc3RhbmNlc1xuICAgICAgICBpZiAoc2Vzc2lvbklkKSB7XG4gICAgICAgICAgICB3aSA9IF8uZmluZChpbS5pbnRlcmZhY2VJbnN0YW5jZXMsIGZ1bmN0aW9uKGkpIHsgcmV0dXJuIGkuZ2V0U2Vzc2lvbklkKCkgPT09IHNlc3Npb25JZDsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXdpKSB7XG4gICAgICAgICAgICAvLyBNYWtlIG5ldyBpbnRlcmZhY2UgaWYgbm90IGZvdW5kXG4gICAgICAgICAgICB3aSA9IG5ldyBXZWJob29rSW50ZXJmYWNlKGltLmUsIGltLm5lc3QpO1xuXG4gICAgICAgICAgICB3aS5zZXRGaWVsZHMoaW0uZ2V0RmllbGRzKCkpO1xuICAgICAgICAgICAgd2kuc2V0U3RlcHMoaW0uZ2V0U3RlcHMoKSk7XG4gICAgICAgICAgICB3aS5zZXRNZXRhZGF0YShpbS5nZXRNZXRhZGF0YSgpKTtcbiAgICAgICAgICAgIHdpLnNldENoZWNrcG9pbnROZXN0KGltLmNoZWNrcG9pbnROZXN0KTtcblxuICAgICAgICAgICAgaWYgKGltLmludGVyZmFjZUluc3RhbmNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBpbS5lLmFkZFdlYmhvb2tJbnRlcmZhY2UodGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGltLmUubG9nKDAsIGAke2ltLmludGVyZmFjZUluc3RhbmNlcy5sZW5ndGh9IGludGVyZmFjZSBzZXNzaW9ucyBhbHJlYWR5IGV4aXN0LmAsIGltKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGltLmFkZEludGVyZmFjZUluc3RhbmNlKHdpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGltLmUubG9nKDAsIGBSZXN0b3JlZCBpbnRlcmZhY2Ugc2Vzc2lvbiAke3dpLmdldFNlc3Npb25JZCgpfS5gLCBpbSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gd2k7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBwZW5kaW5nIGpvYnMgdG8gdGhlIGludGVyZmFjZXMgam9iIGxpc3QuXG4gICAgICogQHBhcmFtIG5lc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgY2hlY2tOZXN0KG5lc3Q6IEZvbGRlck5lc3QpIHtcbiAgICAgICAgdGhpcy5jaGVja3BvaW50TmVzdCA9IG5lc3Q7XG4gICAgICAgIG5lc3Qud2F0Y2hIb2xkKCk7XG4gICAgfVxufSJdfQ==
