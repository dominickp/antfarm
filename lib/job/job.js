"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lifeEvent_1 = require("../environment/lifeEvent");
var jobProperty_1 = require("./jobProperty");
var fileJob_1 = require("./fileJob");
// Handle the circular dependency by stashing the type in a variable for requiring later.
// import * as PackedJobTypes from "./packedJob";
// let PackedJob: typeof PackedJobTypes.PackedJob;
var shortid = require("shortid"), _ = require("lodash"), tmp = require("tmp"), fs = require("fs"), path = require("path"), JSZip = require("jszip"), async = require("async");
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
        var file_name = job.nameProper + ".zip";
        var file_path = dir + path.sep + file_name;
        var addFileToZip = function (zip, done) {
            zip
                .generateNodeStream({ type: "nodebuffer", streamFiles: true })
                .pipe(fs.createWriteStream(file_path))
                .on("finish", function () {
                done();
            });
        };
        if (job.isFile()) {
            fs.readFile(job.path, function (err, data) {
                if (err)
                    throw err;
                zip.file(job.name, data);
                addFileToZip(zip, function (done) {
                    var fileJob = new fileJob_1.FileJob(job.e, file_path);
                    callback(fileJob);
                });
            });
        }
        else if (job.isFolder()) {
            async.forEachOfSeries(job.files, function (file, key, cb) {
                fs.readFile(file.path, function (err, data) {
                    if (err)
                        throw err;
                    zip.file(file.name, data);
                    addFileToZip(zip, function (done) {
                        job.e.log(0, "Compressing file " + key + " of " + job.files.length + ".", job);
                        cb();
                    });
                });
            }, function (err) {
                if (err)
                    throw err;
                job.e.log(0, "Compressing complete. Compressed " + job.files.length + " files.", job);
                var fileJob = new fileJob_1.FileJob(job.e, file_path);
                callback(fileJob);
            });
        }
        else {
            // FIXME
            addFileToZip(zip, function (done) {
                done();
            });
        }
    };
    return Job;
}());
exports.Job = Job;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2Ivam9iLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esc0RBQW1EO0FBRW5ELDZDQUEwQztBQUUxQyxxQ0FBa0M7QUFHbEMseUZBQXlGO0FBQ3pGLGlEQUFpRDtBQUNqRCxrREFBa0Q7QUFFbEQsSUFBUSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUM1QixDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUNyQixHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUNwQixFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUNsQixJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUN0QixLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUN4QixLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRWpDO0lBWUk7Ozs7T0FJRztJQUNILGFBQVksQ0FBYyxFQUFFLElBQVk7UUFDcEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDUixDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQixDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNmLENBQUMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO1FBRWpCLENBQUMsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsZUFBWSxJQUFJLHdCQUFrQixDQUFDLENBQUMsRUFBRSxNQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBR0Qsc0JBQVcscUJBQUk7YUFBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBRUQ7OztPQUdHO0lBQ0ksc0JBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQU1ELHNCQUFXLG1DQUFrQjtRQUo3Qjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDbEMsQ0FBQzs7O09BQUE7SUFNRCxzQkFBVyxpQ0FBZ0I7UUFKM0I7OztXQUdHO2FBQ0gsVUFBNEIsU0FBa0I7WUFDMUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztRQUN2QyxDQUFDOzs7T0FBQTtJQU1ELHNCQUFXLDBCQUFTO1FBSnBCOzs7V0FHRzthQUNIO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDM0IsQ0FBQzthQUVELFVBQXFCLE1BQW1CO1lBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQzdCLENBQUM7OztPQUpBO0lBTUQ7Ozs7O09BS0c7SUFDTyw2QkFBZSxHQUF6QixVQUEwQixJQUFZLEVBQUUsS0FBYSxFQUFFLE1BQWM7UUFDakUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBTUQsc0JBQVcscUJBQUk7UUFJZjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7UUFkRDs7O1dBR0c7YUFDSCxVQUFnQixJQUFZO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBY0Qsc0JBQVcsbUJBQUU7UUFKYjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3BCLENBQUM7OztPQUFBO0lBTUQsc0JBQVcsMkJBQVU7UUFKckI7OztXQUdHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixDQUFDOzs7T0FBQTtJQU1ELHNCQUFXLHFCQUFJO1FBSWY7OztXQUdHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO1FBZEQ7OztXQUdHO2FBQ0gsVUFBZ0IsSUFBVTtZQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQWNELHNCQUFXLHVCQUFNO1FBSWpCOzs7V0FHRzthQUNIO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQWREOzs7V0FHRzthQUNILFVBQWtCLE1BQWM7WUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDMUIsQ0FBQzs7O09BQUE7SUFVRDs7O09BR0c7SUFDSSxrQkFBSSxHQUFYLFVBQVksTUFBYztRQUN0QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDYixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ1osQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVEsQ0FBQyxDQUFDLElBQUkscUNBQWlDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBUSxDQUFDLENBQUMsSUFBSSw2QkFBeUIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRUQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLHNCQUFRLEdBQWYsVUFBZ0IsTUFBYztRQUMxQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDZixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRTVCLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN2QixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ1osYUFBYSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDbkMsQ0FBQztRQUVELEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXpCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSw2QkFBMEIsTUFBTSxDQUFDLElBQUksUUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDMUUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBR0Q7O09BRUc7SUFDSSxrQkFBSSxHQUFYLFVBQVksZUFBZSxFQUFFLFFBQVE7UUFDakMsTUFBTSxtQ0FBbUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F3Q0c7SUFDSSxtQkFBSyxHQUFaLFVBQWEsWUFBMEI7UUFDbkMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ2YsSUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFFNUIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7O09BYUc7SUFDSSw4QkFBZ0IsR0FBdkIsVUFBd0IsR0FBVyxFQUFFLEtBQVU7UUFDM0MsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ2YsSUFBSSxJQUFJLEdBQUcsSUFBSSx5QkFBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV2QyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsZ0JBQWEsR0FBRyxnQ0FBNEIsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsc0JBQVcsK0JBQWM7YUFBekIsVUFBMEIsVUFBa0I7WUFDeEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ2YsR0FBRyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7WUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGNBQVksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxpQkFBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7OztPQUFBO0lBR0Q7Ozs7T0FJRztJQUNJLHlCQUFXLEdBQWxCLFVBQW1CLEdBQVc7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFnQixDQUFDO0lBQ2hELENBQUM7SUFFRCxzQkFBVywyQkFBVTthQUFyQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzVCLENBQUM7OztPQUFBO0lBRUQ7Ozs7T0FJRztJQUNJLDhCQUFnQixHQUF2QixVQUF3QixHQUFXO1FBQy9CLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztRQUNmLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN0QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7T0FhRztJQUNJLDZCQUFlLEdBQXRCLFVBQXVCLEdBQVc7UUFDOUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ2YsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3JDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0ksa0JBQUksR0FBWCxVQUFZLFFBQWtDO1FBQzFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztRQUNmLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDakQsSUFBSSxFQUFFLEdBQUcsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ1IsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7Ozs7Ozs7OztPQVdHO0lBQ0ksb0JBQU0sR0FBYixVQUFjLFFBQTRCO1FBQ3RDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztRQUNmLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDakQsSUFBSSxFQUFFLEdBQUcsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQUMsV0FBVztZQUN0QixRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0kscUJBQU8sR0FBZDtRQUNJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztRQUNmLElBQUksSUFBSSxDQUFDO1FBQ1QsSUFBSSxRQUFRLEdBQUcsVUFBUyxHQUFHLEVBQUUsS0FBSztZQUM5QiwyQkFBMkI7WUFDM0IsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLE1BQU0sSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ3JCLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssT0FBTyxJQUFJLEdBQUcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ3JCLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQztZQUNELElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSw4QkFBNEIsR0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxzQkFBVyxxQkFBSTthQUFmO1lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNyQixDQUFDO2FBa0JELFVBQWdCLElBQVk7UUFDNUIsQ0FBQzs7O09BbkJBO0lBRU0sb0JBQU0sR0FBYjtRQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVNLHNCQUFRLEdBQWY7UUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxzQkFBVyxzQkFBSzthQUFoQjtZQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFFTSxxQkFBTyxHQUFkLFVBQWUsS0FBVTtRQUNyQixNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFLTSxvQkFBTSxHQUFiLFVBQWMsSUFBWTtRQUN0QixNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLGlCQUFHLEdBQVYsVUFBVyxLQUFhLEVBQUUsT0FBZTtRQUNyQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDZixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsc0JBQVcscUJBQUk7YUFBZjtZQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVywwQkFBUzthQUFwQjtZQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFFTDs7Ozs7Ozs7OztPQVVHO0lBQ1Esc0JBQVEsR0FBZixVQUFnQixRQUFnQztRQUM1QyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDZixlQUFlO1FBQ2YsSUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUN0QixJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDM0IsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztRQUN4QyxJQUFJLFNBQVMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUM7UUFFM0MsSUFBSSxZQUFZLEdBQUcsVUFBQyxHQUFRLEVBQUUsSUFBSTtZQUM5QixHQUFHO2lCQUNFLGtCQUFrQixDQUFDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFDLENBQUM7aUJBQzNELElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ3JDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ1YsSUFBSSxFQUFFLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQztRQUVGLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDZixFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsVUFBQyxHQUFHLEVBQUUsSUFBSTtnQkFDNUIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUNuQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3pCLFlBQVksQ0FBQyxHQUFHLEVBQUUsVUFBQyxJQUFJO29CQUNuQixJQUFJLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDNUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0QixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDM0MsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQUMsR0FBRyxFQUFFLElBQUk7b0JBQzdCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQzt3QkFBQyxNQUFNLEdBQUcsQ0FBQztvQkFDbkIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUMxQixZQUFZLENBQUMsR0FBRyxFQUFFLFVBQUMsSUFBSTt3QkFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLHNCQUFvQixHQUFHLFlBQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLE1BQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDckUsRUFBRSxFQUFFLENBQUM7b0JBQ1QsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLEVBQUUsVUFBQyxHQUFHO2dCQUNILEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFBQyxNQUFNLEdBQUcsQ0FBQztnQkFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLHNDQUFvQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sWUFBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNqRixJQUFJLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDNUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osUUFBUTtZQUNSLFlBQVksQ0FBQyxHQUFHLEVBQUUsVUFBQyxJQUFJO2dCQUNuQixJQUFJLEVBQUUsQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUVMLENBQUM7SUFFTCxVQUFDO0FBQUQsQ0E3ZUEsQUE2ZUMsSUFBQTtBQTdlcUIsa0JBQUciLCJmaWxlIjoibGliL2pvYi9qb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUdW5uZWwgfSBmcm9tIFwiLi4vdHVubmVsL3R1bm5lbFwiO1xyXG5pbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4uL25lc3QvbmVzdFwiO1xyXG5pbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcclxuaW1wb3J0IHtMaWZlRXZlbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9saWZlRXZlbnRcIjtcclxuaW1wb3J0IHtFbWFpbE9wdGlvbnN9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbWFpbE9wdGlvbnNcIjtcclxuaW1wb3J0IHtKb2JQcm9wZXJ0eX0gZnJvbSBcIi4vam9iUHJvcGVydHlcIjtcclxuaW1wb3J0IHtQYWNrZWRKb2J9IGZyb20gXCIuL3BhY2tlZEpvYlwiO1xyXG5pbXBvcnQge0ZpbGVKb2J9IGZyb20gXCIuL2ZpbGVKb2JcIjtcclxuXHJcblxyXG4vLyBIYW5kbGUgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY3kgYnkgc3Rhc2hpbmcgdGhlIHR5cGUgaW4gYSB2YXJpYWJsZSBmb3IgcmVxdWlyaW5nIGxhdGVyLlxyXG4vLyBpbXBvcnQgKiBhcyBQYWNrZWRKb2JUeXBlcyBmcm9tIFwiLi9wYWNrZWRKb2JcIjtcclxuLy8gbGV0IFBhY2tlZEpvYjogdHlwZW9mIFBhY2tlZEpvYlR5cGVzLlBhY2tlZEpvYjtcclxuXHJcbmNvbnN0ICAgc2hvcnRpZCA9IHJlcXVpcmUoXCJzaG9ydGlkXCIpLFxyXG4gICAgICAgIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpLFxyXG4gICAgICAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIiksXHJcbiAgICAgICAgZnMgPSByZXF1aXJlKFwiZnNcIiksXHJcbiAgICAgICAgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxyXG4gICAgICAgIEpTWmlwID0gcmVxdWlyZShcImpzemlwXCIpLFxyXG4gICAgICAgIGFzeW5jID0gcmVxdWlyZShcImFzeW5jXCIpO1xyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEpvYiB7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9uYW1lOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgX3R1bm5lbDogVHVubmVsO1xyXG4gICAgcHJvdGVjdGVkIF9uZXN0OiBOZXN0O1xyXG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xyXG4gICAgcHJvdGVjdGVkIF9sb2NhbGx5QXZhaWxhYmxlOiBib29sZWFuO1xyXG4gICAgcHJvdGVjdGVkIF9saWZlQ3ljbGU6IExpZmVFdmVudFtdO1xyXG4gICAgcHJvdGVjdGVkIF9pZDogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIF9wcm9wZXJ0aWVzO1xyXG4gICAgcHJvdGVjdGVkIF90eXBlOiBzdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBKb2IgY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSBlXHJcbiAgICAgKiBAcGFyYW0gbmFtZVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgbmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGogPSB0aGlzO1xyXG4gICAgICAgIGouZSA9IGU7XHJcbiAgICAgICAgai5faWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XHJcbiAgICAgICAgai5fbmFtZSA9IG5hbWU7XHJcbiAgICAgICAgai5fbGlmZUN5Y2xlID0gW107XHJcbiAgICAgICAgai5fcHJvcGVydGllcyA9IHt9O1xyXG4gICAgICAgIGouX3R5cGUgPSBcImJhc2VcIjtcclxuXHJcbiAgICAgICAgai5jcmVhdGVMaWZlRXZlbnQoXCJjcmVhdGVkXCIsIG51bGwsIG5hbWUpO1xyXG4gICAgICAgIGouZS5sb2coMSwgYE5ldyBKb2IgXCIke25hbWV9XCIgY3JlYXRlZCwgaWQ6ICR7ai5pZH0uYCwgaiwgW2oubmVzdCwgai50dW5uZWxdKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIGdldCB0eXBlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90eXBlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xhc3MgX25hbWUgZm9yIGxvZ2dpbmcuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiSm9iXCI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgbG9jYWxseSBhdmFpbGFibGUuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBpc0xvY2FsbHlBdmFpbGFibGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvY2FsbHlBdmFpbGFibGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgaWYgdGhlIGpvYiBpcyBsb2NhbGx5IGF2YWlsYWJsZS5cclxuICAgICAqIEBwYXJhbSBhdmFpbGFibGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBsb2NhbGx5QXZhaWxhYmxlKGF2YWlsYWJsZTogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX2xvY2FsbHlBdmFpbGFibGUgPSBhdmFpbGFibGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIGxpZmUgY3ljbGUgb2JqZWN0LlxyXG4gICAgICogQHJldHVybnMge0xpZmVFdmVudFtdfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGxpZmVDeWNsZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGlmZUN5Y2xlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgbGlmZUN5Y2xlKGV2ZW50czogTGlmZUV2ZW50W10pIHtcclxuICAgICAgICB0aGlzLl9saWZlQ3ljbGUgPSBldmVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlmZSBldmVudC5cclxuICAgICAqIEBwYXJhbSB2ZXJiXHJcbiAgICAgKiBAcGFyYW0gc3RhcnRcclxuICAgICAqIEBwYXJhbSBmaW5pc2hcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUxpZmVFdmVudCh2ZXJiOiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGZpbmlzaDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5saWZlQ3ljbGUucHVzaChuZXcgTGlmZUV2ZW50KHZlcmIsIHN0YXJ0LCBmaW5pc2gpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBhIG5ldyBfbmFtZS5cclxuICAgICAqIEBwYXJhbSBuYW1lXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgX25hbWUuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IG5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIElELlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBpZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIF9uYW1lIHByb3Blci5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgbmFtZVByb3BlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBuZXN0LlxyXG4gICAgICogQHBhcmFtIG5lc3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBuZXN0KG5lc3Q6IE5lc3QpIHtcclxuICAgICAgICB0aGlzLl9uZXN0ID0gbmVzdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgbmVzdC5cclxuICAgICAqIEByZXR1cm5zIHtOZXN0fVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IG5lc3QoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25lc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIHR1bm5lbC5cclxuICAgICAqIEBwYXJhbSB0dW5uZWxcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCB0dW5uZWwodHVubmVsOiBUdW5uZWwpIHtcclxuICAgICAgICB0aGlzLl90dW5uZWwgPSB0dW5uZWw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIHR1bm5lbC5cclxuICAgICAqIEByZXR1cm5zIHtUdW5uZWx9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgdHVubmVsKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90dW5uZWw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGdW5jdGlvbiB0byBjYWxsIHRvIGZhaWwgYSBqb2Igd2hpbGUgaW4gYSB0dW5uZWwuXHJcbiAgICAgKiBAcGFyYW0gcmVhc29uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBmYWlsKHJlYXNvbjogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGogPSB0aGlzO1xyXG4gICAgICAgIGlmICghai50dW5uZWwpIHtcclxuICAgICAgICAgICAgai5lLmxvZygzLCBgSm9iIFwiJHtqLm5hbWV9XCIgZmFpbGVkIGJlZm9yZSB0dW5uZWwgd2FzIHNldC5gLCBqKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFqLm5lc3QpIHtcclxuICAgICAgICAgICAgai5lLmxvZygzLCBgSm9iIFwiJHtqLm5hbWV9XCIgZG9lcyBub3QgaGF2ZSBhIG5lc3QuYCwgaik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBqLnR1bm5lbC5leGVjdXRlRmFpbChqLCBqLm5lc3QsIHJlYXNvbik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2ZlciBhIGpvYiB0byBhbm90aGVyIHR1bm5lbCBkaXJlY3RseS5cclxuICAgICAqIEBwYXJhbSB0dW5uZWxcclxuICAgICAqL1xyXG4gICAgcHVibGljIHRyYW5zZmVyKHR1bm5lbDogVHVubmVsKSB7XHJcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IG9sZFR1bm5lbCA9IHRoaXMudHVubmVsO1xyXG5cclxuICAgICAgICBsZXQgb2xkVHVubmVsTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgaWYgKG9sZFR1bm5lbCkge1xyXG4gICAgICAgICAgICBvbGRUdW5uZWxOYW1lID0gb2xkVHVubmVsLm5hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBqb2IudHVubmVsID0gdHVubmVsO1xyXG4gICAgICAgIHR1bm5lbC5hcnJpdmUoam9iLCBudWxsKTtcclxuXHJcbiAgICAgICAgam9iLmUubG9nKDEsIGBUcmFuc2ZlcnJlZCB0byBUdW5uZWwgXCIke3R1bm5lbC5uYW1lfVwiLmAsIGpvYiwgW29sZFR1bm5lbF0pO1xyXG4gICAgICAgIGpvYi5jcmVhdGVMaWZlRXZlbnQoXCJ0cmFuc2ZlclwiLCBvbGRUdW5uZWxOYW1lLCB0dW5uZWwubmFtZSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTW92ZSBmdW5jdGlvbiBlcnJvci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIG1vdmUoZGVzdGluYXRpb25OZXN0LCBjYWxsYmFjaykge1xyXG4gICAgICAgIHRocm93IFwiVGhpcyB0eXBlIG9mIGpvYiBjYW5ub3QgYmUgbW92ZWQuXCI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kcyBhbiBlbWFpbC5cclxuICAgICAqIEBwYXJhbSBlbWFpbE9wdGlvbnMgICAgICBFbWFpbCBvcHRpb25zXHJcbiAgICAgKiAjIyMjIFNlbmRpbmcgcHVnIHRlbXBsYXRlIGVtYWlsIGV4YW1wbGVcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiAvLyBteV90dW5uZWwuanNcclxuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xyXG4gICAgICogICAgICBqb2IuZW1haWwoe1xyXG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIGZyb20gcHVnIHRlbXBsYXRlXCIsXHJcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXHJcbiAgICAgKiAgICAgICAgICB0ZW1wbGF0ZTogX19kaXJuYW1lICsgXCIuL3RlbXBsYXRlX2ZpbGVzL215X2VtYWlsLnB1Z1wiXHJcbiAgICAgKiAgICAgIH0pO1xyXG4gICAgICogfSk7XHJcbiAgICAgKiBgYGBcclxuICAgICAqXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogLy8gdGVtcGxhdGVfZmlsZXMvbXlfZW1haWwucHVnXHJcbiAgICAgKiBoMT1cIkV4YW1wbGUgZW1haWwhXCJcclxuICAgICAqIHA9XCJHb3Qgam9iIElEIFwiICsgam9iLmdldElkKClcclxuICAgICAqIGBgYFxyXG4gICAgICogIyMjIyBTZW5kaW5nIHBsYWluLXRleHQgZW1haWxcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcclxuICAgICAqICAgICAgam9iLmVtYWlsKHtcclxuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCB3aXRoIGhhcmQtY29kZWQgcGxhaW4tdGV4dFwiLFxyXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxyXG4gICAgICogICAgICAgICAgdGV4dDogXCJNeSBlbWFpbCBib2R5IVwiXHJcbiAgICAgKiAgICAgIH0pO1xyXG4gICAgICogfSk7XHJcbiAgICAgKiBgYGBcclxuICAgICAqICMjIyMgU2VuZGluZyBodG1sIGVtYWlsXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XHJcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XHJcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgd2l0aCBoYXJkLWNvZGVkIGh0bWxcIixcclxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcclxuICAgICAqICAgICAgICAgIGh0bWw6IFwiPGgxPk15IGVtYWlsIGJvZHkhPC9oMT5cIlxyXG4gICAgICogICAgICB9KTtcclxuICAgICAqIH0pO1xyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBlbWFpbChlbWFpbE9wdGlvbnM6IEVtYWlsT3B0aW9ucykge1xyXG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xyXG4gICAgICAgIGxldCBlbWFpbGVyID0gam9iLmUuZW1haWxlcjtcclxuXHJcbiAgICAgICAgZW1haWxlci5zZW5kTWFpbChlbWFpbE9wdGlvbnMsIGpvYik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2ggam9iIHNwZWNpZmljIGRhdGEgdG8gdGhlIGpvYiBpbnN0YW5jZS5cclxuICAgICAqICMjIyMgRXhhbXBsZVxyXG4gICAgICpcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiBqb2Iuc2V0UHJvcGVydHlWYWx1ZShcIk15IEpvYiBOdW1iZXJcIiwgMTIzNDU2KTtcclxuICAgICAqXHJcbiAgICAgKiBjb25zb2xlLmxvZyhqb2IuZ2V0UHJvcGVydHlWYWx1ZShcIk15IEpvYiBOdW1iZXJcIikpO1xyXG4gICAgICogLy8gMTIzNDU2XHJcbiAgICAgKiBgYGBcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFByb3BlcnR5VmFsdWUoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcclxuICAgICAgICBsZXQgam9iID0gdGhpcztcclxuICAgICAgICBsZXQgcHJvcCA9IG5ldyBKb2JQcm9wZXJ0eShrZXksIHZhbHVlKTtcclxuXHJcbiAgICAgICAgam9iLl9wcm9wZXJ0aWVzW2tleV0gPSBwcm9wO1xyXG4gICAgICAgIGpvYi5lLmxvZygxLCBgUHJvcGVydHkgXCIke2tleX1cIiBhZGRlZCB0byBqb2IgcHJvcGVydGllcy5gLCBqb2IpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgcHJvcGVydHlWYWx1ZXMocHJvcGVydGllczogT2JqZWN0KSB7XHJcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XHJcbiAgICAgICAgam9iLl9wcm9wZXJ0aWVzID0gcHJvcGVydGllcztcclxuICAgICAgICBqb2IuZS5sb2coMCwgYFJlc3RvcmVkICR7T2JqZWN0LmtleXMoam9iLl9wcm9wZXJ0aWVzKS5sZW5ndGh9IHByb3BlcnRpZXMuYCwgam9iKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIGVudGlyZSBqb2IgcHJvcGVydHkgb2JqZWN0LlxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHJldHVybnMge0pvYlByb3BlcnR5fVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0UHJvcGVydHkoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllc1trZXldIGFzIEpvYlByb3BlcnR5O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgcHJvcGVydGllcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpZiBpdCBoYXMgYmVlbiBwcmV2aW91c2x5IHNldC5cclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEByZXR1cm5zIHthbnl9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eVZhbHVlKGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XHJcbiAgICAgICAgaWYgKGpvYi5fcHJvcGVydGllc1trZXldKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBqb2IuX3Byb3BlcnRpZXNba2V5XS52YWx1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIHR5cGUgb2YgYSBwcm9wZXJ0eS5cclxuICAgICAqICMjIyMgRXhhbXBsZVxyXG4gICAgICpcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiBqb2Iuc2V0UHJvcGVydHlWYWx1ZShcIk15IEpvYiBOdW1iZXJcIiwgMTIzNDU2KTtcclxuICAgICAqXHJcbiAgICAgKiBjb25zb2xlLmxvZyhqb2IuZ2V0UHJvcGVydHlUeXBlKFwiTXkgSm9iIE51bWJlclwiKSk7XHJcbiAgICAgKiAvLyBcIm51bWJlclwiXHJcbiAgICAgKiBgYGBcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0UHJvcGVydHlUeXBlKGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XHJcbiAgICAgICAgaWYgKGpvYi5fcHJvcGVydGllc1trZXldKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBqb2IuX3Byb3BlcnRpZXNba2V5XS50eXBlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhY2tzIHRoZSBqb2IgaW5zdGFuY2UgYW5kIGZpbGUgdG9nZXRoZXIgaW4gYSB6aXAuXHJcbiAgICAgKiBSZXR1cm5zIGEgUGFja0pvYiBpbiB0aGUgcGFyYW1ldGVyIG9mIHRoZSBjYWxsYmFjay5cclxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICogIyMjIyBFeGFtcGxlXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogam9iLnBhY2soZnVuY3Rpb24ocGFja0pvYil7XHJcbiAgICAgKiAgICAgIHBhY2tKb2IubW92ZShwYWNrZWRfZm9sZGVyX25lc3QpO1xyXG4gICAgICogfSk7XHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHBhY2soY2FsbGJhY2s6IChqb2I6IFBhY2tlZEpvYikgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xyXG4gICAgICAgIGxldCBQYWNrZWRKb2IgPSByZXF1aXJlKFwiLi9wYWNrZWRKb2JcIikuUGFja2VkSm9iO1xyXG4gICAgICAgIGxldCBwaiA9IG5ldyBQYWNrZWRKb2Ioam9iLmUsIGpvYik7XHJcbiAgICAgICAgcGouZXhlY1BhY2soKCkgPT4ge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhwaik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbnBhY2tzIGEgcGFja2VkIGpvYi4gUmV0dXJucyBhIHRoZSBvcmlnaW5hbCB1bnBhY2tlZCBqb2IgaW4gdGhlIHBhcmFtZXRlciBvZiB0aGUgY2FsbGJhY2suXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqICMjIyMgRXhhbXBsZVxyXG4gICAgICogYGBganNcclxuICAgICAqIHBhY2tlZEpvYi51bnBhY2soZnVuY3Rpb24odW5wYWNrZWRKb2Ipe1xyXG4gICAgICogICAgIGNvbnNvbGUubG9nKFwiVW5wYWNrZWRcIiwgdW5wYWNrZWRKb2IubmFtZSk7XHJcbiAgICAgKiAgICAgdW5wYWNrZWRKb2IubW92ZSh1bnBhY2tlZF9mb2xkZXIpO1xyXG4gICAgICogICAgIHBhY2tlZEpvYi5yZW1vdmUoKTtcclxuICAgICAqIH0pO1xyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB1bnBhY2soY2FsbGJhY2s6IChqb2I6IEpvYikgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xyXG4gICAgICAgIGxldCBQYWNrZWRKb2IgPSByZXF1aXJlKFwiLi9wYWNrZWRKb2JcIikuUGFja2VkSm9iO1xyXG4gICAgICAgIGxldCBwaiA9IG5ldyBQYWNrZWRKb2Ioam9iLmUsIGpvYik7XHJcbiAgICAgICAgcGouZXhlY1VucGFjaygodW5wYWNrZWRKb2IpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2sodW5wYWNrZWRKb2IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBqb2Igb2JqZWN0IGFzIEpTT04gd2l0aCBjaXJjdWxhciByZWZlcmVuY2VzIHJlbW92ZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0SlNPTigpIHtcclxuICAgICAgICBsZXQgam9iID0gdGhpcztcclxuICAgICAgICBsZXQganNvbjtcclxuICAgICAgICBsZXQgcmVwbGFjZXIgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIC8vIEZpbHRlcmluZyBvdXQgcHJvcGVydGllc1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcIm5lc3RcIiB8fCBrZXkgPT09IFwiZVwiIHx8IGtleSA9PT0gXCJ0dW5uZWxcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcIl9uZXN0XCIgfHwga2V5ID09PSBcIl90dW5uZWxcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAganNvbiA9IEpTT04uc3RyaW5naWZ5KGpvYiwgcmVwbGFjZXIpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBqb2IuZS5sb2coMywgYGdldEpTT04gc3RyaW5naWZ5IGVycm9yOiAke2Vycn1gLCBqb2IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGpzb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBwYXRoKCkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlzRmlsZSgpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc0ZvbGRlcigpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgZmlsZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0RmlsZShpbmRleDogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHBhdGgocGF0aDogc3RyaW5nKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmFtZShuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgbWVzc2FnZSB0byB0aGUgbG9nIHdpdGggdGhpcyBqb2IgYXMgdGhlIGFjdG9yLlxyXG4gICAgICogQHBhcmFtIGxldmVsICAgICAgICAgICAgIDAgPSBkZWJ1ZywgMSA9IGluZm8sIDIsID0gd2FybmluZywgMyA9IGVycm9yXHJcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSAgICAgICAgICAgTG9nIG1lc3NhZ2VcclxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBsb2cobGV2ZWw6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIGpvYi5lLmxvZyhsZXZlbCwgbWVzc2FnZSwgam9iKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHNpemUgKCkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBzaXplQnl0ZXMgKCkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4vKipcclxuICogQ29tcHJlc3NlcyB0aGUgam9iLlxyXG4gKiBSZXR1cm5zIGEgUGFja0pvYiBpbiB0aGUgcGFyYW1ldGVyIG9mIHRoZSBjYWxsYmFjay5cclxuICogQHBhcmFtIGNhbGxiYWNrXHJcbiAqICMjIyMgRXhhbXBsZVxyXG4gKiBgYGBqc1xyXG4gKiBqb2IuY29tcHJlc3MoZnVuY3Rpb24oZmlsZUpvYil7XHJcbiAqICAgICAgZmlsZUpvYi5tb3ZlKHBhY2tlZF9mb2xkZXJfbmVzdCk7XHJcbiAqIH0pO1xyXG4gKiBgYGBcclxuICovXHJcbiAgICBwdWJsaWMgY29tcHJlc3MoY2FsbGJhY2s6IChqb2I6IEZpbGVKb2IpID0+IHZvaWQpIHtcclxuICAgICAgICBsZXQgam9iID0gdGhpcztcclxuICAgICAgICAvLyBTYXZlIG91dCB6aXBcclxuICAgICAgICBsZXQgemlwID0gbmV3IEpTWmlwKCk7XHJcbiAgICAgICAgbGV0IHRtcG9iaiA9IHRtcC5kaXJTeW5jKCk7XHJcbiAgICAgICAgbGV0IGRpciA9IHRtcG9iai5uYW1lO1xyXG4gICAgICAgIGxldCBmaWxlX25hbWUgPSBqb2IubmFtZVByb3BlciArIFwiLnppcFwiO1xyXG4gICAgICAgIGxldCBmaWxlX3BhdGggPSBkaXIgKyBwYXRoLnNlcCArIGZpbGVfbmFtZTtcclxuXHJcbiAgICAgICAgbGV0IGFkZEZpbGVUb1ppcCA9ICh6aXA6IGFueSwgZG9uZSkgPT4ge1xyXG4gICAgICAgICAgICB6aXBcclxuICAgICAgICAgICAgICAgIC5nZW5lcmF0ZU5vZGVTdHJlYW0oe3R5cGU6IFwibm9kZWJ1ZmZlclwiLCBzdHJlYW1GaWxlczogdHJ1ZX0pXHJcbiAgICAgICAgICAgICAgICAucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbShmaWxlX3BhdGgpKVxyXG4gICAgICAgICAgICAgICAgLm9uKFwiZmluaXNoXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAoam9iLmlzRmlsZSgpKSB7XHJcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlKGpvYi5wYXRoLCAoZXJyLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICB6aXAuZmlsZShqb2IubmFtZSwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBhZGRGaWxlVG9aaXAoemlwLCAoZG9uZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmaWxlSm9iID0gbmV3IEZpbGVKb2Ioam9iLmUsIGZpbGVfcGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZmlsZUpvYik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChqb2IuaXNGb2xkZXIoKSkge1xyXG4gICAgICAgICAgICBhc3luYy5mb3JFYWNoT2ZTZXJpZXMoam9iLmZpbGVzLCAoZmlsZSwga2V5LCBjYikgPT4ge1xyXG4gICAgICAgICAgICAgICAgZnMucmVhZEZpbGUoZmlsZS5wYXRoLCAoZXJyLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikgdGhyb3cgZXJyO1xyXG4gICAgICAgICAgICAgICAgICAgIHppcC5maWxlKGZpbGUubmFtZSwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkRmlsZVRvWmlwKHppcCwgKGRvbmUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgam9iLmUubG9nKDAsIGBDb21wcmVzc2luZyBmaWxlICR7a2V5fSBvZiAke2pvYi5maWxlcy5sZW5ndGh9LmAsIGpvYik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikgdGhyb3cgZXJyO1xyXG4gICAgICAgICAgICAgICAgam9iLmUubG9nKDAsIGBDb21wcmVzc2luZyBjb21wbGV0ZS4gQ29tcHJlc3NlZCAke2pvYi5maWxlcy5sZW5ndGh9IGZpbGVzLmAsIGpvYik7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmlsZUpvYiA9IG5ldyBGaWxlSm9iKGpvYi5lLCBmaWxlX3BhdGgpO1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZmlsZUpvYik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGFkZEZpbGVUb1ppcCh6aXAsIChkb25lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgfVxyXG5cclxufSJdfQ==
