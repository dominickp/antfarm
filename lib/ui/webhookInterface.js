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
                id: job.getId(),
                name: job.name,
                path: job.getPath()
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS93ZWJob29rSW50ZXJmYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFJQSxxQkFBbUIsUUFBUSxDQUFDLENBQUE7QUFNNUIsSUFBUSxPQUFPLEdBQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUNoQyxDQUFDLEdBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUMvQixLQUFLLEdBQVMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSDtJQVVJOzs7O09BSUc7SUFDSCwwQkFBWSxDQUFjLEVBQUUsSUFBaUI7UUFDekMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVTLHVDQUFZLEdBQXRCO1FBQ0ksSUFBSSxDQUFDLFFBQVEsR0FBRztZQUNaLG1CQUFtQixFQUFFLEVBQUU7U0FDTCxDQUFDO0lBQzNCLENBQUM7SUFFTSxzQ0FBVyxHQUFsQjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxzQ0FBVyxHQUFsQixVQUFtQixRQUEyQjtRQUMxQyxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsK0RBQStEO1FBQy9ELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLElBQUksY0FBYyxDQUFDLG1CQUFtQixDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFD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LENBQUM7UUFDZCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsVUFBQyxDQUFDLElBQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9FLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNJLHFDQUFVLEdBQWpCLFVBQWtCLElBQVU7UUFDeEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksbUNBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxtQ0FBUSxHQUFmLFVBQWdCLEtBQVU7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0E3T0EsQUE2T0MsSUFBQTtBQTdPWSx3QkFBZ0IsbUJBNk81QixDQUFBIiwiZmlsZSI6ImxpYi91aS93ZWJob29rSW50ZXJmYWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge1dlYmhvb2tOZXN0fSBmcm9tIFwiLi4vbmVzdC93ZWJob29rTmVzdFwiO1xuaW1wb3J0IHtGb2xkZXJOZXN0fSBmcm9tIFwiLi4vbmVzdC9mb2xkZXJOZXN0XCI7XG5pbXBvcnQge0ZpZWxkT3B0aW9uc30gZnJvbSBcIi4vZmllbGRcIjtcbmltcG9ydCB7U3RlcH0gZnJvbSBcIi4vc3RlcFwiO1xuaW1wb3J0IHtJbnRlcmZhY2VNZXRhZGF0YX0gZnJvbSBcIi4vaW50ZXJmYWNlTWV0YWRhdGFcIjtcbmltcG9ydCB7SW50ZXJmYWNlUHJvcGVydHl9IGZyb20gXCIuL0ludGVyZmFjZVByb3BlcnR5XCI7XG5pbXBvcnQge0ZpbGVKb2J9IGZyb20gXCIuLi9qb2IvZmlsZUpvYlwiO1xuaW1wb3J0IHtGb2xkZXJKb2J9IGZyb20gXCIuLi9qb2IvZm9sZGVySm9iXCI7XG5cbmNvbnN0ICAgc2hvcnRpZCAgICAgPSByZXF1aXJlKFwic2hvcnRpZFwiKSxcbiAgICAgICAgXyAgICAgICAgICAgPSByZXF1aXJlKFwibG9kYXNoXCIpLFxuICAgICAgICBjbG9uZSAgICAgICA9IHJlcXVpcmUoXCJjbG9uZVwiKTtcblxuLyoqXG4gKiBBIHdlYmhvb2sgaW50ZXJmYWNlIGluc3RhbmNlLCB0aWVkIHRvIGEgcGFydGljdWxhciBzZXNzaW9uLlxuICogV2l0aGluIGludGVyZmFjZSBzdGVwcywgeW91IGNhbiB1c2UgdGhlc2UgbWV0aG9kcyBkaXJlY3RseSB0byBhbHRlciB0aGUgc2NoZW1hIGJlaW5nIHJldHVybmVkIHRvIHRoZSB1c2VyIGludGVyZmFjZS5cbiAqICMjIyMgRXhhbXBsZVxuICogYGBganNcbiAqIHZhciBtYW5hZ2VyID0gd2ViaG9vay5nZXRJbnRlcmZhY2VNYW5hZ2VyKCk7XG4gKiBtYW5hZ2VyLmFkZFN0ZXAoXCJDaGVjayBqb2IgbnVtYmVyXCIsIGZ1bmN0aW9uKHdlYmhvb2tKb2IsIHdlYmhvb2tJbnRlcmZhY2UsIHN0ZXApe1xuICogICAgICBpZih3ZWJob29rSm9iLmdldFF1ZXJ5U3RyaW5nVmFsdWUoXCJqb2JfbnVtYmVyXCIpKXtcbiAqICAgICAgICAgIHdlYmhvb2tJbnRlcmZhY2UuYWRkRmllbGQoe1xuICogICAgICAgICAgICAgIGlkOiBcInNvbWV0aGluZ19lbHNlXCIsXG4gKiAgICAgICAgICAgICAgX25hbWU6IFwiU29tZSBvdGhlciBmaWVsZFwiLFxuICogICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxuICogICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoYW5rcyBmb3IgYWRkaW5nIGEgam9iIG51bWJlciFcIlxuICogICAgICAgICAgfSk7XG4gKiAgICAgICAgICBzdGVwLmNvbXBsZXRlID0gdHJ1ZTsgLy8gTWFyayBzdGVwIGFzIGNvbXBsZXRlXG4gKiAgICAgIH1cbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBXZWJob29rSW50ZXJmYWNlIHtcblxuICAgIHByb3RlY3RlZCBmaWVsZHM6IEZpZWxkT3B0aW9uc1tdO1xuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcbiAgICBwcm90ZWN0ZWQgbmVzdDogV2ViaG9va05lc3Q7XG4gICAgcHJvdGVjdGVkIGNoZWNrcG9pbnROZXN0OiBGb2xkZXJOZXN0O1xuICAgIHByb3RlY3RlZCBzdGVwczogU3RlcFtdO1xuICAgIHByb3RlY3RlZCBzZXNzaW9uSWQ6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgbWV0YWRhdGE6IEludGVyZmFjZU1ldGFkYXRhO1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0Vudmlyb25tZW50fSBlXG4gICAgICogQHBhcmFtIHtXZWJob29rTmVzdH0gbmVzdFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBuZXN0OiBXZWJob29rTmVzdCkge1xuICAgICAgICB0aGlzLmUgPSBlO1xuICAgICAgICB0aGlzLm5lc3QgPSBuZXN0O1xuICAgICAgICB0aGlzLnNlc3Npb25JZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgdGhpcy5zdGVwcyA9IFtdO1xuICAgICAgICB0aGlzLmZpZWxkcyA9IFtdO1xuICAgICAgICB0aGlzLmluaXRNZXRhZGF0YSgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBpbml0TWV0YWRhdGEoKSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEgPSB7XG4gICAgICAgICAgICBpbnRlcmZhY2VQcm9wZXJ0aWVzOiBbXVxuICAgICAgICB9IGFzIEludGVyZmFjZU1ldGFkYXRhO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRNZXRhZGF0YSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWV0YWRhdGE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyBhIGNsb25lZCBpbnN0YW5jZSBvZiBtZXRhZGF0YS5cbiAgICAgKiBAcGFyYW0gbWV0YWRhdGFcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0TWV0YWRhdGEobWV0YWRhdGE6IEludGVyZmFjZU1ldGFkYXRhKSB7XG4gICAgICAgIGxldCBjbG9uZWRNZXRhZGF0YSA9IGNsb25lKG1ldGFkYXRhKTtcbiAgICAgICAgLy8gbGV0IGNsb25lZE1ldGFkYXRhID0gXy5jbG9uZShtZXRhZGF0YSkgYXMgSW50ZXJmYWNlTWV0YWRhdGE7XG4gICAgICAgIGlmIChfLmhhcyhjbG9uZWRNZXRhZGF0YSwgXCJpbnRlcmZhY2VQcm9wZXJ0aWVzXCIpICYmIGNsb25lZE1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbG9uZWRNZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tZXRhZGF0YSA9IGNsb25lZE1ldGFkYXRhO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXREZXNjcmlwdGlvbihkZXNjcmlwdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VG9vbHRpcCh0b29sdGlwOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YS50b29sdGlwID0gdG9vbHRpcDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkSW50ZXJmYWNlUHJvcGVydHkocHJvcGVydHk6IEludGVyZmFjZVByb3BlcnR5KSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcy5wdXNoKGNsb25lKHByb3BlcnR5KSk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldEludGVyZmFjZVByb3BlcnRpZXMocHJvcGVydGllczogSW50ZXJmYWNlUHJvcGVydHlbXSkge1xuICAgICAgICB0aGlzLm1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMgPSBjbG9uZShwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIHNlc3Npb24gaWQuIFVzZWQgdG8gbWF0Y2ggdG8gaW50ZXJmYWNlIGluc3RhbmNlZCB3aXRoaW4gdGhlIG1hbmFnZXIuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2Vzc2lvbklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXNzaW9uSWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuZXN0XG4gICAgICogQHJldHVybnMge1dlYmhvb2tOZXN0fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROZXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gaW50ZXJmYWNlIGZpZWxkIHRvIHRoZSBpbnRlcmZhY2UuXG4gICAgICogQHBhcmFtIHtGaWVsZE9wdGlvbnN9IGZpZWxkXG4gICAgICovXG4gICAgcHVibGljIGFkZEZpZWxkKGZpZWxkOiBGaWVsZE9wdGlvbnMpIHtcbiAgICAgICAgbGV0IHdpID0gdGhpcztcblxuICAgICAgICBsZXQgZXhpc3RpbmdGaWVsZCA9IF8uZmluZCh3aS5maWVsZHMsIGZ1bmN0aW9uKGYpIHsgcmV0dXJuIGYuaWQgPT09IGZpZWxkLmlkOyB9KTtcblxuICAgICAgICBpZiAoZXhpc3RpbmdGaWVsZCkge1xuICAgICAgICAgICAgd2kuZS5sb2coMywgYEZpZWxkIGlkIFwiJHtmaWVsZC5pZH1cIiBhbHJlYWR5IGV4aXN0cy4gSXQgY2Fubm90IGJlIGFkZGVkIGFnYWluLmAsIHdpKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZmllbGRzLnB1c2goZmllbGQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBleGlzdGluZyBmaWVsZCBmcm9tIHRoZSBpbnRlcmZhY2UgdG8gbW9kaWZ5IGl0cyBwcm9wZXJ0aWVzLlxuICAgICAqIEBwYXJhbSBmaWVsZElkXG4gICAgICogQHJldHVybnMge0ZpZWxkT3B0aW9uc31cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIGltLmFkZFN0ZXAoXCJDaGVjayBqb2IgbnVtYmVyXCIsIGZ1bmN0aW9uKHdlYmhvb2tKb2IsIHdlYmhvb2tJbnRlcmZhY2UsIHN0ZXAsIGRvbmUpIHtcbiAgICAgKiAgICAgIGlmKHdlYmhvb2tKb2IuZ2V0UGFyYW1ldGVyKFwiam9iX251bWJlclwiKS5sZW5ndGggPT0gNikge1xuICAgICAqICAgICAgICAgIC8vIE1ha2Ugam9iIG51bWJlciByZWFkIG9ubHlcbiAgICAgKiAgICAgICAgICB2YXIgam9iTnVtYmVyRmllbGQgPSB3ZWJob29rSW50ZXJmYWNlLmdldEZpZWxkKFwiam9iX251bWJlclwiKTtcbiAgICAgKiAgICAgICAgICBqb2JOdW1iZXJGaWVsZC5yZWFkb25seSA9IHRydWU7XG4gICAgICogICAgICAgICAgLy8gQ29tcGxldGUgc3RlcFxuICAgICAqICAgICAgICAgIHdlYmhvb2tJbnRlcmZhY2UuY29tcGxldGVTdGVwKHN0ZXApO1xuICAgICAqICAgICAgfSBlbHNlIHtcbiAgICAgKiAgICAgICAgICBzdGVwLmZhaWx1cmUgPSBcIkpvYiBudW1iZXIgd2FzIG5vdCA2IGNoYXJhY3RlcnMuXCI7XG4gICAgICogICAgICB9XG4gICAgICogICAgICBkb25lKCk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGdldEZpZWxkKGZpZWxkSWQ6IHN0cmluZykge1xuICAgICAgICBsZXQgd2kgPSB0aGlzO1xuICAgICAgICByZXR1cm4gXy5maW5kKHdpLmZpZWxkcywgZnVuY3Rpb24oZikgeyByZXR1cm4gZi5pZCA9PT0gZmllbGRJZDsgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcndyaXRlcyBmaWVsZHMgd2l0aCBhIGNsb25lLlxuICAgICAqIEBwYXJhbSBmaWVsZHNcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RmllbGRzKGZpZWxkczogRmllbGRPcHRpb25zW10pIHtcbiAgICAgICAgdGhpcy5maWVsZHMgPSBjbG9uZShmaWVsZHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBhcnJheSBvZiBhbGwgb2YgdGhlIGZpZWxkcy5cbiAgICAgKiBAcmV0dXJucyB7RmllbGRPcHRpb25zW119XG4gICAgICovXG4gICAgcHVibGljIGdldEZpZWxkcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmllbGRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGludGVyZmFjZSBmb3IgdHJhbnNwb3J0LlxuICAgICAqIEByZXR1cm5zIHt7ZmllbGRzOiBBcnJheX19XG4gICAgICovXG4gICAgcHVibGljIGdldFRyYW5zcG9ydEludGVyZmFjZSgpIHtcbiAgICAgICAgbGV0IHdpID0gdGhpcztcbiAgICAgICAgbGV0IGpvYnMgPSB3aS5nZXRKb2JzKCk7XG4gICAgICAgIGxldCBqb2JzQXJyYXkgPSBbXTtcblxuICAgICAgICBqb2JzLmZvckVhY2goKGpvYikgPT4ge1xuICAgICAgICAgICAgam9ic0FycmF5LnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiBqb2IuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICBuYW1lOiBqb2IubmFtZSxcbiAgICAgICAgICAgICAgICBwYXRoOiBqb2IuZ2V0UGF0aCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNlc3Npb25JZDogd2kuc2Vzc2lvbklkLFxuICAgICAgICAgICAgZmllbGRzOiB3aS5maWVsZHMsXG4gICAgICAgICAgICBoZWxkSm9iczogam9ic0FycmF5LFxuICAgICAgICAgICAgc3RlcHM6IHdpLmdldFN0ZXBzKCksXG4gICAgICAgICAgICBtZXRhZGF0YTogd2kuZ2V0TWV0YWRhdGEoKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgY2hlY2tlZCBqb2JzLlxuICAgICAqIEByZXR1cm5zIHsoRmlsZUpvYnxGb2xkZXJKb2IpW119XG4gICAgICovXG4gICAgcHVibGljIGdldEpvYnMoKSB7XG4gICAgICAgIGxldCB3aSA9IHRoaXM7XG4gICAgICAgIGlmICh3aS5jaGVja3BvaW50TmVzdCkge1xuICAgICAgICAgICAgcmV0dXJuIHdpLmNoZWNrcG9pbnROZXN0LmdldEhlbGRKb2JzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBjaGVja3BvaW50IG5lc3QuXG4gICAgICogQHBhcmFtIG5lc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q2hlY2twb2ludE5lc3QobmVzdDogRm9sZGVyTmVzdCkge1xuICAgICAgICB0aGlzLmNoZWNrcG9pbnROZXN0ID0gbmVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdXNlciBpbnRlcmZhY2Ugc3RlcFxuICAgICAqIEBwYXJhbSBzdGVwTmFtZVxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBhZGRTdGVwKHN0ZXBOYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgbGV0IHN0ZXAgPSBuZXcgU3RlcCgpO1xuICAgICAgICBzdGVwLm5hbWUgPSBzdGVwTmFtZTtcbiAgICAgICAgc3RlcC5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICBzdGVwLmNvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc3RlcHMucHVzaChzdGVwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYXJrIGEgc3RlcCBhcyBjb21wbGV0ZSBhbmQgcmVtb3ZlIGl0IGZyb20gdGhlIGludGVyZmFjZS5cbiAgICAgKiBAcGFyYW0gc3RlcCB7U3RlcH1cbiAgICAgKi9cbiAgICBwdWJsaWMgY29tcGxldGVTdGVwKHN0ZXA6IFN0ZXApOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHdpID0gdGhpcztcbiAgICAgICAgbGV0IHN0ZXBzID0gd2kuZ2V0U3RlcHMoKTtcbiAgICAgICAgbGV0IG1hdGNoZWRJbmRleCA9IF8uZmluZEluZGV4KHN0ZXBzLCAocykgPT4geyByZXR1cm4gcy5uYW1lID09PSBzdGVwLm5hbWU7IH0pO1xuICAgICAgICBpZiAoc3RlcHNbbWF0Y2hlZEluZGV4XSkge1xuICAgICAgICAgICAgd2kuc3RlcHMuc3BsaWNlKG1hdGNoZWRJbmRleCwgMSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFsaWFzIG9mIGNvbXBsZXRlU3RlcC5cbiAgICAgKiBAcGFyYW0gc3RlcCB7U3RlcH1cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3ZlU3RlcChzdGVwOiBTdGVwKSB7XG4gICAgICAgIHRoaXMuY29tcGxldGVTdGVwKHN0ZXApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBhcnJheSBvZiBpbnN0YW5jZSBzdGVwcy5cbiAgICAgKiBAcmV0dXJucyB7U3RlcFtdfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTdGVwcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RlcHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcndyaXRlIHRoZSBpbnN0YW50IHN0ZXBzLlxuICAgICAqIEBwYXJhbSBzdGVwc1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRTdGVwcyhzdGVwczogYW55KSB7XG4gICAgICAgIHRoaXMuc3RlcHMgPSBjbG9uZShzdGVwcyk7XG4gICAgfVxufSJdfQ==
