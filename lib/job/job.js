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
        j.name = name;
        j.lifeCycle = [];
        j.properties = {};
        j.type = "base";
        j.createLifeEvent("created", null, name);
        j.e.log(1, "New Job \"" + name + "\" created, id: " + j.id + ".", j);
    }
    /**
     * Class name for logging.
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
    /**
     * Set a new name.
     * @param name
     */
    Job.prototype.setName = function (name) {
        this.name = name;
    };
    /**
     * Get the name.
     * @returns {string}
     */
    Job.prototype.getName = function () {
        return this.name;
    };
    /**
     * Get the ID.
     * @returns {string}
     */
    Job.prototype.getId = function () {
        return this.id;
    };
    /**
     * Get the name proper.
     * @returns {string}
     */
    Job.prototype.getNameProper = function () {
        return this.getName();
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
            j.e.log(3, "Job \"" + j.getName() + "\" failed before tunnel was set.", j);
        }
        if (!j.getNest()) {
            j.e.log(3, "Job \"" + j.getName() + "\" does not have a nest.", j);
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
            oldTunnelName = oldTunnel.getName();
        }
        job.setTunnel(tunnel);
        tunnel.arrive(job, null);
        job.e.log(1, "Transferred to Tunnel \"" + tunnel.getName() + "\".", job, [oldTunnel]);
        job.createLifeEvent("transfer", oldTunnelName, tunnel.getName());
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
     *          template: "./template_files/my_email.pug"
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
    return Job;
}());
exports.Job = Job;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLDhCQUE0QixHQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLHFCQUFPLEdBQWQ7UUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFTSxvQkFBTSxHQUFiO1FBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRU0sc0JBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVNLHNCQUFRLEdBQWY7UUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFTSxxQkFBTyxHQUFkLFVBQWUsS0FBVTtRQUNyQixNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFTSxxQkFBTyxHQUFkLFVBQWUsSUFBWTtRQUN2QixNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFTSxvQkFBTSxHQUFiLFVBQWMsSUFBWTtRQUN0QixNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFTCxVQUFDO0FBQUQsQ0FwWUEsQUFvWUMsSUFBQTtBQXBZcUIsV0FBRyxNQW9ZeEIsQ0FBQSIsImZpbGUiOiJsaWIvam9iL2pvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFR1bm5lbCB9IGZyb20gXCIuLi90dW5uZWwvdHVubmVsXCI7XG5pbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4uL25lc3QvbmVzdFwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0xpZmVFdmVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2xpZmVFdmVudFwiO1xuaW1wb3J0IHtFbWFpbE9wdGlvbnN9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbWFpbE9wdGlvbnNcIjtcbmltcG9ydCB7Sm9iUHJvcGVydHl9IGZyb20gXCIuL2pvYlByb3BlcnR5XCI7XG5cbi8vIEhhbmRsZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeSBieSBzdGFzaGluZyB0aGUgdHlwZSBpbiBhIHZhcmlhYmxlIGZvciByZXF1aXJpbmcgbGF0ZXIuXG4vLyBpbXBvcnQgKiBhcyBQYWNrZWRKb2JUeXBlcyBmcm9tIFwiLi9wYWNrZWRKb2JcIjtcbi8vIGxldCBQYWNrZWRKb2I6IHR5cGVvZiBQYWNrZWRKb2JUeXBlcy5QYWNrZWRKb2I7XG5cbmNvbnN0ICAgc2hvcnRpZCA9IHJlcXVpcmUoXCJzaG9ydGlkXCIpLFxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEpvYiB7XG5cbiAgICBwcm90ZWN0ZWQgbmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCB0dW5uZWw6IFR1bm5lbDtcbiAgICBwcm90ZWN0ZWQgbmVzdDogTmVzdDtcbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG4gICAgcHJvdGVjdGVkIGxvY2FsbHlBdmFpbGFibGU6IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIGxpZmVDeWNsZTogTGlmZUV2ZW50W107XG4gICAgcHJvdGVjdGVkIGlkOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIHByb3BlcnRpZXM7XG4gICAgcHJvdGVjdGVkIHR5cGU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEpvYiBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqID0gdGhpcztcbiAgICAgICAgai5lID0gZTtcbiAgICAgICAgai5pZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgai5uYW1lID0gbmFtZTtcbiAgICAgICAgai5saWZlQ3ljbGUgPSBbXTtcbiAgICAgICAgai5wcm9wZXJ0aWVzID0ge307XG4gICAgICAgIGoudHlwZSA9IFwiYmFzZVwiO1xuXG4gICAgICAgIGouY3JlYXRlTGlmZUV2ZW50KFwiY3JlYXRlZFwiLCBudWxsLCBuYW1lKTtcbiAgICAgICAgai5lLmxvZygxLCBgTmV3IEpvYiBcIiR7bmFtZX1cIiBjcmVhdGVkLCBpZDogJHtqLmlkfS5gLCBqKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGFzcyBuYW1lIGZvciBsb2dnaW5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gXCJKb2JcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgbG9jYWxseSBhdmFpbGFibGUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzTG9jYWxseUF2YWlsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxseUF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgaWYgdGhlIGpvYiBpcyBsb2NhbGx5IGF2YWlsYWJsZS5cbiAgICAgKiBAcGFyYW0gYXZhaWxhYmxlXG4gICAgICovXG4gICAgcHVibGljIHNldExvY2FsbHlBdmFpbGFibGUoYXZhaWxhYmxlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMubG9jYWxseUF2YWlsYWJsZSA9IGF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGxpZmUgY3ljbGUgb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHtMaWZlRXZlbnRbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TGlmZUN5Y2xlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saWZlQ3ljbGU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldExpZmVDeWNsZShldmVudHM6IExpZmVFdmVudFtdKSB7XG4gICAgICAgIHRoaXMubGlmZUN5Y2xlID0gZXZlbnRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBsaWZlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB2ZXJiXG4gICAgICogQHBhcmFtIHN0YXJ0XG4gICAgICogQHBhcmFtIGZpbmlzaFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVMaWZlRXZlbnQodmVyYjogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBmaW5pc2g6IHN0cmluZykge1xuICAgICAgICB0aGlzLmxpZmVDeWNsZS5wdXNoKG5ldyBMaWZlRXZlbnQodmVyYiwgc3RhcnQsIGZpbmlzaCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBuYW1lLlxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICovXG4gICAgcHVibGljIHNldE5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBJRC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuYW1lIHByb3Blci5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROYW1lUHJvcGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXROYW1lKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBuZXN0LlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHVibGljIHNldE5lc3QobmVzdDogTmVzdCkge1xuICAgICAgICB0aGlzLm5lc3QgPSBuZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmVzdC5cbiAgICAgKiBAcmV0dXJucyB7TmVzdH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TmVzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHR1bm5lbC5cbiAgICAgKiBAcGFyYW0gdHVubmVsXG4gICAgICovXG4gICAgcHVibGljIHNldFR1bm5lbCh0dW5uZWw6IFR1bm5lbCkge1xuICAgICAgICB0aGlzLnR1bm5lbCA9IHR1bm5lbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHR1bm5lbC5cbiAgICAgKiBAcmV0dXJucyB7VHVubmVsfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRUdW5uZWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR1bm5lbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBjYWxsIHRvIGZhaWwgYSBqb2Igd2hpbGUgaW4gYSB0dW5uZWwuXG4gICAgICogQHBhcmFtIHJlYXNvblxuICAgICAqL1xuICAgIHB1YmxpYyBmYWlsKHJlYXNvbjogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqID0gdGhpcztcbiAgICAgICAgaWYgKCFqLmdldFR1bm5lbCgpKSB7XG4gICAgICAgICAgICBqLmUubG9nKDMsIGBKb2IgXCIke2ouZ2V0TmFtZSgpfVwiIGZhaWxlZCBiZWZvcmUgdHVubmVsIHdhcyBzZXQuYCwgaik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFqLmdldE5lc3QoKSkge1xuICAgICAgICAgICAgai5lLmxvZygzLCBgSm9iIFwiJHtqLmdldE5hbWUoKX1cIiBkb2VzIG5vdCBoYXZlIGEgbmVzdC5gLCBqKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGoudHVubmVsLmV4ZWN1dGVGYWlsKGosIGouZ2V0TmVzdCgpLCByZWFzb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYW5zZmVyIGEgam9iIHRvIGFub3RoZXIgdHVubmVsIGRpcmVjdGx5LlxuICAgICAqIEBwYXJhbSB0dW5uZWxcbiAgICAgKi9cbiAgICBwdWJsaWMgdHJhbnNmZXIodHVubmVsOiBUdW5uZWwpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBvbGRUdW5uZWwgPSB0aGlzLmdldFR1bm5lbCgpO1xuXG4gICAgICAgIGxldCBvbGRUdW5uZWxOYW1lID0gXCJcIjtcbiAgICAgICAgaWYgKG9sZFR1bm5lbCkge1xuICAgICAgICAgICAgb2xkVHVubmVsTmFtZSA9IG9sZFR1bm5lbC5nZXROYW1lKCk7XG4gICAgICAgIH1cblxuICAgICAgICBqb2Iuc2V0VHVubmVsKHR1bm5lbCk7XG4gICAgICAgIHR1bm5lbC5hcnJpdmUoam9iLCBudWxsKTtcblxuICAgICAgICBqb2IuZS5sb2coMSwgYFRyYW5zZmVycmVkIHRvIFR1bm5lbCBcIiR7dHVubmVsLmdldE5hbWUoKX1cIi5gLCBqb2IsIFtvbGRUdW5uZWxdKTtcbiAgICAgICAgam9iLmNyZWF0ZUxpZmVFdmVudChcInRyYW5zZmVyXCIsIG9sZFR1bm5lbE5hbWUsIHR1bm5lbC5nZXROYW1lKCkpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogTW92ZSBmdW5jdGlvbiBlcnJvci5cbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZShkZXN0aW5hdGlvbk5lc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRocm93IFwiVGhpcyB0eXBlIG9mIGpvYiBjYW5ub3QgYmUgbW92ZWQuXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZHMgYW4gZW1haWwuXG4gICAgICogQHBhcmFtIGVtYWlsT3B0aW9ucyAgICAgIEVtYWlsIG9wdGlvbnNcbiAgICAgKiAjIyMjIFNlbmRpbmcgcHVnIHRlbXBsYXRlIGVtYWlsIGV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIC8vIG15X3R1bm5lbC5qc1xuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xuICAgICAqICAgICAgam9iLmVtYWlsKHtcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgZnJvbSBwdWcgdGVtcGxhdGVcIixcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXG4gICAgICogICAgICAgICAgdGVtcGxhdGU6IFwiLi90ZW1wbGF0ZV9maWxlcy9teV9lbWFpbC5wdWdcIlxuICAgICAqICAgICAgfSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIC8vIHRlbXBsYXRlX2ZpbGVzL215X2VtYWlsLnB1Z1xuICAgICAqIGgxPVwiRXhhbXBsZSBlbWFpbCFcIlxuICAgICAqIHA9XCJHb3Qgam9iIElEIFwiICsgam9iLmdldElkKClcbiAgICAgKiBgYGBcbiAgICAgKiAjIyMjIFNlbmRpbmcgcGxhaW4tdGV4dCBlbWFpbFxuICAgICAqIGBgYGpzXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XG4gICAgICogICAgICBqb2IuZW1haWwoe1xuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCB3aXRoIGhhcmQtY29kZWQgcGxhaW4tdGV4dFwiLFxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcbiAgICAgKiAgICAgICAgICB0ZXh0OiBcIk15IGVtYWlsIGJvZHkhXCJcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqICMjIyMgU2VuZGluZyBodG1sIGVtYWlsXG4gICAgICogYGBganNcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIHdpdGggaGFyZC1jb2RlZCBodG1sXCIsXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxuICAgICAqICAgICAgICAgIGh0bWw6IFwiPGgxPk15IGVtYWlsIGJvZHkhPC9oMT5cIlxuICAgICAqICAgICAgfSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGVtYWlsKGVtYWlsT3B0aW9uczogRW1haWxPcHRpb25zKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgZW1haWxlciA9IGpvYi5lLmdldEVtYWlsZXIoKTtcblxuICAgICAgICBlbWFpbGVyLnNlbmRNYWlsKGVtYWlsT3B0aW9ucywgam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggam9iIHNwZWNpZmljIGRhdGEgdG8gdGhlIGpvYiBpbnN0YW5jZS5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogam9iLnNldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIsIDEyMzQ1Nik7XG4gICAgICpcbiAgICAgKiBjb25zb2xlLmxvZyhqb2IuZ2V0UHJvcGVydHlWYWx1ZShcIk15IEpvYiBOdW1iZXJcIikpO1xuICAgICAqIC8vIDEyMzQ1NlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRQcm9wZXJ0eVZhbHVlKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgcHJvcCA9IG5ldyBKb2JQcm9wZXJ0eShrZXksIHZhbHVlKTtcblxuICAgICAgICBqb2IucHJvcGVydGllc1trZXldID0gcHJvcDtcbiAgICAgICAgam9iLmUubG9nKDEsIGBQcm9wZXJ0eSBcIiR7a2V5fVwiIGFkZGVkIHRvIGpvYiBwcm9wZXJ0aWVzLmAsIGpvYik7XG4gICAgfVxuXG4gICAgcHVibGljIHNldFByb3BlcnR5VmFsdWVzKHByb3BlcnRpZXM6IE9iamVjdCkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgam9iLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuICAgICAgICBqb2IuZS5sb2coMCwgYFJlc3RvcmVkICR7T2JqZWN0LmtleXMoam9iLnByb3BlcnRpZXMpLmxlbmd0aH0gcHJvcGVydGllcy5gLCBqb2IpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBlbnRpcmUgam9iIHByb3BlcnR5IG9iamVjdC5cbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnMge0pvYlByb3BlcnR5fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eShrZXk6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzW2tleV0gYXMgSm9iUHJvcGVydHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGlmIGl0IGhhcyBiZWVuIHByZXZpb3VzbHkgc2V0LlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eVZhbHVlKGtleTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBpZiAoam9iLnByb3BlcnRpZXNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGpvYi5wcm9wZXJ0aWVzW2tleV0udmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdHlwZSBvZiBhIHByb3BlcnR5LlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiBqb2Iuc2V0UHJvcGVydHlWYWx1ZShcIk15IEpvYiBOdW1iZXJcIiwgMTIzNDU2KTtcbiAgICAgKlxuICAgICAqIGNvbnNvbGUubG9nKGpvYi5nZXRQcm9wZXJ0eVR5cGUoXCJNeSBKb2IgTnVtYmVyXCIpKTtcbiAgICAgKiAvLyBcIm51bWJlclwiXG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UHJvcGVydHlUeXBlKGtleTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBpZiAoam9iLnByb3BlcnRpZXNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGpvYi5wcm9wZXJ0aWVzW2tleV0uZ2V0VHlwZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYWNrcyB0aGUgam9iIGluc3RhbmNlIGFuZCBmaWxlIHRvZ2V0aGVyIGluIGEgemlwLlxuICAgICAqIFJldHVybnMgYSBQYWNrSm9iIGluIHRoZSBwYXJhbWV0ZXIgb2YgdGhlIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogam9iLnBhY2soZnVuY3Rpb24ocGFja0pvYil7XG4gICAgICogICAgICBwYWNrSm9iLm1vdmUocGFja2VkX2ZvbGRlcl9uZXN0KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgcGFjayhjYWxsYmFjaykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IFBhY2tlZEpvYiA9IHJlcXVpcmUoXCIuL3BhY2tlZEpvYlwiKS5QYWNrZWRKb2I7XG4gICAgICAgIGxldCBwaiA9IG5ldyBQYWNrZWRKb2Ioam9iLmUsIGpvYik7XG4gICAgICAgIHBqLmV4ZWNQYWNrKCgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHBqKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHVucGFjayhjYWxsYmFjaykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IFBhY2tlZEpvYiA9IHJlcXVpcmUoXCIuL3BhY2tlZEpvYlwiKS5QYWNrZWRKb2I7XG4gICAgICAgIGxldCBwaiA9IG5ldyBQYWNrZWRKb2Ioam9iLmUsIGpvYik7XG4gICAgICAgIHBqLmV4ZWNVbnBhY2soKHVucGFja2VkSm9iKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayh1bnBhY2tlZEpvYik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgam9iIG9iamVjdCBhcyBKU09OIHdpdGggY2lyY3VsYXIgcmVmZXJlbmNlcyByZW1vdmVkLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldEpTT04oKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQganNvbjtcbiAgICAgICAgbGV0IHJlcGxhY2VyID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gRmlsdGVyaW5nIG91dCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcIm5lc3RcIiB8fCBrZXkgPT09IFwiZVwiIHx8IGtleSA9PT0gXCJ0dW5uZWxcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGpzb24gPSBKU09OLnN0cmluZ2lmeShqb2IsIHJlcGxhY2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBqb2IuZS5sb2coMywgYGdldEpTT04gc3RyaW5naWZ5IGVycm9yOiAke2Vycn1gLCBqb2IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpzb247XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBhdGgoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGlzRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNGb2xkZXIoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEZpbGVzKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRGaWxlKGluZGV4OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0UGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxufSJdfQ==
