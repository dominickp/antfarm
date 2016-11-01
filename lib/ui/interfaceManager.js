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
        this._nest = webhookNest;
        this._interfaceInstances = [];
        this._fields = [];
        this._steps = [];
        this._handleRequest = handleRequest;
        this.initMetadata();
    }
    InterfaceManager.prototype.initMetadata = function () {
        this._metadata = {
            interfaceProperties: []
        };
    };
    Object.defineProperty(InterfaceManager.prototype, "metadata", {
        get: function () {
            return this._metadata;
        },
        set: function (metadata) {
            var clonedMetadata = clone(metadata);
            if (_.has(clonedMetadata, "interfaceProperties") && typeof (clonedMetadata.interfaceProperties) !== "undefined" && clonedMetadata.interfaceProperties.constructor === Array) {
            }
            else {
                clonedMetadata.interfaceProperties = [];
            }
            this._metadata = clonedMetadata;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceManager.prototype, "description", {
        set: function (description) {
            this.metadata.description = description;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceManager.prototype, "tooltip", {
        set: function (tooltip) {
            this.metadata.tooltip = tooltip;
        },
        enumerable: true,
        configurable: true
    });
    InterfaceManager.prototype.addInterfaceProperty = function (property) {
        this.metadata.interfaceProperties.push(property);
    };
    Object.defineProperty(InterfaceManager.prototype, "interfaceProperties", {
        set: function (properties) {
            this.metadata.interfaceProperties = properties;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceManager.prototype, "interfaceInstances", {
        get: function () {
            return this._interfaceInstances;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceManager.prototype, "checkpointNest", {
        get: function () {
            return this._checkpointNest;
        },
        set: function (nest) {
            this._checkpointNest = nest;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceManager.prototype, "customHandleRequest", {
        /**
         * Get the custom handleRequest function.
         * @returns {any}
         */
        get: function () {
            return this._handleRequest;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceManager.prototype, "nest", {
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
    Object.defineProperty(InterfaceManager.prototype, "path", {
        /**
         * Get the nest _path.
         * @returns {string}
         */
        get: function () {
            return this.nest.path;
        },
        enumerable: true,
        configurable: true
    });
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
    Object.defineProperty(InterfaceManager.prototype, "fields", {
        /**
         * Gets an array of interface fields.
         * @returns {FieldOptions[]}
         */
        get: function () {
            return this._fields;
        },
        enumerable: true,
        configurable: true
    });
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
    Object.defineProperty(InterfaceManager.prototype, "steps", {
        /**
         * Get an array of user interface steps.
         * @returns {Step[]}
         */
        get: function () {
            return this._steps;
        },
        enumerable: true,
        configurable: true
    });
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
            return i.getSessionId() === wi.sessionId;
        });
        if (removeSuccess) {
            im.e.log(0, "Removed webhook interface session " + wi.sessionId, im);
        }
        else {
            im.e.log(3, "Unable to remove webhook interface session " + wi.sessionId, im);
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
            wi.fields = im.fields;
            wi.steps = im.steps;
            wi.metadata = im.metadata;
            wi.checkpointNest = im.checkpointNest;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS9pbnRlcmZhY2VNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxpQ0FBK0Isb0JBQW9CLENBQUMsQ0FBQTtBQUdwRCxxQkFBbUIsUUFBUSxDQUFDLENBQUE7QUFLNUIsSUFBUSxDQUFDLEdBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUMvQixLQUFLLEdBQVMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXZDOzs7Ozs7Ozs7Ozs7R0FZRztBQUNIO0lBV0k7Ozs7O09BS0c7SUFDSCwwQkFBWSxDQUFjLEVBQUUsV0FBd0IsRUFBRSxhQUFtQjtRQUNyRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7UUFDcEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFUyx1Q0FBWSxHQUF0QjtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUc7WUFDYixtQkFBbUIsRUFBRSxFQUFFO1NBQ0wsQ0FBQztJQUMzQixDQUFDO0lBRUQsc0JBQVcsc0NBQVE7YUFBbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDO2FBRUQsVUFBb0IsUUFBMkI7WUFFM0MsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXJDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLFdBQVcsSUFBSSxjQUFjLENBQUMsbUJB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QkFBa0IsQ0FBQyxNQUFNLHVDQUFvQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pGLENBQUM7WUFDRCxFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGdDQUE4QixFQUFFLENBQUMsWUFBWSxFQUFFLE1BQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFRDs7O09BR0c7SUFDSSxvQ0FBUyxHQUFoQixVQUFpQixJQUFnQjtRQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztRQUMzQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0F0T0EsQUFzT0MsSUFBQTtBQXRPWSx3QkFBZ0IsbUJBc081QixDQUFBIiwiZmlsZSI6ImxpYi91aS9pbnRlcmZhY2VNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtXZWJob29rTmVzdH0gZnJvbSBcIi4uL25lc3Qvd2ViaG9va05lc3RcIjtcbmltcG9ydCB7V2ViaG9va0ludGVyZmFjZX0gZnJvbSBcIi4vd2ViaG9va0ludGVyZmFjZVwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0ZpZWxkT3B0aW9uc30gZnJvbSBcIi4vZmllbGRcIjtcbmltcG9ydCB7U3RlcH0gZnJvbSBcIi4vc3RlcFwiO1xuaW1wb3J0IHtJbnRlcmZhY2VNZXRhZGF0YX0gZnJvbSBcIi4vaW50ZXJmYWNlTWV0YWRhdGFcIjtcbmltcG9ydCB7SW50ZXJmYWNlUHJvcGVydHl9IGZyb20gXCIuL0ludGVyZmFjZVByb3BlcnR5XCI7XG5pbXBvcnQge0ZvbGRlck5lc3R9IGZyb20gXCIuLi9uZXN0L2ZvbGRlck5lc3RcIjtcblxuY29uc3QgICBfICAgICAgICAgICA9IHJlcXVpcmUoXCJsb2Rhc2hcIiksXG4gICAgICAgIGNsb25lICAgICAgID0gcmVxdWlyZShcImNsb25lXCIpO1xuXG4vKipcbiAqIFRoZSBpbnRlcmZhY2UgbWFuYWdlciBhbGxvd3MgeW91IHRvIHNlcGFyYXRlIHlvdXIgaW50ZXJmYWNlIGZpZWxkcyBmb3Igc3RlcHBlZCB1c2VyIGludGVyZmFjZXMuXG4gKiBJdCdzIGEgZmFjdG9yeSB0aGF0IGhhbmRsZXMgdGhlIGNvbnN0cnVjdGlvbiBhbmQgc2Vzc2lvbiBoYW5kbGluZyBvZiBXZWJob29rSW50ZXJmYWNlIGluc3RhbmNlcy5cbiAqICMjIyMgRXhhbXBsZVxuICogYGBganNcbiAqIHZhciBtYW5hZ2VyID0gd2ViaG9vay5nZXRJbnRlcmZhY2VNYW5hZ2VyKCk7XG4gKiBtYW5hZ2VyLmFkZEZpZWxkKHtcbiAqICAgICAgaWQ6IFwiam9iX251bWJlclwiLFxuICogICAgICBfbmFtZTogXCJKb2IgTnVtYmVyXCI7XG4gKiAgICAgIHR5cGU6IFwidGV4dFwiXG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgSW50ZXJmYWNlTWFuYWdlciB7XG5cbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG4gICAgcHJvdGVjdGVkIF9uZXN0OiBXZWJob29rTmVzdDtcbiAgICBwcm90ZWN0ZWQgX2ZpZWxkczogRmllbGRPcHRpb25zW107XG4gICAgcHJvdGVjdGVkIF9zdGVwczogU3RlcFtdO1xuICAgIHByb3RlY3RlZCBfaW50ZXJmYWNlSW5zdGFuY2VzOiBXZWJob29rSW50ZXJmYWNlW107XG4gICAgcHJvdGVjdGVkIF9oYW5kbGVSZXF1ZXN0OiBhbnk7XG4gICAgcHJvdGVjdGVkIF9tZXRhZGF0YTogSW50ZXJmYWNlTWV0YWRhdGE7XG4gICAgcHJvdGVjdGVkIF9jaGVja3BvaW50TmVzdDogRm9sZGVyTmVzdDtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGVcbiAgICAgKiBAcGFyYW0gd2ViaG9va05lc3RcbiAgICAgKiBAcGFyYW0gaGFuZGxlUmVxdWVzdCAgICAgT3B0aW9uYWwgY3VzdG9tIHJlcXVlc3QgaGFuZGxlciBmb3Igd2ViaG9va3MuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHdlYmhvb2tOZXN0OiBXZWJob29rTmVzdCwgaGFuZGxlUmVxdWVzdD86IGFueSkge1xuICAgICAgICB0aGlzLmUgPSBlO1xuICAgICAgICB0aGlzLl9uZXN0ID0gd2ViaG9va05lc3Q7XG4gICAgICAgIHRoaXMuX2ludGVyZmFjZUluc3RhbmNlcyA9IFtdO1xuICAgICAgICB0aGlzLl9maWVsZHMgPSBbXTtcbiAgICAgICAgdGhpcy5fc3RlcHMgPSBbXTtcbiAgICAgICAgdGhpcy5faGFuZGxlUmVxdWVzdCA9IGhhbmRsZVJlcXVlc3Q7XG4gICAgICAgIHRoaXMuaW5pdE1ldGFkYXRhKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGluaXRNZXRhZGF0YSgpIHtcbiAgICAgICAgdGhpcy5fbWV0YWRhdGEgPSB7XG4gICAgICAgICAgICBpbnRlcmZhY2VQcm9wZXJ0aWVzOiBbXVxuICAgICAgICB9IGFzIEludGVyZmFjZU1ldGFkYXRhO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgbWV0YWRhdGEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tZXRhZGF0YTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IG1ldGFkYXRhKG1ldGFkYXRhOiBJbnRlcmZhY2VNZXRhZGF0YSkge1xuXG4gICAgICAgIGxldCBjbG9uZWRNZXRhZGF0YSA9IGNsb25lKG1ldGFkYXRhKTtcblxuICAgICAgICBpZiAoXy5oYXMoY2xvbmVkTWV0YWRhdGEsIFwiaW50ZXJmYWNlUHJvcGVydGllc1wiKSAmJiB0eXBlb2YgKGNsb25lZE1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMpICE9PSBcInVuZGVmaW5lZFwiICYmIGNsb25lZE1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbG9uZWRNZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbWV0YWRhdGEgPSBjbG9uZWRNZXRhZGF0YTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGRlc2NyaXB0aW9uKGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YS5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgdG9vbHRpcCh0b29sdGlwOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5tZXRhZGF0YS50b29sdGlwID0gdG9vbHRpcDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkSW50ZXJmYWNlUHJvcGVydHkocHJvcGVydHk6IEludGVyZmFjZVByb3BlcnR5KSB7XG4gICAgICAgIHRoaXMubWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcy5wdXNoKHByb3BlcnR5KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGludGVyZmFjZVByb3BlcnRpZXMocHJvcGVydGllczogSW50ZXJmYWNlUHJvcGVydHlbXSkge1xuICAgICAgICB0aGlzLm1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaW50ZXJmYWNlSW5zdGFuY2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW50ZXJmYWNlSW5zdGFuY2VzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgY2hlY2twb2ludE5lc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jaGVja3BvaW50TmVzdDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGNoZWNrcG9pbnROZXN0KG5lc3Q6IEZvbGRlck5lc3QpIHtcbiAgICAgICAgdGhpcy5fY2hlY2twb2ludE5lc3QgPSBuZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY3VzdG9tIGhhbmRsZVJlcXVlc3QgZnVuY3Rpb24uXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGN1c3RvbUhhbmRsZVJlcXVlc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVSZXF1ZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmVzdFxuICAgICAqIEByZXR1cm5zIHtXZWJob29rTmVzdH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5lc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmVzdCBfcGF0aC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmVzdC5wYXRoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gaW50ZXJmYWNlIGZpZWxkIHRvIHRoZSBpbnRlcmZhY2UuXG4gICAgICogQHBhcmFtIHtGaWVsZE9wdGlvbnN9IGZpZWxkXG4gICAgICovXG4gICAgcHVibGljIGFkZEZpZWxkKGZpZWxkOiBGaWVsZE9wdGlvbnMpIHtcbiAgICAgICAgbGV0IHdpID0gdGhpcztcblxuICAgICAgICBsZXQgZXhpc3RpbmdGaWVsZCA9IF8uZmluZCh3aS5maWVsZHMsIGZ1bmN0aW9uKGYpIHsgcmV0dXJuIGYuaWQgPT09IGZpZWxkLmlkOyB9KTtcblxuICAgICAgICBpZiAoZXhpc3RpbmdGaWVsZCkge1xuICAgICAgICAgICAgd2kuZS5sb2coMywgYEZpZWxkIGlkIFwiJHtmaWVsZC5pZH1cIiBhbHJlYWR5IGV4aXN0cy4gSXQgY2Fubm90IGJlIGFkZGVkIGFnYWluLmAsIHdpKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZmllbGRzLnB1c2goZmllbGQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYW4gYXJyYXkgb2YgaW50ZXJmYWNlIGZpZWxkcy5cbiAgICAgKiBAcmV0dXJucyB7RmllbGRPcHRpb25zW119XG4gICAgICovXG4gICAgcHVibGljIGdldCBmaWVsZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maWVsZHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHVzZXIgaW50ZXJmYWNlIHN0ZXAuXG4gICAgICogQHBhcmFtIHN0ZXBOYW1lXG4gICAgICogQHBhcmFtIGNhbGxiYWNrICAgICAgICAgIFBhcmFtZXRlcnM6IFdlYmhvb2tKb2IsIFdlYmhvb2tJbnRlcmZhY2UsIFN0ZXAsIERvbmUgY2FsbGJhY2tcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqICBtYW5hZ2VyLmFkZFN0ZXAoXCJDaGVjayBqb2IgbnVtYmVyXCIsIGZ1bmN0aW9uKHdlYmhvb2tKb2IsIHdlYmhvb2tJbnRlcmZhY2UsIHN0ZXAsIGRvbmUpe1xuICAgICAqICAgICAgaWYod2ViaG9va0pvYi5nZXRRdWVyeVN0cmluZ1ZhbHVlKFwiam9iX251bWJlclwiKSl7XG4gICAgICogICAgICAgICAgd2ViaG9va0ludGVyZmFjZS5hZGRGaWVsZCh7XG4gICAgICogICAgICAgICAgICAgIGlkOiBcInNvbWV0aGluZ19lbHNlXCIsXG4gICAgICogICAgICAgICAgICAgIF9uYW1lOiBcIlNvbWUgb3RoZXIgZmllbGRcIixcbiAgICAgKiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICogICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoYW5rcyBmb3IgYWRkaW5nIGEgam9iIG51bWJlciFcIlxuICAgICAqICAgICAgICAgIH0pO1xuICAgICAqICAgICAgICAgIHN0ZXAuY29tcGxldGUgPSB0cnVlOyAvLyBNYXJrIHN0ZXAgYXMgY29tcGxldGVcbiAgICAgKiAgICAgICAgICBkb25lKCk7IC8vIENhbGxiYWNrIHRvIGRvIG5leHQgc3RlcCBvciBzZW5kIHJlc3BvbnNlIGlmIGNvbXBsZXRlXG4gICAgICogICAgICB9XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGFkZFN0ZXAoc3RlcE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBsZXQgc3RlcCA9IG5ldyBTdGVwKCk7XG4gICAgICAgIHN0ZXAubmFtZSA9IHN0ZXBOYW1lO1xuICAgICAgICBzdGVwLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHN0ZXAuY29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zdGVwcy5wdXNoKHN0ZXApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBhcnJheSBvZiB1c2VyIGludGVyZmFjZSBzdGVwcy5cbiAgICAgKiBAcmV0dXJucyB7U3RlcFtdfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgc3RlcHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGVwcztcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWRkSW50ZXJmYWNlSW5zdGFuY2Uod2k6IFdlYmhvb2tJbnRlcmZhY2UpIHtcbiAgICAgICAgbGV0IGltID0gdGhpcztcbiAgICAgICAgaW0uaW50ZXJmYWNlSW5zdGFuY2VzLnB1c2god2kpO1xuXG4gICAgICAgIC8vIERlc3RydWN0XG4gICAgICAgIGxldCBzZXNzaW9uRXhwaXJhdGlvbiA9IChpbS5lLm9wdGlvbnMud2ViaG9va19pbnRlcmZhY2Vfc2Vzc2lvbl90aW1lb3V0ICogNjAwMDApIHx8IDMwMDAwMDtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGltLnJlbW92ZUludGVyZmFjZUluc3RhbmNlKHdpKTtcbiAgICAgICAgfSwgc2Vzc2lvbkV4cGlyYXRpb24pO1xuXG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHJlbW92ZUludGVyZmFjZUluc3RhbmNlKHdpOiBXZWJob29rSW50ZXJmYWNlKSB7XG4gICAgICAgIGxldCBpbSA9IHRoaXM7XG4gICAgICAgIGxldCByZW1vdmVTdWNjZXNzID0gXy5yZW1vdmUodGhpcy5pbnRlcmZhY2VJbnN0YW5jZXMsIChpKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gaS5nZXRTZXNzaW9uSWQoKSA9PT0gd2kuc2Vzc2lvbklkO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVtb3ZlU3VjY2Vzcykge1xuICAgICAgICAgICAgaW0uZS5sb2coMCwgYFJlbW92ZWQgd2ViaG9vayBpbnRlcmZhY2Ugc2Vzc2lvbiAke3dpLnNlc3Npb25JZH1gLCBpbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbS5lLmxvZygzLCBgVW5hYmxlIHRvIHJlbW92ZSB3ZWJob29rIGludGVyZmFjZSBzZXNzaW9uICR7d2kuc2Vzc2lvbklkfWAsIGltKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIG9yIHJldHVybiBhIG5ldyB3ZWJob29rIGludGVyZmFjZSBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0gc2Vzc2lvbklkXG4gICAgICogQHJldHVybnMge1dlYmhvb2tJbnRlcmZhY2V9XG4gICAgICovXG4gICAgcHVibGljIGdldEludGVyZmFjZShzZXNzaW9uSWQ/OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGltID0gdGhpcztcbiAgICAgICAgbGV0IHdpO1xuICAgICAgICAvLyBGaW5kIGluIHRoaXMuaW50ZXJmYWNlSW5zdGFuY2VzXG4gICAgICAgIGlmIChzZXNzaW9uSWQpIHtcbiAgICAgICAgICAgIHdpID0gXy5maW5kKGltLmludGVyZmFjZUluc3RhbmNlcywgZnVuY3Rpb24oaSkgeyByZXR1cm4gaS5nZXRTZXNzaW9uSWQoKSA9PT0gc2Vzc2lvbklkOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghd2kpIHtcbiAgICAgICAgICAgIC8vIE1ha2UgbmV3IGludGVyZmFjZSBpZiBub3QgZm91bmRcbiAgICAgICAgICAgIHdpID0gbmV3IFdlYmhvb2tJbnRlcmZhY2UoaW0uZSwgaW0ubmVzdCk7XG5cbiAgICAgICAgICAgIHdpLmZpZWxkcyA9IGltLmZpZWxkcztcbiAgICAgICAgICAgIHdpLnN0ZXBzID0gaW0uc3RlcHM7XG4gICAgICAgICAgICB3aS5tZXRhZGF0YSA9IGltLm1ldGFkYXRhO1xuICAgICAgICAgICAgd2kuY2hlY2twb2ludE5lc3QgPSBpbS5jaGVja3BvaW50TmVzdDtcblxuICAgICAgICAgICAgaWYgKGltLmludGVyZmFjZUluc3RhbmNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBpbS5lLmFkZFdlYmhvb2tJbnRlcmZhY2UodGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGltLmUubG9nKDAsIGAke2ltLmludGVyZmFjZUluc3RhbmNlcy5sZW5ndGh9IGludGVyZmFjZSBzZXNzaW9ucyBhbHJlYWR5IGV4aXN0LmAsIGltKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGltLmFkZEludGVyZmFjZUluc3RhbmNlKHdpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGltLmUubG9nKDAsIGBSZXN0b3JlZCBpbnRlcmZhY2Ugc2Vzc2lvbiAke3dpLmdldFNlc3Npb25JZCgpfS5gLCBpbSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gd2k7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBwZW5kaW5nIGpvYnMgdG8gdGhlIGludGVyZmFjZXMgam9iIGxpc3QuXG4gICAgICogQHBhcmFtIG5lc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgY2hlY2tOZXN0KG5lc3Q6IEZvbGRlck5lc3QpIHtcbiAgICAgICAgdGhpcy5jaGVja3BvaW50TmVzdCA9IG5lc3Q7XG4gICAgICAgIG5lc3Qud2F0Y2hIb2xkKCk7XG4gICAgfVxufSJdfQ==
