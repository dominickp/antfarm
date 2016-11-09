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
        j.e.log(1, "New Job \"" + name + "\" created, id: " + j.id + ".", j, [j.nest, j.tunnel]);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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RDs7Ozs7T0FLRztJQUNJLGlCQUFHLEdBQVYsVUFBVyxLQUFhLEVBQUUsT0FBZTtRQUNyQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDZixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsc0JBQVcscUJBQUk7YUFBZjtZQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVywwQkFBUzthQUFwQjtZQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFFTCxVQUFDO0FBQUQsQ0E5YUEsQUE4YUMsSUFBQTtBQTlhcUIsV0FBRyxNQThheEIsQ0FBQSIsImZpbGUiOiJsaWIvam9iL2pvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFR1bm5lbCB9IGZyb20gXCIuLi90dW5uZWwvdHVubmVsXCI7XG5pbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4uL25lc3QvbmVzdFwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0xpZmVFdmVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2xpZmVFdmVudFwiO1xuaW1wb3J0IHtFbWFpbE9wdGlvbnN9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbWFpbE9wdGlvbnNcIjtcbmltcG9ydCB7Sm9iUHJvcGVydHl9IGZyb20gXCIuL2pvYlByb3BlcnR5XCI7XG5pbXBvcnQge1BhY2tlZEpvYn0gZnJvbSBcIi4vcGFja2VkSm9iXCI7XG5cbi8vIEhhbmRsZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeSBieSBzdGFzaGluZyB0aGUgdHlwZSBpbiBhIHZhcmlhYmxlIGZvciByZXF1aXJpbmcgbGF0ZXIuXG4vLyBpbXBvcnQgKiBhcyBQYWNrZWRKb2JUeXBlcyBmcm9tIFwiLi9wYWNrZWRKb2JcIjtcbi8vIGxldCBQYWNrZWRKb2I6IHR5cGVvZiBQYWNrZWRKb2JUeXBlcy5QYWNrZWRKb2I7XG5cbmNvbnN0ICAgc2hvcnRpZCA9IHJlcXVpcmUoXCJzaG9ydGlkXCIpLFxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEpvYiB7XG5cbiAgICBwcm90ZWN0ZWQgX25hbWU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX3R1bm5lbDogVHVubmVsO1xuICAgIHByb3RlY3RlZCBfbmVzdDogTmVzdDtcbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG4gICAgcHJvdGVjdGVkIF9sb2NhbGx5QXZhaWxhYmxlOiBib29sZWFuO1xuICAgIHByb3RlY3RlZCBfbGlmZUN5Y2xlOiBMaWZlRXZlbnRbXTtcbiAgICBwcm90ZWN0ZWQgX2lkOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF9wcm9wZXJ0aWVzO1xuICAgIHByb3RlY3RlZCBfdHlwZTogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogSm9iIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIGVcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGogPSB0aGlzO1xuICAgICAgICBqLmUgPSBlO1xuICAgICAgICBqLl9pZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgai5fbmFtZSA9IG5hbWU7XG4gICAgICAgIGouX2xpZmVDeWNsZSA9IFtdO1xuICAgICAgICBqLl9wcm9wZXJ0aWVzID0ge307XG4gICAgICAgIGouX3R5cGUgPSBcImJhc2VcIjtcblxuICAgICAgICBqLmNyZWF0ZUxpZmVFdmVudChcImNyZWF0ZWRcIiwgbnVsbCwgbmFtZSk7XG4gICAgICAgIGouZS5sb2coMSwgYE5ldyBKb2IgXCIke25hbWV9XCIgY3JlYXRlZCwgaWQ6ICR7ai5pZH0uYCwgaiwgW2oubmVzdCwgai50dW5uZWxdKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R5cGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgX25hbWUgZm9yIGxvZ2dpbmcuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBcIkpvYlwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGpvYiBpcyBsb2NhbGx5IGF2YWlsYWJsZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGlzTG9jYWxseUF2YWlsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvY2FsbHlBdmFpbGFibGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGlmIHRoZSBqb2IgaXMgbG9jYWxseSBhdmFpbGFibGUuXG4gICAgICogQHBhcmFtIGF2YWlsYWJsZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbG9jYWxseUF2YWlsYWJsZShhdmFpbGFibGU6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fbG9jYWxseUF2YWlsYWJsZSA9IGF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGxpZmUgY3ljbGUgb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHtMaWZlRXZlbnRbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGxpZmVDeWNsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpZmVDeWNsZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGxpZmVDeWNsZShldmVudHM6IExpZmVFdmVudFtdKSB7XG4gICAgICAgIHRoaXMuX2xpZmVDeWNsZSA9IGV2ZW50cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlmZSBldmVudC5cbiAgICAgKiBAcGFyYW0gdmVyYlxuICAgICAqIEBwYXJhbSBzdGFydFxuICAgICAqIEBwYXJhbSBmaW5pc2hcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlTGlmZUV2ZW50KHZlcmI6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZmluaXNoOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5saWZlQ3ljbGUucHVzaChuZXcgTGlmZUV2ZW50KHZlcmIsIHN0YXJ0LCBmaW5pc2gpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBuZXcgX25hbWUuXG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IG5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgX25hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgSUQuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBfbmFtZSBwcm9wZXIuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5hbWVQcm9wZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBuZXN0LlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHVibGljIHNldCBuZXN0KG5lc3Q6IE5lc3QpIHtcbiAgICAgICAgdGhpcy5fbmVzdCA9IG5lc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuZXN0LlxuICAgICAqIEByZXR1cm5zIHtOZXN0fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbmVzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25lc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSB0dW5uZWwuXG4gICAgICogQHBhcmFtIHR1bm5lbFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgdHVubmVsKHR1bm5lbDogVHVubmVsKSB7XG4gICAgICAgIHRoaXMuX3R1bm5lbCA9IHR1bm5lbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHR1bm5lbC5cbiAgICAgKiBAcmV0dXJucyB7VHVubmVsfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgdHVubmVsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHVubmVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGNhbGwgdG8gZmFpbCBhIGpvYiB3aGlsZSBpbiBhIHR1bm5lbC5cbiAgICAgKiBAcGFyYW0gcmVhc29uXG4gICAgICovXG4gICAgcHVibGljIGZhaWwocmVhc29uOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGogPSB0aGlzO1xuICAgICAgICBpZiAoIWoudHVubmVsKSB7XG4gICAgICAgICAgICBqLmUubG9nKDMsIGBKb2IgXCIke2oubmFtZX1cIiBmYWlsZWQgYmVmb3JlIHR1bm5lbCB3YXMgc2V0LmAsIGopO1xuICAgICAgICB9XG4gICAgICAgIGlmICghai5uZXN0KSB7XG4gICAgICAgICAgICBqLmUubG9nKDMsIGBKb2IgXCIke2oubmFtZX1cIiBkb2VzIG5vdCBoYXZlIGEgbmVzdC5gLCBqKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGoudHVubmVsLmV4ZWN1dGVGYWlsKGosIGoubmVzdCwgcmVhc29uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2ZlciBhIGpvYiB0byBhbm90aGVyIHR1bm5lbCBkaXJlY3RseS5cbiAgICAgKiBAcGFyYW0gdHVubmVsXG4gICAgICovXG4gICAgcHVibGljIHRyYW5zZmVyKHR1bm5lbDogVHVubmVsKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgb2xkVHVubmVsID0gdGhpcy50dW5uZWw7XG5cbiAgICAgICAgbGV0IG9sZFR1bm5lbE5hbWUgPSBcIlwiO1xuICAgICAgICBpZiAob2xkVHVubmVsKSB7XG4gICAgICAgICAgICBvbGRUdW5uZWxOYW1lID0gb2xkVHVubmVsLm5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBqb2IudHVubmVsID0gdHVubmVsO1xuICAgICAgICB0dW5uZWwuYXJyaXZlKGpvYiwgbnVsbCk7XG5cbiAgICAgICAgam9iLmUubG9nKDEsIGBUcmFuc2ZlcnJlZCB0byBUdW5uZWwgXCIke3R1bm5lbC5uYW1lfVwiLmAsIGpvYiwgW29sZFR1bm5lbF0pO1xuICAgICAgICBqb2IuY3JlYXRlTGlmZUV2ZW50KFwidHJhbnNmZXJcIiwgb2xkVHVubmVsTmFtZSwgdHVubmVsLm5hbWUpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogTW92ZSBmdW5jdGlvbiBlcnJvci5cbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZShkZXN0aW5hdGlvbk5lc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRocm93IFwiVGhpcyB0eXBlIG9mIGpvYiBjYW5ub3QgYmUgbW92ZWQuXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZHMgYW4gZW1haWwuXG4gICAgICogQHBhcmFtIGVtYWlsT3B0aW9ucyAgICAgIEVtYWlsIG9wdGlvbnNcbiAgICAgKiAjIyMjIFNlbmRpbmcgcHVnIHRlbXBsYXRlIGVtYWlsIGV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIC8vIG15X3R1bm5lbC5qc1xuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xuICAgICAqICAgICAgam9iLmVtYWlsKHtcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgZnJvbSBwdWcgdGVtcGxhdGVcIixcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXG4gICAgICogICAgICAgICAgdGVtcGxhdGU6IF9fZGlybmFtZSArIFwiLi90ZW1wbGF0ZV9maWxlcy9teV9lbWFpbC5wdWdcIlxuICAgICAqICAgICAgfSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIC8vIHRlbXBsYXRlX2ZpbGVzL215X2VtYWlsLnB1Z1xuICAgICAqIGgxPVwiRXhhbXBsZSBlbWFpbCFcIlxuICAgICAqIHA9XCJHb3Qgam9iIElEIFwiICsgam9iLmdldElkKClcbiAgICAgKiBgYGBcbiAgICAgKiAjIyMjIFNlbmRpbmcgcGxhaW4tdGV4dCBlbWFpbFxuICAgICAqIGBgYGpzXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XG4gICAgICogICAgICBqb2IuZW1haWwoe1xuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCB3aXRoIGhhcmQtY29kZWQgcGxhaW4tdGV4dFwiLFxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcbiAgICAgKiAgICAgICAgICB0ZXh0OiBcIk15IGVtYWlsIGJvZHkhXCJcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqICMjIyMgU2VuZGluZyBodG1sIGVtYWlsXG4gICAgICogYGBganNcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIHdpdGggaGFyZC1jb2RlZCBodG1sXCIsXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxuICAgICAqICAgICAgICAgIGh0bWw6IFwiPGgxPk15IGVtYWlsIGJvZHkhPC9oMT5cIlxuICAgICAqICAgICAgfSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGVtYWlsKGVtYWlsT3B0aW9uczogRW1haWxPcHRpb25zKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgZW1haWxlciA9IGpvYi5lLmVtYWlsZXI7XG5cbiAgICAgICAgZW1haWxlci5zZW5kTWFpbChlbWFpbE9wdGlvbnMsIGpvYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGpvYiBzcGVjaWZpYyBkYXRhIHRvIHRoZSBqb2IgaW5zdGFuY2UuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5zZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiLCAxMjM0NTYpO1xuICAgICAqXG4gICAgICogY29uc29sZS5sb2coam9iLmdldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIpKTtcbiAgICAgKiAvLyAxMjM0NTZcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UHJvcGVydHlWYWx1ZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IHByb3AgPSBuZXcgSm9iUHJvcGVydHkoa2V5LCB2YWx1ZSk7XG5cbiAgICAgICAgam9iLl9wcm9wZXJ0aWVzW2tleV0gPSBwcm9wO1xuICAgICAgICBqb2IuZS5sb2coMSwgYFByb3BlcnR5IFwiJHtrZXl9XCIgYWRkZWQgdG8gam9iIHByb3BlcnRpZXMuYCwgam9iKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHByb3BlcnR5VmFsdWVzKHByb3BlcnRpZXM6IE9iamVjdCkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgam9iLl9wcm9wZXJ0aWVzID0gcHJvcGVydGllcztcbiAgICAgICAgam9iLmUubG9nKDAsIGBSZXN0b3JlZCAke09iamVjdC5rZXlzKGpvYi5fcHJvcGVydGllcykubGVuZ3RofSBwcm9wZXJ0aWVzLmAsIGpvYik7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGVudGlyZSBqb2IgcHJvcGVydHkgb2JqZWN0LlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJucyB7Sm9iUHJvcGVydHl9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5KGtleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzW2tleV0gYXMgSm9iUHJvcGVydHk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaWYgaXQgaGFzIGJlZW4gcHJldmlvdXNseSBzZXQuXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5VmFsdWUoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGlmIChqb2IuX3Byb3BlcnRpZXNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGpvYi5fcHJvcGVydGllc1trZXldLnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHR5cGUgb2YgYSBwcm9wZXJ0eS5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogam9iLnNldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIsIDEyMzQ1Nik7XG4gICAgICpcbiAgICAgKiBjb25zb2xlLmxvZyhqb2IuZ2V0UHJvcGVydHlUeXBlKFwiTXkgSm9iIE51bWJlclwiKSk7XG4gICAgICogLy8gXCJudW1iZXJcIlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5VHlwZShrZXk6IHN0cmluZykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgaWYgKGpvYi5fcHJvcGVydGllc1trZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gam9iLl9wcm9wZXJ0aWVzW2tleV0udHlwZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFja3MgdGhlIGpvYiBpbnN0YW5jZSBhbmQgZmlsZSB0b2dldGhlciBpbiBhIHppcC5cbiAgICAgKiBSZXR1cm5zIGEgUGFja0pvYiBpbiB0aGUgcGFyYW1ldGVyIG9mIHRoZSBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5wYWNrKGZ1bmN0aW9uKHBhY2tKb2Ipe1xuICAgICAqICAgICAgcGFja0pvYi5tb3ZlKHBhY2tlZF9mb2xkZXJfbmVzdCk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIHBhY2soY2FsbGJhY2s6IChqb2I6IFBhY2tlZEpvYikgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IFBhY2tlZEpvYiA9IHJlcXVpcmUoXCIuL3BhY2tlZEpvYlwiKS5QYWNrZWRKb2I7XG4gICAgICAgIGxldCBwaiA9IG5ldyBQYWNrZWRKb2Ioam9iLmUsIGpvYik7XG4gICAgICAgIHBqLmV4ZWNQYWNrKCgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHBqKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVW5wYWNrcyBhIHBhY2tlZCBqb2IuIFJldHVybnMgYSB0aGUgb3JpZ2luYWwgdW5wYWNrZWQgam9iIGluIHRoZSBwYXJhbWV0ZXIgb2YgdGhlIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogcGFja2VkSm9iLnVucGFjayhmdW5jdGlvbih1bnBhY2tlZEpvYil7XG4gICAgICogICAgIGNvbnNvbGUubG9nKFwiVW5wYWNrZWRcIiwgdW5wYWNrZWRKb2IubmFtZSk7XG4gICAgICogICAgIHVucGFja2VkSm9iLm1vdmUodW5wYWNrZWRfZm9sZGVyKTtcbiAgICAgKiAgICAgcGFja2VkSm9iLnJlbW92ZSgpO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyB1bnBhY2soY2FsbGJhY2s6IChqb2I6IEpvYikgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IFBhY2tlZEpvYiA9IHJlcXVpcmUoXCIuL3BhY2tlZEpvYlwiKS5QYWNrZWRKb2I7XG4gICAgICAgIGxldCBwaiA9IG5ldyBQYWNrZWRKb2Ioam9iLmUsIGpvYik7XG4gICAgICAgIHBqLmV4ZWNVbnBhY2soKHVucGFja2VkSm9iKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayh1bnBhY2tlZEpvYik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgam9iIG9iamVjdCBhcyBKU09OIHdpdGggY2lyY3VsYXIgcmVmZXJlbmNlcyByZW1vdmVkLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldEpTT04oKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQganNvbjtcbiAgICAgICAgbGV0IHJlcGxhY2VyID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gRmlsdGVyaW5nIG91dCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcIm5lc3RcIiB8fCBrZXkgPT09IFwiZVwiIHx8IGtleSA9PT0gXCJ0dW5uZWxcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcIl9uZXN0XCIgfHwga2V5ID09PSBcIl90dW5uZWxcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGpzb24gPSBKU09OLnN0cmluZ2lmeShqb2IsIHJlcGxhY2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBqb2IuZS5sb2coMywgYGdldEpTT04gc3RyaW5naWZ5IGVycm9yOiAke2Vycn1gLCBqb2IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpzb247XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBwYXRoKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc0ZpbGUoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGlzRm9sZGVyKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZmlsZXMoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEZpbGUoaW5kZXg6IGFueSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgcGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIG1lc3NhZ2UgdG8gdGhlIGxvZyB3aXRoIHRoaXMgam9iIGFzIHRoZSBhY3Rvci5cbiAgICAgKiBAcGFyYW0gbGV2ZWwgICAgICAgICAgICAgMCA9IGRlYnVnLCAxID0gaW5mbywgMiwgPSB3YXJuaW5nLCAzID0gZXJyb3JcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSAgICAgICAgICAgTG9nIG1lc3NhZ2VcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHB1YmxpYyBsb2cobGV2ZWw6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICByZXR1cm4gam9iLmUubG9nKGxldmVsLCBtZXNzYWdlLCBqb2IpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgc2l6ZSAoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzaXplQnl0ZXMgKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxufSJdfQ==
