"use strict";
var step_1 = require("./step");
var shortid = require("shortid"), _ = require("lodash"), clone = require("clone");
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
 *              _name: "Some other field",
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
        this.initMetadata();
    }
    WebhookInterface.prototype.initMetadata = function () {
        this.metadata = {
            interfaceProperties: []
        };
    };
    WebhookInterface.prototype.getMetadata = function () {
        return this.metadata;
    };
    /**
     * Sets a cloned instance of metadata.
     * @param metadata
     */
    WebhookInterface.prototype.setMetadata = function (metadata) {
        var clonedMetadata = clone(metadata);
        // let clonedMetadata = _.clone(metadata) as InterfaceMetadata;
        if (_.has(clonedMetadata, "interfaceProperties") && clonedMetadata.interfaceProperties.constructor === Array) {
        }
        else {
            clonedMetadata.interfaceProperties = [];
        }
        this.metadata = clonedMetadata;
    };
    WebhookInterface.prototype.setDescription = function (description) {
        this.metadata.description = description;
    };
    WebhookInterface.prototype.setTooltip = function (tooltip) {
        this.metadata.tooltip = tooltip;
    };
    WebhookInterface.prototype.addInterfaceProperty = function (property) {
        this.metadata.interfaceProperties.push(clone(property));
    };
    WebhookInterface.prototype.setInterfaceProperties = function (properties) {
        this.metadata.interfaceProperties = clone(properties);
    };
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
     * Get an existing field from the interface to modify its properties.
     * @param fieldId
     * @returns {FieldOptions}
     * #### Example
     * ```js
     * im.addStep("Check job number", function(webhookJob, webhookInterface, step, done) {
     *      if(webhookJob.getParameter("job_number").length == 6) {
     *          // Make job number read only
     *          var jobNumberField = webhookInterface.getField("job_number");
     *          jobNumberField.readonly = true;
     *          // Complete step
     *          webhookInterface.completeStep(step);
     *      } else {
     *          step.failure = "Job number was not 6 characters.";
     *      }
     *      done();
     * });
     * ```
     */
    WebhookInterface.prototype.getField = function (fieldId) {
        var wi = this;
        return _.find(wi.fields, function (f) { return f.id === fieldId; });
    };
    /**
     * Overwrites fields with a clone.
     * @param fields
     */
    WebhookInterface.prototype.setFields = function (fields) {
        this.fields = clone(fields);
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
        var wi = this;
        var jobs = wi.getJobs();
        var jobsArray = [];
        jobs.forEach(function (job) {
            jobsArray.push({
                id: job.id,
                name: job.name,
                path: job.path
            });
        });
        return {
            sessionId: wi.sessionId,
            fields: wi.fields,
            heldJobs: jobsArray,
            steps: wi.getSteps(),
            metadata: wi.getMetadata()
        };
    };
    /**
     * Returns checked jobs.
     * @returns {(FileJob|FolderJob)[]}
     */
    WebhookInterface.prototype.getJobs = function () {
        var wi = this;
        if (wi.checkpointNest) {
            return wi.checkpointNest.getHeldJobs();
        }
        else {
            return [];
        }
    };
    /**
     * Sets the checkpoint nest.
     * @param nest
     */
    WebhookInterface.prototype.setCheckpointNest = function (nest) {
        this.checkpointNest = nest;
    };
    /**
     * Adds a user interface step
     * @param stepName
     * @param callback
     */
    WebhookInterface.prototype.addStep = function (stepName, callback) {
        var step = new step_1.Step();
        step.name = stepName;
        step.callback = callback;
        step.complete = false;
        this.steps.push(step);
    };
    /**
     * Mark a step as complete and remove it from the interface.
     * @param step {Step}
     */
    WebhookInterface.prototype.completeStep = function (step) {
        var wi = this;
        var steps = wi.getSteps();
        var matchedIndex = _.findIndex(steps, function (s) { return s.name === step.name; });
        if (steps[matchedIndex]) {
            wi.steps.splice(matchedIndex, 1);
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Alias of completeStep.
     * @param step {Step}
     */
    WebhookInterface.prototype.removeStep = function (step) {
        this.completeStep(step);
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
        this.steps = clone(steps);
    };
    return WebhookInterface;
}());
exports.WebhookInterface = WebhookInterface;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS93ZWJob29rSW50ZXJmYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFJQSxxQkFBbUIsUUFBUSxDQUFDLENBQUE7QUFNNUIsSUFBUSxPQUFPLEdBQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUNoQyxDQUFDLEdBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUMvQixLQUFLLEdBQVMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSDtJQVVJOzs7O09BSUc7SUFDSCwwQkFBWSxDQUFjLEVBQUUsSUFBaUI7UUFDekMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVTLHVDQUFZLEdBQXRCO1FBQ0ksSUFBSSxDQUFDLFFBQVEsR0FBRztZQUNaLG1CQUFtQixFQUFFLEVBQUU7U0FDTCxDQUFDO0lBQzNCLENBQUM7SUFFTSxzQ0FBVyxHQUFsQjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxzQ0FBVyxHQUFsQixVQUFtQixRQUEyQjtRQUMxQyxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsK0RBQStEO1FBQy9ELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLElBQUksY0FBYyxDQUFDLG1CQUFtQixDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFD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LElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMxQixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxVQUFDLENBQUMsSUFBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0UsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0kscUNBQVUsR0FBakIsVUFBa0IsSUFBVTtRQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxtQ0FBUSxHQUFmO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLG1DQUFRLEdBQWYsVUFBZ0IsS0FBVTtRQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBQ0wsdUJBQUM7QUFBRCxDQTdPQSxBQTZPQyxJQUFBO0FBN09ZLHdCQUFnQixtQkE2TzVCLENBQUEiLCJmaWxlIjoibGliL3VpL3dlYmhvb2tJbnRlcmZhY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7V2ViaG9va05lc3R9IGZyb20gXCIuLi9uZXN0L3dlYmhvb2tOZXN0XCI7XG5pbXBvcnQge0ZvbGRlck5lc3R9IGZyb20gXCIuLi9uZXN0L2ZvbGRlck5lc3RcIjtcbmltcG9ydCB7RmllbGRPcHRpb25zfSBmcm9tIFwiLi9maWVsZFwiO1xuaW1wb3J0IHtTdGVwfSBmcm9tIFwiLi9zdGVwXCI7XG5pbXBvcnQge0ludGVyZmFjZU1ldGFkYXRhfSBmcm9tIFwiLi9pbnRlcmZhY2VNZXRhZGF0YVwiO1xuaW1wb3J0IHtJbnRlcmZhY2VQcm9wZXJ0eX0gZnJvbSBcIi4vSW50ZXJmYWNlUHJvcGVydHlcIjtcbmltcG9ydCB7RmlsZUpvYn0gZnJvbSBcIi4uL2pvYi9maWxlSm9iXCI7XG5pbXBvcnQge0ZvbGRlckpvYn0gZnJvbSBcIi4uL2pvYi9mb2xkZXJKb2JcIjtcblxuY29uc3QgICBzaG9ydGlkICAgICA9IHJlcXVpcmUoXCJzaG9ydGlkXCIpLFxuICAgICAgICBfICAgICAgICAgICA9IHJlcXVpcmUoXCJsb2Rhc2hcIiksXG4gICAgICAgIGNsb25lICAgICAgID0gcmVxdWlyZShcImNsb25lXCIpO1xuXG4vKipcbiAqIEEgd2ViaG9vayBpbnRlcmZhY2UgaW5zdGFuY2UsIHRpZWQgdG8gYSBwYXJ0aWN1bGFyIHNlc3Npb24uXG4gKiBXaXRoaW4gaW50ZXJmYWNlIHN0ZXBzLCB5b3UgY2FuIHVzZSB0aGVzZSBtZXRob2RzIGRpcmVjdGx5IHRvIGFsdGVyIHRoZSBzY2hlbWEgYmVpbmcgcmV0dXJuZWQgdG8gdGhlIHVzZXIgaW50ZXJmYWNlLlxuICogIyMjIyBFeGFtcGxlXG4gKiBgYGBqc1xuICogdmFyIG1hbmFnZXIgPSB3ZWJob29rLmdldEludGVyZmFjZU1hbmFnZXIoKTtcbiAqIG1hbmFnZXIuYWRkU3RlcChcIkNoZWNrIGpvYiBudW1iZXJcIiwgZnVuY3Rpb24od2ViaG9va0pvYiwgd2ViaG9va0ludGVyZmFjZSwgc3RlcCl7XG4gKiAgICAgIGlmKHdlYmhvb2tKb2IuZ2V0UXVlcnlTdHJpbmdWYWx1ZShcImpvYl9udW1iZXJcIikpe1xuICogICAgICAgICAgd2ViaG9va0ludGVyZmFjZS5hZGRGaWVsZCh7XG4gKiAgICAgICAgICAgICAgaWQ6IFwic29tZXRoaW5nX2Vsc2VcIixcbiAqICAgICAgICAgICAgICBfbmFtZTogXCJTb21lIG90aGVyIGZpZWxkXCIsXG4gKiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gKiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhhbmtzIGZvciBhZGRpbmcgYSBqb2IgbnVtYmVyIVwiXG4gKiAgICAgICAgICB9KTtcbiAqICAgICAgICAgIHN0ZXAuY29tcGxldGUgPSB0cnVlOyAvLyBNYXJrIHN0ZXAgYXMgY29tcGxldGVcbiAqICAgICAgfVxuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFdlYmhvb2tJbnRlcmZhY2Uge1xuXG4gICAgcHJvdGVjdGVkIGZpZWxkczogRmllbGRPcHRpb25zW107XG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuICAgIHByb3RlY3RlZCBuZXN0OiBXZWJob29rTmVzdDtcbiAgICBwcm90ZWN0ZWQgY2hlY2twb2ludE5lc3Q6IEZvbGRlck5lc3Q7XG4gICAgcHJvdGVjdGVkIHN0ZXBzOiBTdGVwW107XG4gICAgcHJvdGVjdGVkIHNlc3Npb25JZDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBtZXRhZGF0YTogSW50ZXJmYWNlTWV0YWRhdGE7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7RW52aXJvbm1lbnR9IGVcbiAgICAgKiBAcGFyYW0ge1dlYmhvb2tOZXN0fSBuZXN0XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIG5lc3Q6IFdlYmhvb2tOZXN0KSB7XG4gICAgICAgIHRoaXMuZSA9IGU7XG4gICAgICAgIHRoaXMubmVzdCA9IG5lc3Q7XG4gICAgICAgIHRoaXMuc2Vzc2lvbklkID0gc2hvcnRpZC5nZW5lcmF0ZSgpO1xuICAgICAgICB0aGlzLnN0ZXBzID0gW107XG4gICAgICAgIHRoaXMuZmllbGRzID0gW107XG4gICAgICAgIHRoaXMuaW5pdE1ldGFkYXRhKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGluaXRNZXRhZGF0YSgpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YSA9IHtcbiAgICAgICAgICAgIGludGVyZmFjZVByb3BlcnRpZXM6IFtdXG4gICAgICAgIH0gYXMgSW50ZXJmYWNlTWV0YWRhdGE7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE1ldGFkYXRhKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXRhZGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgY2xvbmVkIGluc3RhbmNlIG9mIG1ldGFkYXRhLlxuICAgICAqIEBwYXJhbSBtZXRhZGF0YVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRNZXRhZGF0YShtZXRhZGF0YTogSW50ZXJmYWNlTWV0YWRhdGEpIHtcbiAgICAgICAgbGV0IGNsb25lZE1ldGFkYXRhID0gY2xvbmUobWV0YWRhdGEpO1xuICAgICAgICAvLyBsZXQgY2xvbmVkTWV0YWRhdGEgPSBfLmNsb25lKG1ldGFkYXRhKSBhcyBJbnRlcmZhY2VNZXRhZGF0YTtcbiAgICAgICAgaWYgKF8uaGFzKGNsb25lZE1ldGFkYXRhLCBcImludGVyZmFjZVByb3BlcnRpZXNcIikgJiYgY2xvbmVkTWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsb25lZE1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1ldGFkYXRhID0gY2xvbmVkTWV0YWRhdGE7XG4gICAgfVxuXG4gICAgcHVibGljIHNldERlc2NyaXB0aW9uKGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YS5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRUb29sdGlwKHRvb2x0aXA6IHN0cmluZykge1xuICAgICAgICB0aGlzLm1ldGFkYXRhLnRvb2x0aXAgPSB0b29sdGlwO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRJbnRlcmZhY2VQcm9wZXJ0eShwcm9wZXJ0eTogSW50ZXJmYWNlUHJvcGVydHkpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzLnB1c2goY2xvbmUocHJvcGVydHkpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0SW50ZXJmYWNlUHJvcGVydGllcyhwcm9wZXJ0aWVzOiBJbnRlcmZhY2VQcm9wZXJ0eVtdKSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcyA9IGNsb25lKHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgc2Vzc2lvbiBpZC4gVXNlZCB0byBtYXRjaCB0byBpbnRlcmZhY2UgaW5zdGFuY2VkIHdpdGhpbiB0aGUgbWFuYWdlci5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTZXNzaW9uSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlc3Npb25JZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG5lc3RcbiAgICAgKiBAcmV0dXJucyB7V2ViaG9va05lc3R9XG4gICAgICovXG4gICAgcHVibGljIGdldE5lc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5lc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBpbnRlcmZhY2UgZmllbGQgdG8gdGhlIGludGVyZmFjZS5cbiAgICAgKiBAcGFyYW0ge0ZpZWxkT3B0aW9uc30gZmllbGRcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkRmllbGQoZmllbGQ6IEZpZWxkT3B0aW9ucykge1xuICAgICAgICBsZXQgd2kgPSB0aGlzO1xuXG4gICAgICAgIGxldCBleGlzdGluZ0ZpZWxkID0gXy5maW5kKHdpLmZpZWxkcywgZnVuY3Rpb24oZikgeyByZXR1cm4gZi5pZCA9PT0gZmllbGQuaWQ7IH0pO1xuXG4gICAgICAgIGlmIChleGlzdGluZ0ZpZWxkKSB7XG4gICAgICAgICAgICB3aS5lLmxvZygzLCBgRmllbGQgaWQgXCIke2ZpZWxkLmlkfVwiIGFscmVhZHkgZXhpc3RzLiBJdCBjYW5ub3QgYmUgYWRkZWQgYWdhaW4uYCwgd2kpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5maWVsZHMucHVzaChmaWVsZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIGV4aXN0aW5nIGZpZWxkIGZyb20gdGhlIGludGVyZmFjZSB0byBtb2RpZnkgaXRzIHByb3BlcnRpZXMuXG4gICAgICogQHBhcmFtIGZpZWxkSWRcbiAgICAgKiBAcmV0dXJucyB7RmllbGRPcHRpb25zfVxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogaW0uYWRkU3RlcChcIkNoZWNrIGpvYiBudW1iZXJcIiwgZnVuY3Rpb24od2ViaG9va0pvYiwgd2ViaG9va0ludGVyZmFjZSwgc3RlcCwgZG9uZSkge1xuICAgICAqICAgICAgaWYod2ViaG9va0pvYi5nZXRQYXJhbWV0ZXIoXCJqb2JfbnVtYmVyXCIpLmxlbmd0aCA9PSA2KSB7XG4gICAgICogICAgICAgICAgLy8gTWFrZSBqb2IgbnVtYmVyIHJlYWQgb25seVxuICAgICAqICAgICAgICAgIHZhciBqb2JOdW1iZXJGaWVsZCA9IHdlYmhvb2tJbnRlcmZhY2UuZ2V0RmllbGQoXCJqb2JfbnVtYmVyXCIpO1xuICAgICAqICAgICAgICAgIGpvYk51bWJlckZpZWxkLnJlYWRvbmx5ID0gdHJ1ZTtcbiAgICAgKiAgICAgICAgICAvLyBDb21wbGV0ZSBzdGVwXG4gICAgICogICAgICAgICAgd2ViaG9va0ludGVyZmFjZS5jb21wbGV0ZVN0ZXAoc3RlcCk7XG4gICAgICogICAgICB9IGVsc2Uge1xuICAgICAqICAgICAgICAgIHN0ZXAuZmFpbHVyZSA9IFwiSm9iIG51bWJlciB3YXMgbm90IDYgY2hhcmFjdGVycy5cIjtcbiAgICAgKiAgICAgIH1cbiAgICAgKiAgICAgIGRvbmUoKTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RmllbGQoZmllbGRJZDogc3RyaW5nKSB7XG4gICAgICAgIGxldCB3aSA9IHRoaXM7XG4gICAgICAgIHJldHVybiBfLmZpbmQod2kuZmllbGRzLCBmdW5jdGlvbihmKSB7IHJldHVybiBmLmlkID09PSBmaWVsZElkOyB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVyd3JpdGVzIGZpZWxkcyB3aXRoIGEgY2xvbmUuXG4gICAgICogQHBhcmFtIGZpZWxkc1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRGaWVsZHMoZmllbGRzOiBGaWVsZE9wdGlvbnNbXSkge1xuICAgICAgICB0aGlzLmZpZWxkcyA9IGNsb25lKGZpZWxkcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIGFycmF5IG9mIGFsbCBvZiB0aGUgZmllbGRzLlxuICAgICAqIEByZXR1cm5zIHtGaWVsZE9wdGlvbnNbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RmllbGRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWVsZHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaW50ZXJmYWNlIGZvciB0cmFuc3BvcnQuXG4gICAgICogQHJldHVybnMge3tmaWVsZHM6IEFycmF5fX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VHJhbnNwb3J0SW50ZXJmYWNlKCkge1xuICAgICAgICBsZXQgd2kgPSB0aGlzO1xuICAgICAgICBsZXQgam9icyA9IHdpLmdldEpvYnMoKTtcbiAgICAgICAgbGV0IGpvYnNBcnJheSA9IFtdO1xuXG4gICAgICAgIGpvYnMuZm9yRWFjaCgoam9iKSA9PiB7XG4gICAgICAgICAgICBqb2JzQXJyYXkucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6IGpvYi5pZCxcbiAgICAgICAgICAgICAgICBuYW1lOiBqb2IubmFtZSxcbiAgICAgICAgICAgICAgICBwYXRoOiBqb2IucGF0aFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZXNzaW9uSWQ6IHdpLnNlc3Npb25JZCxcbiAgICAgICAgICAgIGZpZWxkczogd2kuZmllbGRzLFxuICAgICAgICAgICAgaGVsZEpvYnM6IGpvYnNBcnJheSxcbiAgICAgICAgICAgIHN0ZXBzOiB3aS5nZXRTdGVwcygpLFxuICAgICAgICAgICAgbWV0YWRhdGE6IHdpLmdldE1ldGFkYXRhKClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNoZWNrZWQgam9icy5cbiAgICAgKiBAcmV0dXJucyB7KEZpbGVKb2J8Rm9sZGVySm9iKVtdfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRKb2JzKCkge1xuICAgICAgICBsZXQgd2kgPSB0aGlzO1xuICAgICAgICBpZiAod2kuY2hlY2twb2ludE5lc3QpIHtcbiAgICAgICAgICAgIHJldHVybiB3aS5jaGVja3BvaW50TmVzdC5nZXRIZWxkSm9icygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgY2hlY2twb2ludCBuZXN0LlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHVibGljIHNldENoZWNrcG9pbnROZXN0KG5lc3Q6IEZvbGRlck5lc3QpIHtcbiAgICAgICAgdGhpcy5jaGVja3BvaW50TmVzdCA9IG5lc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHVzZXIgaW50ZXJmYWNlIHN0ZXBcbiAgICAgKiBAcGFyYW0gc3RlcE5hbWVcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkU3RlcChzdGVwTmFtZTogc3RyaW5nLCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIGxldCBzdGVwID0gbmV3IFN0ZXAoKTtcbiAgICAgICAgc3RlcC5uYW1lID0gc3RlcE5hbWU7XG4gICAgICAgIHN0ZXAuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgc3RlcC5jb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnN0ZXBzLnB1c2goc3RlcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFyayBhIHN0ZXAgYXMgY29tcGxldGUgYW5kIHJlbW92ZSBpdCBmcm9tIHRoZSBpbnRlcmZhY2UuXG4gICAgICogQHBhcmFtIHN0ZXAge1N0ZXB9XG4gICAgICovXG4gICAgcHVibGljIGNvbXBsZXRlU3RlcChzdGVwOiBTdGVwKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCB3aSA9IHRoaXM7XG4gICAgICAgIGxldCBzdGVwcyA9IHdpLmdldFN0ZXBzKCk7XG4gICAgICAgIGxldCBtYXRjaGVkSW5kZXggPSBfLmZpbmRJbmRleChzdGVwcywgKHMpID0+IHsgcmV0dXJuIHMubmFtZSA9PT0gc3RlcC5uYW1lOyB9KTtcbiAgICAgICAgaWYgKHN0ZXBzW21hdGNoZWRJbmRleF0pIHtcbiAgICAgICAgICAgIHdpLnN0ZXBzLnNwbGljZShtYXRjaGVkSW5kZXgsIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbGlhcyBvZiBjb21wbGV0ZVN0ZXAuXG4gICAgICogQHBhcmFtIHN0ZXAge1N0ZXB9XG4gICAgICovXG4gICAgcHVibGljIHJlbW92ZVN0ZXAoc3RlcDogU3RlcCkge1xuICAgICAgICB0aGlzLmNvbXBsZXRlU3RlcChzdGVwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYW4gYXJyYXkgb2YgaW5zdGFuY2Ugc3RlcHMuXG4gICAgICogQHJldHVybnMge1N0ZXBbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U3RlcHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0ZXBzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJ3cml0ZSB0aGUgaW5zdGFudCBzdGVwcy5cbiAgICAgKiBAcGFyYW0gc3RlcHNcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0U3RlcHMoc3RlcHM6IGFueSkge1xuICAgICAgICB0aGlzLnN0ZXBzID0gY2xvbmUoc3RlcHMpO1xuICAgIH1cbn0iXX0=
