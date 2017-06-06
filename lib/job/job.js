"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lifeEvent_1 = require("../environment/lifeEvent");
var jobProperty_1 = require("./jobProperty");
var fileJob_1 = require("./fileJob");
// Handle the circular dependency by stashing the type in a variable for requiring later.
// import * as PackedJobTypes from "./packedJob";
// let PackedJob: typeof PackedJobTypes.PackedJob;
var shortid = require("shortid"), _ = require("lodash"), tmp = require("tmp"), fs = require("fs"), path = require("path"), JSZip = require("jszip");
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
    /**
     * Compresses the job.
     * Returns a PackJob in the parameter of the callback.
     * @param callback
     * #### Example
     * ```js
     * job.compress(function(fileJob){
     *      fileJob.move(packed_folder_nest);
     * });
     * ```
     */
    Job.prototype.compress = function (callback) {
        var job = this;
        // Save out zip
        var zip = new JSZip();
        var tmpobj = tmp.dirSync();
        var dir = tmpobj.name;
        var file_name = job.name + ".zip";
        var file_path = dir + path.sep + file_name;
        zip
            .generateNodeStream({ type: "nodebuffer", streamFiles: true })
            .pipe(fs.createWriteStream(file_path))
            .on("finish", function () {
            // JSZip generates a readable stream with a "end" event,
            // but is piped here in a writable stream which emits a "_finish" event.
            var fileJob = new fileJob_1.FileJob(job.e, file_path);
            callback(fileJob);
        });
    };
    return Job;
}());
exports.Job = Job;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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UUFBUSxFQUFFO1lBQ1Ysd0RBQXdEO1lBQ3hELHdFQUF3RTtZQUN4RSxJQUFJLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQTtZQUMzQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUwsVUFBQztBQUFELENBNWNBLEFBNGNDLElBQUE7QUE1Y3FCLGtCQUFHIiwiZmlsZSI6ImxpYi9qb2Ivam9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVHVubmVsIH0gZnJvbSBcIi4uL3R1bm5lbC90dW5uZWxcIjtcclxuaW1wb3J0IHsgTmVzdCB9IGZyb20gXCIuLi9uZXN0L25lc3RcIjtcclxuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XHJcbmltcG9ydCB7TGlmZUV2ZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvbGlmZUV2ZW50XCI7XHJcbmltcG9ydCB7RW1haWxPcHRpb25zfSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW1haWxPcHRpb25zXCI7XHJcbmltcG9ydCB7Sm9iUHJvcGVydHl9IGZyb20gXCIuL2pvYlByb3BlcnR5XCI7XHJcbmltcG9ydCB7UGFja2VkSm9ifSBmcm9tIFwiLi9wYWNrZWRKb2JcIjtcclxuaW1wb3J0IHtGaWxlSm9ifSBmcm9tIFwiLi9maWxlSm9iXCI7XHJcblxyXG5cclxuLy8gSGFuZGxlIHRoZSBjaXJjdWxhciBkZXBlbmRlbmN5IGJ5IHN0YXNoaW5nIHRoZSB0eXBlIGluIGEgdmFyaWFibGUgZm9yIHJlcXVpcmluZyBsYXRlci5cclxuLy8gaW1wb3J0ICogYXMgUGFja2VkSm9iVHlwZXMgZnJvbSBcIi4vcGFja2VkSm9iXCI7XHJcbi8vIGxldCBQYWNrZWRKb2I6IHR5cGVvZiBQYWNrZWRKb2JUeXBlcy5QYWNrZWRKb2I7XHJcblxyXG5jb25zdCAgIHNob3J0aWQgPSByZXF1aXJlKFwic2hvcnRpZFwiKSxcclxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKSxcclxuICAgICAgICB0bXAgPSByZXF1aXJlKFwidG1wXCIpLFxyXG4gICAgICAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxyXG4gICAgICAgIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKSxcclxuICAgICAgICBKU1ppcCA9IHJlcXVpcmUoXCJqc3ppcFwiKTtcclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBKb2Ige1xyXG5cclxuICAgIHByb3RlY3RlZCBfbmFtZTogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIF90dW5uZWw6IFR1bm5lbDtcclxuICAgIHByb3RlY3RlZCBfbmVzdDogTmVzdDtcclxuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcclxuICAgIHByb3RlY3RlZCBfbG9jYWxseUF2YWlsYWJsZTogYm9vbGVhbjtcclxuICAgIHByb3RlY3RlZCBfbGlmZUN5Y2xlOiBMaWZlRXZlbnRbXTtcclxuICAgIHByb3RlY3RlZCBfaWQ6IHN0cmluZztcclxuICAgIHByb3RlY3RlZCBfcHJvcGVydGllcztcclxuICAgIHByb3RlY3RlZCBfdHlwZTogc3RyaW5nO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSm9iIGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0gZVxyXG4gICAgICogQHBhcmFtIG5hbWVcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBqID0gdGhpcztcclxuICAgICAgICBqLmUgPSBlO1xyXG4gICAgICAgIGouX2lkID0gc2hvcnRpZC5nZW5lcmF0ZSgpO1xyXG4gICAgICAgIGouX25hbWUgPSBuYW1lO1xyXG4gICAgICAgIGouX2xpZmVDeWNsZSA9IFtdO1xyXG4gICAgICAgIGouX3Byb3BlcnRpZXMgPSB7fTtcclxuICAgICAgICBqLl90eXBlID0gXCJiYXNlXCI7XHJcblxyXG4gICAgICAgIGouY3JlYXRlTGlmZUV2ZW50KFwiY3JlYXRlZFwiLCBudWxsLCBuYW1lKTtcclxuICAgICAgICBqLmUubG9nKDEsIGBOZXcgSm9iIFwiJHtuYW1lfVwiIGNyZWF0ZWQsIGlkOiAke2ouaWR9LmAsIGosIFtqLm5lc3QsIGoudHVubmVsXSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBnZXQgdHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdHlwZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsYXNzIF9uYW1lIGZvciBsb2dnaW5nLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIHRvU3RyaW5nKCkge1xyXG4gICAgICAgIHJldHVybiBcIkpvYlwiO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGxvY2FsbHkgYXZhaWxhYmxlLlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgaXNMb2NhbGx5QXZhaWxhYmxlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sb2NhbGx5QXZhaWxhYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGlmIHRoZSBqb2IgaXMgbG9jYWxseSBhdmFpbGFibGUuXHJcbiAgICAgKiBAcGFyYW0gYXZhaWxhYmxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgbG9jYWxseUF2YWlsYWJsZShhdmFpbGFibGU6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl9sb2NhbGx5QXZhaWxhYmxlID0gYXZhaWxhYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBsaWZlIGN5Y2xlIG9iamVjdC5cclxuICAgICAqIEByZXR1cm5zIHtMaWZlRXZlbnRbXX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBsaWZlQ3ljbGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpZmVDeWNsZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGxpZmVDeWNsZShldmVudHM6IExpZmVFdmVudFtdKSB7XHJcbiAgICAgICAgdGhpcy5fbGlmZUN5Y2xlID0gZXZlbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpZmUgZXZlbnQuXHJcbiAgICAgKiBAcGFyYW0gdmVyYlxyXG4gICAgICogQHBhcmFtIHN0YXJ0XHJcbiAgICAgKiBAcGFyYW0gZmluaXNoXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjcmVhdGVMaWZlRXZlbnQodmVyYjogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBmaW5pc2g6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMubGlmZUN5Y2xlLnB1c2gobmV3IExpZmVFdmVudCh2ZXJiLCBzdGFydCwgZmluaXNoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgYSBuZXcgX25hbWUuXHJcbiAgICAgKiBAcGFyYW0gbmFtZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0IG5hbWUobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIF9uYW1lLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBuYW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBJRC5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgaWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBfbmFtZSBwcm9wZXIuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IG5hbWVQcm9wZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgbmVzdC5cclxuICAgICAqIEBwYXJhbSBuZXN0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgbmVzdChuZXN0OiBOZXN0KSB7XHJcbiAgICAgICAgdGhpcy5fbmVzdCA9IG5lc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIG5lc3QuXHJcbiAgICAgKiBAcmV0dXJucyB7TmVzdH1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBuZXN0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9uZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB0dW5uZWwuXHJcbiAgICAgKiBAcGFyYW0gdHVubmVsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgdHVubmVsKHR1bm5lbDogVHVubmVsKSB7XHJcbiAgICAgICAgdGhpcy5fdHVubmVsID0gdHVubmVsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSB0dW5uZWwuXHJcbiAgICAgKiBAcmV0dXJucyB7VHVubmVsfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHR1bm5lbCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdHVubmVsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRnVuY3Rpb24gdG8gY2FsbCB0byBmYWlsIGEgam9iIHdoaWxlIGluIGEgdHVubmVsLlxyXG4gICAgICogQHBhcmFtIHJlYXNvblxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZmFpbChyZWFzb246IHN0cmluZykge1xyXG4gICAgICAgIGxldCBqID0gdGhpcztcclxuICAgICAgICBpZiAoIWoudHVubmVsKSB7XHJcbiAgICAgICAgICAgIGouZS5sb2coMywgYEpvYiBcIiR7ai5uYW1lfVwiIGZhaWxlZCBiZWZvcmUgdHVubmVsIHdhcyBzZXQuYCwgaik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghai5uZXN0KSB7XHJcbiAgICAgICAgICAgIGouZS5sb2coMywgYEpvYiBcIiR7ai5uYW1lfVwiIGRvZXMgbm90IGhhdmUgYSBuZXN0LmAsIGopO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgai50dW5uZWwuZXhlY3V0ZUZhaWwoaiwgai5uZXN0LCByZWFzb24pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhbnNmZXIgYSBqb2IgdG8gYW5vdGhlciB0dW5uZWwgZGlyZWN0bHkuXHJcbiAgICAgKiBAcGFyYW0gdHVubmVsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0cmFuc2Zlcih0dW5uZWw6IFR1bm5lbCkge1xyXG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xyXG4gICAgICAgIGxldCBvbGRUdW5uZWwgPSB0aGlzLnR1bm5lbDtcclxuXHJcbiAgICAgICAgbGV0IG9sZFR1bm5lbE5hbWUgPSBcIlwiO1xyXG4gICAgICAgIGlmIChvbGRUdW5uZWwpIHtcclxuICAgICAgICAgICAgb2xkVHVubmVsTmFtZSA9IG9sZFR1bm5lbC5uYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgam9iLnR1bm5lbCA9IHR1bm5lbDtcclxuICAgICAgICB0dW5uZWwuYXJyaXZlKGpvYiwgbnVsbCk7XHJcblxyXG4gICAgICAgIGpvYi5lLmxvZygxLCBgVHJhbnNmZXJyZWQgdG8gVHVubmVsIFwiJHt0dW5uZWwubmFtZX1cIi5gLCBqb2IsIFtvbGRUdW5uZWxdKTtcclxuICAgICAgICBqb2IuY3JlYXRlTGlmZUV2ZW50KFwidHJhbnNmZXJcIiwgb2xkVHVubmVsTmFtZSwgdHVubmVsLm5hbWUpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1vdmUgZnVuY3Rpb24gZXJyb3IuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBtb3ZlKGRlc3RpbmF0aW9uTmVzdCwgY2FsbGJhY2spIHtcclxuICAgICAgICB0aHJvdyBcIlRoaXMgdHlwZSBvZiBqb2IgY2Fubm90IGJlIG1vdmVkLlwiO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2VuZHMgYW4gZW1haWwuXHJcbiAgICAgKiBAcGFyYW0gZW1haWxPcHRpb25zICAgICAgRW1haWwgb3B0aW9uc1xyXG4gICAgICogIyMjIyBTZW5kaW5nIHB1ZyB0ZW1wbGF0ZSBlbWFpbCBleGFtcGxlXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogLy8gbXlfdHVubmVsLmpzXHJcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcclxuICAgICAqICAgICAgam9iLmVtYWlsKHtcclxuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCBmcm9tIHB1ZyB0ZW1wbGF0ZVwiLFxyXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxyXG4gICAgICogICAgICAgICAgdGVtcGxhdGU6IF9fZGlybmFtZSArIFwiLi90ZW1wbGF0ZV9maWxlcy9teV9lbWFpbC5wdWdcIlxyXG4gICAgICogICAgICB9KTtcclxuICAgICAqIH0pO1xyXG4gICAgICogYGBgXHJcbiAgICAgKlxyXG4gICAgICogYGBganNcclxuICAgICAqIC8vIHRlbXBsYXRlX2ZpbGVzL215X2VtYWlsLnB1Z1xyXG4gICAgICogaDE9XCJFeGFtcGxlIGVtYWlsIVwiXHJcbiAgICAgKiBwPVwiR290IGpvYiBJRCBcIiArIGpvYi5nZXRJZCgpXHJcbiAgICAgKiBgYGBcclxuICAgICAqICMjIyMgU2VuZGluZyBwbGFpbi10ZXh0IGVtYWlsXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XHJcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XHJcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgd2l0aCBoYXJkLWNvZGVkIHBsYWluLXRleHRcIixcclxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcclxuICAgICAqICAgICAgICAgIHRleHQ6IFwiTXkgZW1haWwgYm9keSFcIlxyXG4gICAgICogICAgICB9KTtcclxuICAgICAqIH0pO1xyXG4gICAgICogYGBgXHJcbiAgICAgKiAjIyMjIFNlbmRpbmcgaHRtbCBlbWFpbFxyXG4gICAgICogYGBganNcclxuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xyXG4gICAgICogICAgICBqb2IuZW1haWwoe1xyXG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIHdpdGggaGFyZC1jb2RlZCBodG1sXCIsXHJcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXHJcbiAgICAgKiAgICAgICAgICBodG1sOiBcIjxoMT5NeSBlbWFpbCBib2R5ITwvaDE+XCJcclxuICAgICAqICAgICAgfSk7XHJcbiAgICAgKiB9KTtcclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZW1haWwoZW1haWxPcHRpb25zOiBFbWFpbE9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgam9iID0gdGhpcztcclxuICAgICAgICBsZXQgZW1haWxlciA9IGpvYi5lLmVtYWlsZXI7XHJcblxyXG4gICAgICAgIGVtYWlsZXIuc2VuZE1haWwoZW1haWxPcHRpb25zLCBqb2IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoIGpvYiBzcGVjaWZpYyBkYXRhIHRvIHRoZSBqb2IgaW5zdGFuY2UuXHJcbiAgICAgKiAjIyMjIEV4YW1wbGVcclxuICAgICAqXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogam9iLnNldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIsIDEyMzQ1Nik7XHJcbiAgICAgKlxyXG4gICAgICogY29uc29sZS5sb2coam9iLmdldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIpKTtcclxuICAgICAqIC8vIDEyMzQ1NlxyXG4gICAgICogYGBgXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRQcm9wZXJ0eVZhbHVlKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHByb3AgPSBuZXcgSm9iUHJvcGVydHkoa2V5LCB2YWx1ZSk7XHJcblxyXG4gICAgICAgIGpvYi5fcHJvcGVydGllc1trZXldID0gcHJvcDtcclxuICAgICAgICBqb2IuZS5sb2coMSwgYFByb3BlcnR5IFwiJHtrZXl9XCIgYWRkZWQgdG8gam9iIHByb3BlcnRpZXMuYCwgam9iKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHByb3BlcnR5VmFsdWVzKHByb3BlcnRpZXM6IE9iamVjdCkge1xyXG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xyXG4gICAgICAgIGpvYi5fcHJvcGVydGllcyA9IHByb3BlcnRpZXM7XHJcbiAgICAgICAgam9iLmUubG9nKDAsIGBSZXN0b3JlZCAke09iamVjdC5rZXlzKGpvYi5fcHJvcGVydGllcykubGVuZ3RofSBwcm9wZXJ0aWVzLmAsIGpvYik7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBlbnRpcmUgam9iIHByb3BlcnR5IG9iamVjdC5cclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEByZXR1cm5zIHtKb2JQcm9wZXJ0eX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFByb3BlcnR5KGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXNba2V5XSBhcyBKb2JQcm9wZXJ0eTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHByb3BlcnRpZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaWYgaXQgaGFzIGJlZW4gcHJldmlvdXNseSBzZXQuXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcmV0dXJucyB7YW55fVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0UHJvcGVydHlWYWx1ZShrZXk6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xyXG4gICAgICAgIGlmIChqb2IuX3Byb3BlcnRpZXNba2V5XSkge1xyXG4gICAgICAgICAgICByZXR1cm4gam9iLl9wcm9wZXJ0aWVzW2tleV0udmFsdWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSB0eXBlIG9mIGEgcHJvcGVydHkuXHJcbiAgICAgKiAjIyMjIEV4YW1wbGVcclxuICAgICAqXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogam9iLnNldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIsIDEyMzQ1Nik7XHJcbiAgICAgKlxyXG4gICAgICogY29uc29sZS5sb2coam9iLmdldFByb3BlcnR5VHlwZShcIk15IEpvYiBOdW1iZXJcIikpO1xyXG4gICAgICogLy8gXCJudW1iZXJcIlxyXG4gICAgICogYGBgXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFByb3BlcnR5VHlwZShrZXk6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xyXG4gICAgICAgIGlmIChqb2IuX3Byb3BlcnRpZXNba2V5XSkge1xyXG4gICAgICAgICAgICByZXR1cm4gam9iLl9wcm9wZXJ0aWVzW2tleV0udHlwZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYWNrcyB0aGUgam9iIGluc3RhbmNlIGFuZCBmaWxlIHRvZ2V0aGVyIGluIGEgemlwLlxyXG4gICAgICogUmV0dXJucyBhIFBhY2tKb2IgaW4gdGhlIHBhcmFtZXRlciBvZiB0aGUgY2FsbGJhY2suXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqICMjIyMgRXhhbXBsZVxyXG4gICAgICogYGBganNcclxuICAgICAqIGpvYi5wYWNrKGZ1bmN0aW9uKHBhY2tKb2Ipe1xyXG4gICAgICogICAgICBwYWNrSm9iLm1vdmUocGFja2VkX2ZvbGRlcl9uZXN0KTtcclxuICAgICAqIH0pO1xyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBwYWNrKGNhbGxiYWNrOiAoam9iOiBQYWNrZWRKb2IpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgICAgICBsZXQgam9iID0gdGhpcztcclxuICAgICAgICBsZXQgUGFja2VkSm9iID0gcmVxdWlyZShcIi4vcGFja2VkSm9iXCIpLlBhY2tlZEpvYjtcclxuICAgICAgICBsZXQgcGogPSBuZXcgUGFja2VkSm9iKGpvYi5lLCBqb2IpO1xyXG4gICAgICAgIHBqLmV4ZWNQYWNrKCgpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2socGopO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5wYWNrcyBhIHBhY2tlZCBqb2IuIFJldHVybnMgYSB0aGUgb3JpZ2luYWwgdW5wYWNrZWQgam9iIGluIHRoZSBwYXJhbWV0ZXIgb2YgdGhlIGNhbGxiYWNrLlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXHJcbiAgICAgKiAjIyMjIEV4YW1wbGVcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiBwYWNrZWRKb2IudW5wYWNrKGZ1bmN0aW9uKHVucGFja2VkSm9iKXtcclxuICAgICAqICAgICBjb25zb2xlLmxvZyhcIlVucGFja2VkXCIsIHVucGFja2VkSm9iLm5hbWUpO1xyXG4gICAgICogICAgIHVucGFja2VkSm9iLm1vdmUodW5wYWNrZWRfZm9sZGVyKTtcclxuICAgICAqICAgICBwYWNrZWRKb2IucmVtb3ZlKCk7XHJcbiAgICAgKiB9KTtcclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdW5wYWNrKGNhbGxiYWNrOiAoam9iOiBKb2IpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgICAgICBsZXQgam9iID0gdGhpcztcclxuICAgICAgICBsZXQgUGFja2VkSm9iID0gcmVxdWlyZShcIi4vcGFja2VkSm9iXCIpLlBhY2tlZEpvYjtcclxuICAgICAgICBsZXQgcGogPSBuZXcgUGFja2VkSm9iKGpvYi5lLCBqb2IpO1xyXG4gICAgICAgIHBqLmV4ZWNVbnBhY2soKHVucGFja2VkSm9iKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKHVucGFja2VkSm9iKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgam9iIG9iamVjdCBhcyBKU09OIHdpdGggY2lyY3VsYXIgcmVmZXJlbmNlcyByZW1vdmVkLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEpTT04oKSB7XHJcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGpzb247XHJcbiAgICAgICAgbGV0IHJlcGxhY2VyID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAvLyBGaWx0ZXJpbmcgb3V0IHByb3BlcnRpZXNcclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gXCJuZXN0XCIgfHwga2V5ID09PSBcImVcIiB8fCBrZXkgPT09IFwidHVubmVsXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gXCJfbmVzdFwiIHx8IGtleSA9PT0gXCJfdHVubmVsXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGpzb24gPSBKU09OLnN0cmluZ2lmeShqb2IsIHJlcGxhY2VyKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgam9iLmUubG9nKDMsIGBnZXRKU09OIHN0cmluZ2lmeSBlcnJvcjogJHtlcnJ9YCwgam9iKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBqc29uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgcGF0aCgpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc0ZpbGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaXNGb2xkZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGZpbGVzKCkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEZpbGUoaW5kZXg6IGFueSkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBwYXRoKHBhdGg6IHN0cmluZykge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5hbWUobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIG1lc3NhZ2UgdG8gdGhlIGxvZyB3aXRoIHRoaXMgam9iIGFzIHRoZSBhY3Rvci5cclxuICAgICAqIEBwYXJhbSBsZXZlbCAgICAgICAgICAgICAwID0gZGVidWcsIDEgPSBpbmZvLCAyLCA9IHdhcm5pbmcsIDMgPSBlcnJvclxyXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgICAgICAgICAgIExvZyBtZXNzYWdlXHJcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbG9nKGxldmVsOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBqb2IuZS5sb2cobGV2ZWwsIG1lc3NhZ2UsIGpvYik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBzaXplICgpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgc2l6ZUJ5dGVzICgpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuLyoqXHJcbiAqIENvbXByZXNzZXMgdGhlIGpvYi5cclxuICogUmV0dXJucyBhIFBhY2tKb2IgaW4gdGhlIHBhcmFtZXRlciBvZiB0aGUgY2FsbGJhY2suXHJcbiAqIEBwYXJhbSBjYWxsYmFja1xyXG4gKiAjIyMjIEV4YW1wbGVcclxuICogYGBganNcclxuICogam9iLmNvbXByZXNzKGZ1bmN0aW9uKGZpbGVKb2Ipe1xyXG4gKiAgICAgIGZpbGVKb2IubW92ZShwYWNrZWRfZm9sZGVyX25lc3QpO1xyXG4gKiB9KTtcclxuICogYGBgXHJcbiAqL1xyXG4gICAgcHVibGljIGNvbXByZXNzKGNhbGxiYWNrOiAoam9iOiBGaWxlSm9iKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XHJcbiAgICAgICAgLy8gU2F2ZSBvdXQgemlwXHJcbiAgICAgICAgbGV0IHppcCA9IG5ldyBKU1ppcCgpO1xyXG4gICAgICAgIGxldCB0bXBvYmogPSB0bXAuZGlyU3luYygpO1xyXG4gICAgICAgIGxldCBkaXIgPSB0bXBvYmoubmFtZTtcclxuICAgICAgICBsZXQgZmlsZV9uYW1lID0gam9iLm5hbWUgKyBcIi56aXBcIjtcclxuICAgICAgICBsZXQgZmlsZV9wYXRoID0gZGlyICsgcGF0aC5zZXAgKyBmaWxlX25hbWU7XHJcbiAgICAgICAgemlwXHJcbiAgICAgICAgICAgIC5nZW5lcmF0ZU5vZGVTdHJlYW0oe3R5cGU6IFwibm9kZWJ1ZmZlclwiLCBzdHJlYW1GaWxlczogdHJ1ZX0pXHJcbiAgICAgICAgICAgIC5waXBlKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGZpbGVfcGF0aCkpXHJcbiAgICAgICAgICAgIC5vbihcImZpbmlzaFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBKU1ppcCBnZW5lcmF0ZXMgYSByZWFkYWJsZSBzdHJlYW0gd2l0aCBhIFwiZW5kXCIgZXZlbnQsXHJcbiAgICAgICAgICAgICAgICAvLyBidXQgaXMgcGlwZWQgaGVyZSBpbiBhIHdyaXRhYmxlIHN0cmVhbSB3aGljaCBlbWl0cyBhIFwiX2ZpbmlzaFwiIGV2ZW50LlxyXG4gICAgICAgICAgICAgICAgbGV0IGZpbGVKb2IgPSBuZXcgRmlsZUpvYihqb2IuZSwgZmlsZV9wYXRoKVxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZmlsZUpvYik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSJdfQ==
