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
            steps: wi.steps,
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
    return WebhookInterface;
}());
exports.WebhookInterface = WebhookInterface;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS93ZWJob29rSW50ZXJmYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFJQSxxQkFBbUIsUUFBUSxDQUFDLENBQUE7QUFNNUIsSUFBUSxPQUFPLEdBQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUNoQyxDQUFDLEdBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUMvQixLQUFLLEdBQVMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSDtJQVVJOzs7O09BSUc7SUFDSCwwQkFBWSxDQUFjLEVBQUUsSUFBaUI7UUFDekMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVTLHVDQUFZLEdBQXRCO1FBQ0ksSUFBSSxDQUFDLFFBQVEsR0FBRztZQUNaLG1CQUFtQixFQUFFLEVBQUU7U0FDTCxDQUFDO0lBQzNCLENBQUM7SUFFRCxzQkFBVyxzQ0FBUTthQUFuQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7UUFFRDs7O1dBR0c7YUFDSCxVQUFvQixRQUEyQjtZQUMzQyxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckMsK0RBQStEO1lBQy9ELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLElBQUksY0FBYyxDQUFDLG1CQUFtQixDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQy9H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cG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtXZWJob29rTmVzdH0gZnJvbSBcIi4uL25lc3Qvd2ViaG9va05lc3RcIjtcbmltcG9ydCB7Rm9sZGVyTmVzdH0gZnJvbSBcIi4uL25lc3QvZm9sZGVyTmVzdFwiO1xuaW1wb3J0IHtGaWVsZE9wdGlvbnN9IGZyb20gXCIuL2ZpZWxkXCI7XG5pbXBvcnQge1N0ZXB9IGZyb20gXCIuL3N0ZXBcIjtcbmltcG9ydCB7SW50ZXJmYWNlTWV0YWRhdGF9IGZyb20gXCIuL2ludGVyZmFjZU1ldGFkYXRhXCI7XG5pbXBvcnQge0ludGVyZmFjZVByb3BlcnR5fSBmcm9tIFwiLi9JbnRlcmZhY2VQcm9wZXJ0eVwiO1xuaW1wb3J0IHtGaWxlSm9ifSBmcm9tIFwiLi4vam9iL2ZpbGVKb2JcIjtcbmltcG9ydCB7Rm9sZGVySm9ifSBmcm9tIFwiLi4vam9iL2ZvbGRlckpvYlwiO1xuXG5jb25zdCAgIHNob3J0aWQgICAgID0gcmVxdWlyZShcInNob3J0aWRcIiksXG4gICAgICAgIF8gICAgICAgICAgID0gcmVxdWlyZShcImxvZGFzaFwiKSxcbiAgICAgICAgY2xvbmUgICAgICAgPSByZXF1aXJlKFwiY2xvbmVcIik7XG5cbi8qKlxuICogQSB3ZWJob29rIGludGVyZmFjZSBpbnN0YW5jZSwgdGllZCB0byBhIHBhcnRpY3VsYXIgc2Vzc2lvbi5cbiAqIFdpdGhpbiBpbnRlcmZhY2Ugc3RlcHMsIHlvdSBjYW4gdXNlIHRoZXNlIG1ldGhvZHMgZGlyZWN0bHkgdG8gYWx0ZXIgdGhlIHNjaGVtYSBiZWluZyByZXR1cm5lZCB0byB0aGUgdXNlciBpbnRlcmZhY2UuXG4gKiAjIyMjIEV4YW1wbGVcbiAqIGBgYGpzXG4gKiB2YXIgbWFuYWdlciA9IHdlYmhvb2suZ2V0SW50ZXJmYWNlTWFuYWdlcigpO1xuICogbWFuYWdlci5hZGRTdGVwKFwiQ2hlY2sgam9iIG51bWJlclwiLCBmdW5jdGlvbih3ZWJob29rSm9iLCB3ZWJob29rSW50ZXJmYWNlLCBzdGVwKXtcbiAqICAgICAgaWYod2ViaG9va0pvYi5nZXRRdWVyeVN0cmluZ1ZhbHVlKFwiam9iX251bWJlclwiKSl7XG4gKiAgICAgICAgICB3ZWJob29rSW50ZXJmYWNlLmFkZEZpZWxkKHtcbiAqICAgICAgICAgICAgICBpZDogXCJzb21ldGhpbmdfZWxzZVwiLFxuICogICAgICAgICAgICAgIF9uYW1lOiBcIlNvbWUgb3RoZXIgZmllbGRcIixcbiAqICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcbiAqICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGFua3MgZm9yIGFkZGluZyBhIGpvYiBudW1iZXIhXCJcbiAqICAgICAgICAgIH0pO1xuICogICAgICAgICAgc3RlcC5jb21wbGV0ZSA9IHRydWU7IC8vIE1hcmsgc3RlcCBhcyBjb21wbGV0ZVxuICogICAgICB9XG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgV2ViaG9va0ludGVyZmFjZSB7XG5cbiAgICBwcm90ZWN0ZWQgX2ZpZWxkczogRmllbGRPcHRpb25zW107XG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuICAgIHByb3RlY3RlZCBfbmVzdDogV2ViaG9va05lc3Q7XG4gICAgcHJvdGVjdGVkIF9jaGVja3BvaW50TmVzdDogRm9sZGVyTmVzdDtcbiAgICBwcm90ZWN0ZWQgX3N0ZXBzOiBTdGVwW107XG4gICAgcHJvdGVjdGVkIF9zZXNzaW9uSWQ6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX21ldGFkYXRhOiBJbnRlcmZhY2VNZXRhZGF0YTtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtFbnZpcm9ubWVudH0gZVxuICAgICAqIEBwYXJhbSB7V2ViaG9va05lc3R9IG5lc3RcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgbmVzdDogV2ViaG9va05lc3QpIHtcbiAgICAgICAgdGhpcy5lID0gZTtcbiAgICAgICAgdGhpcy5fbmVzdCA9IG5lc3Q7XG4gICAgICAgIHRoaXMuX3Nlc3Npb25JZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgdGhpcy5fc3RlcHMgPSBbXTtcbiAgICAgICAgdGhpcy5fZmllbGRzID0gW107XG4gICAgICAgIHRoaXMuaW5pdE1ldGFkYXRhKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGluaXRNZXRhZGF0YSgpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YSA9IHtcbiAgICAgICAgICAgIGludGVyZmFjZVByb3BlcnRpZXM6IFtdXG4gICAgICAgIH0gYXMgSW50ZXJmYWNlTWV0YWRhdGE7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBtZXRhZGF0YSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21ldGFkYXRhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgYSBjbG9uZWQgaW5zdGFuY2Ugb2YgbWV0YWRhdGEuXG4gICAgICogQHBhcmFtIG1ldGFkYXRhXG4gICAgICovXG4gICAgcHVibGljIHNldCBtZXRhZGF0YShtZXRhZGF0YTogSW50ZXJmYWNlTWV0YWRhdGEpIHtcbiAgICAgICAgbGV0IGNsb25lZE1ldGFkYXRhID0gY2xvbmUobWV0YWRhdGEpO1xuICAgICAgICAvLyBsZXQgY2xvbmVkTWV0YWRhdGEgPSBfLmNsb25lKG1ldGFkYXRhKSBhcyBJbnRlcmZhY2VNZXRhZGF0YTtcbiAgICAgICAgaWYgKF8uaGFzKGNsb25lZE1ldGFkYXRhLCBcImludGVyZmFjZVByb3BlcnRpZXNcIikgJiYgY2xvbmVkTWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsb25lZE1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9tZXRhZGF0YSA9IGNsb25lZE1ldGFkYXRhO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgZGVzY3JpcHRpb24oZGVzY3JpcHRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLm1ldGFkYXRhLmRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG4gICAgfVxuXG4gICAgcHVibGljIHNldCB0b29sdGlwKHRvb2x0aXA6IHN0cmluZykge1xuICAgICAgICB0aGlzLm1ldGFkYXRhLnRvb2x0aXAgPSB0b29sdGlwO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRJbnRlcmZhY2VQcm9wZXJ0eShwcm9wZXJ0eTogSW50ZXJmYWNlUHJvcGVydHkpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzLnB1c2goY2xvbmUocHJvcGVydHkpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGludGVyZmFjZVByb3BlcnRpZXMocHJvcGVydGllczogSW50ZXJmYWNlUHJvcGVydHlbXSkge1xuICAgICAgICB0aGlzLm1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMgPSBjbG9uZShwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIHNlc3Npb24gaWQuIFVzZWQgdG8gbWF0Y2ggdG8gaW50ZXJmYWNlIGluc3RhbmNlZCB3aXRoaW4gdGhlIG1hbmFnZXIuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHNlc3Npb25JZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Nlc3Npb25JZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG5lc3RcbiAgICAgKiBAcmV0dXJucyB7V2ViaG9va05lc3R9XG4gICAgICovXG4gICAgcHVibGljIGdldCBuZXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIGludGVyZmFjZSBmaWVsZCB0byB0aGUgaW50ZXJmYWNlLlxuICAgICAqIEBwYXJhbSB7RmllbGRPcHRpb25zfSBmaWVsZFxuICAgICAqL1xuICAgIHB1YmxpYyBhZGRGaWVsZChmaWVsZDogRmllbGRPcHRpb25zKSB7XG4gICAgICAgIGxldCB3aSA9IHRoaXM7XG5cbiAgICAgICAgbGV0IGV4aXN0aW5nRmllbGQgPSBfLmZpbmQod2kuZmllbGRzLCBmdW5jdGlvbihmKSB7IHJldHVybiBmLmlkID09PSBmaWVsZC5pZDsgfSk7XG5cbiAgICAgICAgaWYgKGV4aXN0aW5nRmllbGQpIHtcbiAgICAgICAgICAgIHdpLmUubG9nKDMsIGBGaWVsZCBpZCBcIiR7ZmllbGQuaWR9XCIgYWxyZWFkeSBleGlzdHMuIEl0IGNhbm5vdCBiZSBhZGRlZCBhZ2Fpbi5gLCB3aSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZpZWxkcy5wdXNoKGZpZWxkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYW4gZXhpc3RpbmcgZmllbGQgZnJvbSB0aGUgaW50ZXJmYWNlIHRvIG1vZGlmeSBpdHMgcHJvcGVydGllcy5cbiAgICAgKiBAcGFyYW0gZmllbGRJZFxuICAgICAqIEByZXR1cm5zIHtGaWVsZE9wdGlvbnN9XG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBpbS5hZGRTdGVwKFwiQ2hlY2sgam9iIG51bWJlclwiLCBmdW5jdGlvbih3ZWJob29rSm9iLCB3ZWJob29rSW50ZXJmYWNlLCBzdGVwLCBkb25lKSB7XG4gICAgICogICAgICBpZih3ZWJob29rSm9iLmdldFBhcmFtZXRlcihcImpvYl9udW1iZXJcIikubGVuZ3RoID09IDYpIHtcbiAgICAgKiAgICAgICAgICAvLyBNYWtlIGpvYiBudW1iZXIgcmVhZCBvbmx5XG4gICAgICogICAgICAgICAgdmFyIGpvYk51bWJlckZpZWxkID0gd2ViaG9va0ludGVyZmFjZS5nZXRGaWVsZChcImpvYl9udW1iZXJcIik7XG4gICAgICogICAgICAgICAgam9iTnVtYmVyRmllbGQucmVhZG9ubHkgPSB0cnVlO1xuICAgICAqICAgICAgICAgIC8vIENvbXBsZXRlIHN0ZXBcbiAgICAgKiAgICAgICAgICB3ZWJob29rSW50ZXJmYWNlLmNvbXBsZXRlU3RlcChzdGVwKTtcbiAgICAgKiAgICAgIH0gZWxzZSB7XG4gICAgICogICAgICAgICAgc3RlcC5mYWlsdXJlID0gXCJKb2IgbnVtYmVyIHdhcyBub3QgNiBjaGFyYWN0ZXJzLlwiO1xuICAgICAqICAgICAgfVxuICAgICAqICAgICAgZG9uZSgpO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRGaWVsZChmaWVsZElkOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHdpID0gdGhpcztcbiAgICAgICAgcmV0dXJuIF8uZmluZCh3aS5maWVsZHMsIGZ1bmN0aW9uKGYpIHsgcmV0dXJuIGYuaWQgPT09IGZpZWxkSWQ7IH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJ3cml0ZXMgZmllbGRzIHdpdGggYSBjbG9uZS5cbiAgICAgKiBAcGFyYW0gZmllbGRzXG4gICAgICovXG4gICAgcHVibGljIHNldCBmaWVsZHMoZmllbGRzOiBGaWVsZE9wdGlvbnNbXSkge1xuICAgICAgICB0aGlzLl9maWVsZHMgPSBjbG9uZShmaWVsZHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBhcnJheSBvZiBhbGwgb2YgdGhlIGZpZWxkcy5cbiAgICAgKiBAcmV0dXJucyB7RmllbGRPcHRpb25zW119XG4gICAgICovXG4gICAgcHVibGljIGdldCBmaWVsZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maWVsZHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaW50ZXJmYWNlIGZvciB0cmFuc3BvcnQuXG4gICAgICogQHJldHVybnMge3tmaWVsZHM6IEFycmF5fX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VHJhbnNwb3J0SW50ZXJmYWNlKCkge1xuICAgICAgICBsZXQgd2kgPSB0aGlzO1xuICAgICAgICBsZXQgam9icyA9IHdpLmdldEpvYnMoKTtcbiAgICAgICAgbGV0IGpvYnNBcnJheSA9IFtdO1xuXG4gICAgICAgIGpvYnMuZm9yRWFjaCgoam9iKSA9PiB7XG4gICAgICAgICAgICBqb2JzQXJyYXkucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6IGpvYi5pZCxcbiAgICAgICAgICAgICAgICBuYW1lOiBqb2IubmFtZSxcbiAgICAgICAgICAgICAgICBwYXRoOiBqb2IucGF0aFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZXNzaW9uSWQ6IHdpLnNlc3Npb25JZCxcbiAgICAgICAgICAgIGZpZWxkczogd2kuZmllbGRzLFxuICAgICAgICAgICAgaGVsZEpvYnM6IGpvYnNBcnJheSxcbiAgICAgICAgICAgIHN0ZXBzOiB3aS5zdGVwcyxcbiAgICAgICAgICAgIG1ldGFkYXRhOiB3aS5tZXRhZGF0YVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgY2hlY2tlZCBqb2JzLlxuICAgICAqIEByZXR1cm5zIHsoRmlsZUpvYnxGb2xkZXJKb2IpW119XG4gICAgICovXG4gICAgcHVibGljIGdldEpvYnMoKSB7XG4gICAgICAgIGxldCB3aSA9IHRoaXM7XG4gICAgICAgIGlmICh3aS5jaGVja3BvaW50TmVzdCkge1xuICAgICAgICAgICAgcmV0dXJuIHdpLmNoZWNrcG9pbnROZXN0LmdldEhlbGRKb2JzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBjaGVja3BvaW50IG5lc3QuXG4gICAgICogQHBhcmFtIG5lc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGNoZWNrcG9pbnROZXN0KG5lc3Q6IEZvbGRlck5lc3QpIHtcbiAgICAgICAgdGhpcy5fY2hlY2twb2ludE5lc3QgPSBuZXN0O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgY2hlY2twb2ludE5lc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jaGVja3BvaW50TmVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdXNlciBpbnRlcmZhY2Ugc3RlcFxuICAgICAqIEBwYXJhbSBzdGVwTmFtZVxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBhZGRTdGVwKHN0ZXBOYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgbGV0IHN0ZXAgPSBuZXcgU3RlcCgpO1xuICAgICAgICBzdGVwLm5hbWUgPSBzdGVwTmFtZTtcbiAgICAgICAgc3RlcC5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICBzdGVwLmNvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc3RlcHMucHVzaChzdGVwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYXJrIGEgc3RlcCBhcyBjb21wbGV0ZSBhbmQgcmVtb3ZlIGl0IGZyb20gdGhlIGludGVyZmFjZS5cbiAgICAgKiBAcGFyYW0gc3RlcCB7U3RlcH1cbiAgICAgKi9cbiAgICBwdWJsaWMgY29tcGxldGVTdGVwKHN0ZXA6IFN0ZXApOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHdpID0gdGhpcztcbiAgICAgICAgbGV0IHN0ZXBzID0gd2kuc3RlcHM7XG4gICAgICAgIGxldCBtYXRjaGVkSW5kZXggPSBfLmZpbmRJbmRleChzdGVwcywgKHMpID0+IHsgcmV0dXJuIHMubmFtZSA9PT0gc3RlcC5uYW1lOyB9KTtcbiAgICAgICAgaWYgKHN0ZXBzW21hdGNoZWRJbmRleF0pIHtcbiAgICAgICAgICAgIHdpLnN0ZXBzLnNwbGljZShtYXRjaGVkSW5kZXgsIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbGlhcyBvZiBjb21wbGV0ZVN0ZXAuXG4gICAgICogQHBhcmFtIHN0ZXAge1N0ZXB9XG4gICAgICovXG4gICAgcHVibGljIHJlbW92ZVN0ZXAoc3RlcDogU3RlcCkge1xuICAgICAgICB0aGlzLmNvbXBsZXRlU3RlcChzdGVwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYW4gYXJyYXkgb2YgaW5zdGFuY2Ugc3RlcHMuXG4gICAgICogQHJldHVybnMge1N0ZXBbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHN0ZXBzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RlcHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcndyaXRlIHRoZSBpbnN0YW50IHN0ZXBzLlxuICAgICAqIEBwYXJhbSBzdGVwc1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgc3RlcHMoc3RlcHM6IGFueSkge1xuICAgICAgICB0aGlzLl9zdGVwcyA9IGNsb25lKHN0ZXBzKTtcbiAgICB9XG59Il19
