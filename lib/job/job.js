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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Ozs7O09BS0c7SUFDSSxpQkFBRyxHQUFWLFVBQVcsS0FBYSxFQUFFLE9BQWU7UUFDckMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ2YsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELHNCQUFXLHFCQUFJO2FBQWY7WUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3JCLENBQUM7OztPQUFBO0lBRUQsc0JBQVcsMEJBQVM7YUFBcEI7WUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3JCLENBQUM7OztPQUFBO0lBRUwsVUFBQztBQUFELENBOWFBLEFBOGFDLElBQUE7QUE5YXFCLFdBQUcsTUE4YXhCLENBQUEiLCJmaWxlIjoibGliL2pvYi9qb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUdW5uZWwgfSBmcm9tIFwiLi4vdHVubmVsL3R1bm5lbFwiO1xuaW1wb3J0IHsgTmVzdCB9IGZyb20gXCIuLi9uZXN0L25lc3RcIjtcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtMaWZlRXZlbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9saWZlRXZlbnRcIjtcbmltcG9ydCB7RW1haWxPcHRpb25zfSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW1haWxPcHRpb25zXCI7XG5pbXBvcnQge0pvYlByb3BlcnR5fSBmcm9tIFwiLi9qb2JQcm9wZXJ0eVwiO1xuXG4vLyBIYW5kbGUgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY3kgYnkgc3Rhc2hpbmcgdGhlIHR5cGUgaW4gYSB2YXJpYWJsZSBmb3IgcmVxdWlyaW5nIGxhdGVyLlxuLy8gaW1wb3J0ICogYXMgUGFja2VkSm9iVHlwZXMgZnJvbSBcIi4vcGFja2VkSm9iXCI7XG4vLyBsZXQgUGFja2VkSm9iOiB0eXBlb2YgUGFja2VkSm9iVHlwZXMuUGFja2VkSm9iO1xuXG5jb25zdCAgIHNob3J0aWQgPSByZXF1aXJlKFwic2hvcnRpZFwiKSxcbiAgICAgICAgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBKb2Ige1xuXG4gICAgcHJvdGVjdGVkIF9uYW1lOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF90dW5uZWw6IFR1bm5lbDtcbiAgICBwcm90ZWN0ZWQgX25lc3Q6IE5lc3Q7XG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuICAgIHByb3RlY3RlZCBfbG9jYWxseUF2YWlsYWJsZTogYm9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgX2xpZmVDeWNsZTogTGlmZUV2ZW50W107XG4gICAgcHJvdGVjdGVkIF9pZDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfcHJvcGVydGllcztcbiAgICBwcm90ZWN0ZWQgX3R5cGU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEpvYiBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqID0gdGhpcztcbiAgICAgICAgai5lID0gZTtcbiAgICAgICAgai5faWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XG4gICAgICAgIGouX25hbWUgPSBuYW1lO1xuICAgICAgICBqLl9saWZlQ3ljbGUgPSBbXTtcbiAgICAgICAgai5fcHJvcGVydGllcyA9IHt9O1xuICAgICAgICBqLl90eXBlID0gXCJiYXNlXCI7XG5cbiAgICAgICAgai5jcmVhdGVMaWZlRXZlbnQoXCJjcmVhdGVkXCIsIG51bGwsIG5hbWUpO1xuICAgICAgICBqLmUubG9nKDEsIGBOZXcgSm9iIFwiJHtuYW1lfVwiIGNyZWF0ZWQsIGlkOiAke2ouaWR9LmAsIGosIFtqLm5lc3QsIGoudHVubmVsXSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90eXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsYXNzIF9uYW1lIGZvciBsb2dnaW5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gXCJKb2JcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgbG9jYWxseSBhdmFpbGFibGUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGdldCBpc0xvY2FsbHlBdmFpbGFibGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2NhbGx5QXZhaWxhYmxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBpZiB0aGUgam9iIGlzIGxvY2FsbHkgYXZhaWxhYmxlLlxuICAgICAqIEBwYXJhbSBhdmFpbGFibGVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGxvY2FsbHlBdmFpbGFibGUoYXZhaWxhYmxlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX2xvY2FsbHlBdmFpbGFibGUgPSBhdmFpbGFibGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBsaWZlIGN5Y2xlIG9iamVjdC5cbiAgICAgKiBAcmV0dXJucyB7TGlmZUV2ZW50W119XG4gICAgICovXG4gICAgcHVibGljIGdldCBsaWZlQ3ljbGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9saWZlQ3ljbGU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBsaWZlQ3ljbGUoZXZlbnRzOiBMaWZlRXZlbnRbXSkge1xuICAgICAgICB0aGlzLl9saWZlQ3ljbGUgPSBldmVudHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpZmUgZXZlbnQuXG4gICAgICogQHBhcmFtIHZlcmJcbiAgICAgKiBAcGFyYW0gc3RhcnRcbiAgICAgKiBAcGFyYW0gZmluaXNoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUxpZmVFdmVudCh2ZXJiOiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGZpbmlzaDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubGlmZUN5Y2xlLnB1c2gobmV3IExpZmVFdmVudCh2ZXJiLCBzdGFydCwgZmluaXNoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgbmV3IF9uYW1lLlxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICovXG4gICAgcHVibGljIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIF9uYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIElELlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgX25hbWUgcHJvcGVyLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBuYW1lUHJvcGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgbmVzdC5cbiAgICAgKiBAcGFyYW0gbmVzdFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbmVzdChuZXN0OiBOZXN0KSB7XG4gICAgICAgIHRoaXMuX25lc3QgPSBuZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmVzdC5cbiAgICAgKiBAcmV0dXJucyB7TmVzdH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5lc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgdHVubmVsLlxuICAgICAqIEBwYXJhbSB0dW5uZWxcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHR1bm5lbCh0dW5uZWw6IFR1bm5lbCkge1xuICAgICAgICB0aGlzLl90dW5uZWwgPSB0dW5uZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB0dW5uZWwuXG4gICAgICogQHJldHVybnMge1R1bm5lbH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHR1bm5lbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R1bm5lbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBjYWxsIHRvIGZhaWwgYSBqb2Igd2hpbGUgaW4gYSB0dW5uZWwuXG4gICAgICogQHBhcmFtIHJlYXNvblxuICAgICAqL1xuICAgIHB1YmxpYyBmYWlsKHJlYXNvbjogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqID0gdGhpcztcbiAgICAgICAgaWYgKCFqLnR1bm5lbCkge1xuICAgICAgICAgICAgai5lLmxvZygzLCBgSm9iIFwiJHtqLm5hbWV9XCIgZmFpbGVkIGJlZm9yZSB0dW5uZWwgd2FzIHNldC5gLCBqKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWoubmVzdCkge1xuICAgICAgICAgICAgai5lLmxvZygzLCBgSm9iIFwiJHtqLm5hbWV9XCIgZG9lcyBub3QgaGF2ZSBhIG5lc3QuYCwgaik7XG4gICAgICAgIH1cblxuICAgICAgICBqLnR1bm5lbC5leGVjdXRlRmFpbChqLCBqLm5lc3QsIHJlYXNvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJhbnNmZXIgYSBqb2IgdG8gYW5vdGhlciB0dW5uZWwgZGlyZWN0bHkuXG4gICAgICogQHBhcmFtIHR1bm5lbFxuICAgICAqL1xuICAgIHB1YmxpYyB0cmFuc2Zlcih0dW5uZWw6IFR1bm5lbCkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IG9sZFR1bm5lbCA9IHRoaXMudHVubmVsO1xuXG4gICAgICAgIGxldCBvbGRUdW5uZWxOYW1lID0gXCJcIjtcbiAgICAgICAgaWYgKG9sZFR1bm5lbCkge1xuICAgICAgICAgICAgb2xkVHVubmVsTmFtZSA9IG9sZFR1bm5lbC5uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgam9iLnR1bm5lbCA9IHR1bm5lbDtcbiAgICAgICAgdHVubmVsLmFycml2ZShqb2IsIG51bGwpO1xuXG4gICAgICAgIGpvYi5lLmxvZygxLCBgVHJhbnNmZXJyZWQgdG8gVHVubmVsIFwiJHt0dW5uZWwubmFtZX1cIi5gLCBqb2IsIFtvbGRUdW5uZWxdKTtcbiAgICAgICAgam9iLmNyZWF0ZUxpZmVFdmVudChcInRyYW5zZmVyXCIsIG9sZFR1bm5lbE5hbWUsIHR1bm5lbC5uYW1lKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIE1vdmUgZnVuY3Rpb24gZXJyb3IuXG4gICAgICovXG4gICAgcHVibGljIG1vdmUoZGVzdGluYXRpb25OZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB0aHJvdyBcIlRoaXMgdHlwZSBvZiBqb2IgY2Fubm90IGJlIG1vdmVkLlwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmRzIGFuIGVtYWlsLlxuICAgICAqIEBwYXJhbSBlbWFpbE9wdGlvbnMgICAgICBFbWFpbCBvcHRpb25zXG4gICAgICogIyMjIyBTZW5kaW5nIHB1ZyB0ZW1wbGF0ZSBlbWFpbCBleGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiAvLyBteV90dW5uZWwuanNcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIGZyb20gcHVnIHRlbXBsYXRlXCIsXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxuICAgICAqICAgICAgICAgIHRlbXBsYXRlOiBfX2Rpcm5hbWUgKyBcIi4vdGVtcGxhdGVfZmlsZXMvbXlfZW1haWwucHVnXCJcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiAvLyB0ZW1wbGF0ZV9maWxlcy9teV9lbWFpbC5wdWdcbiAgICAgKiBoMT1cIkV4YW1wbGUgZW1haWwhXCJcbiAgICAgKiBwPVwiR290IGpvYiBJRCBcIiArIGpvYi5nZXRJZCgpXG4gICAgICogYGBgXG4gICAgICogIyMjIyBTZW5kaW5nIHBsYWluLXRleHQgZW1haWxcbiAgICAgKiBgYGBqc1xuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xuICAgICAqICAgICAgam9iLmVtYWlsKHtcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgd2l0aCBoYXJkLWNvZGVkIHBsYWluLXRleHRcIixcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXG4gICAgICogICAgICAgICAgdGV4dDogXCJNeSBlbWFpbCBib2R5IVwiXG4gICAgICogICAgICB9KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKiAjIyMjIFNlbmRpbmcgaHRtbCBlbWFpbFxuICAgICAqIGBgYGpzXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XG4gICAgICogICAgICBqb2IuZW1haWwoe1xuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCB3aXRoIGhhcmQtY29kZWQgaHRtbFwiLFxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcbiAgICAgKiAgICAgICAgICBodG1sOiBcIjxoMT5NeSBlbWFpbCBib2R5ITwvaDE+XCJcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBlbWFpbChlbWFpbE9wdGlvbnM6IEVtYWlsT3B0aW9ucykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IGVtYWlsZXIgPSBqb2IuZS5lbWFpbGVyO1xuXG4gICAgICAgIGVtYWlsZXIuc2VuZE1haWwoZW1haWxPcHRpb25zLCBqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBqb2Igc3BlY2lmaWMgZGF0YSB0byB0aGUgam9iIGluc3RhbmNlLlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiBqb2Iuc2V0UHJvcGVydHlWYWx1ZShcIk15IEpvYiBOdW1iZXJcIiwgMTIzNDU2KTtcbiAgICAgKlxuICAgICAqIGNvbnNvbGUubG9nKGpvYi5nZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiKSk7XG4gICAgICogLy8gMTIzNDU2XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIHZhbHVlXG4gICAgICovXG4gICAgcHVibGljIHNldFByb3BlcnR5VmFsdWUoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBwcm9wID0gbmV3IEpvYlByb3BlcnR5KGtleSwgdmFsdWUpO1xuXG4gICAgICAgIGpvYi5fcHJvcGVydGllc1trZXldID0gcHJvcDtcbiAgICAgICAgam9iLmUubG9nKDEsIGBQcm9wZXJ0eSBcIiR7a2V5fVwiIGFkZGVkIHRvIGpvYiBwcm9wZXJ0aWVzLmAsIGpvYik7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBwcm9wZXJ0eVZhbHVlcyhwcm9wZXJ0aWVzOiBPYmplY3QpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGpvYi5fcHJvcGVydGllcyA9IHByb3BlcnRpZXM7XG4gICAgICAgIGpvYi5lLmxvZygwLCBgUmVzdG9yZWQgJHtPYmplY3Qua2V5cyhqb2IuX3Byb3BlcnRpZXMpLmxlbmd0aH0gcHJvcGVydGllcy5gLCBqb2IpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBlbnRpcmUgam9iIHByb3BlcnR5IG9iamVjdC5cbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnMge0pvYlByb3BlcnR5fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eShrZXk6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllc1trZXldIGFzIEpvYlByb3BlcnR5O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGlmIGl0IGhhcyBiZWVuIHByZXZpb3VzbHkgc2V0LlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eVZhbHVlKGtleTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBpZiAoam9iLl9wcm9wZXJ0aWVzW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiBqb2IuX3Byb3BlcnRpZXNba2V5XS52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB0eXBlIG9mIGEgcHJvcGVydHkuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5zZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiLCAxMjM0NTYpO1xuICAgICAqXG4gICAgICogY29uc29sZS5sb2coam9iLmdldFByb3BlcnR5VHlwZShcIk15IEpvYiBOdW1iZXJcIikpO1xuICAgICAqIC8vIFwibnVtYmVyXCJcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eVR5cGUoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGlmIChqb2IuX3Byb3BlcnRpZXNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGpvYi5fcHJvcGVydGllc1trZXldLnR5cGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhY2tzIHRoZSBqb2IgaW5zdGFuY2UgYW5kIGZpbGUgdG9nZXRoZXIgaW4gYSB6aXAuXG4gICAgICogUmV0dXJucyBhIFBhY2tKb2IgaW4gdGhlIHBhcmFtZXRlciBvZiB0aGUgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBqb2IucGFjayhmdW5jdGlvbihwYWNrSm9iKXtcbiAgICAgKiAgICAgIHBhY2tKb2IubW92ZShwYWNrZWRfZm9sZGVyX25lc3QpO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBwYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgUGFja2VkSm9iID0gcmVxdWlyZShcIi4vcGFja2VkSm9iXCIpLlBhY2tlZEpvYjtcbiAgICAgICAgbGV0IHBqID0gbmV3IFBhY2tlZEpvYihqb2IuZSwgam9iKTtcbiAgICAgICAgcGouZXhlY1BhY2soKCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2socGopO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVbnBhY2tzIGEgcGFja2VkIGpvYi4gUmV0dXJucyBhIHRoZSBvcmlnaW5hbCB1bnBhY2tlZCBqb2IgaW4gdGhlIHBhcmFtZXRlciBvZiB0aGUgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBwYWNrZWRKb2IudW5wYWNrKGZ1bmN0aW9uKHVucGFja2VkSm9iKXtcbiAgICAgKiAgICAgY29uc29sZS5sb2coXCJVbnBhY2tlZFwiLCB1bnBhY2tlZEpvYi5uYW1lKTtcbiAgICAgKiAgICAgdW5wYWNrZWRKb2IubW92ZSh1bnBhY2tlZF9mb2xkZXIpO1xuICAgICAqICAgICBwYWNrZWRKb2IucmVtb3ZlKCk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIHVucGFjayhjYWxsYmFjaykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IFBhY2tlZEpvYiA9IHJlcXVpcmUoXCIuL3BhY2tlZEpvYlwiKS5QYWNrZWRKb2I7XG4gICAgICAgIGxldCBwaiA9IG5ldyBQYWNrZWRKb2Ioam9iLmUsIGpvYik7XG4gICAgICAgIHBqLmV4ZWNVbnBhY2soKHVucGFja2VkSm9iKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayh1bnBhY2tlZEpvYik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgam9iIG9iamVjdCBhcyBKU09OIHdpdGggY2lyY3VsYXIgcmVmZXJlbmNlcyByZW1vdmVkLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldEpTT04oKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQganNvbjtcbiAgICAgICAgbGV0IHJlcGxhY2VyID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gRmlsdGVyaW5nIG91dCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcIm5lc3RcIiB8fCBrZXkgPT09IFwiZVwiIHx8IGtleSA9PT0gXCJ0dW5uZWxcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcIl9uZXN0XCIgfHwga2V5ID09PSBcIl90dW5uZWxcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGpzb24gPSBKU09OLnN0cmluZ2lmeShqb2IsIHJlcGxhY2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBqb2IuZS5sb2coMywgYGdldEpTT04gc3RyaW5naWZ5IGVycm9yOiAke2Vycn1gLCBqb2IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpzb247XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBwYXRoKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc0ZpbGUoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGlzRm9sZGVyKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZmlsZXMoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEZpbGUoaW5kZXg6IGFueSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgcGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIG1lc3NhZ2UgdG8gdGhlIGxvZyB3aXRoIHRoaXMgam9iIGFzIHRoZSBhY3Rvci5cbiAgICAgKiBAcGFyYW0gbGV2ZWwgICAgICAgICAgICAgMCA9IGRlYnVnLCAxID0gaW5mbywgMiwgPSB3YXJuaW5nLCAzID0gZXJyb3JcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSAgICAgICAgICAgTG9nIG1lc3NhZ2VcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHB1YmxpYyBsb2cobGV2ZWw6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICByZXR1cm4gam9iLmUubG9nKGxldmVsLCBtZXNzYWdlLCBqb2IpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgc2l6ZSAoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzaXplQnl0ZXMgKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxufSJdfQ==
