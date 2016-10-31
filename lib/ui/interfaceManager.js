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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS9pbnRlcmZhY2VNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxpQ0FBK0Isb0JBQW9CLENBQUMsQ0FBQTtBQUdwRCxxQkFBbUIsUUFBUSxDQUFDLENBQUE7QUFLNUIsSUFBUSxDQUFDLEdBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUMvQixLQUFLLEdBQVMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXZDOzs7Ozs7Ozs7Ozs7R0FZRztBQUNIO0lBV0k7Ozs7O09BS0c7SUFDSCwwQkFBWSxDQUFjLEVBQUUsV0FBd0IsRUFBRSxhQUFtQjtRQUNyRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFUyx1Q0FBWSxHQUF0QjtRQUNJLElBQUksQ0FBQyxRQUFRLEdBQUc7WUFDWixtQkFBbUIsRUFBRSxFQUFFO1NBQ0wsQ0FBQztJQUMzQixDQUFDO0lBRU0sc0NBQVcsR0FBbEI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBRU0sc0NBQVcsR0FBbEIsVUFBbUIsUUFBMkI7UUFFMUMsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXJDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLFdBQVcsSUFBSSxjQUFjLENB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LENBQUM7SUFFRDs7O09BR0c7SUFDSSxvQ0FBUyxHQUFoQixVQUFpQixJQUFnQjtRQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztRQUMzQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0ExTkEsQUEwTkMsSUFBQTtBQTFOWSx3QkFBZ0IsbUJBME41QixDQUFBIiwiZmlsZSI6ImxpYi91aS9pbnRlcmZhY2VNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtXZWJob29rTmVzdH0gZnJvbSBcIi4uL25lc3Qvd2ViaG9va05lc3RcIjtcbmltcG9ydCB7V2ViaG9va0ludGVyZmFjZX0gZnJvbSBcIi4vd2ViaG9va0ludGVyZmFjZVwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0ZpZWxkT3B0aW9uc30gZnJvbSBcIi4vZmllbGRcIjtcbmltcG9ydCB7U3RlcH0gZnJvbSBcIi4vc3RlcFwiO1xuaW1wb3J0IHtJbnRlcmZhY2VNZXRhZGF0YX0gZnJvbSBcIi4vaW50ZXJmYWNlTWV0YWRhdGFcIjtcbmltcG9ydCB7SW50ZXJmYWNlUHJvcGVydHl9IGZyb20gXCIuL0ludGVyZmFjZVByb3BlcnR5XCI7XG5pbXBvcnQge0ZvbGRlck5lc3R9IGZyb20gXCIuLi9uZXN0L2ZvbGRlck5lc3RcIjtcblxuY29uc3QgICBfICAgICAgICAgICA9IHJlcXVpcmUoXCJsb2Rhc2hcIiksXG4gICAgICAgIGNsb25lICAgICAgID0gcmVxdWlyZShcImNsb25lXCIpO1xuXG4vKipcbiAqIFRoZSBpbnRlcmZhY2UgbWFuYWdlciBhbGxvd3MgeW91IHRvIHNlcGFyYXRlIHlvdXIgaW50ZXJmYWNlIGZpZWxkcyBmb3Igc3RlcHBlZCB1c2VyIGludGVyZmFjZXMuXG4gKiBJdCdzIGEgZmFjdG9yeSB0aGF0IGhhbmRsZXMgdGhlIGNvbnN0cnVjdGlvbiBhbmQgc2Vzc2lvbiBoYW5kbGluZyBvZiBXZWJob29rSW50ZXJmYWNlIGluc3RhbmNlcy5cbiAqICMjIyMgRXhhbXBsZVxuICogYGBganNcbiAqIHZhciBtYW5hZ2VyID0gd2ViaG9vay5nZXRJbnRlcmZhY2VNYW5hZ2VyKCk7XG4gKiBtYW5hZ2VyLmFkZEZpZWxkKHtcbiAqICAgICAgaWQ6IFwiam9iX251bWJlclwiLFxuICogICAgICBfbmFtZTogXCJKb2IgTnVtYmVyXCI7XG4gKiAgICAgIHR5cGU6IFwidGV4dFwiXG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgSW50ZXJmYWNlTWFuYWdlciB7XG5cbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG4gICAgcHJvdGVjdGVkIG5lc3Q6IFdlYmhvb2tOZXN0O1xuICAgIHByb3RlY3RlZCBmaWVsZHM6IEZpZWxkT3B0aW9uc1tdO1xuICAgIHByb3RlY3RlZCBzdGVwczogU3RlcFtdO1xuICAgIHByb3RlY3RlZCBpbnRlcmZhY2VJbnN0YW5jZXM6IFdlYmhvb2tJbnRlcmZhY2VbXTtcbiAgICBwcm90ZWN0ZWQgaGFuZGxlUmVxdWVzdDogYW55O1xuICAgIHByb3RlY3RlZCBtZXRhZGF0YTogSW50ZXJmYWNlTWV0YWRhdGE7XG4gICAgcHJvdGVjdGVkIGNoZWNrcG9pbnROZXN0OiBGb2xkZXJOZXN0O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSB3ZWJob29rTmVzdFxuICAgICAqIEBwYXJhbSBoYW5kbGVSZXF1ZXN0ICAgICBPcHRpb25hbCBjdXN0b20gcmVxdWVzdCBoYW5kbGVyIGZvciB3ZWJob29rcy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgd2ViaG9va05lc3Q6IFdlYmhvb2tOZXN0LCBoYW5kbGVSZXF1ZXN0PzogYW55KSB7XG4gICAgICAgIHRoaXMuZSA9IGU7XG4gICAgICAgIHRoaXMubmVzdCA9IHdlYmhvb2tOZXN0O1xuICAgICAgICB0aGlzLmludGVyZmFjZUluc3RhbmNlcyA9IFtdO1xuICAgICAgICB0aGlzLmZpZWxkcyA9IFtdO1xuICAgICAgICB0aGlzLnN0ZXBzID0gW107XG4gICAgICAgIHRoaXMuaGFuZGxlUmVxdWVzdCA9IGhhbmRsZVJlcXVlc3Q7XG4gICAgICAgIHRoaXMuaW5pdE1ldGFkYXRhKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGluaXRNZXRhZGF0YSgpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YSA9IHtcbiAgICAgICAgICAgIGludGVyZmFjZVByb3BlcnRpZXM6IFtdXG4gICAgICAgIH0gYXMgSW50ZXJmYWNlTWV0YWRhdGE7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE1ldGFkYXRhKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXRhZGF0YTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0TWV0YWRhdGEobWV0YWRhdGE6IEludGVyZmFjZU1ldGFkYXRhKSB7XG5cbiAgICAgICAgbGV0IGNsb25lZE1ldGFkYXRhID0gY2xvbmUobWV0YWRhdGEpO1xuXG4gICAgICAgIGlmIChfLmhhcyhjbG9uZWRNZXRhZGF0YSwgXCJpbnRlcmZhY2VQcm9wZXJ0aWVzXCIpICYmIHR5cGVvZiAoY2xvbmVkTWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcykgIT09IFwidW5kZWZpbmVkXCIgJiYgY2xvbmVkTWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsb25lZE1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1ldGFkYXRhID0gY2xvbmVkTWV0YWRhdGE7XG4gICAgfVxuXG4gICAgcHVibGljIHNldERlc2NyaXB0aW9uKGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YS5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRUb29sdGlwKHRvb2x0aXA6IHN0cmluZykge1xuICAgICAgICB0aGlzLm1ldGFkYXRhLnRvb2x0aXAgPSB0b29sdGlwO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRJbnRlcmZhY2VQcm9wZXJ0eShwcm9wZXJ0eTogSW50ZXJmYWNlUHJvcGVydHkpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzLnB1c2gocHJvcGVydHkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJbnRlcmZhY2VQcm9wZXJ0aWVzKHByb3BlcnRpZXM6IEludGVyZmFjZVByb3BlcnR5W10pIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzID0gcHJvcGVydGllcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1c3RvbSBoYW5kbGVSZXF1ZXN0IGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIGdldEN1c3RvbUhhbmRsZVJlcXVlc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVJlcXVlc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuZXN0XG4gICAgICogQHJldHVybnMge1dlYmhvb2tOZXN0fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROZXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmVzdCBfcGF0aC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXN0LmdldFBhdGgoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIGludGVyZmFjZSBmaWVsZCB0byB0aGUgaW50ZXJmYWNlLlxuICAgICAqIEBwYXJhbSB7RmllbGRPcHRpb25zfSBmaWVsZFxuICAgICAqL1xuICAgIHB1YmxpYyBhZGRGaWVsZChmaWVsZDogRmllbGRPcHRpb25zKSB7XG4gICAgICAgIGxldCB3aSA9IHRoaXM7XG5cbiAgICAgICAgbGV0IGV4aXN0aW5nRmllbGQgPSBfLmZpbmQod2kuZmllbGRzLCBmdW5jdGlvbihmKSB7IHJldHVybiBmLmlkID09PSBmaWVsZC5pZDsgfSk7XG5cbiAgICAgICAgaWYgKGV4aXN0aW5nRmllbGQpIHtcbiAgICAgICAgICAgIHdpLmUubG9nKDMsIGBGaWVsZCBpZCBcIiR7ZmllbGQuaWR9XCIgYWxyZWFkeSBleGlzdHMuIEl0IGNhbm5vdCBiZSBhZGRlZCBhZ2Fpbi5gLCB3aSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZpZWxkcy5wdXNoKGZpZWxkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGFuIGFycmF5IG9mIGludGVyZmFjZSBmaWVsZHMuXG4gICAgICogQHJldHVybnMge0ZpZWxkT3B0aW9uc1tdfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRGaWVsZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpZWxkcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdXNlciBpbnRlcmZhY2Ugc3RlcC5cbiAgICAgKiBAcGFyYW0gc3RlcE5hbWVcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgICAgICAgICAgUGFyYW1ldGVyczogV2ViaG9va0pvYiwgV2ViaG9va0ludGVyZmFjZSwgU3RlcCwgRG9uZSBjYWxsYmFja1xuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogIG1hbmFnZXIuYWRkU3RlcChcIkNoZWNrIGpvYiBudW1iZXJcIiwgZnVuY3Rpb24od2ViaG9va0pvYiwgd2ViaG9va0ludGVyZmFjZSwgc3RlcCwgZG9uZSl7XG4gICAgICogICAgICBpZih3ZWJob29rSm9iLmdldFF1ZXJ5U3RyaW5nVmFsdWUoXCJqb2JfbnVtYmVyXCIpKXtcbiAgICAgKiAgICAgICAgICB3ZWJob29rSW50ZXJmYWNlLmFkZEZpZWxkKHtcbiAgICAgKiAgICAgICAgICAgICAgaWQ6IFwic29tZXRoaW5nX2Vsc2VcIixcbiAgICAgKiAgICAgICAgICAgICAgX25hbWU6IFwiU29tZSBvdGhlciBmaWVsZFwiLFxuICAgICAqICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgKiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhhbmtzIGZvciBhZGRpbmcgYSBqb2IgbnVtYmVyIVwiXG4gICAgICogICAgICAgICAgfSk7XG4gICAgICogICAgICAgICAgc3RlcC5jb21wbGV0ZSA9IHRydWU7IC8vIE1hcmsgc3RlcCBhcyBjb21wbGV0ZVxuICAgICAqICAgICAgICAgIGRvbmUoKTsgLy8gQ2FsbGJhY2sgdG8gZG8gbmV4dCBzdGVwIG9yIHNlbmQgcmVzcG9uc2UgaWYgY29tcGxldGVcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkU3RlcChzdGVwTmFtZTogc3RyaW5nLCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIGxldCBzdGVwID0gbmV3IFN0ZXAoKTtcbiAgICAgICAgc3RlcC5uYW1lID0gc3RlcE5hbWU7XG4gICAgICAgIHN0ZXAuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgc3RlcC5jb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnN0ZXBzLnB1c2goc3RlcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIGFycmF5IG9mIHVzZXIgaW50ZXJmYWNlIHN0ZXBzLlxuICAgICAqIEByZXR1cm5zIHtTdGVwW119XG4gICAgICovXG4gICAgcHVibGljIGdldFN0ZXBzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGVwcztcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWRkSW50ZXJmYWNlSW5zdGFuY2Uod2k6IFdlYmhvb2tJbnRlcmZhY2UpIHtcbiAgICAgICAgbGV0IGltID0gdGhpcztcbiAgICAgICAgaW0uaW50ZXJmYWNlSW5zdGFuY2VzLnB1c2god2kpO1xuXG4gICAgICAgIC8vIERlc3RydWN0XG4gICAgICAgIGxldCBzZXNzaW9uRXhwaXJhdGlvbiA9IChpbS5lLmdldE9wdGlvbnMoKS53ZWJob29rX2ludGVyZmFjZV9zZXNzaW9uX3RpbWVvdXQgKiA2MDAwMCkgfHwgMzAwMDAwO1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaW0ucmVtb3ZlSW50ZXJmYWNlSW5zdGFuY2Uod2kpO1xuICAgICAgICB9LCBzZXNzaW9uRXhwaXJhdGlvbik7XG5cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcmVtb3ZlSW50ZXJmYWNlSW5zdGFuY2Uod2k6IFdlYmhvb2tJbnRlcmZhY2UpIHtcbiAgICAgICAgbGV0IGltID0gdGhpcztcbiAgICAgICAgbGV0IHJlbW92ZVN1Y2Nlc3MgPSBfLnJlbW92ZSh0aGlzLmludGVyZmFjZUluc3RhbmNlcywgKGkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBpLmdldFNlc3Npb25JZCgpID09PSB3aS5nZXRTZXNzaW9uSWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHJlbW92ZVN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGltLmUubG9nKDAsIGBSZW1vdmVkIHdlYmhvb2sgaW50ZXJmYWNlIHNlc3Npb24gJHt3aS5nZXRTZXNzaW9uSWQoKX1gLCBpbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbS5lLmxvZygzLCBgVW5hYmxlIHRvIHJlbW92ZSB3ZWJob29rIGludGVyZmFjZSBzZXNzaW9uICR7d2kuZ2V0U2Vzc2lvbklkKCl9YCwgaW0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZpbmQgb3IgcmV0dXJuIGEgbmV3IHdlYmhvb2sgaW50ZXJmYWNlIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSBzZXNzaW9uSWRcbiAgICAgKiBAcmV0dXJucyB7V2ViaG9va0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SW50ZXJmYWNlKHNlc3Npb25JZD86IHN0cmluZykge1xuICAgICAgICBsZXQgaW0gPSB0aGlzO1xuICAgICAgICBsZXQgd2k7XG4gICAgICAgIC8vIEZpbmQgaW4gdGhpcy5pbnRlcmZhY2VJbnN0YW5jZXNcbiAgICAgICAgaWYgKHNlc3Npb25JZCkge1xuICAgICAgICAgICAgd2kgPSBfLmZpbmQoaW0uaW50ZXJmYWNlSW5zdGFuY2VzLCBmdW5jdGlvbihpKSB7IHJldHVybiBpLmdldFNlc3Npb25JZCgpID09PSBzZXNzaW9uSWQ7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF3aSkge1xuICAgICAgICAgICAgLy8gTWFrZSBuZXcgaW50ZXJmYWNlIGlmIG5vdCBmb3VuZFxuICAgICAgICAgICAgd2kgPSBuZXcgV2ViaG9va0ludGVyZmFjZShpbS5lLCBpbS5uZXN0KTtcblxuICAgICAgICAgICAgd2kuc2V0RmllbGRzKGltLmdldEZpZWxkcygpKTtcbiAgICAgICAgICAgIHdpLnNldFN0ZXBzKGltLmdldFN0ZXBzKCkpO1xuICAgICAgICAgICAgd2kuc2V0TWV0YWRhdGEoaW0uZ2V0TWV0YWRhdGEoKSk7XG4gICAgICAgICAgICB3aS5zZXRDaGVja3BvaW50TmVzdChpbS5jaGVja3BvaW50TmVzdCk7XG5cbiAgICAgICAgICAgIGlmIChpbS5pbnRlcmZhY2VJbnN0YW5jZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaW0uZS5hZGRXZWJob29rSW50ZXJmYWNlKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbS5lLmxvZygwLCBgJHtpbS5pbnRlcmZhY2VJbnN0YW5jZXMubGVuZ3RofSBpbnRlcmZhY2Ugc2Vzc2lvbnMgYWxyZWFkeSBleGlzdC5gLCBpbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbS5hZGRJbnRlcmZhY2VJbnN0YW5jZSh3aSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbS5lLmxvZygwLCBgUmVzdG9yZWQgaW50ZXJmYWNlIHNlc3Npb24gJHt3aS5nZXRTZXNzaW9uSWQoKX0uYCwgaW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHdpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgcGVuZGluZyBqb2JzIHRvIHRoZSBpbnRlcmZhY2VzIGpvYiBsaXN0LlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHVibGljIGNoZWNrTmVzdChuZXN0OiBGb2xkZXJOZXN0KSB7XG4gICAgICAgIHRoaXMuY2hlY2twb2ludE5lc3QgPSBuZXN0O1xuICAgICAgICBuZXN0LndhdGNoSG9sZCgpO1xuICAgIH1cbn0iXX0=
