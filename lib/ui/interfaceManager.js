"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        this._steps.push(step);
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
        var removeSuccess = _.remove(im.interfaceInstances, function (i) {
            return i.sessionId === wi.sessionId;
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
            wi = _.find(im.interfaceInstances, function (i) { return i.sessionId === sessionId; });
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
            im.e.log(0, "Restored interface session " + wi.sessionId + ".", im);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS9pbnRlcmZhY2VNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsdURBQW9EO0FBR3BELCtCQUE0QjtBQUs1QixJQUFRLENBQUMsR0FBYSxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQy9CLEtBQUssR0FBUyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFdkM7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0g7SUFXSTs7Ozs7T0FLRztJQUNILDBCQUFZLENBQWMsRUFBRSxXQUF3QixFQUFFLGFBQW1CO1FBQ3JFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDekIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztRQUNwQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVTLHVDQUFZLEdBQXRCO1FBQ0ksSUFBSSxDQUFDLFNBQVMsR0FBRztZQUNiLG1CQUFtQixFQUFFLEVBQUU7U0FDTCxDQUFDO0lBQzNCLENBQUM7SUFFRCxzQkFBVyxzQ0FBUTthQUFuQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7YUFFRCxVQUFvQixRQUEyQjtZQUUzQyxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFckMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUscUJBQXFCLENBQUMsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLEtBQUssV0FBVyxJQUFJLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFDLENB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LENBQUMsQ0FBQztZQUN6RixDQUFDO1lBQ0QsRUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxnQ0FBOEIsRUFBRSxDQUFDLFNBQVMsTUFBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCxNQUFNLENBQUMsRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7T0FHRztJQUNJLG9DQUFTLEdBQWhCLFVBQWlCLElBQWdCO1FBQzdCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBQ0wsdUJBQUM7QUFBRCxDQXRPQSxBQXNPQyxJQUFBO0FBdE9ZLDRDQUFnQiIsImZpbGUiOiJsaWIvdWkvaW50ZXJmYWNlTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7V2ViaG9va05lc3R9IGZyb20gXCIuLi9uZXN0L3dlYmhvb2tOZXN0XCI7XHJcbmltcG9ydCB7V2ViaG9va0ludGVyZmFjZX0gZnJvbSBcIi4vd2ViaG9va0ludGVyZmFjZVwiO1xyXG5pbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcclxuaW1wb3J0IHtGaWVsZE9wdGlvbnN9IGZyb20gXCIuL2ZpZWxkXCI7XHJcbmltcG9ydCB7U3RlcH0gZnJvbSBcIi4vc3RlcFwiO1xyXG5pbXBvcnQge0ludGVyZmFjZU1ldGFkYXRhfSBmcm9tIFwiLi9pbnRlcmZhY2VNZXRhZGF0YVwiO1xyXG5pbXBvcnQge0ludGVyZmFjZVByb3BlcnR5fSBmcm9tIFwiLi9JbnRlcmZhY2VQcm9wZXJ0eVwiO1xyXG5pbXBvcnQge0ZvbGRlck5lc3R9IGZyb20gXCIuLi9uZXN0L2ZvbGRlck5lc3RcIjtcclxuXHJcbmNvbnN0ICAgXyAgICAgICAgICAgPSByZXF1aXJlKFwibG9kYXNoXCIpLFxyXG4gICAgICAgIGNsb25lICAgICAgID0gcmVxdWlyZShcImNsb25lXCIpO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBpbnRlcmZhY2UgbWFuYWdlciBhbGxvd3MgeW91IHRvIHNlcGFyYXRlIHlvdXIgaW50ZXJmYWNlIGZpZWxkcyBmb3Igc3RlcHBlZCB1c2VyIGludGVyZmFjZXMuXHJcbiAqIEl0J3MgYSBmYWN0b3J5IHRoYXQgaGFuZGxlcyB0aGUgY29uc3RydWN0aW9uIGFuZCBzZXNzaW9uIGhhbmRsaW5nIG9mIFdlYmhvb2tJbnRlcmZhY2UgaW5zdGFuY2VzLlxyXG4gKiAjIyMjIEV4YW1wbGVcclxuICogYGBganNcclxuICogdmFyIG1hbmFnZXIgPSB3ZWJob29rLmdldEludGVyZmFjZU1hbmFnZXIoKTtcclxuICogbWFuYWdlci5hZGRGaWVsZCh7XHJcbiAqICAgICAgaWQ6IFwiam9iX251bWJlclwiLFxyXG4gKiAgICAgIF9uYW1lOiBcIkpvYiBOdW1iZXJcIjtcclxuICogICAgICB0eXBlOiBcInRleHRcIlxyXG4gKiB9KTtcclxuICogYGBgXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgSW50ZXJmYWNlTWFuYWdlciB7XHJcblxyXG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xyXG4gICAgcHJvdGVjdGVkIF9uZXN0OiBXZWJob29rTmVzdDtcclxuICAgIHByb3RlY3RlZCBfZmllbGRzOiBGaWVsZE9wdGlvbnNbXTtcclxuICAgIHByb3RlY3RlZCBfc3RlcHM6IFN0ZXBbXTtcclxuICAgIHByb3RlY3RlZCBfaW50ZXJmYWNlSW5zdGFuY2VzOiBXZWJob29rSW50ZXJmYWNlW107XHJcbiAgICBwcm90ZWN0ZWQgX2hhbmRsZVJlcXVlc3Q6IGFueTtcclxuICAgIHByb3RlY3RlZCBfbWV0YWRhdGE6IEludGVyZmFjZU1ldGFkYXRhO1xyXG4gICAgcHJvdGVjdGVkIF9jaGVja3BvaW50TmVzdDogRm9sZGVyTmVzdDtcclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZVxyXG4gICAgICogQHBhcmFtIHdlYmhvb2tOZXN0XHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlUmVxdWVzdCAgICAgT3B0aW9uYWwgY3VzdG9tIHJlcXVlc3QgaGFuZGxlciBmb3Igd2ViaG9va3MuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCB3ZWJob29rTmVzdDogV2ViaG9va05lc3QsIGhhbmRsZVJlcXVlc3Q/OiBhbnkpIHtcclxuICAgICAgICB0aGlzLmUgPSBlO1xyXG4gICAgICAgIHRoaXMuX25lc3QgPSB3ZWJob29rTmVzdDtcclxuICAgICAgICB0aGlzLl9pbnRlcmZhY2VJbnN0YW5jZXMgPSBbXTtcclxuICAgICAgICB0aGlzLl9maWVsZHMgPSBbXTtcclxuICAgICAgICB0aGlzLl9zdGVwcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZVJlcXVlc3QgPSBoYW5kbGVSZXF1ZXN0O1xyXG4gICAgICAgIHRoaXMuaW5pdE1ldGFkYXRhKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGluaXRNZXRhZGF0YSgpIHtcclxuICAgICAgICB0aGlzLl9tZXRhZGF0YSA9IHtcclxuICAgICAgICAgICAgaW50ZXJmYWNlUHJvcGVydGllczogW11cclxuICAgICAgICB9IGFzIEludGVyZmFjZU1ldGFkYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbWV0YWRhdGEoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21ldGFkYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgbWV0YWRhdGEobWV0YWRhdGE6IEludGVyZmFjZU1ldGFkYXRhKSB7XHJcblxyXG4gICAgICAgIGxldCBjbG9uZWRNZXRhZGF0YSA9IGNsb25lKG1ldGFkYXRhKTtcclxuXHJcbiAgICAgICAgaWYgKF8uaGFzKGNsb25lZE1ldGFkYXRhLCBcImludGVyZmFjZVByb3BlcnRpZXNcIikgJiYgdHlwZW9mIChjbG9uZWRNZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzKSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjbG9uZWRNZXRhZGF0YS5pbnRlcmZhY2VQcm9wZXJ0aWVzLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNsb25lZE1ldGFkYXRhLmludGVyZmFjZVByb3BlcnRpZXMgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWV0YWRhdGEgPSBjbG9uZWRNZXRhZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGRlc2NyaXB0aW9uKGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm1ldGFkYXRhLmRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCB0b29sdGlwKHRvb2x0aXA6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMubWV0YWRhdGEudG9vbHRpcCA9IHRvb2x0aXA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZEludGVyZmFjZVByb3BlcnR5KHByb3BlcnR5OiBJbnRlcmZhY2VQcm9wZXJ0eSkge1xyXG4gICAgICAgIHRoaXMubWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcy5wdXNoKHByb3BlcnR5KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGludGVyZmFjZVByb3BlcnRpZXMocHJvcGVydGllczogSW50ZXJmYWNlUHJvcGVydHlbXSkge1xyXG4gICAgICAgIHRoaXMubWV0YWRhdGEuaW50ZXJmYWNlUHJvcGVydGllcyA9IHByb3BlcnRpZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBpbnRlcmZhY2VJbnN0YW5jZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludGVyZmFjZUluc3RhbmNlcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNoZWNrcG9pbnROZXN0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jaGVja3BvaW50TmVzdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGNoZWNrcG9pbnROZXN0KG5lc3Q6IEZvbGRlck5lc3QpIHtcclxuICAgICAgICB0aGlzLl9jaGVja3BvaW50TmVzdCA9IG5lc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIGN1c3RvbSBoYW5kbGVSZXF1ZXN0IGZ1bmN0aW9uLlxyXG4gICAgICogQHJldHVybnMge2FueX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBjdXN0b21IYW5kbGVSZXF1ZXN0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVSZXF1ZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBuZXN0XHJcbiAgICAgKiBAcmV0dXJucyB7V2ViaG9va05lc3R9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgbmVzdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbmVzdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgbmVzdCBfcGF0aC5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgcGF0aCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5uZXN0LnBhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGFuIGludGVyZmFjZSBmaWVsZCB0byB0aGUgaW50ZXJmYWNlLlxyXG4gICAgICogQHBhcmFtIHtGaWVsZE9wdGlvbnN9IGZpZWxkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRGaWVsZChmaWVsZDogRmllbGRPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IHdpID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IGV4aXN0aW5nRmllbGQgPSBfLmZpbmQod2kuZmllbGRzLCBmdW5jdGlvbihmKSB7IHJldHVybiBmLmlkID09PSBmaWVsZC5pZDsgfSk7XHJcblxyXG4gICAgICAgIGlmIChleGlzdGluZ0ZpZWxkKSB7XHJcbiAgICAgICAgICAgIHdpLmUubG9nKDMsIGBGaWVsZCBpZCBcIiR7ZmllbGQuaWR9XCIgYWxyZWFkeSBleGlzdHMuIEl0IGNhbm5vdCBiZSBhZGRlZCBhZ2Fpbi5gLCB3aSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZmllbGRzLnB1c2goZmllbGQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBhbiBhcnJheSBvZiBpbnRlcmZhY2UgZmllbGRzLlxyXG4gICAgICogQHJldHVybnMge0ZpZWxkT3B0aW9uc1tdfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGZpZWxkcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZmllbGRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIHVzZXIgaW50ZXJmYWNlIHN0ZXAuXHJcbiAgICAgKiBAcGFyYW0gc3RlcE5hbWVcclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayAgICAgICAgICBQYXJhbWV0ZXJzOiBXZWJob29rSm9iLCBXZWJob29rSW50ZXJmYWNlLCBTdGVwLCBEb25lIGNhbGxiYWNrXHJcbiAgICAgKiAjIyMjIEV4YW1wbGVcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiAgbWFuYWdlci5hZGRTdGVwKFwiQ2hlY2sgam9iIG51bWJlclwiLCBmdW5jdGlvbih3ZWJob29rSm9iLCB3ZWJob29rSW50ZXJmYWNlLCBzdGVwLCBkb25lKXtcclxuICAgICAqICAgICAgaWYod2ViaG9va0pvYi5nZXRRdWVyeVN0cmluZ1ZhbHVlKFwiam9iX251bWJlclwiKSl7XHJcbiAgICAgKiAgICAgICAgICB3ZWJob29rSW50ZXJmYWNlLmFkZEZpZWxkKHtcclxuICAgICAqICAgICAgICAgICAgICBpZDogXCJzb21ldGhpbmdfZWxzZVwiLFxyXG4gICAgICogICAgICAgICAgICAgIF9uYW1lOiBcIlNvbWUgb3RoZXIgZmllbGRcIixcclxuICAgICAqICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcclxuICAgICAqICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGFua3MgZm9yIGFkZGluZyBhIGpvYiBudW1iZXIhXCJcclxuICAgICAqICAgICAgICAgIH0pO1xyXG4gICAgICogICAgICAgICAgc3RlcC5jb21wbGV0ZSA9IHRydWU7IC8vIE1hcmsgc3RlcCBhcyBjb21wbGV0ZVxyXG4gICAgICogICAgICAgICAgZG9uZSgpOyAvLyBDYWxsYmFjayB0byBkbyBuZXh0IHN0ZXAgb3Igc2VuZCByZXNwb25zZSBpZiBjb21wbGV0ZVxyXG4gICAgICogICAgICB9XHJcbiAgICAgKiB9KTtcclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYWRkU3RlcChzdGVwTmFtZTogc3RyaW5nLCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgbGV0IHN0ZXAgPSBuZXcgU3RlcCgpO1xyXG4gICAgICAgIHN0ZXAubmFtZSA9IHN0ZXBOYW1lO1xyXG4gICAgICAgIHN0ZXAuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICBzdGVwLmNvbXBsZXRlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fc3RlcHMucHVzaChzdGVwKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBhbiBhcnJheSBvZiB1c2VyIGludGVyZmFjZSBzdGVwcy5cclxuICAgICAqIEByZXR1cm5zIHtTdGVwW119XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgc3RlcHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0ZXBzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhZGRJbnRlcmZhY2VJbnN0YW5jZSh3aTogV2ViaG9va0ludGVyZmFjZSkge1xyXG4gICAgICAgIGxldCBpbSA9IHRoaXM7XHJcbiAgICAgICAgaW0uaW50ZXJmYWNlSW5zdGFuY2VzLnB1c2god2kpO1xyXG5cclxuICAgICAgICAvLyBEZXN0cnVjdFxyXG4gICAgICAgIGxldCBzZXNzaW9uRXhwaXJhdGlvbiA9IChpbS5lLm9wdGlvbnMud2ViaG9va19pbnRlcmZhY2Vfc2Vzc2lvbl90aW1lb3V0ICogNjAwMDApIHx8IDMwMDAwMDtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGltLnJlbW92ZUludGVyZmFjZUluc3RhbmNlKHdpKTtcclxuICAgICAgICB9LCBzZXNzaW9uRXhwaXJhdGlvbik7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCByZW1vdmVJbnRlcmZhY2VJbnN0YW5jZSh3aTogV2ViaG9va0ludGVyZmFjZSkge1xyXG4gICAgICAgIGxldCBpbSA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHJlbW92ZVN1Y2Nlc3MgPSBfLnJlbW92ZShpbS5pbnRlcmZhY2VJbnN0YW5jZXMsIChpKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBpLnNlc3Npb25JZCA9PT0gd2kuc2Vzc2lvbklkO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAocmVtb3ZlU3VjY2Vzcykge1xyXG4gICAgICAgICAgICBpbS5lLmxvZygwLCBgUmVtb3ZlZCB3ZWJob29rIGludGVyZmFjZSBzZXNzaW9uICR7d2kuc2Vzc2lvbklkfWAsIGltKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbS5lLmxvZygzLCBgVW5hYmxlIHRvIHJlbW92ZSB3ZWJob29rIGludGVyZmFjZSBzZXNzaW9uICR7d2kuc2Vzc2lvbklkfWAsIGltKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZCBvciByZXR1cm4gYSBuZXcgd2ViaG9vayBpbnRlcmZhY2UgaW5zdGFuY2UuXHJcbiAgICAgKiBAcGFyYW0gc2Vzc2lvbklkXHJcbiAgICAgKiBAcmV0dXJucyB7V2ViaG9va0ludGVyZmFjZX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEludGVyZmFjZShzZXNzaW9uSWQ/OiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgaW0gPSB0aGlzO1xyXG4gICAgICAgIGxldCB3aTtcclxuICAgICAgICAvLyBGaW5kIGluIHRoaXMuaW50ZXJmYWNlSW5zdGFuY2VzXHJcbiAgICAgICAgaWYgKHNlc3Npb25JZCkge1xyXG4gICAgICAgICAgICB3aSA9IF8uZmluZChpbS5pbnRlcmZhY2VJbnN0YW5jZXMsIGZ1bmN0aW9uKGkpIHsgcmV0dXJuIGkuc2Vzc2lvbklkID09PSBzZXNzaW9uSWQ7IH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF3aSkge1xyXG4gICAgICAgICAgICAvLyBNYWtlIG5ldyBpbnRlcmZhY2UgaWYgbm90IGZvdW5kXHJcbiAgICAgICAgICAgIHdpID0gbmV3IFdlYmhvb2tJbnRlcmZhY2UoaW0uZSwgaW0ubmVzdCk7XHJcblxyXG4gICAgICAgICAgICB3aS5maWVsZHMgPSBpbS5maWVsZHM7XHJcbiAgICAgICAgICAgIHdpLnN0ZXBzID0gaW0uc3RlcHM7XHJcbiAgICAgICAgICAgIHdpLm1ldGFkYXRhID0gaW0ubWV0YWRhdGE7XHJcbiAgICAgICAgICAgIHdpLmNoZWNrcG9pbnROZXN0ID0gaW0uY2hlY2twb2ludE5lc3Q7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW0uaW50ZXJmYWNlSW5zdGFuY2VzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaW0uZS5hZGRXZWJob29rSW50ZXJmYWNlKHRoaXMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW0uZS5sb2coMCwgYCR7aW0uaW50ZXJmYWNlSW5zdGFuY2VzLmxlbmd0aH0gaW50ZXJmYWNlIHNlc3Npb25zIGFscmVhZHkgZXhpc3QuYCwgaW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGltLmFkZEludGVyZmFjZUluc3RhbmNlKHdpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbS5lLmxvZygwLCBgUmVzdG9yZWQgaW50ZXJmYWNlIHNlc3Npb24gJHt3aS5zZXNzaW9uSWR9LmAsIGltKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB3aTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgcGVuZGluZyBqb2JzIHRvIHRoZSBpbnRlcmZhY2VzIGpvYiBsaXN0LlxyXG4gICAgICogQHBhcmFtIG5lc3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNoZWNrTmVzdChuZXN0OiBGb2xkZXJOZXN0KSB7XHJcbiAgICAgICAgdGhpcy5jaGVja3BvaW50TmVzdCA9IG5lc3Q7XHJcbiAgICAgICAgbmVzdC53YXRjaEhvbGQoKTtcclxuICAgIH1cclxufSJdfQ==
