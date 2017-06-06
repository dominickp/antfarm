"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS93ZWJob29rSW50ZXJmYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsK0JBQTRCO0FBTTVCLElBQVEsT0FBTyxHQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFDaEMsQ0FBQyxHQUFhLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFDL0IsS0FBSyxHQUFTLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUV2Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBQ0g7SUFVSTs7OztPQUlHO0lBQ0gsMEJBQVksQ0FBYyxFQUFFLElBQWlCO1FBQ3pDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFUyx1Q0FBWSxHQUF0QjtRQUNJLElBQUksQ0FBQyxRQUFRLEdBQUc7WUFDWixtQkFBbUIsRUFBRSxFQUFFO1NBQ0wsQ0FBQztJQUMzQixDQUFDO0lBRUQsc0JBQVcsc0NBQVE7YUFBbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDO1FBRUQ7OztXQUdHO2FBQ0gsVUFBb0IsUUFBMkI7WUFDM0MsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLCtEQUErRDtZQUMvRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxxQkFBcUIsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMvRyxDQUFDO1lBQUMsSUFB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QyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFTTCx1QkFBQztBQUFELENBelBBLEFBeVBDLElBQUE7QUF6UFksNENBQWdCIiwiZmlsZSI6ImxpYi91aS93ZWJob29rSW50ZXJmYWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XHJcbmltcG9ydCB7V2ViaG9va05lc3R9IGZyb20gXCIuLi9uZXN0L3dlYmhvb2tOZXN0XCI7XHJcbmltcG9ydCB7Rm9sZGVyTmVzdH0gZnJvbSBcIi4uL25lc3QvZm9sZGVyTmVzdFwiO1xyXG5pbXBvcnQge0ZpZWxkT3B0aW9uc30gZnJvbSBcIi4vZmllbGRcIjtcclxuaW1wb3J0IHtTdGVwfSBmcm9tIFwiLi9zdGVwXCI7XHJcbmltcG9ydCB7SW50ZXJmYWNlTWV0YWRhdGF9IGZyb20gXCIuL2ludGVyZmFjZU1ldGFkYXRhXCI7XHJcbmltcG9ydCB7SW50ZXJmYWNlUHJvcGVydHl9IGZyb20gXCIuL0ludGVyZmFjZVByb3BlcnR5XCI7XHJcbmltcG9ydCB7RmlsZUpvYn0gZnJvbSBcIi4uL2pvYi9maWxlSm9iXCI7XHJcbmltcG9ydCB7Rm9sZGVySm9ifSBmcm9tIFwiLi4vam9iL2ZvbGRlckpvYlwiO1xyXG5cclxuY29uc3QgICBzaG9ydGlkICAgICA9IHJlcXVpcmUoXCJzaG9ydGlkXCIpLFxyXG4gICAgICAgIF8gICAgICAgICAgID0gcmVxdWlyZShcImxvZGFzaFwiKSxcclxuICAgICAgICBjbG9uZSAgICAgICA9IHJlcXVpcmUoXCJjbG9uZVwiKTtcclxuXHJcbi8qKlxyXG4gKiBBIHdlYmhvb2sgaW50ZXJmYWNlIGluc3RhbmNlLCB0aWVkIHRvIGEgcGFydGljdWxhciBzZXNzaW9uLlxyXG4gKiBXaXRoaW4gaW50ZXJmYWNlIHN0ZXBzLCB5b3UgY2FuIHVzZSB0aGVzZSBtZXRob2RzIGRpcmVjdGx5IHRvIGFsdGVyIHRoZSBzY2hlbWEgYmVpbmcgcmV0dXJuZWQgdG8gdGhlIHVzZXIgaW50ZXJmYWNlLlxyXG4gKiAjIyMjIEV4YW1wbGVcclxuICogYGBganNcclxuICogdmFyIG1hbmFnZXIgPSB3ZWJob29rLmdldEludGVyZmFjZU1hbmFnZXIoKTtcclxuICogbWFuYWdlci5hZGRTdGVwKFwiQ2hlY2sgam9iIG51bWJlclwiLCBmdW5jdGlvbih3ZWJob29rSm9iLCB3ZWJob29rSW50ZXJmYWNlLCBzdGVwKXtcclxuICogICAgICBpZih3ZWJob29rSm9iLmdldFF1ZXJ5U3RyaW5nVmFsdWUoXCJqb2JfbnVtYmVyXCIpKXtcclxuICogICAgICAgICAgd2ViaG9va0ludGVyZmFjZS5hZGRGaWVsZCh7XHJcbiAqICAgICAgICAgICAgICBpZDogXCJzb21ldGhpbmdfZWxzZVwiLFxyXG4gKiAgICAgICAgICAgICAgX25hbWU6IFwiU29tZSBvdGhlciBmaWVsZFwiLFxyXG4gKiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAqICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGFua3MgZm9yIGFkZGluZyBhIGpvYiBudW1iZXIhXCJcclxuICogICAgICAgICAgfSk7XHJcbiAqICAgICAgICAgIHN0ZXAuY29tcGxldGUgPSB0cnVlOyAvLyBNYXJrIHN0ZXAgYXMgY29tcGxldGVcclxuICogICAgICB9XHJcbiAqIH0pO1xyXG4gKiBgYGBcclxuICovXHJcbmV4cG9ydCBjbGFzcyBXZWJob29rSW50ZXJmYWNlIHtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX2ZpZWxkczogRmllbGRPcHRpb25zW107XHJcbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgX25lc3Q6IFdlYmhvb2tOZXN0O1xyXG4gICAgcHJvdGVjdGVkIF9jaGVja3BvaW50TmVzdDogRm9sZGVyTmVzdDtcclxuICAgIHByb3RlY3RlZCBfc3RlcHM6IFN0ZXBbXTtcclxuICAgIHByb3RlY3RlZCBfc2Vzc2lvbklkOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgX21ldGFkYXRhOiBJbnRlcmZhY2VNZXRhZGF0YTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge0Vudmlyb25tZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge1dlYmhvb2tOZXN0fSBuZXN0XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBuZXN0OiBXZWJob29rTmVzdCkge1xyXG4gICAgICAgIHRoaXMuZSA9IGU7XHJcbiAgICAgICAgdGhpcy5fbmVzdCA9IG5lc3Q7XHJcbiAgICAgICAgdGhpcy5fc2Vzc2lvbklkID0gc2hvcnRpZC5nZW5lcmF0ZSgpO1xyXG4gICAgICAgIHRoaXMuX3N0ZXBzID0gW107XHJcbiAgICAgICAgdGhpcy5fZmllbGRzID0gW107XHJcbiAgICAgICAgdGhpcy5pbml0TWV0YWRhdGEoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgaW5pdE1ldGFkYXRhKCkge1xyXG4gICAgICAgIHRoaXMubWV0YWRhdGEgPSB7XHJcbiAgICAgICAgICAgIGludGVyZmFjZVByb3BlcnRpZXM6IFtdXHJcbiAgICAgICAgfSBhcyBJbnRlcmZhY2VNZXRhZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG1ldGFkYXRhKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9tZXRhZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgYSBjbG9uZWQgaW5zdGFuY2Ugb2YgbWV0YWRhdGEuXHJcbiAgICAgKiBAcGFyYW0gbWV0YWRhdGFcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBtZXRhZGF0YShtZXRhZGF0YTogSW50ZXJmYWNlTWV0YWRhdGEpIHtcclxuICAgICAgICBsZXQgY2xvbmVkTWV0YWRhdGEgPSBjbG9uZShtZXRhZGF0YSk7XHJcbiAgICAgICAgLy8gbGV0IGNsb25lZE1ldGFkYXRhID0gXy5jbG9uZShtZXRhZGF0YSkgYXMgSW50ZXJmYWNlTWV0YWRhdGE7XHJcbiAgICAgICAgaWYgKF8uaGFzKGNsb25lZE1ldGFkYXRhLCBcImludGVyZmFjZVByb3BlcnRpZXNcIikgJiYgY2xvbmVkTWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbG9uZWRNZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX21ldGFkYXRhID0gY2xvbmVkTWV0YWRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBkZXNjcmlwdGlvbihkZXNjcmlwdGlvbjogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5tZXRhZGF0YS5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgdG9vbHRpcCh0b29sdGlwOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm1ldGFkYXRhLnRvb2x0aXAgPSB0b29sdGlwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRJbnRlcmZhY2VQcm9wZXJ0eShwcm9wZXJ0eTogSW50ZXJmYWNlUHJvcGVydHkpIHtcclxuICAgICAgICB0aGlzLm1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMucHVzaChjbG9uZShwcm9wZXJ0eSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgaW50ZXJmYWNlUHJvcGVydGllcyhwcm9wZXJ0aWVzOiBJbnRlcmZhY2VQcm9wZXJ0eVtdKSB7XHJcbiAgICAgICAgdGhpcy5tZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzID0gY2xvbmUocHJvcGVydGllcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIHNlc3Npb24gaWQuIFVzZWQgdG8gbWF0Y2ggdG8gaW50ZXJmYWNlIGluc3RhbmNlZCB3aXRoaW4gdGhlIG1hbmFnZXIuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHNlc3Npb25JZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbklkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBuZXN0XHJcbiAgICAgKiBAcmV0dXJucyB7V2ViaG9va05lc3R9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgbmVzdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbmVzdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYW4gaW50ZXJmYWNlIGZpZWxkIHRvIHRoZSBpbnRlcmZhY2UuXHJcbiAgICAgKiBAcGFyYW0ge0ZpZWxkT3B0aW9uc30gZmllbGRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZEZpZWxkKGZpZWxkOiBGaWVsZE9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgd2kgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgZXhpc3RpbmdGaWVsZCA9IF8uZmluZCh3aS5maWVsZHMsIGZ1bmN0aW9uKGYpIHsgcmV0dXJuIGYuaWQgPT09IGZpZWxkLmlkOyB9KTtcclxuXHJcbiAgICAgICAgaWYgKGV4aXN0aW5nRmllbGQpIHtcclxuICAgICAgICAgICAgd2kuZS5sb2coMywgYEZpZWxkIGlkIFwiJHtmaWVsZC5pZH1cIiBhbHJlYWR5IGV4aXN0cy4gSXQgY2Fubm90IGJlIGFkZGVkIGFnYWluLmAsIHdpKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5maWVsZHMucHVzaChmaWVsZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgYW4gZXhpc3RpbmcgZmllbGQgZnJvbSB0aGUgaW50ZXJmYWNlIHRvIG1vZGlmeSBpdHMgcHJvcGVydGllcy5cclxuICAgICAqIEBwYXJhbSBmaWVsZElkXHJcbiAgICAgKiBAcmV0dXJucyB7RmllbGRPcHRpb25zfVxyXG4gICAgICogIyMjIyBFeGFtcGxlXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogaW0uYWRkU3RlcChcIkNoZWNrIGpvYiBudW1iZXJcIiwgZnVuY3Rpb24od2ViaG9va0pvYiwgd2ViaG9va0ludGVyZmFjZSwgc3RlcCwgZG9uZSkge1xyXG4gICAgICogICAgICBpZih3ZWJob29rSm9iLmdldFBhcmFtZXRlcihcImpvYl9udW1iZXJcIikubGVuZ3RoID09IDYpIHtcclxuICAgICAqICAgICAgICAgIC8vIE1ha2Ugam9iIG51bWJlciByZWFkIG9ubHlcclxuICAgICAqICAgICAgICAgIHZhciBqb2JOdW1iZXJGaWVsZCA9IHdlYmhvb2tJbnRlcmZhY2UuZ2V0RmllbGQoXCJqb2JfbnVtYmVyXCIpO1xyXG4gICAgICogICAgICAgICAgam9iTnVtYmVyRmllbGQucmVhZG9ubHkgPSB0cnVlO1xyXG4gICAgICogICAgICAgICAgLy8gQ29tcGxldGUgc3RlcFxyXG4gICAgICogICAgICAgICAgd2ViaG9va0ludGVyZmFjZS5jb21wbGV0ZVN0ZXAoc3RlcCk7XHJcbiAgICAgKiAgICAgIH0gZWxzZSB7XHJcbiAgICAgKiAgICAgICAgICBzdGVwLmZhaWx1cmUgPSBcIkpvYiBudW1iZXIgd2FzIG5vdCA2IGNoYXJhY3RlcnMuXCI7XHJcbiAgICAgKiAgICAgIH1cclxuICAgICAqICAgICAgZG9uZSgpO1xyXG4gICAgICogfSk7XHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEZpZWxkKGZpZWxkSWQ6IHN0cmluZykge1xyXG4gICAgICAgIGxldCB3aSA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIF8uZmluZCh3aS5maWVsZHMsIGZ1bmN0aW9uKGYpIHsgcmV0dXJuIGYuaWQgPT09IGZpZWxkSWQ7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3ZlcndyaXRlcyBmaWVsZHMgd2l0aCBhIGNsb25lLlxyXG4gICAgICogQHBhcmFtIGZpZWxkc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0IGZpZWxkcyhmaWVsZHM6IEZpZWxkT3B0aW9uc1tdKSB7XHJcbiAgICAgICAgdGhpcy5fZmllbGRzID0gY2xvbmUoZmllbGRzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBhbiBhcnJheSBvZiBhbGwgb2YgdGhlIGZpZWxkcy5cclxuICAgICAqIEByZXR1cm5zIHtGaWVsZE9wdGlvbnNbXX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBmaWVsZHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpZWxkcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGludGVyZmFjZSBmb3IgdHJhbnNwb3J0LlxyXG4gICAgICogQHJldHVybnMge3tmaWVsZHM6IEFycmF5fX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFRyYW5zcG9ydEludGVyZmFjZSgpIHtcclxuICAgICAgICBsZXQgd2kgPSB0aGlzO1xyXG4gICAgICAgIGxldCBqb2JzID0gd2kuZ2V0Sm9icygpO1xyXG4gICAgICAgIGxldCBqb2JzQXJyYXkgPSBbXTtcclxuXHJcbiAgICAgICAgam9icy5mb3JFYWNoKChqb2IpID0+IHtcclxuICAgICAgICAgICAgam9ic0FycmF5LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgaWQ6IGpvYi5pZCxcclxuICAgICAgICAgICAgICAgIG5hbWU6IGpvYi5uYW1lLFxyXG4gICAgICAgICAgICAgICAgcGF0aDogam9iLnBhdGhcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNlc3Npb25JZDogd2kuc2Vzc2lvbklkLFxyXG4gICAgICAgICAgICBmaWVsZHM6IHdpLmZpZWxkcyxcclxuICAgICAgICAgICAgaGVsZEpvYnM6IGpvYnNBcnJheSxcclxuICAgICAgICAgICAgc3RlcHM6IHdpLmdldFN0ZXBzVHJhbnNwb3J0KCksXHJcbiAgICAgICAgICAgIG1ldGFkYXRhOiB3aS5tZXRhZGF0YVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGNoZWNrZWQgam9icy5cclxuICAgICAqIEByZXR1cm5zIHsoRmlsZUpvYnxGb2xkZXJKb2IpW119XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRKb2JzKCkge1xyXG4gICAgICAgIGxldCB3aSA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHdpLmNoZWNrcG9pbnROZXN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB3aS5jaGVja3BvaW50TmVzdC5nZXRIZWxkSm9icygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBjaGVja3BvaW50IG5lc3QuXHJcbiAgICAgKiBAcGFyYW0gbmVzdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0IGNoZWNrcG9pbnROZXN0KG5lc3Q6IEZvbGRlck5lc3QpIHtcclxuICAgICAgICB0aGlzLl9jaGVja3BvaW50TmVzdCA9IG5lc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjaGVja3BvaW50TmVzdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2hlY2twb2ludE5lc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgdXNlciBpbnRlcmZhY2Ugc3RlcFxyXG4gICAgICogQHBhcmFtIHN0ZXBOYW1lXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZFN0ZXAoc3RlcE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgIGxldCBzdGVwID0gbmV3IFN0ZXAoKTtcclxuICAgICAgICBzdGVwLm5hbWUgPSBzdGVwTmFtZTtcclxuICAgICAgICBzdGVwLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgc3RlcC5jb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc3RlcHMucHVzaChzdGVwKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hcmsgYSBzdGVwIGFzIGNvbXBsZXRlIGFuZCByZW1vdmUgaXQgZnJvbSB0aGUgaW50ZXJmYWNlLlxyXG4gICAgICogQHBhcmFtIHN0ZXAge1N0ZXB9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjb21wbGV0ZVN0ZXAoc3RlcDogU3RlcCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB3aSA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHN0ZXBzID0gd2kuc3RlcHM7XHJcbiAgICAgICAgbGV0IG1hdGNoZWRJbmRleCA9IF8uZmluZEluZGV4KHN0ZXBzLCAocykgPT4geyByZXR1cm4gcy5uYW1lID09PSBzdGVwLm5hbWU7IH0pO1xyXG4gICAgICAgIGlmIChzdGVwc1ttYXRjaGVkSW5kZXhdKSB7XHJcbiAgICAgICAgICAgIHdpLnN0ZXBzLnNwbGljZShtYXRjaGVkSW5kZXgsIDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWxpYXMgb2YgY29tcGxldGVTdGVwLlxyXG4gICAgICogQHBhcmFtIHN0ZXAge1N0ZXB9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZW1vdmVTdGVwKHN0ZXA6IFN0ZXApIHtcclxuICAgICAgICB0aGlzLmNvbXBsZXRlU3RlcChzdGVwKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBhbiBhcnJheSBvZiBpbnN0YW5jZSBzdGVwcy5cclxuICAgICAqIEByZXR1cm5zIHtTdGVwW119XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgc3RlcHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0ZXBzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRTdGVwc1RyYW5zcG9ydCAoKSB7XHJcbiAgICAgICAgbGV0IHN0ZXBzID0gW107XHJcbiAgICAgICAgdGhpcy5zdGVwcy5mb3JFYWNoKHN0ZXAgPT4ge1xyXG4gICAgICAgICAgICBzdGVwcy5wdXNoKHtjb21wbGV0ZTogc3RlcC5jb21wbGV0ZSwgbmFtZTogc3RlcC5uYW1lfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHN0ZXBzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3ZlcndyaXRlIHRoZSBpbnN0YW50IHN0ZXBzLlxyXG4gICAgICogQHBhcmFtIHN0ZXBzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgc3RlcHMoc3RlcHM6IGFueSkge1xyXG4gICAgICAgIHRoaXMuX3N0ZXBzID0gY2xvbmUoc3RlcHMpO1xyXG4gICAgfVxyXG59Il19
