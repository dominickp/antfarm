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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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S0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ0wsVUFBQztBQUFELENBamFBLEFBaWFDLElBQUE7QUFqYXFCLFdBQUcsTUFpYXhCLENBQUEiLCJmaWxlIjoibGliL2pvYi9qb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUdW5uZWwgfSBmcm9tIFwiLi4vdHVubmVsL3R1bm5lbFwiO1xuaW1wb3J0IHsgTmVzdCB9IGZyb20gXCIuLi9uZXN0L25lc3RcIjtcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtMaWZlRXZlbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9saWZlRXZlbnRcIjtcbmltcG9ydCB7RW1haWxPcHRpb25zfSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW1haWxPcHRpb25zXCI7XG5pbXBvcnQge0pvYlByb3BlcnR5fSBmcm9tIFwiLi9qb2JQcm9wZXJ0eVwiO1xuXG4vLyBIYW5kbGUgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY3kgYnkgc3Rhc2hpbmcgdGhlIHR5cGUgaW4gYSB2YXJpYWJsZSBmb3IgcmVxdWlyaW5nIGxhdGVyLlxuLy8gaW1wb3J0ICogYXMgUGFja2VkSm9iVHlwZXMgZnJvbSBcIi4vcGFja2VkSm9iXCI7XG4vLyBsZXQgUGFja2VkSm9iOiB0eXBlb2YgUGFja2VkSm9iVHlwZXMuUGFja2VkSm9iO1xuXG5jb25zdCAgIHNob3J0aWQgPSByZXF1aXJlKFwic2hvcnRpZFwiKSxcbiAgICAgICAgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBKb2Ige1xuXG4gICAgcHJvdGVjdGVkIF9uYW1lOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF90dW5uZWw6IFR1bm5lbDtcbiAgICBwcm90ZWN0ZWQgX25lc3Q6IE5lc3Q7XG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuICAgIHByb3RlY3RlZCBfbG9jYWxseUF2YWlsYWJsZTogYm9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgX2xpZmVDeWNsZTogTGlmZUV2ZW50W107XG4gICAgcHJvdGVjdGVkIF9pZDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfcHJvcGVydGllcztcbiAgICBwcm90ZWN0ZWQgX3R5cGU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEpvYiBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqID0gdGhpcztcbiAgICAgICAgai5lID0gZTtcbiAgICAgICAgai5faWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XG4gICAgICAgIGouX25hbWUgPSBuYW1lO1xuICAgICAgICBqLl9saWZlQ3ljbGUgPSBbXTtcbiAgICAgICAgai5fcHJvcGVydGllcyA9IHt9O1xuICAgICAgICBqLl90eXBlID0gXCJiYXNlXCI7XG5cbiAgICAgICAgai5jcmVhdGVMaWZlRXZlbnQoXCJjcmVhdGVkXCIsIG51bGwsIG5hbWUpO1xuICAgICAgICBqLmUubG9nKDEsIGBOZXcgSm9iIFwiJHtuYW1lfVwiIGNyZWF0ZWQsIGlkOiAke2ouaWR9LmAsIGopO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHlwZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGFzcyBfbmFtZSBmb3IgbG9nZ2luZy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIFwiSm9iXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGxvY2FsbHkgYXZhaWxhYmxlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgaXNMb2NhbGx5QXZhaWxhYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbG9jYWxseUF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgaWYgdGhlIGpvYiBpcyBsb2NhbGx5IGF2YWlsYWJsZS5cbiAgICAgKiBAcGFyYW0gYXZhaWxhYmxlXG4gICAgICovXG4gICAgcHVibGljIHNldCBsb2NhbGx5QXZhaWxhYmxlKGF2YWlsYWJsZTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9sb2NhbGx5QXZhaWxhYmxlID0gYXZhaWxhYmxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbGlmZSBjeWNsZSBvYmplY3QuXG4gICAgICogQHJldHVybnMge0xpZmVFdmVudFtdfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbGlmZUN5Y2xlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGlmZUN5Y2xlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgbGlmZUN5Y2xlKGV2ZW50czogTGlmZUV2ZW50W10pIHtcbiAgICAgICAgdGhpcy5fbGlmZUN5Y2xlID0gZXZlbnRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBsaWZlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB2ZXJiXG4gICAgICogQHBhcmFtIHN0YXJ0XG4gICAgICogQHBhcmFtIGZpbmlzaFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVMaWZlRXZlbnQodmVyYjogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBmaW5pc2g6IHN0cmluZykge1xuICAgICAgICB0aGlzLmxpZmVDeWNsZS5wdXNoKG5ldyBMaWZlRXZlbnQodmVyYiwgc3RhcnQsIGZpbmlzaCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBfbmFtZS5cbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBfbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBJRC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIF9uYW1lIHByb3Blci5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbmFtZVByb3BlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIG5lc3QuXG4gICAgICogQHBhcmFtIG5lc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IG5lc3QobmVzdDogTmVzdCkge1xuICAgICAgICB0aGlzLl9uZXN0ID0gbmVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG5lc3QuXG4gICAgICogQHJldHVybnMge05lc3R9XG4gICAgICovXG4gICAgcHVibGljIGdldCBuZXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHR1bm5lbC5cbiAgICAgKiBAcGFyYW0gdHVubmVsXG4gICAgICovXG4gICAgcHVibGljIHNldCB0dW5uZWwodHVubmVsOiBUdW5uZWwpIHtcbiAgICAgICAgdGhpcy5fdHVubmVsID0gdHVubmVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdHVubmVsLlxuICAgICAqIEByZXR1cm5zIHtUdW5uZWx9XG4gICAgICovXG4gICAgcHVibGljIGdldCB0dW5uZWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90dW5uZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gY2FsbCB0byBmYWlsIGEgam9iIHdoaWxlIGluIGEgdHVubmVsLlxuICAgICAqIEBwYXJhbSByZWFzb25cbiAgICAgKi9cbiAgICBwdWJsaWMgZmFpbChyZWFzb246IHN0cmluZykge1xuICAgICAgICBsZXQgaiA9IHRoaXM7XG4gICAgICAgIGlmICghai50dW5uZWwpIHtcbiAgICAgICAgICAgIGouZS5sb2coMywgYEpvYiBcIiR7ai5uYW1lfVwiIGZhaWxlZCBiZWZvcmUgdHVubmVsIHdhcyBzZXQuYCwgaik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFqLm5lc3QpIHtcbiAgICAgICAgICAgIGouZS5sb2coMywgYEpvYiBcIiR7ai5uYW1lfVwiIGRvZXMgbm90IGhhdmUgYSBuZXN0LmAsIGopO1xuICAgICAgICB9XG5cbiAgICAgICAgai50dW5uZWwuZXhlY3V0ZUZhaWwoaiwgai5uZXN0LCByZWFzb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYW5zZmVyIGEgam9iIHRvIGFub3RoZXIgdHVubmVsIGRpcmVjdGx5LlxuICAgICAqIEBwYXJhbSB0dW5uZWxcbiAgICAgKi9cbiAgICBwdWJsaWMgdHJhbnNmZXIodHVubmVsOiBUdW5uZWwpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBvbGRUdW5uZWwgPSB0aGlzLnR1bm5lbDtcblxuICAgICAgICBsZXQgb2xkVHVubmVsTmFtZSA9IFwiXCI7XG4gICAgICAgIGlmIChvbGRUdW5uZWwpIHtcbiAgICAgICAgICAgIG9sZFR1bm5lbE5hbWUgPSBvbGRUdW5uZWwubmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGpvYi50dW5uZWwgPSB0dW5uZWw7XG4gICAgICAgIHR1bm5lbC5hcnJpdmUoam9iLCBudWxsKTtcblxuICAgICAgICBqb2IuZS5sb2coMSwgYFRyYW5zZmVycmVkIHRvIFR1bm5lbCBcIiR7dHVubmVsLm5hbWV9XCIuYCwgam9iLCBbb2xkVHVubmVsXSk7XG4gICAgICAgIGpvYi5jcmVhdGVMaWZlRXZlbnQoXCJ0cmFuc2ZlclwiLCBvbGRUdW5uZWxOYW1lLCB0dW5uZWwubmFtZSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIGZ1bmN0aW9uIGVycm9yLlxuICAgICAqL1xuICAgIHB1YmxpYyBtb3ZlKGRlc3RpbmF0aW9uTmVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhyb3cgXCJUaGlzIHR5cGUgb2Ygam9iIGNhbm5vdCBiZSBtb3ZlZC5cIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyBhbiBlbWFpbC5cbiAgICAgKiBAcGFyYW0gZW1haWxPcHRpb25zICAgICAgRW1haWwgb3B0aW9uc1xuICAgICAqICMjIyMgU2VuZGluZyBwdWcgdGVtcGxhdGUgZW1haWwgZXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogLy8gbXlfdHVubmVsLmpzXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XG4gICAgICogICAgICBqb2IuZW1haWwoe1xuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCBmcm9tIHB1ZyB0ZW1wbGF0ZVwiLFxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcbiAgICAgKiAgICAgICAgICB0ZW1wbGF0ZTogX19kaXJuYW1lICsgXCIuL3RlbXBsYXRlX2ZpbGVzL215X2VtYWlsLnB1Z1wiXG4gICAgICogICAgICB9KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogLy8gdGVtcGxhdGVfZmlsZXMvbXlfZW1haWwucHVnXG4gICAgICogaDE9XCJFeGFtcGxlIGVtYWlsIVwiXG4gICAgICogcD1cIkdvdCBqb2IgSUQgXCIgKyBqb2IuZ2V0SWQoKVxuICAgICAqIGBgYFxuICAgICAqICMjIyMgU2VuZGluZyBwbGFpbi10ZXh0IGVtYWlsXG4gICAgICogYGBganNcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIHdpdGggaGFyZC1jb2RlZCBwbGFpbi10ZXh0XCIsXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxuICAgICAqICAgICAgICAgIHRleHQ6IFwiTXkgZW1haWwgYm9keSFcIlxuICAgICAqICAgICAgfSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICogIyMjIyBTZW5kaW5nIGh0bWwgZW1haWxcbiAgICAgKiBgYGBqc1xuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xuICAgICAqICAgICAgam9iLmVtYWlsKHtcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgd2l0aCBoYXJkLWNvZGVkIGh0bWxcIixcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXG4gICAgICogICAgICAgICAgaHRtbDogXCI8aDE+TXkgZW1haWwgYm9keSE8L2gxPlwiXG4gICAgICogICAgICB9KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgZW1haWwoZW1haWxPcHRpb25zOiBFbWFpbE9wdGlvbnMpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBlbWFpbGVyID0gam9iLmUuZW1haWxlcjtcblxuICAgICAgICBlbWFpbGVyLnNlbmRNYWlsKGVtYWlsT3B0aW9ucywgam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggam9iIHNwZWNpZmljIGRhdGEgdG8gdGhlIGpvYiBpbnN0YW5jZS5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogam9iLnNldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIsIDEyMzQ1Nik7XG4gICAgICpcbiAgICAgKiBjb25zb2xlLmxvZyhqb2IuZ2V0UHJvcGVydHlWYWx1ZShcIk15IEpvYiBOdW1iZXJcIikpO1xuICAgICAqIC8vIDEyMzQ1NlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRQcm9wZXJ0eVZhbHVlKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgcHJvcCA9IG5ldyBKb2JQcm9wZXJ0eShrZXksIHZhbHVlKTtcblxuICAgICAgICBqb2IuX3Byb3BlcnRpZXNba2V5XSA9IHByb3A7XG4gICAgICAgIGpvYi5lLmxvZygxLCBgUHJvcGVydHkgXCIke2tleX1cIiBhZGRlZCB0byBqb2IgcHJvcGVydGllcy5gLCBqb2IpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgcHJvcGVydHlWYWx1ZXMocHJvcGVydGllczogT2JqZWN0KSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBqb2IuX3Byb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuICAgICAgICBqb2IuZS5sb2coMCwgYFJlc3RvcmVkICR7T2JqZWN0LmtleXMoam9iLl9wcm9wZXJ0aWVzKS5sZW5ndGh9IHByb3BlcnRpZXMuYCwgam9iKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZW50aXJlIGpvYiBwcm9wZXJ0eSBvYmplY3QuXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHtKb2JQcm9wZXJ0eX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UHJvcGVydHkoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXNba2V5XSBhcyBKb2JQcm9wZXJ0eTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaWYgaXQgaGFzIGJlZW4gcHJldmlvdXNseSBzZXQuXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5VmFsdWUoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGlmIChqb2IuX3Byb3BlcnRpZXNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGpvYi5fcHJvcGVydGllc1trZXldLnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHR5cGUgb2YgYSBwcm9wZXJ0eS5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogam9iLnNldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIsIDEyMzQ1Nik7XG4gICAgICpcbiAgICAgKiBjb25zb2xlLmxvZyhqb2IuZ2V0UHJvcGVydHlUeXBlKFwiTXkgSm9iIE51bWJlclwiKSk7XG4gICAgICogLy8gXCJudW1iZXJcIlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5VHlwZShrZXk6IHN0cmluZykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgaWYgKGpvYi5fcHJvcGVydGllc1trZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gam9iLl9wcm9wZXJ0aWVzW2tleV0uZ2V0VHlwZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYWNrcyB0aGUgam9iIGluc3RhbmNlIGFuZCBmaWxlIHRvZ2V0aGVyIGluIGEgemlwLlxuICAgICAqIFJldHVybnMgYSBQYWNrSm9iIGluIHRoZSBwYXJhbWV0ZXIgb2YgdGhlIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogam9iLnBhY2soZnVuY3Rpb24ocGFja0pvYil7XG4gICAgICogICAgICBwYWNrSm9iLm1vdmUocGFja2VkX2ZvbGRlcl9uZXN0KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgcGFjayhjYWxsYmFjaykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IFBhY2tlZEpvYiA9IHJlcXVpcmUoXCIuL3BhY2tlZEpvYlwiKS5QYWNrZWRKb2I7XG4gICAgICAgIGxldCBwaiA9IG5ldyBQYWNrZWRKb2Ioam9iLmUsIGpvYik7XG4gICAgICAgIHBqLmV4ZWNQYWNrKCgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHBqKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVW5wYWNrcyBhIHBhY2tlZCBqb2IuIFJldHVybnMgYSB0aGUgb3JpZ2luYWwgdW5wYWNrZWQgam9iIGluIHRoZSBwYXJhbWV0ZXIgb2YgdGhlIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogcGFja2VkSm9iLnVucGFjayhmdW5jdGlvbih1bnBhY2tlZEpvYil7XG4gICAgICogICAgIGNvbnNvbGUubG9nKFwiVW5wYWNrZWRcIiwgdW5wYWNrZWRKb2IubmFtZSk7XG4gICAgICogICAgIHVucGFja2VkSm9iLm1vdmUodW5wYWNrZWRfZm9sZGVyKTtcbiAgICAgKiAgICAgcGFja2VkSm9iLnJlbW92ZSgpO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyB1bnBhY2soY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBQYWNrZWRKb2IgPSByZXF1aXJlKFwiLi9wYWNrZWRKb2JcIikuUGFja2VkSm9iO1xuICAgICAgICBsZXQgcGogPSBuZXcgUGFja2VkSm9iKGpvYi5lLCBqb2IpO1xuICAgICAgICBwai5leGVjVW5wYWNrKCh1bnBhY2tlZEpvYikgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2sodW5wYWNrZWRKb2IpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGpvYiBvYmplY3QgYXMgSlNPTiB3aXRoIGNpcmN1bGFyIHJlZmVyZW5jZXMgcmVtb3ZlZC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRKU09OKCkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IGpzb247XG4gICAgICAgIGxldCByZXBsYWNlciA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIEZpbHRlcmluZyBvdXQgcHJvcGVydGllc1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gXCJuZXN0XCIgfHwga2V5ID09PSBcImVcIiB8fCBrZXkgPT09IFwidHVubmVsXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGtleSA9PT0gXCJfbmVzdFwiIHx8IGtleSA9PT0gXCJfdHVubmVsXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBqc29uID0gSlNPTi5zdHJpbmdpZnkoam9iLCByZXBsYWNlcik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgam9iLmUubG9nKDMsIGBnZXRKU09OIHN0cmluZ2lmeSBlcnJvcjogJHtlcnJ9YCwgam9iKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBqc29uO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNGaWxlKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc0ZvbGRlcigpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGZpbGVzKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRGaWxlKGluZGV4OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHBhdGgocGF0aDogc3RyaW5nKSB7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBtZXNzYWdlIHRvIHRoZSBsb2cgd2l0aCB0aGlzIGpvYiBhcyB0aGUgYWN0b3IuXG4gICAgICogQHBhcmFtIGxldmVsICAgICAgICAgICAgIDAgPSBkZWJ1ZywgMSA9IGluZm8sIDIsID0gd2FybmluZywgMyA9IGVycm9yXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgICAgICAgICAgIExvZyBtZXNzYWdlXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBwdWJsaWMgbG9nKGxldmVsOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgcmV0dXJuIGpvYi5lLmxvZyhsZXZlbCwgbWVzc2FnZSwgam9iKTtcbiAgICB9XG59Il19
