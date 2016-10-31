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
        var emailer = job.e.getEmailer();
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
            return job._properties[key].getType();
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
    return Job;
}());
exports.Job = Job;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFDTCxVQUFDO0FBQUQsQ0FqYUEsQUFpYUMsSUFBQTtBQWphcUIsV0FBRyxNQWlheEIsQ0FBQSIsImZpbGUiOiJsaWIvam9iL2pvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFR1bm5lbCB9IGZyb20gXCIuLi90dW5uZWwvdHVubmVsXCI7XG5pbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4uL25lc3QvbmVzdFwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0xpZmVFdmVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2xpZmVFdmVudFwiO1xuaW1wb3J0IHtFbWFpbE9wdGlvbnN9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbWFpbE9wdGlvbnNcIjtcbmltcG9ydCB7Sm9iUHJvcGVydHl9IGZyb20gXCIuL2pvYlByb3BlcnR5XCI7XG5cbi8vIEhhbmRsZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeSBieSBzdGFzaGluZyB0aGUgdHlwZSBpbiBhIHZhcmlhYmxlIGZvciByZXF1aXJpbmcgbGF0ZXIuXG4vLyBpbXBvcnQgKiBhcyBQYWNrZWRKb2JUeXBlcyBmcm9tIFwiLi9wYWNrZWRKb2JcIjtcbi8vIGxldCBQYWNrZWRKb2I6IHR5cGVvZiBQYWNrZWRKb2JUeXBlcy5QYWNrZWRKb2I7XG5cbmNvbnN0ICAgc2hvcnRpZCA9IHJlcXVpcmUoXCJzaG9ydGlkXCIpLFxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEpvYiB7XG5cbiAgICBwcm90ZWN0ZWQgX25hbWU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX3R1bm5lbDogVHVubmVsO1xuICAgIHByb3RlY3RlZCBfbmVzdDogTmVzdDtcbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG4gICAgcHJvdGVjdGVkIF9sb2NhbGx5QXZhaWxhYmxlOiBib29sZWFuO1xuICAgIHByb3RlY3RlZCBfbGlmZUN5Y2xlOiBMaWZlRXZlbnRbXTtcbiAgICBwcm90ZWN0ZWQgX2lkOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF9wcm9wZXJ0aWVzO1xuICAgIHByb3RlY3RlZCBfdHlwZTogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogSm9iIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIGVcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGogPSB0aGlzO1xuICAgICAgICBqLmUgPSBlO1xuICAgICAgICBqLl9pZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgai5fbmFtZSA9IG5hbWU7XG4gICAgICAgIGouX2xpZmVDeWNsZSA9IFtdO1xuICAgICAgICBqLl9wcm9wZXJ0aWVzID0ge307XG4gICAgICAgIGouX3R5cGUgPSBcImJhc2VcIjtcblxuICAgICAgICBqLmNyZWF0ZUxpZmVFdmVudChcImNyZWF0ZWRcIiwgbnVsbCwgbmFtZSk7XG4gICAgICAgIGouZS5sb2coMSwgYE5ldyBKb2IgXCIke25hbWV9XCIgY3JlYXRlZCwgaWQ6ICR7ai5pZH0uYCwgaik7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90eXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsYXNzIF9uYW1lIGZvciBsb2dnaW5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gXCJKb2JcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgbG9jYWxseSBhdmFpbGFibGUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGdldCBpc0xvY2FsbHlBdmFpbGFibGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2NhbGx5QXZhaWxhYmxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBpZiB0aGUgam9iIGlzIGxvY2FsbHkgYXZhaWxhYmxlLlxuICAgICAqIEBwYXJhbSBhdmFpbGFibGVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGxvY2FsbHlBdmFpbGFibGUoYXZhaWxhYmxlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX2xvY2FsbHlBdmFpbGFibGUgPSBhdmFpbGFibGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBsaWZlIGN5Y2xlIG9iamVjdC5cbiAgICAgKiBAcmV0dXJucyB7TGlmZUV2ZW50W119XG4gICAgICovXG4gICAgcHVibGljIGdldCBsaWZlQ3ljbGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9saWZlQ3ljbGU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBsaWZlQ3ljbGUoZXZlbnRzOiBMaWZlRXZlbnRbXSkge1xuICAgICAgICB0aGlzLl9saWZlQ3ljbGUgPSBldmVudHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpZmUgZXZlbnQuXG4gICAgICogQHBhcmFtIHZlcmJcbiAgICAgKiBAcGFyYW0gc3RhcnRcbiAgICAgKiBAcGFyYW0gZmluaXNoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUxpZmVFdmVudCh2ZXJiOiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGZpbmlzaDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubGlmZUN5Y2xlLnB1c2gobmV3IExpZmVFdmVudCh2ZXJiLCBzdGFydCwgZmluaXNoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgbmV3IF9uYW1lLlxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICovXG4gICAgcHVibGljIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIF9uYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIElELlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgX25hbWUgcHJvcGVyLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBuYW1lUHJvcGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgbmVzdC5cbiAgICAgKiBAcGFyYW0gbmVzdFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbmVzdChuZXN0OiBOZXN0KSB7XG4gICAgICAgIHRoaXMuX25lc3QgPSBuZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmVzdC5cbiAgICAgKiBAcmV0dXJucyB7TmVzdH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5lc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgdHVubmVsLlxuICAgICAqIEBwYXJhbSB0dW5uZWxcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHR1bm5lbCh0dW5uZWw6IFR1bm5lbCkge1xuICAgICAgICB0aGlzLl90dW5uZWwgPSB0dW5uZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB0dW5uZWwuXG4gICAgICogQHJldHVybnMge1R1bm5lbH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHR1bm5lbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R1bm5lbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBjYWxsIHRvIGZhaWwgYSBqb2Igd2hpbGUgaW4gYSB0dW5uZWwuXG4gICAgICogQHBhcmFtIHJlYXNvblxuICAgICAqL1xuICAgIHB1YmxpYyBmYWlsKHJlYXNvbjogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqID0gdGhpcztcbiAgICAgICAgaWYgKCFqLnR1bm5lbCkge1xuICAgICAgICAgICAgai5lLmxvZygzLCBgSm9iIFwiJHtqLm5hbWV9XCIgZmFpbGVkIGJlZm9yZSB0dW5uZWwgd2FzIHNldC5gLCBqKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWoubmVzdCkge1xuICAgICAgICAgICAgai5lLmxvZygzLCBgSm9iIFwiJHtqLm5hbWV9XCIgZG9lcyBub3QgaGF2ZSBhIG5lc3QuYCwgaik7XG4gICAgICAgIH1cblxuICAgICAgICBqLnR1bm5lbC5leGVjdXRlRmFpbChqLCBqLm5lc3QsIHJlYXNvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJhbnNmZXIgYSBqb2IgdG8gYW5vdGhlciB0dW5uZWwgZGlyZWN0bHkuXG4gICAgICogQHBhcmFtIHR1bm5lbFxuICAgICAqL1xuICAgIHB1YmxpYyB0cmFuc2Zlcih0dW5uZWw6IFR1bm5lbCkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IG9sZFR1bm5lbCA9IHRoaXMudHVubmVsO1xuXG4gICAgICAgIGxldCBvbGRUdW5uZWxOYW1lID0gXCJcIjtcbiAgICAgICAgaWYgKG9sZFR1bm5lbCkge1xuICAgICAgICAgICAgb2xkVHVubmVsTmFtZSA9IG9sZFR1bm5lbC5uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgam9iLnR1bm5lbCA9IHR1bm5lbDtcbiAgICAgICAgdHVubmVsLmFycml2ZShqb2IsIG51bGwpO1xuXG4gICAgICAgIGpvYi5lLmxvZygxLCBgVHJhbnNmZXJyZWQgdG8gVHVubmVsIFwiJHt0dW5uZWwubmFtZX1cIi5gLCBqb2IsIFtvbGRUdW5uZWxdKTtcbiAgICAgICAgam9iLmNyZWF0ZUxpZmVFdmVudChcInRyYW5zZmVyXCIsIG9sZFR1bm5lbE5hbWUsIHR1bm5lbC5uYW1lKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIE1vdmUgZnVuY3Rpb24gZXJyb3IuXG4gICAgICovXG4gICAgcHVibGljIG1vdmUoZGVzdGluYXRpb25OZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB0aHJvdyBcIlRoaXMgdHlwZSBvZiBqb2IgY2Fubm90IGJlIG1vdmVkLlwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmRzIGFuIGVtYWlsLlxuICAgICAqIEBwYXJhbSBlbWFpbE9wdGlvbnMgICAgICBFbWFpbCBvcHRpb25zXG4gICAgICogIyMjIyBTZW5kaW5nIHB1ZyB0ZW1wbGF0ZSBlbWFpbCBleGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiAvLyBteV90dW5uZWwuanNcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIGZyb20gcHVnIHRlbXBsYXRlXCIsXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxuICAgICAqICAgICAgICAgIHRlbXBsYXRlOiBfX2Rpcm5hbWUgKyBcIi4vdGVtcGxhdGVfZmlsZXMvbXlfZW1haWwucHVnXCJcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiAvLyB0ZW1wbGF0ZV9maWxlcy9teV9lbWFpbC5wdWdcbiAgICAgKiBoMT1cIkV4YW1wbGUgZW1haWwhXCJcbiAgICAgKiBwPVwiR290IGpvYiBJRCBcIiArIGpvYi5nZXRJZCgpXG4gICAgICogYGBgXG4gICAgICogIyMjIyBTZW5kaW5nIHBsYWluLXRleHQgZW1haWxcbiAgICAgKiBgYGBqc1xuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xuICAgICAqICAgICAgam9iLmVtYWlsKHtcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgd2l0aCBoYXJkLWNvZGVkIHBsYWluLXRleHRcIixcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXG4gICAgICogICAgICAgICAgdGV4dDogXCJNeSBlbWFpbCBib2R5IVwiXG4gICAgICogICAgICB9KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKiAjIyMjIFNlbmRpbmcgaHRtbCBlbWFpbFxuICAgICAqIGBgYGpzXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XG4gICAgICogICAgICBqb2IuZW1haWwoe1xuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCB3aXRoIGhhcmQtY29kZWQgaHRtbFwiLFxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcbiAgICAgKiAgICAgICAgICBodG1sOiBcIjxoMT5NeSBlbWFpbCBib2R5ITwvaDE+XCJcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBlbWFpbChlbWFpbE9wdGlvbnM6IEVtYWlsT3B0aW9ucykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IGVtYWlsZXIgPSBqb2IuZS5nZXRFbWFpbGVyKCk7XG5cbiAgICAgICAgZW1haWxlci5zZW5kTWFpbChlbWFpbE9wdGlvbnMsIGpvYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGpvYiBzcGVjaWZpYyBkYXRhIHRvIHRoZSBqb2IgaW5zdGFuY2UuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5zZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiLCAxMjM0NTYpO1xuICAgICAqXG4gICAgICogY29uc29sZS5sb2coam9iLmdldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIpKTtcbiAgICAgKiAvLyAxMjM0NTZcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UHJvcGVydHlWYWx1ZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IHByb3AgPSBuZXcgSm9iUHJvcGVydHkoa2V5LCB2YWx1ZSk7XG5cbiAgICAgICAgam9iLl9wcm9wZXJ0aWVzW2tleV0gPSBwcm9wO1xuICAgICAgICBqb2IuZS5sb2coMSwgYFByb3BlcnR5IFwiJHtrZXl9XCIgYWRkZWQgdG8gam9iIHByb3BlcnRpZXMuYCwgam9iKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHByb3BlcnR5VmFsdWVzKHByb3BlcnRpZXM6IE9iamVjdCkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgam9iLl9wcm9wZXJ0aWVzID0gcHJvcGVydGllcztcbiAgICAgICAgam9iLmUubG9nKDAsIGBSZXN0b3JlZCAke09iamVjdC5rZXlzKGpvYi5fcHJvcGVydGllcykubGVuZ3RofSBwcm9wZXJ0aWVzLmAsIGpvYik7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGVudGlyZSBqb2IgcHJvcGVydHkgb2JqZWN0LlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJucyB7Sm9iUHJvcGVydHl9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5KGtleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzW2tleV0gYXMgSm9iUHJvcGVydHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGlmIGl0IGhhcyBiZWVuIHByZXZpb3VzbHkgc2V0LlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eVZhbHVlKGtleTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBpZiAoam9iLl9wcm9wZXJ0aWVzW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiBqb2IuX3Byb3BlcnRpZXNba2V5XS52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB0eXBlIG9mIGEgcHJvcGVydHkuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5zZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiLCAxMjM0NTYpO1xuICAgICAqXG4gICAgICogY29uc29sZS5sb2coam9iLmdldFByb3BlcnR5VHlwZShcIk15IEpvYiBOdW1iZXJcIikpO1xuICAgICAqIC8vIFwibnVtYmVyXCJcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eVR5cGUoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGlmIChqb2IuX3Byb3BlcnRpZXNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGpvYi5fcHJvcGVydGllc1trZXldLmdldFR5cGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFja3MgdGhlIGpvYiBpbnN0YW5jZSBhbmQgZmlsZSB0b2dldGhlciBpbiBhIHppcC5cbiAgICAgKiBSZXR1cm5zIGEgUGFja0pvYiBpbiB0aGUgcGFyYW1ldGVyIG9mIHRoZSBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5wYWNrKGZ1bmN0aW9uKHBhY2tKb2Ipe1xuICAgICAqICAgICAgcGFja0pvYi5tb3ZlKHBhY2tlZF9mb2xkZXJfbmVzdCk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIHBhY2soY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBQYWNrZWRKb2IgPSByZXF1aXJlKFwiLi9wYWNrZWRKb2JcIikuUGFja2VkSm9iO1xuICAgICAgICBsZXQgcGogPSBuZXcgUGFja2VkSm9iKGpvYi5lLCBqb2IpO1xuICAgICAgICBwai5leGVjUGFjaygoKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhwaik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVucGFja3MgYSBwYWNrZWQgam9iLiBSZXR1cm5zIGEgdGhlIG9yaWdpbmFsIHVucGFja2VkIGpvYiBpbiB0aGUgcGFyYW1ldGVyIG9mIHRoZSBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIHBhY2tlZEpvYi51bnBhY2soZnVuY3Rpb24odW5wYWNrZWRKb2Ipe1xuICAgICAqICAgICBjb25zb2xlLmxvZyhcIlVucGFja2VkXCIsIHVucGFja2VkSm9iLm5hbWUpO1xuICAgICAqICAgICB1bnBhY2tlZEpvYi5tb3ZlKHVucGFja2VkX2ZvbGRlcik7XG4gICAgICogICAgIHBhY2tlZEpvYi5yZW1vdmUoKTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgdW5wYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgUGFja2VkSm9iID0gcmVxdWlyZShcIi4vcGFja2VkSm9iXCIpLlBhY2tlZEpvYjtcbiAgICAgICAgbGV0IHBqID0gbmV3IFBhY2tlZEpvYihqb2IuZSwgam9iKTtcbiAgICAgICAgcGouZXhlY1VucGFjaygodW5wYWNrZWRKb2IpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHVucGFja2VkSm9iKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBqb2Igb2JqZWN0IGFzIEpTT04gd2l0aCBjaXJjdWxhciByZWZlcmVuY2VzIHJlbW92ZWQuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SlNPTigpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBqc29uO1xuICAgICAgICBsZXQgcmVwbGFjZXIgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBGaWx0ZXJpbmcgb3V0IHByb3BlcnRpZXNcbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwibmVzdFwiIHx8IGtleSA9PT0gXCJlXCIgfHwga2V5ID09PSBcInR1bm5lbFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwiX25lc3RcIiB8fCBrZXkgPT09IFwiX3R1bm5lbFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAganNvbiA9IEpTT04uc3RyaW5naWZ5KGpvYiwgcmVwbGFjZXIpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGpvYi5lLmxvZygzLCBgZ2V0SlNPTiBzdHJpbmdpZnkgZXJyb3I6ICR7ZXJyfWAsIGpvYik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ganNvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHBhdGgoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGlzRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNGb2xkZXIoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBmaWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RmlsZShpbmRleDogYW55KSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBwYXRoKHBhdGg6IHN0cmluZykge1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgbWVzc2FnZSB0byB0aGUgbG9nIHdpdGggdGhpcyBqb2IgYXMgdGhlIGFjdG9yLlxuICAgICAqIEBwYXJhbSBsZXZlbCAgICAgICAgICAgICAwID0gZGVidWcsIDEgPSBpbmZvLCAyLCA9IHdhcm5pbmcsIDMgPSBlcnJvclxuICAgICAqIEBwYXJhbSBtZXNzYWdlICAgICAgICAgICBMb2cgbWVzc2FnZVxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgcHVibGljIGxvZyhsZXZlbDogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBqb2IuZS5sb2cobGV2ZWwsIG1lc3NhZ2UsIGpvYik7XG4gICAgfVxufSJdfQ==
