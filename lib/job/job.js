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
        var buildZip = function (zip, done) {
            // Save out zip
            var tmpobj = tmp.dirSync();
            var dir = tmpobj.name;
            var file_name = job.nameProper + ".zip";
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
        if (job.isFile()) {
            fs.readFile(job.path, function (err, data) {
                if (err)
                    throw err;
                zip.file(job.name, data);
                buildZip(zip, function (done) { });
            });
        }
        else if (job.isFolder()) {
            job.files.forEach(function (file) {
                fs.readFile(file.path, function (err, data) {
                    if (err)
                        throw err;
                    zip.file(file.name, data);
                    buildZip(zip, function (done) { });
                });
            });
        }
        else {
            buildZip(zip, function (done) {
                done();
            });
        }
    };
    return Job;
}());
exports.Job = Job;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2Ivam9iLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esc0RBQW1EO0FBRW5ELDZDQUEwQztBQUUxQyxxQ0FBa0M7QUFHbEMseUZBQXlGO0FBQ3pGLGlEQUFpRDtBQUNqRCxrREFBa0Q7QUFFbEQsSUFBUSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUM1QixDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUNyQixHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUNwQixFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUNsQixJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUN0QixLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRWpDO0lBWUk7Ozs7T0FJRztJQUNILGFBQVksQ0FBYyxFQUFFLElBQVk7UUFDcEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDUixDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQixDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNmLENBQUMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO1FBRWpCLENBQUMsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsZUFBWSxJQUFJLHdCQUFrQixDQUFDLENBQUMsRUFBRSxNQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBR0Qsc0JBQVcscUJBQUk7YUFBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBRUQ7OztPQUdHO0lBQ0ksc0JBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQU1ELHNCQUFXLG1DQUFrQjtRQUo3Qjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDbEMsQ0FBQzs7O09BQUE7SUFNRCxzQkFBVyxpQ0FBZ0I7UUFKM0I7OztXQUdHO2FBQ0gsVUFBNEIsU0FBa0I7WUFDMUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztRQUN2QyxDQUFDOzs7T0FBQTtJQU1ELHNCQUFXLDBCQUFTO1FBSnBCOzs7V0FHRzthQUNIO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDM0IsQ0FBQzthQUVELFVBQXFCLE1BQW1CO1lBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQzdCLENBQUM7OztPQUpBO0lBTUQ7Ozs7O09BS0c7SUFDTyw2QkFBZSxHQUF6QixVQUEwQixJQUFZLEVBQUUsS0FBYSxFQUFFLE1BQWM7UUFDakUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBTUQsc0JBQVcscUJBQUk7UUFJZjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7UUFkRDs7O1dBR0c7YUFDSCxVQUFnQixJQUFZO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBY0Qsc0JBQVcsbUJBQUU7UUFKYjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3BCLENBQUM7OztPQUFBO0lBTUQsc0JBQVcsMkJBQVU7UUFKckI7OztXQUdHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixDQUFDOzs7T0FBQTtJQU1ELHNCQUFXLHFCQUFJO1FBSWY7OztXQUdHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO1FBZEQ7OztXQUdHO2FBQ0gsVUFBZ0IsSUFBVTtZQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQWNELHNCQUFXLHVCQUFNO1FBSWpCOzs7V0FHRzthQUNIO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQWREOzs7V0FHRzthQUNILFVBQWtCLE1BQWM7WUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDMUIsQ0FBQzs7O09BQUE7SUFVRDs7O09BR0c7SUFDSSxrQkFBSSxHQUFYLFVBQVksTUFBYztRQUN0QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDYixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ1osQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVEsQ0FBQyxDQUFDLElBQUkscUNBQWlDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBUSxDQUFDLENBQUMsSUFBSSw2QkFBeUIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRUQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLHNCQUFRLEdBQWYsVUFBZ0IsTUFBYztRQUMxQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDZixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRTVCLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN2QixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ1osYUFBYSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDbkMsQ0FBQztRQUVELEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXpCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSw2QkFBMEIsTUFBTSxDQUFDLElBQUksUUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDMUUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBR0Q7O09BRUc7SUFDSSxrQkFBSSxHQUFYLFVBQVksZUFBZSxFQUFFLFFBQVE7UUFDakMsTUFBTSxtQ0FBbUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F3Q0c7SUFDSSxtQkFBSyxHQUFaLFVBQWEsWUFBMEI7UUFDbkMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ2YsSUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFFNUIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7O09BYUc7SUFDSSw4QkFBZ0IsR0FBdkIsVUFBd0IsR0FBVyxFQUFFLEtBQVU7UUFDM0MsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ2YsSUFBSSxJQUFJLEdBQUcsSUFBSSx5QkFBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV2QyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsZ0JBQWEsR0FBRyxnQ0FBNEIsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsc0JBQVcsK0JBQWM7YUFBekIsVUFBMEIsVUFBa0I7WUFDeEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ2YsR0FBRyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7WUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGNBQVksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxpQkFBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7OztPQUFBO0lBR0Q7Ozs7T0FJRztJQUNJLHlCQUFXLEdBQWxCLFVBQW1CLEdBQVc7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFnQixDQUFDO0lBQ2hELENBQUM7SUFFRCxzQkFBVywyQkFBVTthQUFyQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzVCLENBQUM7OztPQUFBO0lBRUQ7Ozs7T0FJRztJQUNJLDhCQUFnQixHQUF2QixVQUF3QixHQUFXO1FBQy9CLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztRQUNmLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN0QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7T0FhRztJQUNJLDZCQUFlLEdBQXRCLFVBQXVCLEdBQVc7UUFDOUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ2YsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3JDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0ksa0JBQUksR0FBWCxVQUFZLFFBQWtDO1FBQzFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztRQUNmLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDakQsSUFBSSxFQUFFLEdBQUcsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ1IsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7Ozs7Ozs7OztPQVdHO0lBQ0ksb0JBQU0sR0FBYixVQUFjLFFBQTRCO1FBQ3RDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztRQUNmLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDakQsSUFBSSxFQUFFLEdBQUcsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQUMsV0FBVztZQUN0QixRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0kscUJBQU8sR0FBZDtRQUNJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztRQUNmLElBQUksSUFBSSxDQUFDO1FBQ1QsSUFBSSxRQUFRLEdBQUcsVUFBUyxHQUFHLEVBQUUsS0FBSztZQUM5QiwyQkFBMkI7WUFDM0IsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLE1BQU0sSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ3JCLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssT0FBTyxJQUFJLEdBQUcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ3JCLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQztZQUNELElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSw4QkFBNEIsR0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxzQkFBVyxxQkFBSTthQUFmO1lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNyQixDQUFDO2FBa0JELFVBQWdCLElBQVk7UUFDNUIsQ0FBQzs7O09BbkJBO0lBRU0sb0JBQU0sR0FBYjtRQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVNLHNCQUFRLEdBQWY7UUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxzQkFBVyxzQkFBSzthQUFoQjtZQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFFTSxxQkFBTyxHQUFkLFVBQWUsS0FBVTtRQUNyQixNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFLTSxvQkFBTSxHQUFiLFVBQWMsSUFBWTtRQUN0QixNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLGlCQUFHLEdBQVYsVUFBVyxLQUFhLEVBQUUsT0FBZTtRQUNyQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDZixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsc0JBQVcscUJBQUk7YUFBZjtZQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVywwQkFBUzthQUFwQjtZQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFFTDs7Ozs7Ozs7OztPQVVHO0lBQ1Esc0JBQVEsR0FBZixVQUFnQixRQUFnQztRQUM1QyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDZixlQUFlO1FBQ2YsSUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUV0QixJQUFJLFFBQVEsR0FBRyxVQUFDLEdBQVEsRUFBRSxJQUFJO1lBQzFCLGVBQWU7WUFDZixJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0IsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztZQUN0QixJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztZQUN4QyxJQUFJLFNBQVMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUM7WUFDM0MsR0FBRztpQkFDRSxrQkFBa0IsQ0FBQyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBQyxDQUFDO2lCQUMzRCxJQUFJLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUNyQyxFQUFFLENBQUMsUUFBUSxFQUFFO2dCQUNWLHdEQUF3RDtnQkFDeEQsd0VBQXdFO2dCQUN4RSxJQUFJLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDNUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDO1FBRUYsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNmLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFDLEdBQUcsRUFBRSxJQUFJO2dCQUM1QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDekIsUUFBUSxDQUFDLEdBQUcsRUFBRSxVQUFDLElBQUksSUFBTSxDQUFDLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7Z0JBQ2xCLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFTLEdBQUcsRUFBRSxJQUFJO29CQUNyQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7d0JBQUMsTUFBTSxHQUFHLENBQUM7b0JBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDMUIsUUFBUSxDQUFDLEdBQUcsRUFBRSxVQUFDLElBQUksSUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDaEMsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLFFBQVEsQ0FBQyxHQUFHLEVBQUUsVUFBQyxJQUFJO2dCQUNmLElBQUksRUFBRSxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0lBR0wsQ0FBQztJQUVMLFVBQUM7QUFBRCxDQXRlQSxBQXNlQyxJQUFBO0FBdGVxQixrQkFBRyIsImZpbGUiOiJsaWIvam9iL2pvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFR1bm5lbCB9IGZyb20gXCIuLi90dW5uZWwvdHVubmVsXCI7XHJcbmltcG9ydCB7IE5lc3QgfSBmcm9tIFwiLi4vbmVzdC9uZXN0XCI7XHJcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xyXG5pbXBvcnQge0xpZmVFdmVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2xpZmVFdmVudFwiO1xyXG5pbXBvcnQge0VtYWlsT3B0aW9uc30gZnJvbSBcIi4uL2Vudmlyb25tZW50L2VtYWlsT3B0aW9uc1wiO1xyXG5pbXBvcnQge0pvYlByb3BlcnR5fSBmcm9tIFwiLi9qb2JQcm9wZXJ0eVwiO1xyXG5pbXBvcnQge1BhY2tlZEpvYn0gZnJvbSBcIi4vcGFja2VkSm9iXCI7XHJcbmltcG9ydCB7RmlsZUpvYn0gZnJvbSBcIi4vZmlsZUpvYlwiO1xyXG5cclxuXHJcbi8vIEhhbmRsZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeSBieSBzdGFzaGluZyB0aGUgdHlwZSBpbiBhIHZhcmlhYmxlIGZvciByZXF1aXJpbmcgbGF0ZXIuXHJcbi8vIGltcG9ydCAqIGFzIFBhY2tlZEpvYlR5cGVzIGZyb20gXCIuL3BhY2tlZEpvYlwiO1xyXG4vLyBsZXQgUGFja2VkSm9iOiB0eXBlb2YgUGFja2VkSm9iVHlwZXMuUGFja2VkSm9iO1xyXG5cclxuY29uc3QgICBzaG9ydGlkID0gcmVxdWlyZShcInNob3J0aWRcIiksXHJcbiAgICAgICAgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIiksXHJcbiAgICAgICAgdG1wID0gcmVxdWlyZShcInRtcFwiKSxcclxuICAgICAgICBmcyA9IHJlcXVpcmUoXCJmc1wiKSxcclxuICAgICAgICBwYXRoID0gcmVxdWlyZShcInBhdGhcIiksXHJcbiAgICAgICAgSlNaaXAgPSByZXF1aXJlKFwianN6aXBcIik7XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSm9iIHtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX25hbWU6IHN0cmluZztcclxuICAgIHByb3RlY3RlZCBfdHVubmVsOiBUdW5uZWw7XHJcbiAgICBwcm90ZWN0ZWQgX25lc3Q6IE5lc3Q7XHJcbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgX2xvY2FsbHlBdmFpbGFibGU6IGJvb2xlYW47XHJcbiAgICBwcm90ZWN0ZWQgX2xpZmVDeWNsZTogTGlmZUV2ZW50W107XHJcbiAgICBwcm90ZWN0ZWQgX2lkOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgX3Byb3BlcnRpZXM7XHJcbiAgICBwcm90ZWN0ZWQgX3R5cGU6IHN0cmluZztcclxuXHJcbiAgICAvKipcclxuICAgICAqIEpvYiBjb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIGVcclxuICAgICAqIEBwYXJhbSBuYW1lXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgaiA9IHRoaXM7XHJcbiAgICAgICAgai5lID0gZTtcclxuICAgICAgICBqLl9pZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcclxuICAgICAgICBqLl9uYW1lID0gbmFtZTtcclxuICAgICAgICBqLl9saWZlQ3ljbGUgPSBbXTtcclxuICAgICAgICBqLl9wcm9wZXJ0aWVzID0ge307XHJcbiAgICAgICAgai5fdHlwZSA9IFwiYmFzZVwiO1xyXG5cclxuICAgICAgICBqLmNyZWF0ZUxpZmVFdmVudChcImNyZWF0ZWRcIiwgbnVsbCwgbmFtZSk7XHJcbiAgICAgICAgai5lLmxvZygxLCBgTmV3IEpvYiBcIiR7bmFtZX1cIiBjcmVhdGVkLCBpZDogJHtqLmlkfS5gLCBqLCBbai5uZXN0LCBqLnR1bm5lbF0pO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGFzcyBfbmFtZSBmb3IgbG9nZ2luZy5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICByZXR1cm4gXCJKb2JcIjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIGpvYiBpcyBsb2NhbGx5IGF2YWlsYWJsZS5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGlzTG9jYWxseUF2YWlsYWJsZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbG9jYWxseUF2YWlsYWJsZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBpZiB0aGUgam9iIGlzIGxvY2FsbHkgYXZhaWxhYmxlLlxyXG4gICAgICogQHBhcmFtIGF2YWlsYWJsZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0IGxvY2FsbHlBdmFpbGFibGUoYXZhaWxhYmxlOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fbG9jYWxseUF2YWlsYWJsZSA9IGF2YWlsYWJsZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgbGlmZSBjeWNsZSBvYmplY3QuXHJcbiAgICAgKiBAcmV0dXJucyB7TGlmZUV2ZW50W119XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgbGlmZUN5Y2xlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9saWZlQ3ljbGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBsaWZlQ3ljbGUoZXZlbnRzOiBMaWZlRXZlbnRbXSkge1xyXG4gICAgICAgIHRoaXMuX2xpZmVDeWNsZSA9IGV2ZW50cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIG5ldyBsaWZlIGV2ZW50LlxyXG4gICAgICogQHBhcmFtIHZlcmJcclxuICAgICAqIEBwYXJhbSBzdGFydFxyXG4gICAgICogQHBhcmFtIGZpbmlzaFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlTGlmZUV2ZW50KHZlcmI6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZmluaXNoOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmxpZmVDeWNsZS5wdXNoKG5ldyBMaWZlRXZlbnQodmVyYiwgc3RhcnQsIGZpbmlzaCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGEgbmV3IF9uYW1lLlxyXG4gICAgICogQHBhcmFtIG5hbWVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBfbmFtZS5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgbmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgSUQuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGlkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgX25hbWUgcHJvcGVyLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBuYW1lUHJvcGVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIG5lc3QuXHJcbiAgICAgKiBAcGFyYW0gbmVzdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0IG5lc3QobmVzdDogTmVzdCkge1xyXG4gICAgICAgIHRoaXMuX25lc3QgPSBuZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBuZXN0LlxyXG4gICAgICogQHJldHVybnMge05lc3R9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgbmVzdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbmVzdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdHVubmVsLlxyXG4gICAgICogQHBhcmFtIHR1bm5lbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0IHR1bm5lbCh0dW5uZWw6IFR1bm5lbCkge1xyXG4gICAgICAgIHRoaXMuX3R1bm5lbCA9IHR1bm5lbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgdHVubmVsLlxyXG4gICAgICogQHJldHVybnMge1R1bm5lbH1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCB0dW5uZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R1bm5lbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZ1bmN0aW9uIHRvIGNhbGwgdG8gZmFpbCBhIGpvYiB3aGlsZSBpbiBhIHR1bm5lbC5cclxuICAgICAqIEBwYXJhbSByZWFzb25cclxuICAgICAqL1xyXG4gICAgcHVibGljIGZhaWwocmVhc29uOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgaiA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCFqLnR1bm5lbCkge1xyXG4gICAgICAgICAgICBqLmUubG9nKDMsIGBKb2IgXCIke2oubmFtZX1cIiBmYWlsZWQgYmVmb3JlIHR1bm5lbCB3YXMgc2V0LmAsIGopO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWoubmVzdCkge1xyXG4gICAgICAgICAgICBqLmUubG9nKDMsIGBKb2IgXCIke2oubmFtZX1cIiBkb2VzIG5vdCBoYXZlIGEgbmVzdC5gLCBqKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGoudHVubmVsLmV4ZWN1dGVGYWlsKGosIGoubmVzdCwgcmVhc29uKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYW5zZmVyIGEgam9iIHRvIGFub3RoZXIgdHVubmVsIGRpcmVjdGx5LlxyXG4gICAgICogQHBhcmFtIHR1bm5lbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdHJhbnNmZXIodHVubmVsOiBUdW5uZWwpIHtcclxuICAgICAgICBsZXQgam9iID0gdGhpcztcclxuICAgICAgICBsZXQgb2xkVHVubmVsID0gdGhpcy50dW5uZWw7XHJcblxyXG4gICAgICAgIGxldCBvbGRUdW5uZWxOYW1lID0gXCJcIjtcclxuICAgICAgICBpZiAob2xkVHVubmVsKSB7XHJcbiAgICAgICAgICAgIG9sZFR1bm5lbE5hbWUgPSBvbGRUdW5uZWwubmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGpvYi50dW5uZWwgPSB0dW5uZWw7XHJcbiAgICAgICAgdHVubmVsLmFycml2ZShqb2IsIG51bGwpO1xyXG5cclxuICAgICAgICBqb2IuZS5sb2coMSwgYFRyYW5zZmVycmVkIHRvIFR1bm5lbCBcIiR7dHVubmVsLm5hbWV9XCIuYCwgam9iLCBbb2xkVHVubmVsXSk7XHJcbiAgICAgICAgam9iLmNyZWF0ZUxpZmVFdmVudChcInRyYW5zZmVyXCIsIG9sZFR1bm5lbE5hbWUsIHR1bm5lbC5uYW1lKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNb3ZlIGZ1bmN0aW9uIGVycm9yLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbW92ZShkZXN0aW5hdGlvbk5lc3QsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdGhyb3cgXCJUaGlzIHR5cGUgb2Ygam9iIGNhbm5vdCBiZSBtb3ZlZC5cIjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNlbmRzIGFuIGVtYWlsLlxyXG4gICAgICogQHBhcmFtIGVtYWlsT3B0aW9ucyAgICAgIEVtYWlsIG9wdGlvbnNcclxuICAgICAqICMjIyMgU2VuZGluZyBwdWcgdGVtcGxhdGUgZW1haWwgZXhhbXBsZVxyXG4gICAgICogYGBganNcclxuICAgICAqIC8vIG15X3R1bm5lbC5qc1xyXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XHJcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XHJcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgZnJvbSBwdWcgdGVtcGxhdGVcIixcclxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcclxuICAgICAqICAgICAgICAgIHRlbXBsYXRlOiBfX2Rpcm5hbWUgKyBcIi4vdGVtcGxhdGVfZmlsZXMvbXlfZW1haWwucHVnXCJcclxuICAgICAqICAgICAgfSk7XHJcbiAgICAgKiB9KTtcclxuICAgICAqIGBgYFxyXG4gICAgICpcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiAvLyB0ZW1wbGF0ZV9maWxlcy9teV9lbWFpbC5wdWdcclxuICAgICAqIGgxPVwiRXhhbXBsZSBlbWFpbCFcIlxyXG4gICAgICogcD1cIkdvdCBqb2IgSUQgXCIgKyBqb2IuZ2V0SWQoKVxyXG4gICAgICogYGBgXHJcbiAgICAgKiAjIyMjIFNlbmRpbmcgcGxhaW4tdGV4dCBlbWFpbFxyXG4gICAgICogYGBganNcclxuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xyXG4gICAgICogICAgICBqb2IuZW1haWwoe1xyXG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIHdpdGggaGFyZC1jb2RlZCBwbGFpbi10ZXh0XCIsXHJcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXHJcbiAgICAgKiAgICAgICAgICB0ZXh0OiBcIk15IGVtYWlsIGJvZHkhXCJcclxuICAgICAqICAgICAgfSk7XHJcbiAgICAgKiB9KTtcclxuICAgICAqIGBgYFxyXG4gICAgICogIyMjIyBTZW5kaW5nIGh0bWwgZW1haWxcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcclxuICAgICAqICAgICAgam9iLmVtYWlsKHtcclxuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCB3aXRoIGhhcmQtY29kZWQgaHRtbFwiLFxyXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxyXG4gICAgICogICAgICAgICAgaHRtbDogXCI8aDE+TXkgZW1haWwgYm9keSE8L2gxPlwiXHJcbiAgICAgKiAgICAgIH0pO1xyXG4gICAgICogfSk7XHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGVtYWlsKGVtYWlsT3B0aW9uczogRW1haWxPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGVtYWlsZXIgPSBqb2IuZS5lbWFpbGVyO1xyXG5cclxuICAgICAgICBlbWFpbGVyLnNlbmRNYWlsKGVtYWlsT3B0aW9ucywgam9iKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaCBqb2Igc3BlY2lmaWMgZGF0YSB0byB0aGUgam9iIGluc3RhbmNlLlxyXG4gICAgICogIyMjIyBFeGFtcGxlXHJcbiAgICAgKlxyXG4gICAgICogYGBganNcclxuICAgICAqIGpvYi5zZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiLCAxMjM0NTYpO1xyXG4gICAgICpcclxuICAgICAqIGNvbnNvbGUubG9nKGpvYi5nZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiKSk7XHJcbiAgICAgKiAvLyAxMjM0NTZcclxuICAgICAqIGBgYFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0UHJvcGVydHlWYWx1ZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xyXG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xyXG4gICAgICAgIGxldCBwcm9wID0gbmV3IEpvYlByb3BlcnR5KGtleSwgdmFsdWUpO1xyXG5cclxuICAgICAgICBqb2IuX3Byb3BlcnRpZXNba2V5XSA9IHByb3A7XHJcbiAgICAgICAgam9iLmUubG9nKDEsIGBQcm9wZXJ0eSBcIiR7a2V5fVwiIGFkZGVkIHRvIGpvYiBwcm9wZXJ0aWVzLmAsIGpvYik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBwcm9wZXJ0eVZhbHVlcyhwcm9wZXJ0aWVzOiBPYmplY3QpIHtcclxuICAgICAgICBsZXQgam9iID0gdGhpcztcclxuICAgICAgICBqb2IuX3Byb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xyXG4gICAgICAgIGpvYi5lLmxvZygwLCBgUmVzdG9yZWQgJHtPYmplY3Qua2V5cyhqb2IuX3Byb3BlcnRpZXMpLmxlbmd0aH0gcHJvcGVydGllcy5gLCBqb2IpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgZW50aXJlIGpvYiBwcm9wZXJ0eSBvYmplY3QuXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcmV0dXJucyB7Sm9iUHJvcGVydHl9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eShrZXk6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzW2tleV0gYXMgSm9iUHJvcGVydHk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBwcm9wZXJ0aWVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGlmIGl0IGhhcyBiZWVuIHByZXZpb3VzbHkgc2V0LlxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHJldHVybnMge2FueX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFByb3BlcnR5VmFsdWUoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgam9iID0gdGhpcztcclxuICAgICAgICBpZiAoam9iLl9wcm9wZXJ0aWVzW2tleV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGpvYi5fcHJvcGVydGllc1trZXldLnZhbHVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgdHlwZSBvZiBhIHByb3BlcnR5LlxyXG4gICAgICogIyMjIyBFeGFtcGxlXHJcbiAgICAgKlxyXG4gICAgICogYGBganNcclxuICAgICAqIGpvYi5zZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiLCAxMjM0NTYpO1xyXG4gICAgICpcclxuICAgICAqIGNvbnNvbGUubG9nKGpvYi5nZXRQcm9wZXJ0eVR5cGUoXCJNeSBKb2IgTnVtYmVyXCIpKTtcclxuICAgICAqIC8vIFwibnVtYmVyXCJcclxuICAgICAqIGBgYFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eVR5cGUoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgam9iID0gdGhpcztcclxuICAgICAgICBpZiAoam9iLl9wcm9wZXJ0aWVzW2tleV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGpvYi5fcHJvcGVydGllc1trZXldLnR5cGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFja3MgdGhlIGpvYiBpbnN0YW5jZSBhbmQgZmlsZSB0b2dldGhlciBpbiBhIHppcC5cclxuICAgICAqIFJldHVybnMgYSBQYWNrSm9iIGluIHRoZSBwYXJhbWV0ZXIgb2YgdGhlIGNhbGxiYWNrLlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXHJcbiAgICAgKiAjIyMjIEV4YW1wbGVcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiBqb2IucGFjayhmdW5jdGlvbihwYWNrSm9iKXtcclxuICAgICAqICAgICAgcGFja0pvYi5tb3ZlKHBhY2tlZF9mb2xkZXJfbmVzdCk7XHJcbiAgICAgKiB9KTtcclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcGFjayhjYWxsYmFjazogKGpvYjogUGFja2VkSm9iKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IFBhY2tlZEpvYiA9IHJlcXVpcmUoXCIuL3BhY2tlZEpvYlwiKS5QYWNrZWRKb2I7XHJcbiAgICAgICAgbGV0IHBqID0gbmV3IFBhY2tlZEpvYihqb2IuZSwgam9iKTtcclxuICAgICAgICBwai5leGVjUGFjaygoKSA9PiB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKHBqKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVucGFja3MgYSBwYWNrZWQgam9iLiBSZXR1cm5zIGEgdGhlIG9yaWdpbmFsIHVucGFja2VkIGpvYiBpbiB0aGUgcGFyYW1ldGVyIG9mIHRoZSBjYWxsYmFjay5cclxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICogIyMjIyBFeGFtcGxlXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogcGFja2VkSm9iLnVucGFjayhmdW5jdGlvbih1bnBhY2tlZEpvYil7XHJcbiAgICAgKiAgICAgY29uc29sZS5sb2coXCJVbnBhY2tlZFwiLCB1bnBhY2tlZEpvYi5uYW1lKTtcclxuICAgICAqICAgICB1bnBhY2tlZEpvYi5tb3ZlKHVucGFja2VkX2ZvbGRlcik7XHJcbiAgICAgKiAgICAgcGFja2VkSm9iLnJlbW92ZSgpO1xyXG4gICAgICogfSk7XHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHVucGFjayhjYWxsYmFjazogKGpvYjogSm9iKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IFBhY2tlZEpvYiA9IHJlcXVpcmUoXCIuL3BhY2tlZEpvYlwiKS5QYWNrZWRKb2I7XHJcbiAgICAgICAgbGV0IHBqID0gbmV3IFBhY2tlZEpvYihqb2IuZSwgam9iKTtcclxuICAgICAgICBwai5leGVjVW5wYWNrKCh1bnBhY2tlZEpvYikgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayh1bnBhY2tlZEpvYik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIGpvYiBvYmplY3QgYXMgSlNPTiB3aXRoIGNpcmN1bGFyIHJlZmVyZW5jZXMgcmVtb3ZlZC5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRKU09OKCkge1xyXG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xyXG4gICAgICAgIGxldCBqc29uO1xyXG4gICAgICAgIGxldCByZXBsYWNlciA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgLy8gRmlsdGVyaW5nIG91dCBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwibmVzdFwiIHx8IGtleSA9PT0gXCJlXCIgfHwga2V5ID09PSBcInR1bm5lbFwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwiX25lc3RcIiB8fCBrZXkgPT09IFwiX3R1bm5lbFwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBqc29uID0gSlNPTi5zdHJpbmdpZnkoam9iLCByZXBsYWNlcik7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIGpvYi5lLmxvZygzLCBgZ2V0SlNPTiBzdHJpbmdpZnkgZXJyb3I6ICR7ZXJyfWAsIGpvYik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ganNvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHBhdGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaXNGaWxlKCkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlzRm9sZGVyKCkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBmaWxlcygpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRGaWxlKGluZGV4OiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgcGF0aChwYXRoOiBzdHJpbmcpIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBtZXNzYWdlIHRvIHRoZSBsb2cgd2l0aCB0aGlzIGpvYiBhcyB0aGUgYWN0b3IuXHJcbiAgICAgKiBAcGFyYW0gbGV2ZWwgICAgICAgICAgICAgMCA9IGRlYnVnLCAxID0gaW5mbywgMiwgPSB3YXJuaW5nLCAzID0gZXJyb3JcclxuICAgICAqIEBwYXJhbSBtZXNzYWdlICAgICAgICAgICBMb2cgbWVzc2FnZVxyXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGxvZyhsZXZlbDogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgam9iID0gdGhpcztcclxuICAgICAgICByZXR1cm4gam9iLmUubG9nKGxldmVsLCBtZXNzYWdlLCBqb2IpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgc2l6ZSAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHNpemVCeXRlcyAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbi8qKlxyXG4gKiBDb21wcmVzc2VzIHRoZSBqb2IuXHJcbiAqIFJldHVybnMgYSBQYWNrSm9iIGluIHRoZSBwYXJhbWV0ZXIgb2YgdGhlIGNhbGxiYWNrLlxyXG4gKiBAcGFyYW0gY2FsbGJhY2tcclxuICogIyMjIyBFeGFtcGxlXHJcbiAqIGBgYGpzXHJcbiAqIGpvYi5jb21wcmVzcyhmdW5jdGlvbihmaWxlSm9iKXtcclxuICogICAgICBmaWxlSm9iLm1vdmUocGFja2VkX2ZvbGRlcl9uZXN0KTtcclxuICogfSk7XHJcbiAqIGBgYFxyXG4gKi9cclxuICAgIHB1YmxpYyBjb21wcmVzcyhjYWxsYmFjazogKGpvYjogRmlsZUpvYikgPT4gdm9pZCkge1xyXG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xyXG4gICAgICAgIC8vIFNhdmUgb3V0IHppcFxyXG4gICAgICAgIGxldCB6aXAgPSBuZXcgSlNaaXAoKTtcclxuXHJcbiAgICAgICAgbGV0IGJ1aWxkWmlwID0gKHppcDogYW55LCBkb25lKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFNhdmUgb3V0IHppcFxyXG4gICAgICAgICAgICBsZXQgdG1wb2JqID0gdG1wLmRpclN5bmMoKTtcclxuICAgICAgICAgICAgbGV0IGRpciA9IHRtcG9iai5uYW1lO1xyXG4gICAgICAgICAgICBsZXQgZmlsZV9uYW1lID0gam9iLm5hbWVQcm9wZXIgKyBcIi56aXBcIjtcclxuICAgICAgICAgICAgbGV0IGZpbGVfcGF0aCA9IGRpciArIHBhdGguc2VwICsgZmlsZV9uYW1lO1xyXG4gICAgICAgICAgICB6aXBcclxuICAgICAgICAgICAgICAgIC5nZW5lcmF0ZU5vZGVTdHJlYW0oe3R5cGU6IFwibm9kZWJ1ZmZlclwiLCBzdHJlYW1GaWxlczogdHJ1ZX0pXHJcbiAgICAgICAgICAgICAgICAucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbShmaWxlX3BhdGgpKVxyXG4gICAgICAgICAgICAgICAgLm9uKFwiZmluaXNoXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBKU1ppcCBnZW5lcmF0ZXMgYSByZWFkYWJsZSBzdHJlYW0gd2l0aCBhIFwiZW5kXCIgZXZlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYnV0IGlzIHBpcGVkIGhlcmUgaW4gYSB3cml0YWJsZSBzdHJlYW0gd2hpY2ggZW1pdHMgYSBcIl9maW5pc2hcIiBldmVudC5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgZmlsZUpvYiA9IG5ldyBGaWxlSm9iKGpvYi5lLCBmaWxlX3BhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGZpbGVKb2IpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKGpvYi5pc0ZpbGUoKSkge1xyXG4gICAgICAgICAgICBmcy5yZWFkRmlsZShqb2IucGF0aCwgKGVyciwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikgdGhyb3cgZXJyO1xyXG4gICAgICAgICAgICAgICAgemlwLmZpbGUoam9iLm5hbWUsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgYnVpbGRaaXAoemlwLCAoZG9uZSkgPT4ge30pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGpvYi5pc0ZvbGRlcigpKSB7XHJcbiAgICAgICAgICAgIGpvYi5maWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgZnMucmVhZEZpbGUoZmlsZS5wYXRoLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICAgICAgemlwLmZpbGUoZmlsZS5uYW1lLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBidWlsZFppcCh6aXAsIChkb25lKSA9PiB7fSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYnVpbGRaaXAoemlwLCAoZG9uZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgfVxyXG5cclxufSJdfQ==
