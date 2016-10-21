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
        j.createLifeEvent("created", null, name);
        j.e.log(1, "New Job \"" + name + "\" created.", j);
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
        job.setTunnel(tunnel);
        tunnel.arrive(job, null);
        job.e.log(1, "Transferred to Tunnel \"" + tunnel.getName() + "\".", job, [oldTunnel]);
        job.createLifeEvent("transfer", oldTunnel.getName(), tunnel.getName());
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
     */
    Job.prototype.getPack = function () {
        var job = this;
        var PackedJob = require("./packedJob").PackedJob;
        return new PackedJob(job.e, job);
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
    return Job;
}());
exports.Job = Job;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLDhCQUE0QixHQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVMLFVBQUM7QUFBRCxDQWxVQSxBQWtVQyxJQUFBO0FBbFVxQixXQUFHLE1Ba1V4QixDQUFBIiwiZmlsZSI6ImxpYi9qb2Ivam9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVHVubmVsIH0gZnJvbSBcIi4uL3R1bm5lbC90dW5uZWxcIjtcbmltcG9ydCB7IE5lc3QgfSBmcm9tIFwiLi4vbmVzdC9uZXN0XCI7XG5pbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7TGlmZUV2ZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvbGlmZUV2ZW50XCI7XG5pbXBvcnQge0VtYWlsT3B0aW9uc30gZnJvbSBcIi4uL2Vudmlyb25tZW50L2VtYWlsT3B0aW9uc1wiO1xuaW1wb3J0IHtKb2JQcm9wZXJ0eX0gZnJvbSBcIi4vam9iUHJvcGVydHlcIjtcblxuLy8gSGFuZGxlIHRoZSBjaXJjdWxhciBkZXBlbmRlbmN5IGJ5IHN0YXNoaW5nIHRoZSB0eXBlIGluIGEgdmFyaWFibGUgZm9yIHJlcXVpcmluZyBsYXRlci5cbi8vIGltcG9ydCAqIGFzIFBhY2tlZEpvYlR5cGVzIGZyb20gXCIuL3BhY2tlZEpvYlwiO1xuLy8gbGV0IFBhY2tlZEpvYjogdHlwZW9mIFBhY2tlZEpvYlR5cGVzLlBhY2tlZEpvYjtcblxuY29uc3QgICBzaG9ydGlkID0gcmVxdWlyZShcInNob3J0aWRcIiksXG4gICAgICAgIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSm9iIHtcblxuICAgIHByb3RlY3RlZCBuYW1lOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIHR1bm5lbDogVHVubmVsO1xuICAgIHByb3RlY3RlZCBuZXN0OiBOZXN0O1xuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcbiAgICBwcm90ZWN0ZWQgbG9jYWxseUF2YWlsYWJsZTogYm9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgbGlmZUN5Y2xlOiBMaWZlRXZlbnRbXTtcbiAgICBwcm90ZWN0ZWQgaWQ6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgcHJvcGVydGllcztcblxuICAgIC8qKlxuICAgICAqIEpvYiBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqID0gdGhpcztcbiAgICAgICAgai5lID0gZTtcbiAgICAgICAgai5pZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgai5uYW1lID0gbmFtZTtcbiAgICAgICAgai5saWZlQ3ljbGUgPSBbXTtcbiAgICAgICAgai5wcm9wZXJ0aWVzID0ge307XG5cbiAgICAgICAgai5jcmVhdGVMaWZlRXZlbnQoXCJjcmVhdGVkXCIsIG51bGwsIG5hbWUpO1xuICAgICAgICBqLmUubG9nKDEsIGBOZXcgSm9iIFwiJHtuYW1lfVwiIGNyZWF0ZWQuYCwgaik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgbmFtZSBmb3IgbG9nZ2luZy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIFwiSm9iXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGxvY2FsbHkgYXZhaWxhYmxlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHB1YmxpYyBpc0xvY2FsbHlBdmFpbGFibGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvY2FsbHlBdmFpbGFibGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGlmIHRoZSBqb2IgaXMgbG9jYWxseSBhdmFpbGFibGUuXG4gICAgICogQHBhcmFtIGF2YWlsYWJsZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRMb2NhbGx5QXZhaWxhYmxlKGF2YWlsYWJsZTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLmxvY2FsbHlBdmFpbGFibGUgPSBhdmFpbGFibGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBsaWZlIGN5Y2xlIG9iamVjdC5cbiAgICAgKiBAcmV0dXJucyB7TGlmZUV2ZW50W119XG4gICAgICovXG4gICAgcHVibGljIGdldExpZmVDeWNsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlmZUN5Y2xlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBsaWZlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB2ZXJiXG4gICAgICogQHBhcmFtIHN0YXJ0XG4gICAgICogQHBhcmFtIGZpbmlzaFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVMaWZlRXZlbnQodmVyYjogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBmaW5pc2g6IHN0cmluZykge1xuICAgICAgICB0aGlzLmxpZmVDeWNsZS5wdXNoKG5ldyBMaWZlRXZlbnQodmVyYiwgc3RhcnQsIGZpbmlzaCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBuYW1lLlxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICovXG4gICAgcHVibGljIHNldE5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBJRC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuYW1lIHByb3Blci5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROYW1lUHJvcGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXROYW1lKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBuZXN0LlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHVibGljIHNldE5lc3QobmVzdDogTmVzdCkge1xuICAgICAgICB0aGlzLm5lc3QgPSBuZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmVzdC5cbiAgICAgKiBAcmV0dXJucyB7TmVzdH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TmVzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHR1bm5lbC5cbiAgICAgKiBAcGFyYW0gdHVubmVsXG4gICAgICovXG4gICAgcHVibGljIHNldFR1bm5lbCh0dW5uZWw6IFR1bm5lbCkge1xuICAgICAgICB0aGlzLnR1bm5lbCA9IHR1bm5lbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHR1bm5lbC5cbiAgICAgKiBAcmV0dXJucyB7VHVubmVsfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRUdW5uZWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR1bm5lbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBjYWxsIHRvIGZhaWwgYSBqb2Igd2hpbGUgaW4gYSB0dW5uZWwuXG4gICAgICogQHBhcmFtIHJlYXNvblxuICAgICAqL1xuICAgIHB1YmxpYyBmYWlsKHJlYXNvbjogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqID0gdGhpcztcbiAgICAgICAgaWYgKCFqLmdldFR1bm5lbCgpKSB7XG4gICAgICAgICAgICBqLmUubG9nKDMsIGBKb2IgXCIke2ouZ2V0TmFtZSgpfVwiIGZhaWxlZCBiZWZvcmUgdHVubmVsIHdhcyBzZXQuYCwgaik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFqLmdldE5lc3QoKSkge1xuICAgICAgICAgICAgai5lLmxvZygzLCBgSm9iIFwiJHtqLmdldE5hbWUoKX1cIiBkb2VzIG5vdCBoYXZlIGEgbmVzdC5gLCBqKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGoudHVubmVsLmV4ZWN1dGVGYWlsKGosIGouZ2V0TmVzdCgpLCByZWFzb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYW5zZmVyIGEgam9iIHRvIGFub3RoZXIgdHVubmVsIGRpcmVjdGx5LlxuICAgICAqIEBwYXJhbSB0dW5uZWxcbiAgICAgKi9cbiAgICBwdWJsaWMgdHJhbnNmZXIodHVubmVsOiBUdW5uZWwpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBvbGRUdW5uZWwgPSB0aGlzLmdldFR1bm5lbCgpO1xuICAgICAgICBqb2Iuc2V0VHVubmVsKHR1bm5lbCk7XG4gICAgICAgIHR1bm5lbC5hcnJpdmUoam9iLCBudWxsKTtcblxuICAgICAgICBqb2IuZS5sb2coMSwgYFRyYW5zZmVycmVkIHRvIFR1bm5lbCBcIiR7dHVubmVsLmdldE5hbWUoKX1cIi5gLCBqb2IsIFtvbGRUdW5uZWxdKTtcbiAgICAgICAgam9iLmNyZWF0ZUxpZmVFdmVudChcInRyYW5zZmVyXCIsIG9sZFR1bm5lbC5nZXROYW1lKCksIHR1bm5lbC5nZXROYW1lKCkpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogTW92ZSBmdW5jdGlvbiBlcnJvci5cbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZShkZXN0aW5hdGlvbk5lc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRocm93IFwiVGhpcyB0eXBlIG9mIGpvYiBjYW5ub3QgYmUgbW92ZWQuXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZHMgYW4gZW1haWwuXG4gICAgICogQHBhcmFtIGVtYWlsT3B0aW9ucyAgICAgIEVtYWlsIG9wdGlvbnNcbiAgICAgKiAjIyMjIFNlbmRpbmcgcHVnIHRlbXBsYXRlIGVtYWlsIGV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIC8vIG15X3R1bm5lbC5qc1xuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xuICAgICAqICAgICAgam9iLmVtYWlsKHtcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgZnJvbSBwdWcgdGVtcGxhdGVcIixcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXG4gICAgICogICAgICAgICAgdGVtcGxhdGU6IFwiLi90ZW1wbGF0ZV9maWxlcy9teV9lbWFpbC5wdWdcIlxuICAgICAqICAgICAgfSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIC8vIHRlbXBsYXRlX2ZpbGVzL215X2VtYWlsLnB1Z1xuICAgICAqIGgxPVwiRXhhbXBsZSBlbWFpbCFcIlxuICAgICAqIHA9XCJHb3Qgam9iIElEIFwiICsgam9iLmdldElkKClcbiAgICAgKiBgYGBcbiAgICAgKiAjIyMjIFNlbmRpbmcgcGxhaW4tdGV4dCBlbWFpbFxuICAgICAqIGBgYGpzXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XG4gICAgICogICAgICBqb2IuZW1haWwoe1xuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCB3aXRoIGhhcmQtY29kZWQgcGxhaW4tdGV4dFwiLFxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcbiAgICAgKiAgICAgICAgICB0ZXh0OiBcIk15IGVtYWlsIGJvZHkhXCJcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqICMjIyMgU2VuZGluZyBodG1sIGVtYWlsXG4gICAgICogYGBganNcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIHdpdGggaGFyZC1jb2RlZCBodG1sXCIsXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxuICAgICAqICAgICAgICAgIGh0bWw6IFwiPGgxPk15IGVtYWlsIGJvZHkhPC9oMT5cIlxuICAgICAqICAgICAgfSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGVtYWlsKGVtYWlsT3B0aW9uczogRW1haWxPcHRpb25zKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgZW1haWxlciA9IGpvYi5lLmdldEVtYWlsZXIoKTtcblxuICAgICAgICBlbWFpbGVyLnNlbmRNYWlsKGVtYWlsT3B0aW9ucywgam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggam9iIHNwZWNpZmljIGRhdGEgdG8gdGhlIGpvYiBpbnN0YW5jZS5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogam9iLnNldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIsIDEyMzQ1Nik7XG4gICAgICpcbiAgICAgKiBjb25zb2xlLmxvZyhqb2IuZ2V0UHJvcGVydHlWYWx1ZShcIk15IEpvYiBOdW1iZXJcIikpO1xuICAgICAqIC8vIDEyMzQ1NlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRQcm9wZXJ0eVZhbHVlKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgcHJvcCA9IG5ldyBKb2JQcm9wZXJ0eShrZXksIHZhbHVlKTtcblxuICAgICAgICBqb2IucHJvcGVydGllc1trZXldID0gcHJvcDtcbiAgICAgICAgam9iLmUubG9nKDEsIGBQcm9wZXJ0eSBcIiR7a2V5fVwiIGFkZGVkIHRvIGpvYiBwcm9wZXJ0aWVzLmAsIGpvYik7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGVudGlyZSBqb2IgcHJvcGVydHkgb2JqZWN0LlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJucyB7Sm9iUHJvcGVydHl9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5KGtleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXNba2V5XSBhcyBKb2JQcm9wZXJ0eTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaWYgaXQgaGFzIGJlZW4gcHJldmlvdXNseSBzZXQuXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5VmFsdWUoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGlmIChqb2IucHJvcGVydGllc1trZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gam9iLnByb3BlcnRpZXNba2V5XS52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB0eXBlIG9mIGEgcHJvcGVydHkuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5zZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiLCAxMjM0NTYpO1xuICAgICAqXG4gICAgICogY29uc29sZS5sb2coam9iLmdldFByb3BlcnR5VHlwZShcIk15IEpvYiBOdW1iZXJcIikpO1xuICAgICAqIC8vIFwibnVtYmVyXCJcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eVR5cGUoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGlmIChqb2IucHJvcGVydGllc1trZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gam9iLnByb3BlcnRpZXNba2V5XS5nZXRUeXBlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhY2tzIHRoZSBqb2IgaW5zdGFuY2UgYW5kIGZpbGUgdG9nZXRoZXIgaW4gYSB6aXAuXG4gICAgICovXG4gICAgcHVibGljIGdldFBhY2soKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgUGFja2VkSm9iID0gcmVxdWlyZShcIi4vcGFja2VkSm9iXCIpLlBhY2tlZEpvYjtcbiAgICAgICAgcmV0dXJuIG5ldyBQYWNrZWRKb2Ioam9iLmUsIGpvYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBqb2Igb2JqZWN0IGFzIEpTT04gd2l0aCBjaXJjdWxhciByZWZlcmVuY2VzIHJlbW92ZWQuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SlNPTigpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBqc29uO1xuICAgICAgICBsZXQgcmVwbGFjZXIgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBGaWx0ZXJpbmcgb3V0IHByb3BlcnRpZXNcbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwibmVzdFwiIHx8IGtleSA9PT0gXCJlXCIgfHwga2V5ID09PSBcInR1bm5lbFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAganNvbiA9IEpTT04uc3RyaW5naWZ5KGpvYiwgcmVwbGFjZXIpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGpvYi5lLmxvZygzLCBgZ2V0SlNPTiBzdHJpbmdpZnkgZXJyb3I6ICR7ZXJyfWAsIGpvYik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ganNvbjtcbiAgICB9XG5cbn0iXX0=
