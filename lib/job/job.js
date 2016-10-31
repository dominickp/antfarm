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
        j.id = shortid.generate();
        j._name = name;
        j.lifeCycle = [];
        j.properties = {};
        j.type = "base";
        j.createLifeEvent("created", null, name);
        j.e.log(1, "New Job \"" + name + "\" created, id: " + j.id + ".", j);
    }
    /**
     * Class _name for logging.
     * @returns {string}
     */
    Job.prototype.toString = function () {
        return "Job";
    };
    /**
     * Check if job is locally available.
     * @returns {boolean}
     */
    Job.prototype.isLocallyAvailable = function () {
        return this.locallyAvailable;
    };
    /**
     * Set if the job is locally available.
     * @param available
     */
    Job.prototype.setLocallyAvailable = function (available) {
        this.locallyAvailable = available;
    };
    /**
     * Get the life cycle object.
     * @returns {LifeEvent[]}
     */
    Job.prototype.getLifeCycle = function () {
        return this.lifeCycle;
    };
    Job.prototype.setLifeCycle = function (events) {
        this.lifeCycle = events;
    };
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
    /**
     * Get the ID.
     * @returns {string}
     */
    Job.prototype.getId = function () {
        return this.id;
    };
    /**
     * Get the _name proper.
     * @returns {string}
     */
    Job.prototype.getNameProper = function () {
        return this.name;
    };
    /**
     * Set the nest.
     * @param nest
     */
    Job.prototype.setNest = function (nest) {
        this.nest = nest;
    };
    /**
     * Get the nest.
     * @returns {Nest}
     */
    Job.prototype.getNest = function () {
        return this.nest;
    };
    /**
     * Set the tunnel.
     * @param tunnel
     */
    Job.prototype.setTunnel = function (tunnel) {
        this.tunnel = tunnel;
    };
    /**
     * Get the tunnel.
     * @returns {Tunnel}
     */
    Job.prototype.getTunnel = function () {
        return this.tunnel;
    };
    /**
     * Function to call to fail a job while in a tunnel.
     * @param reason
     */
    Job.prototype.fail = function (reason) {
        var j = this;
        if (!j.getTunnel()) {
            j.e.log(3, "Job \"" + j.name + "\" failed before tunnel was set.", j);
        }
        if (!j.getNest()) {
            j.e.log(3, "Job \"" + j.name + "\" does not have a nest.", j);
        }
        j.tunnel.executeFail(j, j.getNest(), reason);
    };
    /**
     * Transfer a job to another tunnel directly.
     * @param tunnel
     */
    Job.prototype.transfer = function (tunnel) {
        var job = this;
        var oldTunnel = this.getTunnel();
        var oldTunnelName = "";
        if (oldTunnel) {
            oldTunnelName = oldTunnel.name;
        }
        job.setTunnel(tunnel);
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
        job.properties[key] = prop;
        job.e.log(1, "Property \"" + key + "\" added to job properties.", job);
    };
    Job.prototype.setPropertyValues = function (properties) {
        var job = this;
        job.properties = properties;
        job.e.log(0, "Restored " + Object.keys(job.properties).length + " properties.", job);
    };
    /**
     * Get the entire job property object.
     * @param key
     * @returns {JobProperty}
     */
    Job.prototype.getProperty = function (key) {
        return this.properties[key];
    };
    /**
     * Get the value of a property if it has been previously set.
     * @param key
     * @returns {any}
     */
    Job.prototype.getPropertyValue = function (key) {
        var job = this;
        if (job.properties[key]) {
            return job.properties[key].value;
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
        if (job.properties[key]) {
            return job.properties[key].getType();
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
    Job.prototype.getPath = function () {
        return undefined;
    };
    Job.prototype.isFile = function () {
        return undefined;
    };
    Job.prototype.isFolder = function () {
        return undefined;
    };
    Job.prototype.getFiles = function () {
        return undefined;
    };
    Job.prototype.getFile = function (index) {
        return undefined;
    };
    Job.prototype.setPath = function (path) {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFBLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsOEJBQTRCLEdBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0scUJBQU8sR0FBZDtRQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVNLG9CQUFNLEdBQWI7UUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFTSxzQkFBUSxHQUFmO1FBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRU0sc0JBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVNLHFCQUFPLEdBQWQsVUFBZSxLQUFVO1FBQ3JCLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVNLHFCQUFPLEdBQWQsVUFBZSxJQUFZO1FBQ3ZCLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVNLG9CQUFNLEdBQWIsVUFBYyxJQUFZO1FBQ3RCLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksaUJBQUcsR0FBVixVQUFXLEtBQWEsRUFBRSxPQUFlO1FBQ3JDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztRQUNmLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFDTCxVQUFDO0FBQUQsQ0ExWkEsQUEwWkMsSUFBQTtBQTFacUIsV0FBRyxNQTBaeEIsQ0FBQSIsImZpbGUiOiJsaWIvam9iL2pvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFR1bm5lbCB9IGZyb20gXCIuLi90dW5uZWwvdHVubmVsXCI7XG5pbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4uL25lc3QvbmVzdFwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0xpZmVFdmVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2xpZmVFdmVudFwiO1xuaW1wb3J0IHtFbWFpbE9wdGlvbnN9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbWFpbE9wdGlvbnNcIjtcbmltcG9ydCB7Sm9iUHJvcGVydHl9IGZyb20gXCIuL2pvYlByb3BlcnR5XCI7XG5cbi8vIEhhbmRsZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeSBieSBzdGFzaGluZyB0aGUgdHlwZSBpbiBhIHZhcmlhYmxlIGZvciByZXF1aXJpbmcgbGF0ZXIuXG4vLyBpbXBvcnQgKiBhcyBQYWNrZWRKb2JUeXBlcyBmcm9tIFwiLi9wYWNrZWRKb2JcIjtcbi8vIGxldCBQYWNrZWRKb2I6IHR5cGVvZiBQYWNrZWRKb2JUeXBlcy5QYWNrZWRKb2I7XG5cbmNvbnN0ICAgc2hvcnRpZCA9IHJlcXVpcmUoXCJzaG9ydGlkXCIpLFxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEpvYiB7XG5cbiAgICBwcm90ZWN0ZWQgX25hbWU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgdHVubmVsOiBUdW5uZWw7XG4gICAgcHJvdGVjdGVkIG5lc3Q6IE5lc3Q7XG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuICAgIHByb3RlY3RlZCBsb2NhbGx5QXZhaWxhYmxlOiBib29sZWFuO1xuICAgIHByb3RlY3RlZCBsaWZlQ3ljbGU6IExpZmVFdmVudFtdO1xuICAgIHByb3RlY3RlZCBpZDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBwcm9wZXJ0aWVzO1xuICAgIHByb3RlY3RlZCB0eXBlOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBKb2IgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIG5hbWU6IHN0cmluZykge1xuICAgICAgICBsZXQgaiA9IHRoaXM7XG4gICAgICAgIGouZSA9IGU7XG4gICAgICAgIGouaWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XG4gICAgICAgIGouX25hbWUgPSBuYW1lO1xuICAgICAgICBqLmxpZmVDeWNsZSA9IFtdO1xuICAgICAgICBqLnByb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgai50eXBlID0gXCJiYXNlXCI7XG5cbiAgICAgICAgai5jcmVhdGVMaWZlRXZlbnQoXCJjcmVhdGVkXCIsIG51bGwsIG5hbWUpO1xuICAgICAgICBqLmUubG9nKDEsIGBOZXcgSm9iIFwiJHtuYW1lfVwiIGNyZWF0ZWQsIGlkOiAke2ouaWR9LmAsIGopO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsYXNzIF9uYW1lIGZvciBsb2dnaW5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gXCJKb2JcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgbG9jYWxseSBhdmFpbGFibGUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzTG9jYWxseUF2YWlsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxseUF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgaWYgdGhlIGpvYiBpcyBsb2NhbGx5IGF2YWlsYWJsZS5cbiAgICAgKiBAcGFyYW0gYXZhaWxhYmxlXG4gICAgICovXG4gICAgcHVibGljIHNldExvY2FsbHlBdmFpbGFibGUoYXZhaWxhYmxlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMubG9jYWxseUF2YWlsYWJsZSA9IGF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGxpZmUgY3ljbGUgb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHtMaWZlRXZlbnRbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TGlmZUN5Y2xlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saWZlQ3ljbGU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldExpZmVDeWNsZShldmVudHM6IExpZmVFdmVudFtdKSB7XG4gICAgICAgIHRoaXMubGlmZUN5Y2xlID0gZXZlbnRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBsaWZlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB2ZXJiXG4gICAgICogQHBhcmFtIHN0YXJ0XG4gICAgICogQHBhcmFtIGZpbmlzaFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVMaWZlRXZlbnQodmVyYjogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBmaW5pc2g6IHN0cmluZykge1xuICAgICAgICB0aGlzLmxpZmVDeWNsZS5wdXNoKG5ldyBMaWZlRXZlbnQodmVyYiwgc3RhcnQsIGZpbmlzaCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBfbmFtZS5cbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBfbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBJRC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBfbmFtZSBwcm9wZXIuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TmFtZVByb3BlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIG5lc3QuXG4gICAgICogQHBhcmFtIG5lc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0TmVzdChuZXN0OiBOZXN0KSB7XG4gICAgICAgIHRoaXMubmVzdCA9IG5lc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuZXN0LlxuICAgICAqIEByZXR1cm5zIHtOZXN0fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROZXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgdHVubmVsLlxuICAgICAqIEBwYXJhbSB0dW5uZWxcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VHVubmVsKHR1bm5lbDogVHVubmVsKSB7XG4gICAgICAgIHRoaXMudHVubmVsID0gdHVubmVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdHVubmVsLlxuICAgICAqIEByZXR1cm5zIHtUdW5uZWx9XG4gICAgICovXG4gICAgcHVibGljIGdldFR1bm5lbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHVubmVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGNhbGwgdG8gZmFpbCBhIGpvYiB3aGlsZSBpbiBhIHR1bm5lbC5cbiAgICAgKiBAcGFyYW0gcmVhc29uXG4gICAgICovXG4gICAgcHVibGljIGZhaWwocmVhc29uOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGogPSB0aGlzO1xuICAgICAgICBpZiAoIWouZ2V0VHVubmVsKCkpIHtcbiAgICAgICAgICAgIGouZS5sb2coMywgYEpvYiBcIiR7ai5uYW1lfVwiIGZhaWxlZCBiZWZvcmUgdHVubmVsIHdhcyBzZXQuYCwgaik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFqLmdldE5lc3QoKSkge1xuICAgICAgICAgICAgai5lLmxvZygzLCBgSm9iIFwiJHtqLm5hbWV9XCIgZG9lcyBub3QgaGF2ZSBhIG5lc3QuYCwgaik7XG4gICAgICAgIH1cblxuICAgICAgICBqLnR1bm5lbC5leGVjdXRlRmFpbChqLCBqLmdldE5lc3QoKSwgcmVhc29uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2ZlciBhIGpvYiB0byBhbm90aGVyIHR1bm5lbCBkaXJlY3RseS5cbiAgICAgKiBAcGFyYW0gdHVubmVsXG4gICAgICovXG4gICAgcHVibGljIHRyYW5zZmVyKHR1bm5lbDogVHVubmVsKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgb2xkVHVubmVsID0gdGhpcy5nZXRUdW5uZWwoKTtcblxuICAgICAgICBsZXQgb2xkVHVubmVsTmFtZSA9IFwiXCI7XG4gICAgICAgIGlmIChvbGRUdW5uZWwpIHtcbiAgICAgICAgICAgIG9sZFR1bm5lbE5hbWUgPSBvbGRUdW5uZWwubmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGpvYi5zZXRUdW5uZWwodHVubmVsKTtcbiAgICAgICAgdHVubmVsLmFycml2ZShqb2IsIG51bGwpO1xuXG4gICAgICAgIGpvYi5lLmxvZygxLCBgVHJhbnNmZXJyZWQgdG8gVHVubmVsIFwiJHt0dW5uZWwubmFtZX1cIi5gLCBqb2IsIFtvbGRUdW5uZWxdKTtcbiAgICAgICAgam9iLmNyZWF0ZUxpZmVFdmVudChcInRyYW5zZmVyXCIsIG9sZFR1bm5lbE5hbWUsIHR1bm5lbC5uYW1lKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIE1vdmUgZnVuY3Rpb24gZXJyb3IuXG4gICAgICovXG4gICAgcHVibGljIG1vdmUoZGVzdGluYXRpb25OZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB0aHJvdyBcIlRoaXMgdHlwZSBvZiBqb2IgY2Fubm90IGJlIG1vdmVkLlwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmRzIGFuIGVtYWlsLlxuICAgICAqIEBwYXJhbSBlbWFpbE9wdGlvbnMgICAgICBFbWFpbCBvcHRpb25zXG4gICAgICogIyMjIyBTZW5kaW5nIHB1ZyB0ZW1wbGF0ZSBlbWFpbCBleGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiAvLyBteV90dW5uZWwuanNcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIGZyb20gcHVnIHRlbXBsYXRlXCIsXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxuICAgICAqICAgICAgICAgIHRlbXBsYXRlOiBfX2Rpcm5hbWUgKyBcIi4vdGVtcGxhdGVfZmlsZXMvbXlfZW1haWwucHVnXCJcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiAvLyB0ZW1wbGF0ZV9maWxlcy9teV9lbWFpbC5wdWdcbiAgICAgKiBoMT1cIkV4YW1wbGUgZW1haWwhXCJcbiAgICAgKiBwPVwiR290IGpvYiBJRCBcIiArIGpvYi5nZXRJZCgpXG4gICAgICogYGBgXG4gICAgICogIyMjIyBTZW5kaW5nIHBsYWluLXRleHQgZW1haWxcbiAgICAgKiBgYGBqc1xuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xuICAgICAqICAgICAgam9iLmVtYWlsKHtcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgd2l0aCBoYXJkLWNvZGVkIHBsYWluLXRleHRcIixcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXG4gICAgICogICAgICAgICAgdGV4dDogXCJNeSBlbWFpbCBib2R5IVwiXG4gICAgICogICAgICB9KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKiAjIyMjIFNlbmRpbmcgaHRtbCBlbWFpbFxuICAgICAqIGBgYGpzXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XG4gICAgICogICAgICBqb2IuZW1haWwoe1xuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCB3aXRoIGhhcmQtY29kZWQgaHRtbFwiLFxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcbiAgICAgKiAgICAgICAgICBodG1sOiBcIjxoMT5NeSBlbWFpbCBib2R5ITwvaDE+XCJcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBlbWFpbChlbWFpbE9wdGlvbnM6IEVtYWlsT3B0aW9ucykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IGVtYWlsZXIgPSBqb2IuZS5nZXRFbWFpbGVyKCk7XG5cbiAgICAgICAgZW1haWxlci5zZW5kTWFpbChlbWFpbE9wdGlvbnMsIGpvYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGpvYiBzcGVjaWZpYyBkYXRhIHRvIHRoZSBqb2IgaW5zdGFuY2UuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5zZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiLCAxMjM0NTYpO1xuICAgICAqXG4gICAgICogY29uc29sZS5sb2coam9iLmdldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIpKTtcbiAgICAgKiAvLyAxMjM0NTZcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UHJvcGVydHlWYWx1ZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IHByb3AgPSBuZXcgSm9iUHJvcGVydHkoa2V5LCB2YWx1ZSk7XG5cbiAgICAgICAgam9iLnByb3BlcnRpZXNba2V5XSA9IHByb3A7XG4gICAgICAgIGpvYi5lLmxvZygxLCBgUHJvcGVydHkgXCIke2tleX1cIiBhZGRlZCB0byBqb2IgcHJvcGVydGllcy5gLCBqb2IpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQcm9wZXJ0eVZhbHVlcyhwcm9wZXJ0aWVzOiBPYmplY3QpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGpvYi5wcm9wZXJ0aWVzID0gcHJvcGVydGllcztcbiAgICAgICAgam9iLmUubG9nKDAsIGBSZXN0b3JlZCAke09iamVjdC5rZXlzKGpvYi5wcm9wZXJ0aWVzKS5sZW5ndGh9IHByb3BlcnRpZXMuYCwgam9iKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZW50aXJlIGpvYiBwcm9wZXJ0eSBvYmplY3QuXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHtKb2JQcm9wZXJ0eX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UHJvcGVydHkoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllc1trZXldIGFzIEpvYlByb3BlcnR5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpZiBpdCBoYXMgYmVlbiBwcmV2aW91c2x5IHNldC5cbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UHJvcGVydHlWYWx1ZShrZXk6IHN0cmluZykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgaWYgKGpvYi5wcm9wZXJ0aWVzW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiBqb2IucHJvcGVydGllc1trZXldLnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHR5cGUgb2YgYSBwcm9wZXJ0eS5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogam9iLnNldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIsIDEyMzQ1Nik7XG4gICAgICpcbiAgICAgKiBjb25zb2xlLmxvZyhqb2IuZ2V0UHJvcGVydHlUeXBlKFwiTXkgSm9iIE51bWJlclwiKSk7XG4gICAgICogLy8gXCJudW1iZXJcIlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5VHlwZShrZXk6IHN0cmluZykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgaWYgKGpvYi5wcm9wZXJ0aWVzW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiBqb2IucHJvcGVydGllc1trZXldLmdldFR5cGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFja3MgdGhlIGpvYiBpbnN0YW5jZSBhbmQgZmlsZSB0b2dldGhlciBpbiBhIHppcC5cbiAgICAgKiBSZXR1cm5zIGEgUGFja0pvYiBpbiB0aGUgcGFyYW1ldGVyIG9mIHRoZSBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5wYWNrKGZ1bmN0aW9uKHBhY2tKb2Ipe1xuICAgICAqICAgICAgcGFja0pvYi5tb3ZlKHBhY2tlZF9mb2xkZXJfbmVzdCk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIHBhY2soY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBQYWNrZWRKb2IgPSByZXF1aXJlKFwiLi9wYWNrZWRKb2JcIikuUGFja2VkSm9iO1xuICAgICAgICBsZXQgcGogPSBuZXcgUGFja2VkSm9iKGpvYi5lLCBqb2IpO1xuICAgICAgICBwai5leGVjUGFjaygoKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhwaik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVucGFja3MgYSBwYWNrZWQgam9iLiBSZXR1cm5zIGEgdGhlIG9yaWdpbmFsIHVucGFja2VkIGpvYiBpbiB0aGUgcGFyYW1ldGVyIG9mIHRoZSBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIHBhY2tlZEpvYi51bnBhY2soZnVuY3Rpb24odW5wYWNrZWRKb2Ipe1xuICAgICAqICAgICBjb25zb2xlLmxvZyhcIlVucGFja2VkXCIsIHVucGFja2VkSm9iLm5hbWUpO1xuICAgICAqICAgICB1bnBhY2tlZEpvYi5tb3ZlKHVucGFja2VkX2ZvbGRlcik7XG4gICAgICogICAgIHBhY2tlZEpvYi5yZW1vdmUoKTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgdW5wYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgUGFja2VkSm9iID0gcmVxdWlyZShcIi4vcGFja2VkSm9iXCIpLlBhY2tlZEpvYjtcbiAgICAgICAgbGV0IHBqID0gbmV3IFBhY2tlZEpvYihqb2IuZSwgam9iKTtcbiAgICAgICAgcGouZXhlY1VucGFjaygodW5wYWNrZWRKb2IpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHVucGFja2VkSm9iKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBqb2Igb2JqZWN0IGFzIEpTT04gd2l0aCBjaXJjdWxhciByZWZlcmVuY2VzIHJlbW92ZWQuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SlNPTigpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBqc29uO1xuICAgICAgICBsZXQgcmVwbGFjZXIgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBGaWx0ZXJpbmcgb3V0IHByb3BlcnRpZXNcbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwibmVzdFwiIHx8IGtleSA9PT0gXCJlXCIgfHwga2V5ID09PSBcInR1bm5lbFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAganNvbiA9IEpTT04uc3RyaW5naWZ5KGpvYiwgcmVwbGFjZXIpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGpvYi5lLmxvZygzLCBgZ2V0SlNPTiBzdHJpbmdpZnkgZXJyb3I6ICR7ZXJyfWAsIGpvYik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ganNvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNGaWxlKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc0ZvbGRlcigpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RmlsZXMoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEZpbGUoaW5kZXg6IGFueSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQYXRoKHBhdGg6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgbWVzc2FnZSB0byB0aGUgbG9nIHdpdGggdGhpcyBqb2IgYXMgdGhlIGFjdG9yLlxuICAgICAqIEBwYXJhbSBsZXZlbCAgICAgICAgICAgICAwID0gZGVidWcsIDEgPSBpbmZvLCAyLCA9IHdhcm5pbmcsIDMgPSBlcnJvclxuICAgICAqIEBwYXJhbSBtZXNzYWdlICAgICAgICAgICBMb2cgbWVzc2FnZVxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgcHVibGljIGxvZyhsZXZlbDogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBqb2IuZS5sb2cobGV2ZWwsIG1lc3NhZ2UsIGpvYik7XG4gICAgfVxufSJdfQ==
