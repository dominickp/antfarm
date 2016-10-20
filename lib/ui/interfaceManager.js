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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS9pbnRlcmZhY2VNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxpQ0FBK0Isb0JBQW9CLENBQUMsQ0FBQTtBQUdwRCxxQkFBbUIsUUFBUSxDQUFDLENBQUE7QUFLNUIsSUFBUSxDQUFDLEdBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUMvQixLQUFLLEdBQVMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXZDOzs7Ozs7Ozs7Ozs7R0FZRztBQUNIO0lBV0k7Ozs7O09BS0c7SUFDSCwwQkFBWSxDQUFjLEVBQUUsV0FBd0IsRUFBRSxhQUFtQjtRQUNyRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFUyx1Q0FBWSxHQUF0QjtRQUNJLElBQUksQ0FBQyxRQUFRLEdBQUc7WUFDWixtQkFBbUIsRUFBRSxFQUFFO1NBQ0wsQ0FBQztJQUMzQixDQUFDO0lBRU0sc0NBQVcsR0FBbEI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBRU0sc0NBQVcsR0FBbEIsVUFBbUIsUUFBMkI7UUFFMUMsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXJDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLFdBQVcsSUFBSSxjQUFjLENB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LENBQUM7SUFFRDs7O09BR0c7SUFDSSxvQ0FBUyxHQUFoQixVQUFpQixJQUFnQjtRQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztRQUMzQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0ExTkEsQUEwTkMsSUFBQTtBQTFOWSx3QkFBZ0IsbUJBME41QixDQUFBIiwiZmlsZSI6ImxpYi91aS9pbnRlcmZhY2VNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtXZWJob29rTmVzdH0gZnJvbSBcIi4uL25lc3Qvd2ViaG9va05lc3RcIjtcbmltcG9ydCB7V2ViaG9va0ludGVyZmFjZX0gZnJvbSBcIi4vd2ViaG9va0ludGVyZmFjZVwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0ZpZWxkT3B0aW9uc30gZnJvbSBcIi4vZmllbGRcIjtcbmltcG9ydCB7U3RlcH0gZnJvbSBcIi4vc3RlcFwiO1xuaW1wb3J0IHtJbnRlcmZhY2VNZXRhZGF0YX0gZnJvbSBcIi4vaW50ZXJmYWNlTWV0YWRhdGFcIjtcbmltcG9ydCB7SW50ZXJmYWNlUHJvcGVydHl9IGZyb20gXCIuL0ludGVyZmFjZVByb3BlcnR5XCI7XG5pbXBvcnQge0ZvbGRlck5lc3R9IGZyb20gXCIuLi9uZXN0L2ZvbGRlck5lc3RcIjtcblxuY29uc3QgICBfICAgICAgICAgICA9IHJlcXVpcmUoXCJsb2Rhc2hcIiksXG4gICAgICAgIGNsb25lICAgICAgID0gcmVxdWlyZShcImNsb25lXCIpO1xuXG4vKipcbiAqIFRoZSBpbnRlcmZhY2UgbWFuYWdlciBhbGxvd3MgeW91IHRvIHNlcGFyYXRlIHlvdXIgaW50ZXJmYWNlIGZpZWxkcyBmb3Igc3RlcHBlZCB1c2VyIGludGVyZmFjZXMuXG4gKiBJdCdzIGEgZmFjdG9yeSB0aGF0IGhhbmRsZXMgdGhlIGNvbnN0cnVjdGlvbiBhbmQgc2Vzc2lvbiBoYW5kbGluZyBvZiBXZWJob29rSW50ZXJmYWNlIGluc3RhbmNlcy5cbiAqICMjIyMgRXhhbXBsZVxuICogYGBganNcbiAqIHZhciBtYW5hZ2VyID0gd2ViaG9vay5nZXRJbnRlcmZhY2VNYW5hZ2VyKCk7XG4gKiBtYW5hZ2VyLmFkZEZpZWxkKHtcbiAqICAgICAgaWQ6IFwiam9iX251bWJlclwiLFxuICogICAgICBuYW1lOiBcIkpvYiBOdW1iZXJcIjtcbiAqICAgICAgdHlwZTogXCJ0ZXh0XCJcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnRlcmZhY2VNYW5hZ2VyIHtcblxuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcbiAgICBwcm90ZWN0ZWQgbmVzdDogV2ViaG9va05lc3Q7XG4gICAgcHJvdGVjdGVkIGZpZWxkczogRmllbGRPcHRpb25zW107XG4gICAgcHJvdGVjdGVkIHN0ZXBzOiBTdGVwW107XG4gICAgcHJvdGVjdGVkIGludGVyZmFjZUluc3RhbmNlczogV2ViaG9va0ludGVyZmFjZVtdO1xuICAgIHByb3RlY3RlZCBoYW5kbGVSZXF1ZXN0OiBhbnk7XG4gICAgcHJvdGVjdGVkIG1ldGFkYXRhOiBJbnRlcmZhY2VNZXRhZGF0YTtcbiAgICBwcm90ZWN0ZWQgY2hlY2twb2ludE5lc3Q6IEZvbGRlck5lc3Q7XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIHdlYmhvb2tOZXN0XG4gICAgICogQHBhcmFtIGhhbmRsZVJlcXVlc3QgICAgIE9wdGlvbmFsIGN1c3RvbSByZXF1ZXN0IGhhbmRsZXIgZm9yIHdlYmhvb2tzLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCB3ZWJob29rTmVzdDogV2ViaG9va05lc3QsIGhhbmRsZVJlcXVlc3Q/OiBhbnkpIHtcbiAgICAgICAgdGhpcy5lID0gZTtcbiAgICAgICAgdGhpcy5uZXN0ID0gd2ViaG9va05lc3Q7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlSW5zdGFuY2VzID0gW107XG4gICAgICAgIHRoaXMuZmllbGRzID0gW107XG4gICAgICAgIHRoaXMuc3RlcHMgPSBbXTtcbiAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0ID0gaGFuZGxlUmVxdWVzdDtcbiAgICAgICAgdGhpcy5pbml0TWV0YWRhdGEoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaW5pdE1ldGFkYXRhKCkge1xuICAgICAgICB0aGlzLm1ldGFkYXRhID0ge1xuICAgICAgICAgICAgaW50ZXJmYWNlUHJvcGVydGllczogW11cbiAgICAgICAgfSBhcyBJbnRlcmZhY2VNZXRhZGF0YTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TWV0YWRhdGEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ldGFkYXRhO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRNZXRhZGF0YShtZXRhZGF0YTogSW50ZXJmYWNlTWV0YWRhdGEpIHtcblxuICAgICAgICBsZXQgY2xvbmVkTWV0YWRhdGEgPSBjbG9uZShtZXRhZGF0YSk7XG5cbiAgICAgICAgaWYgKF8uaGFzKGNsb25lZE1ldGFkYXRhLCBcImludGVyZmFjZVByb3BlcnRpZXNcIikgJiYgdHlwZW9mIChjbG9uZWRNZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzKSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjbG9uZWRNZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xvbmVkTWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWV0YWRhdGEgPSBjbG9uZWRNZXRhZGF0YTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0RGVzY3JpcHRpb24oZGVzY3JpcHRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLm1ldGFkYXRhLmRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG4gICAgfVxuXG4gICAgcHVibGljIHNldFRvb2x0aXAodG9vbHRpcDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEudG9vbHRpcCA9IHRvb2x0aXA7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEludGVyZmFjZVByb3BlcnR5KHByb3BlcnR5OiBJbnRlcmZhY2VQcm9wZXJ0eSkge1xuICAgICAgICB0aGlzLm1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMucHVzaChwcm9wZXJ0eSk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldEludGVyZmFjZVByb3BlcnRpZXMocHJvcGVydGllczogSW50ZXJmYWNlUHJvcGVydHlbXSkge1xuICAgICAgICB0aGlzLm1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY3VzdG9tIGhhbmRsZVJlcXVlc3QgZnVuY3Rpb24uXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q3VzdG9tSGFuZGxlUmVxdWVzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlUmVxdWVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG5lc3RcbiAgICAgKiBAcmV0dXJucyB7V2ViaG9va05lc3R9XG4gICAgICovXG4gICAgcHVibGljIGdldE5lc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5lc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuZXN0IHBhdGguXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmVzdC5nZXRQYXRoKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBpbnRlcmZhY2UgZmllbGQgdG8gdGhlIGludGVyZmFjZS5cbiAgICAgKiBAcGFyYW0ge0ZpZWxkT3B0aW9uc30gZmllbGRcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkRmllbGQoZmllbGQ6IEZpZWxkT3B0aW9ucykge1xuICAgICAgICBsZXQgd2kgPSB0aGlzO1xuXG4gICAgICAgIGxldCBleGlzdGluZ0ZpZWxkID0gXy5maW5kKHdpLmZpZWxkcywgZnVuY3Rpb24oZikgeyByZXR1cm4gZi5pZCA9PT0gZmllbGQuaWQ7IH0pO1xuXG4gICAgICAgIGlmIChleGlzdGluZ0ZpZWxkKSB7XG4gICAgICAgICAgICB3aS5lLmxvZygzLCBgRmllbGQgaWQgXCIke2ZpZWxkLmlkfVwiIGFscmVhZHkgZXhpc3RzLiBJdCBjYW5ub3QgYmUgYWRkZWQgYWdhaW4uYCwgd2kpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5maWVsZHMucHVzaChmaWVsZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbiBhcnJheSBvZiBpbnRlcmZhY2UgZmllbGRzLlxuICAgICAqIEByZXR1cm5zIHtGaWVsZE9wdGlvbnNbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RmllbGRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWVsZHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHVzZXIgaW50ZXJmYWNlIHN0ZXAuXG4gICAgICogQHBhcmFtIHN0ZXBOYW1lXG4gICAgICogQHBhcmFtIGNhbGxiYWNrICAgICAgICAgIFBhcmFtZXRlcnM6IFdlYmhvb2tKb2IsIFdlYmhvb2tJbnRlcmZhY2UsIFN0ZXAsIERvbmUgY2FsbGJhY2tcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqICBtYW5hZ2VyLmFkZFN0ZXAoXCJDaGVjayBqb2IgbnVtYmVyXCIsIGZ1bmN0aW9uKHdlYmhvb2tKb2IsIHdlYmhvb2tJbnRlcmZhY2UsIHN0ZXAsIGRvbmUpe1xuICAgICAqICAgICAgaWYod2ViaG9va0pvYi5nZXRRdWVyeVN0cmluZ1ZhbHVlKFwiam9iX251bWJlclwiKSl7XG4gICAgICogICAgICAgICAgd2ViaG9va0ludGVyZmFjZS5hZGRGaWVsZCh7XG4gICAgICogICAgICAgICAgICAgIGlkOiBcInNvbWV0aGluZ19lbHNlXCIsXG4gICAgICogICAgICAgICAgICAgIG5hbWU6IFwiU29tZSBvdGhlciBmaWVsZFwiLFxuICAgICAqICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgKiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhhbmtzIGZvciBhZGRpbmcgYSBqb2IgbnVtYmVyIVwiXG4gICAgICogICAgICAgICAgfSk7XG4gICAgICogICAgICAgICAgc3RlcC5jb21wbGV0ZSA9IHRydWU7IC8vIE1hcmsgc3RlcCBhcyBjb21wbGV0ZVxuICAgICAqICAgICAgICAgIGRvbmUoKTsgLy8gQ2FsbGJhY2sgdG8gZG8gbmV4dCBzdGVwIG9yIHNlbmQgcmVzcG9uc2UgaWYgY29tcGxldGVcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkU3RlcChzdGVwTmFtZTogc3RyaW5nLCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIGxldCBzdGVwID0gbmV3IFN0ZXAoKTtcbiAgICAgICAgc3RlcC5uYW1lID0gc3RlcE5hbWU7XG4gICAgICAgIHN0ZXAuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgc3RlcC5jb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnN0ZXBzLnB1c2goc3RlcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIGFycmF5IG9mIHVzZXIgaW50ZXJmYWNlIHN0ZXBzLlxuICAgICAqIEByZXR1cm5zIHtTdGVwW119XG4gICAgICovXG4gICAgcHVibGljIGdldFN0ZXBzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGVwcztcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWRkSW50ZXJmYWNlSW5zdGFuY2Uod2k6IFdlYmhvb2tJbnRlcmZhY2UpIHtcbiAgICAgICAgbGV0IGltID0gdGhpcztcbiAgICAgICAgaW0uaW50ZXJmYWNlSW5zdGFuY2VzLnB1c2god2kpO1xuXG4gICAgICAgIC8vIERlc3RydWN0XG4gICAgICAgIGxldCBzZXNzaW9uRXhwaXJhdGlvbiA9IChpbS5lLmdldE9wdGlvbnMoKS53ZWJob29rX2ludGVyZmFjZV9zZXNzaW9uX3RpbWVvdXQgKiA2MDAwMCkgfHwgMzAwMDAwO1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaW0ucmVtb3ZlSW50ZXJmYWNlSW5zdGFuY2Uod2kpO1xuICAgICAgICB9LCBzZXNzaW9uRXhwaXJhdGlvbik7XG5cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcmVtb3ZlSW50ZXJmYWNlSW5zdGFuY2Uod2k6IFdlYmhvb2tJbnRlcmZhY2UpIHtcbiAgICAgICAgbGV0IGltID0gdGhpcztcbiAgICAgICAgbGV0IHJlbW92ZVN1Y2Nlc3MgPSBfLnJlbW92ZSh0aGlzLmludGVyZmFjZUluc3RhbmNlcywgKGkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBpLmdldFNlc3Npb25JZCgpID09PSB3aS5nZXRTZXNzaW9uSWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHJlbW92ZVN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGltLmUubG9nKDAsIGBSZW1vdmVkIHdlYmhvb2sgaW50ZXJmYWNlIHNlc3Npb24gJHt3aS5nZXRTZXNzaW9uSWQoKX1gLCBpbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbS5lLmxvZygzLCBgVW5hYmxlIHRvIHJlbW92ZSB3ZWJob29rIGludGVyZmFjZSBzZXNzaW9uICR7d2kuZ2V0U2Vzc2lvbklkKCl9YCwgaW0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZpbmQgb3IgcmV0dXJuIGEgbmV3IHdlYmhvb2sgaW50ZXJmYWNlIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSBzZXNzaW9uSWRcbiAgICAgKiBAcmV0dXJucyB7V2ViaG9va0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SW50ZXJmYWNlKHNlc3Npb25JZD86IHN0cmluZykge1xuICAgICAgICBsZXQgaW0gPSB0aGlzO1xuICAgICAgICBsZXQgd2k7XG4gICAgICAgIC8vIEZpbmQgaW4gdGhpcy5pbnRlcmZhY2VJbnN0YW5jZXNcbiAgICAgICAgaWYgKHNlc3Npb25JZCkge1xuICAgICAgICAgICAgd2kgPSBfLmZpbmQoaW0uaW50ZXJmYWNlSW5zdGFuY2VzLCBmdW5jdGlvbihpKSB7IHJldHVybiBpLmdldFNlc3Npb25JZCgpID09PSBzZXNzaW9uSWQ7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF3aSkge1xuICAgICAgICAgICAgLy8gTWFrZSBuZXcgaW50ZXJmYWNlIGlmIG5vdCBmb3VuZFxuICAgICAgICAgICAgd2kgPSBuZXcgV2ViaG9va0ludGVyZmFjZShpbS5lLCBpbS5uZXN0KTtcblxuICAgICAgICAgICAgd2kuc2V0RmllbGRzKGltLmdldEZpZWxkcygpKTtcbiAgICAgICAgICAgIHdpLnNldFN0ZXBzKGltLmdldFN0ZXBzKCkpO1xuICAgICAgICAgICAgd2kuc2V0TWV0YWRhdGEoaW0uZ2V0TWV0YWRhdGEoKSk7XG4gICAgICAgICAgICB3aS5zZXRDaGVja3BvaW50TmVzdChpbS5jaGVja3BvaW50TmVzdCk7XG5cbiAgICAgICAgICAgIGlmIChpbS5pbnRlcmZhY2VJbnN0YW5jZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaW0uZS5hZGRXZWJob29rSW50ZXJmYWNlKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbS5lLmxvZygwLCBgJHtpbS5pbnRlcmZhY2VJbnN0YW5jZXMubGVuZ3RofSBpbnRlcmZhY2Ugc2Vzc2lvbnMgYWxyZWFkeSBleGlzdC5gLCBpbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbS5hZGRJbnRlcmZhY2VJbnN0YW5jZSh3aSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbS5lLmxvZygwLCBgUmVzdG9yZWQgaW50ZXJmYWNlIHNlc3Npb24gJHt3aS5nZXRTZXNzaW9uSWQoKX0uYCwgaW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHdpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgcGVuZGluZyBqb2JzIHRvIHRoZSBpbnRlcmZhY2VzIGpvYiBsaXN0LlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHVibGljIGNoZWNrTmVzdChuZXN0OiBGb2xkZXJOZXN0KSB7XG4gICAgICAgIHRoaXMuY2hlY2twb2ludE5lc3QgPSBuZXN0O1xuICAgICAgICBuZXN0LndhdGNoSG9sZCgpO1xuICAgIH1cbn0iXX0=
