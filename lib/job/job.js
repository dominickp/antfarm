"use strict";
var lifeEvent_1 = require("../environment/lifeEvent");
var jobProperty_1 = require("./jobProperty");
// Handle the circular dependency by stashing the type in a variable for requiring later.
// import * as PackedJobTypes from "./packedJob";
// let PackedJob: typeof PackedJobTypes.PackedJob;
var shortid = require("shortid"), _ = require("lodash");
var Job = (function () {
    /**
     * Job constructor
     * @param e
     * @param name
     */
    function Job(e, name) {
        var j = this;
        j.e = e;
        j._id = shortid.generate();
        j._name = name;
        j._lifeCycle = [];
        j._properties = {};
        j._type = "base";
        j.createLifeEvent("created", null, name);
        j.e.log(1, "New Job \"" + name + "\" created, id: " + j.id + ".", j);
    }
    Object.defineProperty(Job.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Class _name for logging.
     * @returns {string}
     */
    Job.prototype.toString = function () {
        return "Job";
    };
    Object.defineProperty(Job.prototype, "isLocallyAvailable", {
        /**
         * Check if job is locally available.
         * @returns {boolean}
         */
        get: function () {
            return this._locallyAvailable;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Job.prototype, "locallyAvailable", {
        /**
         * Set if the job is locally available.
         * @param available
         */
        set: function (available) {
            this._locallyAvailable = available;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Job.prototype, "lifeCycle", {
        /**
         * Get the life cycle object.
         * @returns {LifeEvent[]}
         */
        get: function () {
            return this._lifeCycle;
        },
        set: function (events) {
            this._lifeCycle = events;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Create a new life event.
     * @param verb
     * @param start
     * @param finish
     */
    Job.prototype.createLifeEvent = function (verb, start, finish) {
        this.lifeCycle.push(new lifeEvent_1.LifeEvent(verb, start, finish));
    };
    Object.defineProperty(Job.prototype, "name", {
        /**
         * Get the _name.
         * @returns {string}
         */
        get: function () {
            return this._name;
        },
        /**
         * Set a new _name.
         * @param name
         */
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Job.prototype, "id", {
        /**
         * Get the ID.
         * @returns {string}
         */
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Job.prototype, "nameProper", {
        /**
         * Get the _name proper.
         * @returns {string}
         */
        get: function () {
            return this.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Job.prototype, "nest", {
        /**
         * Get the nest.
         * @returns {Nest}
         */
        get: function () {
            return this._nest;
        },
        /**
         * Set the nest.
         * @param nest
         */
        set: function (nest) {
            this._nest = nest;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Job.prototype, "tunnel", {
        /**
         * Get the tunnel.
         * @returns {Tunnel}
         */
        get: function () {
            return this._tunnel;
        },
        /**
         * Set the tunnel.
         * @param tunnel
         */
        set: function (tunnel) {
            this._tunnel = tunnel;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Function to call to fail a job while in a tunnel.
     * @param reason
     */
    Job.prototype.fail = function (reason) {
        var j = this;
        if (!j.tunnel) {
            j.e.log(3, "Job \"" + j.name + "\" failed before tunnel was set.", j);
        }
        if (!j.nest) {
            j.e.log(3, "Job \"" + j.name + "\" does not have a nest.", j);
        }
        j.tunnel.executeFail(j, j.nest, reason);
    };
    /**
     * Transfer a job to another tunnel directly.
     * @param tunnel
     */
    Job.prototype.transfer = function (tunnel) {
        var job = this;
        var oldTunnel = this.tunnel;
        var oldTunnelName = "";
        if (oldTunnel) {
            oldTunnelName = oldTunnel.name;
        }
        job.tunnel = tunnel;
        tunnel.arrive(job, null);
        job.e.log(1, "Transferred to Tunnel \"" + tunnel.name + "\".", job, [oldTunnel]);
        job.createLifeEvent("transfer", oldTunnelName, tunnel.name);
    };
    /**
     * Move function error.
     */
    Job.prototype.move = function (destinationNest, callback) {
        throw "This type of job cannot be moved.";
    };
    /**
     * Sends an email.
     * @param emailOptions      Email options
     * #### Sending pug template email example
     * ```js
     * // my_tunnel.js
     * tunnel.run(function (job, nest) {
     *      job.email({
     *          subject: "Test email from pug template",
     *          to: "john.smith@example.com",
     *          template: __dirname + "./template_files/my_email.pug"
     *      });
     * });
     * ```
     *
     * ```js
     * // template_files/my_email.pug
     * h1="Example email!"
     * p="Got job ID " + job.getId()
     * ```
     * #### Sending plain-text email
     * ```js
     * tunnel.run(function (job, nest) {
     *      job.email({
     *          subject: "Test email with hard-coded plain-text",
     *          to: "john.smith@example.com",
     *          text: "My email body!"
     *      });
     * });
     * ```
     * #### Sending html email
     * ```js
     * tunnel.run(function (job, nest) {
     *      job.email({
     *          subject: "Test email with hard-coded html",
     *          to: "john.smith@example.com",
     *          html: "<h1>My email body!</h1>"
     *      });
     * });
     * ```
     */
    Job.prototype.email = function (emailOptions) {
        var job = this;
        var emailer = job.e.emailer;
        emailer.sendMail(emailOptions, job);
    };
    /**
     * Attach job specific data to the job instance.
     * #### Example
     *
     * ```js
     * job.setPropertyValue("My Job Number", 123456);
     *
     * console.log(job.getPropertyValue("My Job Number"));
     * // 123456
     * ```
     *
     * @param key
     * @param value
     */
    Job.prototype.setPropertyValue = function (key, value) {
        var job = this;
        var prop = new jobProperty_1.JobProperty(key, value);
        job._properties[key] = prop;
        job.e.log(1, "Property \"" + key + "\" added to job properties.", job);
    };
    Object.defineProperty(Job.prototype, "propertyValues", {
        set: function (properties) {
            var job = this;
            job._properties = properties;
            job.e.log(0, "Restored " + Object.keys(job._properties).length + " properties.", job);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the entire job property object.
     * @param key
     * @returns {JobProperty}
     */
    Job.prototype.getProperty = function (key) {
        return this._properties[key];
    };
    Object.defineProperty(Job.prototype, "properties", {
        get: function () {
            return this._properties;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the value of a property if it has been previously set.
     * @param key
     * @returns {any}
     */
    Job.prototype.getPropertyValue = function (key) {
        var job = this;
        if (job._properties[key]) {
            return job._properties[key].value;
        }
        else {
            return null;
        }
    };
    /**
     * Get the type of a property.
     * #### Example
     *
     * ```js
     * job.setPropertyValue("My Job Number", 123456);
     *
     * console.log(job.getPropertyType("My Job Number"));
     * // "number"
     * ```
     *
     * @param key
     * @returns {string}
     */
    Job.prototype.getPropertyType = function (key) {
        var job = this;
        if (job._properties[key]) {
            return job._properties[key].type;
        }
        else {
            return null;
        }
    };
    /**
     * Packs the job instance and file together in a zip.
     * Returns a PackJob in the parameter of the callback.
     * @param callback
     * #### Example
     * ```js
     * job.pack(function(packJob){
     *      packJob.move(packed_folder_nest);
     * });
     * ```
     */
    Job.prototype.pack = function (callback) {
        var job = this;
        var PackedJob = require("./packedJob").PackedJob;
        var pj = new PackedJob(job.e, job);
        pj.execPack(function () {
            callback(pj);
        });
    };
    /**
     * Unpacks a packed job. Returns a the original unpacked job in the parameter of the callback.
     * @param callback
     * #### Example
     * ```js
     * packedJob.unpack(function(unpackedJob){
     *     console.log("Unpacked", unpackedJob.name);
     *     unpackedJob.move(unpacked_folder);
     *     packedJob.remove();
     * });
     * ```
     */
    Job.prototype.unpack = function (callback) {
        var job = this;
        var PackedJob = require("./packedJob").PackedJob;
        var pj = new PackedJob(job.e, job);
        pj.execUnpack(function (unpackedJob) {
            callback(unpackedJob);
        });
    };
    /**
     * Get the job object as JSON with circular references removed.
     * @returns {string}
     */
    Job.prototype.getJSON = function () {
        var job = this;
        var json;
        var replacer = function (key, value) {
            // Filtering out properties
            if (key === "nest" || key === "e" || key === "tunnel") {
                return undefined;
            }
            if (key === "_nest" || key === "_tunnel") {
                return undefined;
            }
            return value;
        };
        try {
            json = JSON.stringify(job, replacer);
        }
        catch (err) {
            job.e.log(3, "getJSON stringify error: " + err, job);
        }
        return json;
    };
    Object.defineProperty(Job.prototype, "path", {
        get: function () {
            return undefined;
        },
        set: function (path) {
        },
        enumerable: true,
        configurable: true
    });
    Job.prototype.isFile = function () {
        return undefined;
    };
    Job.prototype.isFolder = function () {
        return undefined;
    };
    Object.defineProperty(Job.prototype, "files", {
        get: function () {
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Job.prototype.getFile = function (index) {
        return undefined;
    };
    Job.prototype.rename = function (name) {
        return undefined;
    };
    /**
     * Add a message to the log with this job as the actor.
     * @param level             0 = debug, 1 = info, 2, = warning, 3 = error
     * @param message           Log message
     * @returns {undefined}
     */
    Job.prototype.log = function (level, message) {
        var job = this;
        return job.e.log(level, message, job);
    };
    Object.defineProperty(Job.prototype, "size", {
        get: function () {
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Job.prototype, "sizeBytes", {
        get: function () {
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    return Job;
}());
exports.Job = Job;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztRQUNmLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxzQkFBVyxxQkFBSTthQUFmO1lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNyQixDQUFDOzs7T0FBQTtJQUNELHNCQUFXLDBCQUFTO2FBQXBCO1lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNyQixDQUFDOzs7T0FBQTtJQUNMLFVBQUM7QUFBRCxDQTVhQSxBQTRhQyxJQUFBO0FBNWFxQixXQUFHLE1BNGF4QixDQUFBIiwiZmlsZSI6ImxpYi9qb2Ivam9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVHVubmVsIH0gZnJvbSBcIi4uL3R1bm5lbC90dW5uZWxcIjtcbmltcG9ydCB7IE5lc3QgfSBmcm9tIFwiLi4vbmVzdC9uZXN0XCI7XG5pbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7TGlmZUV2ZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvbGlmZUV2ZW50XCI7XG5pbXBvcnQge0VtYWlsT3B0aW9uc30gZnJvbSBcIi4uL2Vudmlyb25tZW50L2VtYWlsT3B0aW9uc1wiO1xuaW1wb3J0IHtKb2JQcm9wZXJ0eX0gZnJvbSBcIi4vam9iUHJvcGVydHlcIjtcblxuLy8gSGFuZGxlIHRoZSBjaXJjdWxhciBkZXBlbmRlbmN5IGJ5IHN0YXNoaW5nIHRoZSB0eXBlIGluIGEgdmFyaWFibGUgZm9yIHJlcXVpcmluZyBsYXRlci5cbi8vIGltcG9ydCAqIGFzIFBhY2tlZEpvYlR5cGVzIGZyb20gXCIuL3BhY2tlZEpvYlwiO1xuLy8gbGV0IFBhY2tlZEpvYjogdHlwZW9mIFBhY2tlZEpvYlR5cGVzLlBhY2tlZEpvYjtcblxuY29uc3QgICBzaG9ydGlkID0gcmVxdWlyZShcInNob3J0aWRcIiksXG4gICAgICAgIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSm9iIHtcblxuICAgIHByb3RlY3RlZCBfbmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfdHVubmVsOiBUdW5uZWw7XG4gICAgcHJvdGVjdGVkIF9uZXN0OiBOZXN0O1xuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcbiAgICBwcm90ZWN0ZWQgX2xvY2FsbHlBdmFpbGFibGU6IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIF9saWZlQ3ljbGU6IExpZmVFdmVudFtdO1xuICAgIHByb3RlY3RlZCBfaWQ6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX3Byb3BlcnRpZXM7XG4gICAgcHJvdGVjdGVkIF90eXBlOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBKb2IgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIG5hbWU6IHN0cmluZykge1xuICAgICAgICBsZXQgaiA9IHRoaXM7XG4gICAgICAgIGouZSA9IGU7XG4gICAgICAgIGouX2lkID0gc2hvcnRpZC5nZW5lcmF0ZSgpO1xuICAgICAgICBqLl9uYW1lID0gbmFtZTtcbiAgICAgICAgai5fbGlmZUN5Y2xlID0gW107XG4gICAgICAgIGouX3Byb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgai5fdHlwZSA9IFwiYmFzZVwiO1xuXG4gICAgICAgIGouY3JlYXRlTGlmZUV2ZW50KFwiY3JlYXRlZFwiLCBudWxsLCBuYW1lKTtcbiAgICAgICAgai5lLmxvZygxLCBgTmV3IEpvYiBcIiR7bmFtZX1cIiBjcmVhdGVkLCBpZDogJHtqLmlkfS5gLCBqKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R5cGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgX25hbWUgZm9yIGxvZ2dpbmcuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBcIkpvYlwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGpvYiBpcyBsb2NhbGx5IGF2YWlsYWJsZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGlzTG9jYWxseUF2YWlsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvY2FsbHlBdmFpbGFibGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGlmIHRoZSBqb2IgaXMgbG9jYWxseSBhdmFpbGFibGUuXG4gICAgICogQHBhcmFtIGF2YWlsYWJsZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbG9jYWxseUF2YWlsYWJsZShhdmFpbGFibGU6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fbG9jYWxseUF2YWlsYWJsZSA9IGF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGxpZmUgY3ljbGUgb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHtMaWZlRXZlbnRbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGxpZmVDeWNsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpZmVDeWNsZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGxpZmVDeWNsZShldmVudHM6IExpZmVFdmVudFtdKSB7XG4gICAgICAgIHRoaXMuX2xpZmVDeWNsZSA9IGV2ZW50cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlmZSBldmVudC5cbiAgICAgKiBAcGFyYW0gdmVyYlxuICAgICAqIEBwYXJhbSBzdGFydFxuICAgICAqIEBwYXJhbSBmaW5pc2hcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlTGlmZUV2ZW50KHZlcmI6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZmluaXNoOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5saWZlQ3ljbGUucHVzaChuZXcgTGlmZUV2ZW50KHZlcmIsIHN0YXJ0LCBmaW5pc2gpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBuZXcgX25hbWUuXG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IG5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgX25hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgSUQuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBfbmFtZSBwcm9wZXIuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5hbWVQcm9wZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBuZXN0LlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHVibGljIHNldCBuZXN0KG5lc3Q6IE5lc3QpIHtcbiAgICAgICAgdGhpcy5fbmVzdCA9IG5lc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuZXN0LlxuICAgICAqIEByZXR1cm5zIHtOZXN0fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbmVzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25lc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSB0dW5uZWwuXG4gICAgICogQHBhcmFtIHR1bm5lbFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgdHVubmVsKHR1bm5lbDogVHVubmVsKSB7XG4gICAgICAgIHRoaXMuX3R1bm5lbCA9IHR1bm5lbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHR1bm5lbC5cbiAgICAgKiBAcmV0dXJucyB7VHVubmVsfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgdHVubmVsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHVubmVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGNhbGwgdG8gZmFpbCBhIGpvYiB3aGlsZSBpbiBhIHR1bm5lbC5cbiAgICAgKiBAcGFyYW0gcmVhc29uXG4gICAgICovXG4gICAgcHVibGljIGZhaWwocmVhc29uOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGogPSB0aGlzO1xuICAgICAgICBpZiAoIWoudHVubmVsKSB7XG4gICAgICAgICAgICBqLmUubG9nKDMsIGBKb2IgXCIke2oubmFtZX1cIiBmYWlsZWQgYmVmb3JlIHR1bm5lbCB3YXMgc2V0LmAsIGopO1xuICAgICAgICB9XG4gICAgICAgIGlmICghai5uZXN0KSB7XG4gICAgICAgICAgICBqLmUubG9nKDMsIGBKb2IgXCIke2oubmFtZX1cIiBkb2VzIG5vdCBoYXZlIGEgbmVzdC5gLCBqKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGoudHVubmVsLmV4ZWN1dGVGYWlsKGosIGoubmVzdCwgcmVhc29uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2ZlciBhIGpvYiB0byBhbm90aGVyIHR1bm5lbCBkaXJlY3RseS5cbiAgICAgKiBAcGFyYW0gdHVubmVsXG4gICAgICovXG4gICAgcHVibGljIHRyYW5zZmVyKHR1bm5lbDogVHVubmVsKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgb2xkVHVubmVsID0gdGhpcy50dW5uZWw7XG5cbiAgICAgICAgbGV0IG9sZFR1bm5lbE5hbWUgPSBcIlwiO1xuICAgICAgICBpZiAob2xkVHVubmVsKSB7XG4gICAgICAgICAgICBvbGRUdW5uZWxOYW1lID0gb2xkVHVubmVsLm5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBqb2IudHVubmVsID0gdHVubmVsO1xuICAgICAgICB0dW5uZWwuYXJyaXZlKGpvYiwgbnVsbCk7XG5cbiAgICAgICAgam9iLmUubG9nKDEsIGBUcmFuc2ZlcnJlZCB0byBUdW5uZWwgXCIke3R1bm5lbC5uYW1lfVwiLmAsIGpvYiwgW29sZFR1bm5lbF0pO1xuICAgICAgICBqb2IuY3JlYXRlTGlmZUV2ZW50KFwidHJhbnNmZXJcIiwgb2xkVHVubmVsTmFtZSwgdHVubmVsLm5hbWUpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogTW92ZSBmdW5jdGlvbiBlcnJvci5cbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZShkZXN0aW5hdGlvbk5lc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRocm93IFwiVGhpcyB0eXBlIG9mIGpvYiBjYW5ub3QgYmUgbW92ZWQuXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZHMgYW4gZW1haWwuXG4gICAgICogQHBhcmFtIGVtYWlsT3B0aW9ucyAgICAgIEVtYWlsIG9wdGlvbnNcbiAgICAgKiAjIyMjIFNlbmRpbmcgcHVnIHRlbXBsYXRlIGVtYWlsIGV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIC8vIG15X3R1bm5lbC5qc1xuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xuICAgICAqICAgICAgam9iLmVtYWlsKHtcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgZnJvbSBwdWcgdGVtcGxhdGVcIixcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXG4gICAgICogICAgICAgICAgdGVtcGxhdGU6IF9fZGlybmFtZSArIFwiLi90ZW1wbGF0ZV9maWxlcy9teV9lbWFpbC5wdWdcIlxuICAgICAqICAgICAgfSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIC8vIHRlbXBsYXRlX2ZpbGVzL215X2VtYWlsLnB1Z1xuICAgICAqIGgxPVwiRXhhbXBsZSBlbWFpbCFcIlxuICAgICAqIHA9XCJHb3Qgam9iIElEIFwiICsgam9iLmdldElkKClcbiAgICAgKiBgYGBcbiAgICAgKiAjIyMjIFNlbmRpbmcgcGxhaW4tdGV4dCBlbWFpbFxuICAgICAqIGBgYGpzXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XG4gICAgICogICAgICBqb2IuZW1haWwoe1xuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCB3aXRoIGhhcmQtY29kZWQgcGxhaW4tdGV4dFwiLFxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcbiAgICAgKiAgICAgICAgICB0ZXh0OiBcIk15IGVtYWlsIGJvZHkhXCJcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqICMjIyMgU2VuZGluZyBodG1sIGVtYWlsXG4gICAgICogYGBganNcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIHdpdGggaGFyZC1jb2RlZCBodG1sXCIsXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxuICAgICAqICAgICAgICAgIGh0bWw6IFwiPGgxPk15IGVtYWlsIGJvZHkhPC9oMT5cIlxuICAgICAqICAgICAgfSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGVtYWlsKGVtYWlsT3B0aW9uczogRW1haWxPcHRpb25zKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgZW1haWxlciA9IGpvYi5lLmVtYWlsZXI7XG5cbiAgICAgICAgZW1haWxlci5zZW5kTWFpbChlbWFpbE9wdGlvbnMsIGpvYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGpvYiBzcGVjaWZpYyBkYXRhIHRvIHRoZSBqb2IgaW5zdGFuY2UuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5zZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiLCAxMjM0NTYpO1xuICAgICAqXG4gICAgICogY29uc29sZS5sb2coam9iLmdldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIpKTtcbiAgICAgKiAvLyAxMjM0NTZcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UHJvcGVydHlWYWx1ZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IHByb3AgPSBuZXcgSm9iUHJvcGVydHkoa2V5LCB2YWx1ZSk7XG5cbiAgICAgICAgam9iLl9wcm9wZXJ0aWVzW2tleV0gPSBwcm9wO1xuICAgICAgICBqb2IuZS5sb2coMSwgYFByb3BlcnR5IFwiJHtrZXl9XCIgYWRkZWQgdG8gam9iIHByb3BlcnRpZXMuYCwgam9iKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHByb3BlcnR5VmFsdWVzKHByb3BlcnRpZXM6IE9iamVjdCkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgam9iLl9wcm9wZXJ0aWVzID0gcHJvcGVydGllcztcbiAgICAgICAgam9iLmUubG9nKDAsIGBSZXN0b3JlZCAke09iamVjdC5rZXlzKGpvYi5fcHJvcGVydGllcykubGVuZ3RofSBwcm9wZXJ0aWVzLmAsIGpvYik7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGVudGlyZSBqb2IgcHJvcGVydHkgb2JqZWN0LlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJucyB7Sm9iUHJvcGVydHl9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5KGtleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzW2tleV0gYXMgSm9iUHJvcGVydHk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaWYgaXQgaGFzIGJlZW4gcHJldmlvdXNseSBzZXQuXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5VmFsdWUoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGlmIChqb2IuX3Byb3BlcnRpZXNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGpvYi5fcHJvcGVydGllc1trZXldLnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHR5cGUgb2YgYSBwcm9wZXJ0eS5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogam9iLnNldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIsIDEyMzQ1Nik7XG4gICAgICpcbiAgICAgKiBjb25zb2xlLmxvZyhqb2IuZ2V0UHJvcGVydHlUeXBlKFwiTXkgSm9iIE51bWJlclwiKSk7XG4gICAgICogLy8gXCJudW1iZXJcIlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5VHlwZShrZXk6IHN0cmluZykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgaWYgKGpvYi5fcHJvcGVydGllc1trZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gam9iLl9wcm9wZXJ0aWVzW2tleV0udHlwZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFja3MgdGhlIGpvYiBpbnN0YW5jZSBhbmQgZmlsZSB0b2dldGhlciBpbiBhIHppcC5cbiAgICAgKiBSZXR1cm5zIGEgUGFja0pvYiBpbiB0aGUgcGFyYW1ldGVyIG9mIHRoZSBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5wYWNrKGZ1bmN0aW9uKHBhY2tKb2Ipe1xuICAgICAqICAgICAgcGFja0pvYi5tb3ZlKHBhY2tlZF9mb2xkZXJfbmVzdCk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIHBhY2soY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBQYWNrZWRKb2IgPSByZXF1aXJlKFwiLi9wYWNrZWRKb2JcIikuUGFja2VkSm9iO1xuICAgICAgICBsZXQgcGogPSBuZXcgUGFja2VkSm9iKGpvYi5lLCBqb2IpO1xuICAgICAgICBwai5leGVjUGFjaygoKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhwaik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVucGFja3MgYSBwYWNrZWQgam9iLiBSZXR1cm5zIGEgdGhlIG9yaWdpbmFsIHVucGFja2VkIGpvYiBpbiB0aGUgcGFyYW1ldGVyIG9mIHRoZSBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIHBhY2tlZEpvYi51bnBhY2soZnVuY3Rpb24odW5wYWNrZWRKb2Ipe1xuICAgICAqICAgICBjb25zb2xlLmxvZyhcIlVucGFja2VkXCIsIHVucGFja2VkSm9iLm5hbWUpO1xuICAgICAqICAgICB1bnBhY2tlZEpvYi5tb3ZlKHVucGFja2VkX2ZvbGRlcik7XG4gICAgICogICAgIHBhY2tlZEpvYi5yZW1vdmUoKTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgdW5wYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgUGFja2VkSm9iID0gcmVxdWlyZShcIi4vcGFja2VkSm9iXCIpLlBhY2tlZEpvYjtcbiAgICAgICAgbGV0IHBqID0gbmV3IFBhY2tlZEpvYihqb2IuZSwgam9iKTtcbiAgICAgICAgcGouZXhlY1VucGFjaygodW5wYWNrZWRKb2IpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHVucGFja2VkSm9iKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBqb2Igb2JqZWN0IGFzIEpTT04gd2l0aCBjaXJjdWxhciByZWZlcmVuY2VzIHJlbW92ZWQuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SlNPTigpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBqc29uO1xuICAgICAgICBsZXQgcmVwbGFjZXIgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBGaWx0ZXJpbmcgb3V0IHByb3BlcnRpZXNcbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwibmVzdFwiIHx8IGtleSA9PT0gXCJlXCIgfHwga2V5ID09PSBcInR1bm5lbFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwiX25lc3RcIiB8fCBrZXkgPT09IFwiX3R1bm5lbFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAganNvbiA9IEpTT04uc3RyaW5naWZ5KGpvYiwgcmVwbGFjZXIpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGpvYi5lLmxvZygzLCBgZ2V0SlNPTiBzdHJpbmdpZnkgZXJyb3I6ICR7ZXJyfWAsIGpvYik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ganNvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHBhdGgoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGlzRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNGb2xkZXIoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBmaWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RmlsZShpbmRleDogYW55KSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBwYXRoKHBhdGg6IHN0cmluZykge1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgbWVzc2FnZSB0byB0aGUgbG9nIHdpdGggdGhpcyBqb2IgYXMgdGhlIGFjdG9yLlxuICAgICAqIEBwYXJhbSBsZXZlbCAgICAgICAgICAgICAwID0gZGVidWcsIDEgPSBpbmZvLCAyLCA9IHdhcm5pbmcsIDMgPSBlcnJvclxuICAgICAqIEBwYXJhbSBtZXNzYWdlICAgICAgICAgICBMb2cgbWVzc2FnZVxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgcHVibGljIGxvZyhsZXZlbDogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBqb2IuZS5sb2cobGV2ZWwsIG1lc3NhZ2UsIGpvYik7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzaXplICgpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHVibGljIGdldCBzaXplQnl0ZXMgKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbn0iXX0=
