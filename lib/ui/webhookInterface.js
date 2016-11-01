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
        this._nest = nest;
        this._sessionId = shortid.generate();
        this._steps = [];
        this._fields = [];
        this.initMetadata();
    }
    WebhookInterface.prototype.initMetadata = function () {
        this.metadata = {
            interfaceProperties: []
        };
    };
    Object.defineProperty(WebhookInterface.prototype, "metadata", {
        get: function () {
            return this._metadata;
        },
        /**
         * Sets a cloned instance of metadata.
         * @param metadata
         */
        set: function (metadata) {
            var clonedMetadata = clone(metadata);
            // let clonedMetadata = _.clone(metadata) as InterfaceMetadata;
            if (_.has(clonedMetadata, "interfaceProperties") && clonedMetadata.interfaceProperties.constructor === Array) {
            }
            else {
                clonedMetadata.interfaceProperties = [];
            }
            this._metadata = clonedMetadata;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebhookInterface.prototype, "description", {
        set: function (description) {
            this.metadata.description = description;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebhookInterface.prototype, "tooltip", {
        set: function (tooltip) {
            this.metadata.tooltip = tooltip;
        },
        enumerable: true,
        configurable: true
    });
    WebhookInterface.prototype.addInterfaceProperty = function (property) {
        this.metadata.interfaceProperties.push(clone(property));
    };
    Object.defineProperty(WebhookInterface.prototype, "interfaceProperties", {
        set: function (properties) {
            this.metadata.interfaceProperties = clone(properties);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebhookInterface.prototype, "sessionId", {
        /**
         * Return the session id. Used to match to interface instanced within the manager.
         * @returns {string}
         */
        get: function () {
            return this._sessionId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebhookInterface.prototype, "nest", {
        /**
         * Get the nest
         * @returns {WebhookNest}
         */
        get: function () {
            return this._nest;
        },
        enumerable: true,
        configurable: true
    });
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
    Object.defineProperty(WebhookInterface.prototype, "fields", {
        /**
         * Get an array of all of the fields.
         * @returns {FieldOptions[]}
         */
        get: function () {
            return this._fields;
        },
        /**
         * Overwrites fields with a clone.
         * @param fields
         */
        set: function (fields) {
            this._fields = clone(fields);
        },
        enumerable: true,
        configurable: true
    });
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
            steps: wi.getStepsTransport(),
            metadata: wi.metadata
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
    Object.defineProperty(WebhookInterface.prototype, "checkpointNest", {
        get: function () {
            return this._checkpointNest;
        },
        /**
         * Sets the checkpoint nest.
         * @param nest
         */
        set: function (nest) {
            this._checkpointNest = nest;
        },
        enumerable: true,
        configurable: true
    });
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
        var steps = wi.steps;
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
    Object.defineProperty(WebhookInterface.prototype, "steps", {
        /**
         * Get an array of instance steps.
         * @returns {Step[]}
         */
        get: function () {
            return this._steps;
        },
        /**
         * Overwrite the instant steps.
         * @param steps
         */
        set: function (steps) {
            this._steps = clone(steps);
        },
        enumerable: true,
        configurable: true
    });
    WebhookInterface.prototype.getStepsTransport = function () {
        var steps = [];
        this.steps.forEach(function (step) {
            steps.push({ complete: step.complete, name: step.name });
        });
        return steps;
    };
    return WebhookInterface;
}());
exports.WebhookInterface = WebhookInterface;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS93ZWJob29rSW50ZXJmYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFJQSxxQkFBbUIsUUFBUSxDQUFDLENBQUE7QUFNNUIsSUFBUSxPQUFPLEdBQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUNoQyxDQUFDLEdBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUMvQixLQUFLLEdBQVMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSDtJQVVJOzs7O09BSUc7SUFDSCwwQkFBWSxDQUFjLEVBQUUsSUFBaUI7UUFDekMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVTLHVDQUFZLEdBQXRCO1FBQ0ksSUFBSSxDQUFDLFFBQVEsR0FBRztZQUNaLG1CQUFtQixFQUFFLEVBQUU7U0FDTCxDQUFDO0lBQzNCLENBQUM7SUFFRCxzQkFBVyxzQ0FBUTthQUFuQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7UUFFRDs7O1dBR0c7YUFDSCxVQUFvQixRQUEyQjtZQUMzQyxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckMsK0RBQStEO1lBQy9ELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLElBQUksY0FBYyxDQUFDLG1CQUFtQixDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQy9H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LElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUMzRCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQVNMLHVCQUFDO0FBQUQsQ0F6UEEsQUF5UEMsSUFBQTtBQXpQWSx3QkFBZ0IsbUJBeVA1QixDQUFBIiwiZmlsZSI6ImxpYi91aS93ZWJob29rSW50ZXJmYWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge1dlYmhvb2tOZXN0fSBmcm9tIFwiLi4vbmVzdC93ZWJob29rTmVzdFwiO1xuaW1wb3J0IHtGb2xkZXJOZXN0fSBmcm9tIFwiLi4vbmVzdC9mb2xkZXJOZXN0XCI7XG5pbXBvcnQge0ZpZWxkT3B0aW9uc30gZnJvbSBcIi4vZmllbGRcIjtcbmltcG9ydCB7U3RlcH0gZnJvbSBcIi4vc3RlcFwiO1xuaW1wb3J0IHtJbnRlcmZhY2VNZXRhZGF0YX0gZnJvbSBcIi4vaW50ZXJmYWNlTWV0YWRhdGFcIjtcbmltcG9ydCB7SW50ZXJmYWNlUHJvcGVydHl9IGZyb20gXCIuL0ludGVyZmFjZVByb3BlcnR5XCI7XG5pbXBvcnQge0ZpbGVKb2J9IGZyb20gXCIuLi9qb2IvZmlsZUpvYlwiO1xuaW1wb3J0IHtGb2xkZXJKb2J9IGZyb20gXCIuLi9qb2IvZm9sZGVySm9iXCI7XG5cbmNvbnN0ICAgc2hvcnRpZCAgICAgPSByZXF1aXJlKFwic2hvcnRpZFwiKSxcbiAgICAgICAgXyAgICAgICAgICAgPSByZXF1aXJlKFwibG9kYXNoXCIpLFxuICAgICAgICBjbG9uZSAgICAgICA9IHJlcXVpcmUoXCJjbG9uZVwiKTtcblxuLyoqXG4gKiBBIHdlYmhvb2sgaW50ZXJmYWNlIGluc3RhbmNlLCB0aWVkIHRvIGEgcGFydGljdWxhciBzZXNzaW9uLlxuICogV2l0aGluIGludGVyZmFjZSBzdGVwcywgeW91IGNhbiB1c2UgdGhlc2UgbWV0aG9kcyBkaXJlY3RseSB0byBhbHRlciB0aGUgc2NoZW1hIGJlaW5nIHJldHVybmVkIHRvIHRoZSB1c2VyIGludGVyZmFjZS5cbiAqICMjIyMgRXhhbXBsZVxuICogYGBganNcbiAqIHZhciBtYW5hZ2VyID0gd2ViaG9vay5nZXRJbnRlcmZhY2VNYW5hZ2VyKCk7XG4gKiBtYW5hZ2VyLmFkZFN0ZXAoXCJDaGVjayBqb2IgbnVtYmVyXCIsIGZ1bmN0aW9uKHdlYmhvb2tKb2IsIHdlYmhvb2tJbnRlcmZhY2UsIHN0ZXApe1xuICogICAgICBpZih3ZWJob29rSm9iLmdldFF1ZXJ5U3RyaW5nVmFsdWUoXCJqb2JfbnVtYmVyXCIpKXtcbiAqICAgICAgICAgIHdlYmhvb2tJbnRlcmZhY2UuYWRkRmllbGQoe1xuICogICAgICAgICAgICAgIGlkOiBcInNvbWV0aGluZ19lbHNlXCIsXG4gKiAgICAgICAgICAgICAgX25hbWU6IFwiU29tZSBvdGhlciBmaWVsZFwiLFxuICogICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxuICogICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoYW5rcyBmb3IgYWRkaW5nIGEgam9iIG51bWJlciFcIlxuICogICAgICAgICAgfSk7XG4gKiAgICAgICAgICBzdGVwLmNvbXBsZXRlID0gdHJ1ZTsgLy8gTWFyayBzdGVwIGFzIGNvbXBsZXRlXG4gKiAgICAgIH1cbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBXZWJob29rSW50ZXJmYWNlIHtcblxuICAgIHByb3RlY3RlZCBfZmllbGRzOiBGaWVsZE9wdGlvbnNbXTtcbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG4gICAgcHJvdGVjdGVkIF9uZXN0OiBXZWJob29rTmVzdDtcbiAgICBwcm90ZWN0ZWQgX2NoZWNrcG9pbnROZXN0OiBGb2xkZXJOZXN0O1xuICAgIHByb3RlY3RlZCBfc3RlcHM6IFN0ZXBbXTtcbiAgICBwcm90ZWN0ZWQgX3Nlc3Npb25JZDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfbWV0YWRhdGE6IEludGVyZmFjZU1ldGFkYXRhO1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0Vudmlyb25tZW50fSBlXG4gICAgICogQHBhcmFtIHtXZWJob29rTmVzdH0gbmVzdFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBuZXN0OiBXZWJob29rTmVzdCkge1xuICAgICAgICB0aGlzLmUgPSBlO1xuICAgICAgICB0aGlzLl9uZXN0ID0gbmVzdDtcbiAgICAgICAgdGhpcy5fc2Vzc2lvbklkID0gc2hvcnRpZC5nZW5lcmF0ZSgpO1xuICAgICAgICB0aGlzLl9zdGVwcyA9IFtdO1xuICAgICAgICB0aGlzLl9maWVsZHMgPSBbXTtcbiAgICAgICAgdGhpcy5pbml0TWV0YWRhdGEoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaW5pdE1ldGFkYXRhKCkge1xuICAgICAgICB0aGlzLm1ldGFkYXRhID0ge1xuICAgICAgICAgICAgaW50ZXJmYWNlUHJvcGVydGllczogW11cbiAgICAgICAgfSBhcyBJbnRlcmZhY2VNZXRhZGF0YTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IG1ldGFkYXRhKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWV0YWRhdGE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyBhIGNsb25lZCBpbnN0YW5jZSBvZiBtZXRhZGF0YS5cbiAgICAgKiBAcGFyYW0gbWV0YWRhdGFcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IG1ldGFkYXRhKG1ldGFkYXRhOiBJbnRlcmZhY2VNZXRhZGF0YSkge1xuICAgICAgICBsZXQgY2xvbmVkTWV0YWRhdGEgPSBjbG9uZShtZXRhZGF0YSk7XG4gICAgICAgIC8vIGxldCBjbG9uZWRNZXRhZGF0YSA9IF8uY2xvbmUobWV0YWRhdGEpIGFzIEludGVyZmFjZU1ldGFkYXRhO1xuICAgICAgICBpZiAoXy5oYXMoY2xvbmVkTWV0YWRhdGEsIFwiaW50ZXJmYWNlUHJvcGVydGllc1wiKSAmJiBjbG9uZWRNZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xvbmVkTWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21ldGFkYXRhID0gY2xvbmVkTWV0YWRhdGE7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBkZXNjcmlwdGlvbihkZXNjcmlwdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHRvb2x0aXAodG9vbHRpcDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEudG9vbHRpcCA9IHRvb2x0aXA7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEludGVyZmFjZVByb3BlcnR5KHByb3BlcnR5OiBJbnRlcmZhY2VQcm9wZXJ0eSkge1xuICAgICAgICB0aGlzLm1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMucHVzaChjbG9uZShwcm9wZXJ0eSkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgaW50ZXJmYWNlUHJvcGVydGllcyhwcm9wZXJ0aWVzOiBJbnRlcmZhY2VQcm9wZXJ0eVtdKSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcyA9IGNsb25lKHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgc2Vzc2lvbiBpZC4gVXNlZCB0byBtYXRjaCB0byBpbnRlcmZhY2UgaW5zdGFuY2VkIHdpdGhpbiB0aGUgbWFuYWdlci5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgc2Vzc2lvbklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbklkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmVzdFxuICAgICAqIEByZXR1cm5zIHtXZWJob29rTmVzdH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5lc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gaW50ZXJmYWNlIGZpZWxkIHRvIHRoZSBpbnRlcmZhY2UuXG4gICAgICogQHBhcmFtIHtGaWVsZE9wdGlvbnN9IGZpZWxkXG4gICAgICovXG4gICAgcHVibGljIGFkZEZpZWxkKGZpZWxkOiBGaWVsZE9wdGlvbnMpIHtcbiAgICAgICAgbGV0IHdpID0gdGhpcztcblxuICAgICAgICBsZXQgZXhpc3RpbmdGaWVsZCA9IF8uZmluZCh3aS5maWVsZHMsIGZ1bmN0aW9uKGYpIHsgcmV0dXJuIGYuaWQgPT09IGZpZWxkLmlkOyB9KTtcblxuICAgICAgICBpZiAoZXhpc3RpbmdGaWVsZCkge1xuICAgICAgICAgICAgd2kuZS5sb2coMywgYEZpZWxkIGlkIFwiJHtmaWVsZC5pZH1cIiBhbHJlYWR5IGV4aXN0cy4gSXQgY2Fubm90IGJlIGFkZGVkIGFnYWluLmAsIHdpKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZmllbGRzLnB1c2goZmllbGQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBleGlzdGluZyBmaWVsZCBmcm9tIHRoZSBpbnRlcmZhY2UgdG8gbW9kaWZ5IGl0cyBwcm9wZXJ0aWVzLlxuICAgICAqIEBwYXJhbSBmaWVsZElkXG4gICAgICogQHJldHVybnMge0ZpZWxkT3B0aW9uc31cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIGltLmFkZFN0ZXAoXCJDaGVjayBqb2IgbnVtYmVyXCIsIGZ1bmN0aW9uKHdlYmhvb2tKb2IsIHdlYmhvb2tJbnRlcmZhY2UsIHN0ZXAsIGRvbmUpIHtcbiAgICAgKiAgICAgIGlmKHdlYmhvb2tKb2IuZ2V0UGFyYW1ldGVyKFwiam9iX251bWJlclwiKS5sZW5ndGggPT0gNikge1xuICAgICAqICAgICAgICAgIC8vIE1ha2Ugam9iIG51bWJlciByZWFkIG9ubHlcbiAgICAgKiAgICAgICAgICB2YXIgam9iTnVtYmVyRmllbGQgPSB3ZWJob29rSW50ZXJmYWNlLmdldEZpZWxkKFwiam9iX251bWJlclwiKTtcbiAgICAgKiAgICAgICAgICBqb2JOdW1iZXJGaWVsZC5yZWFkb25seSA9IHRydWU7XG4gICAgICogICAgICAgICAgLy8gQ29tcGxldGUgc3RlcFxuICAgICAqICAgICAgICAgIHdlYmhvb2tJbnRlcmZhY2UuY29tcGxldGVTdGVwKHN0ZXApO1xuICAgICAqICAgICAgfSBlbHNlIHtcbiAgICAgKiAgICAgICAgICBzdGVwLmZhaWx1cmUgPSBcIkpvYiBudW1iZXIgd2FzIG5vdCA2IGNoYXJhY3RlcnMuXCI7XG4gICAgICogICAgICB9XG4gICAgICogICAgICBkb25lKCk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGdldEZpZWxkKGZpZWxkSWQ6IHN0cmluZykge1xuICAgICAgICBsZXQgd2kgPSB0aGlzO1xuICAgICAgICByZXR1cm4gXy5maW5kKHdpLmZpZWxkcywgZnVuY3Rpb24oZikgeyByZXR1cm4gZi5pZCA9PT0gZmllbGRJZDsgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcndyaXRlcyBmaWVsZHMgd2l0aCBhIGNsb25lLlxuICAgICAqIEBwYXJhbSBmaWVsZHNcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGZpZWxkcyhmaWVsZHM6IEZpZWxkT3B0aW9uc1tdKSB7XG4gICAgICAgIHRoaXMuX2ZpZWxkcyA9IGNsb25lKGZpZWxkcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIGFycmF5IG9mIGFsbCBvZiB0aGUgZmllbGRzLlxuICAgICAqIEByZXR1cm5zIHtGaWVsZE9wdGlvbnNbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGZpZWxkcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpZWxkcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnRlcmZhY2UgZm9yIHRyYW5zcG9ydC5cbiAgICAgKiBAcmV0dXJucyB7e2ZpZWxkczogQXJyYXl9fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRUcmFuc3BvcnRJbnRlcmZhY2UoKSB7XG4gICAgICAgIGxldCB3aSA9IHRoaXM7XG4gICAgICAgIGxldCBqb2JzID0gd2kuZ2V0Sm9icygpO1xuICAgICAgICBsZXQgam9ic0FycmF5ID0gW107XG5cbiAgICAgICAgam9icy5mb3JFYWNoKChqb2IpID0+IHtcbiAgICAgICAgICAgIGpvYnNBcnJheS5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogam9iLmlkLFxuICAgICAgICAgICAgICAgIG5hbWU6IGpvYi5uYW1lLFxuICAgICAgICAgICAgICAgIHBhdGg6IGpvYi5wYXRoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNlc3Npb25JZDogd2kuc2Vzc2lvbklkLFxuICAgICAgICAgICAgZmllbGRzOiB3aS5maWVsZHMsXG4gICAgICAgICAgICBoZWxkSm9iczogam9ic0FycmF5LFxuICAgICAgICAgICAgc3RlcHM6IHdpLmdldFN0ZXBzVHJhbnNwb3J0KCksXG4gICAgICAgICAgICBtZXRhZGF0YTogd2kubWV0YWRhdGFcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNoZWNrZWQgam9icy5cbiAgICAgKiBAcmV0dXJucyB7KEZpbGVKb2J8Rm9sZGVySm9iKVtdfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRKb2JzKCkge1xuICAgICAgICBsZXQgd2kgPSB0aGlzO1xuICAgICAgICBpZiAod2kuY2hlY2twb2ludE5lc3QpIHtcbiAgICAgICAgICAgIHJldHVybiB3aS5jaGVja3BvaW50TmVzdC5nZXRIZWxkSm9icygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgY2hlY2twb2ludCBuZXN0LlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHVibGljIHNldCBjaGVja3BvaW50TmVzdChuZXN0OiBGb2xkZXJOZXN0KSB7XG4gICAgICAgIHRoaXMuX2NoZWNrcG9pbnROZXN0ID0gbmVzdDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGNoZWNrcG9pbnROZXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2hlY2twb2ludE5lc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHVzZXIgaW50ZXJmYWNlIHN0ZXBcbiAgICAgKiBAcGFyYW0gc3RlcE5hbWVcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkU3RlcChzdGVwTmFtZTogc3RyaW5nLCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIGxldCBzdGVwID0gbmV3IFN0ZXAoKTtcbiAgICAgICAgc3RlcC5uYW1lID0gc3RlcE5hbWU7XG4gICAgICAgIHN0ZXAuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgc3RlcC5jb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnN0ZXBzLnB1c2goc3RlcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFyayBhIHN0ZXAgYXMgY29tcGxldGUgYW5kIHJlbW92ZSBpdCBmcm9tIHRoZSBpbnRlcmZhY2UuXG4gICAgICogQHBhcmFtIHN0ZXAge1N0ZXB9XG4gICAgICovXG4gICAgcHVibGljIGNvbXBsZXRlU3RlcChzdGVwOiBTdGVwKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCB3aSA9IHRoaXM7XG4gICAgICAgIGxldCBzdGVwcyA9IHdpLnN0ZXBzO1xuICAgICAgICBsZXQgbWF0Y2hlZEluZGV4ID0gXy5maW5kSW5kZXgoc3RlcHMsIChzKSA9PiB7IHJldHVybiBzLm5hbWUgPT09IHN0ZXAubmFtZTsgfSk7XG4gICAgICAgIGlmIChzdGVwc1ttYXRjaGVkSW5kZXhdKSB7XG4gICAgICAgICAgICB3aS5zdGVwcy5zcGxpY2UobWF0Y2hlZEluZGV4LCAxKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWxpYXMgb2YgY29tcGxldGVTdGVwLlxuICAgICAqIEBwYXJhbSBzdGVwIHtTdGVwfVxuICAgICAqL1xuICAgIHB1YmxpYyByZW1vdmVTdGVwKHN0ZXA6IFN0ZXApIHtcbiAgICAgICAgdGhpcy5jb21wbGV0ZVN0ZXAoc3RlcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIGFycmF5IG9mIGluc3RhbmNlIHN0ZXBzLlxuICAgICAqIEByZXR1cm5zIHtTdGVwW119XG4gICAgICovXG4gICAgcHVibGljIGdldCBzdGVwcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0ZXBzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRTdGVwc1RyYW5zcG9ydCAoKSB7XG4gICAgICAgIGxldCBzdGVwcyA9IFtdO1xuICAgICAgICB0aGlzLnN0ZXBzLmZvckVhY2goc3RlcCA9PiB7XG4gICAgICAgICAgICBzdGVwcy5wdXNoKHtjb21wbGV0ZTogc3RlcC5jb21wbGV0ZSwgbmFtZTogc3RlcC5uYW1lfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3RlcHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcndyaXRlIHRoZSBpbnN0YW50IHN0ZXBzLlxuICAgICAqIEBwYXJhbSBzdGVwc1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgc3RlcHMoc3RlcHM6IGFueSkge1xuICAgICAgICB0aGlzLl9zdGVwcyA9IGNsb25lKHN0ZXBzKTtcbiAgICB9XG59Il19
