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
        pj.pack(function () {
            callback(pj);
        });
    };
    Job.prototype.unpack = function (callback) {
        var job = this;
        var PackedJob = require("./packedJob").PackedJob;
        var pj = new PackedJob(job.e, job);
        pj.unpack(function () {
            callback(pj);
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
    return Job;
}());
exports.Job = Job;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QU8sR0FBZCxVQUFlLElBQVk7UUFDdkIsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRUwsVUFBQztBQUFELENBaFhBLEFBZ1hDLElBQUE7QUFoWHFCLFdBQUcsTUFnWHhCLENBQUEiLCJmaWxlIjoibGliL2pvYi9qb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUdW5uZWwgfSBmcm9tIFwiLi4vdHVubmVsL3R1bm5lbFwiO1xuaW1wb3J0IHsgTmVzdCB9IGZyb20gXCIuLi9uZXN0L25lc3RcIjtcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtMaWZlRXZlbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9saWZlRXZlbnRcIjtcbmltcG9ydCB7RW1haWxPcHRpb25zfSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW1haWxPcHRpb25zXCI7XG5pbXBvcnQge0pvYlByb3BlcnR5fSBmcm9tIFwiLi9qb2JQcm9wZXJ0eVwiO1xuXG4vLyBIYW5kbGUgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY3kgYnkgc3Rhc2hpbmcgdGhlIHR5cGUgaW4gYSB2YXJpYWJsZSBmb3IgcmVxdWlyaW5nIGxhdGVyLlxuLy8gaW1wb3J0ICogYXMgUGFja2VkSm9iVHlwZXMgZnJvbSBcIi4vcGFja2VkSm9iXCI7XG4vLyBsZXQgUGFja2VkSm9iOiB0eXBlb2YgUGFja2VkSm9iVHlwZXMuUGFja2VkSm9iO1xuXG5jb25zdCAgIHNob3J0aWQgPSByZXF1aXJlKFwic2hvcnRpZFwiKSxcbiAgICAgICAgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBKb2Ige1xuXG4gICAgcHJvdGVjdGVkIG5hbWU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgdHVubmVsOiBUdW5uZWw7XG4gICAgcHJvdGVjdGVkIG5lc3Q6IE5lc3Q7XG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuICAgIHByb3RlY3RlZCBsb2NhbGx5QXZhaWxhYmxlOiBib29sZWFuO1xuICAgIHByb3RlY3RlZCBsaWZlQ3ljbGU6IExpZmVFdmVudFtdO1xuICAgIHByb3RlY3RlZCBpZDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBwcm9wZXJ0aWVzO1xuICAgIHByb3RlY3RlZCB0eXBlOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBKb2IgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIG5hbWU6IHN0cmluZykge1xuICAgICAgICBsZXQgaiA9IHRoaXM7XG4gICAgICAgIGouZSA9IGU7XG4gICAgICAgIGouaWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XG4gICAgICAgIGoubmFtZSA9IG5hbWU7XG4gICAgICAgIGoubGlmZUN5Y2xlID0gW107XG4gICAgICAgIGoucHJvcGVydGllcyA9IHt9O1xuICAgICAgICBqLnR5cGUgPSBcImJhc2VcIjtcblxuICAgICAgICBqLmNyZWF0ZUxpZmVFdmVudChcImNyZWF0ZWRcIiwgbnVsbCwgbmFtZSk7XG4gICAgICAgIGouZS5sb2coMSwgYE5ldyBKb2IgXCIke25hbWV9XCIgY3JlYXRlZC5gLCBqKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGFzcyBuYW1lIGZvciBsb2dnaW5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gXCJKb2JcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgbG9jYWxseSBhdmFpbGFibGUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzTG9jYWxseUF2YWlsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxseUF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgaWYgdGhlIGpvYiBpcyBsb2NhbGx5IGF2YWlsYWJsZS5cbiAgICAgKiBAcGFyYW0gYXZhaWxhYmxlXG4gICAgICovXG4gICAgcHVibGljIHNldExvY2FsbHlBdmFpbGFibGUoYXZhaWxhYmxlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMubG9jYWxseUF2YWlsYWJsZSA9IGF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGxpZmUgY3ljbGUgb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHtMaWZlRXZlbnRbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TGlmZUN5Y2xlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saWZlQ3ljbGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpZmUgZXZlbnQuXG4gICAgICogQHBhcmFtIHZlcmJcbiAgICAgKiBAcGFyYW0gc3RhcnRcbiAgICAgKiBAcGFyYW0gZmluaXNoXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUxpZmVFdmVudCh2ZXJiOiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGZpbmlzaDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMubGlmZUN5Y2xlLnB1c2gobmV3IExpZmVFdmVudCh2ZXJiLCBzdGFydCwgZmluaXNoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgbmV3IG5hbWUuXG4gICAgICogQHBhcmFtIG5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0TmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG5hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIElELlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldElkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG5hbWUgcHJvcGVyLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldE5hbWVQcm9wZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldE5hbWUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIG5lc3QuXG4gICAgICogQHBhcmFtIG5lc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0TmVzdChuZXN0OiBOZXN0KSB7XG4gICAgICAgIHRoaXMubmVzdCA9IG5lc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuZXN0LlxuICAgICAqIEByZXR1cm5zIHtOZXN0fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROZXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgdHVubmVsLlxuICAgICAqIEBwYXJhbSB0dW5uZWxcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VHVubmVsKHR1bm5lbDogVHVubmVsKSB7XG4gICAgICAgIHRoaXMudHVubmVsID0gdHVubmVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdHVubmVsLlxuICAgICAqIEByZXR1cm5zIHtUdW5uZWx9XG4gICAgICovXG4gICAgcHVibGljIGdldFR1bm5lbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHVubmVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGNhbGwgdG8gZmFpbCBhIGpvYiB3aGlsZSBpbiBhIHR1bm5lbC5cbiAgICAgKiBAcGFyYW0gcmVhc29uXG4gICAgICovXG4gICAgcHVibGljIGZhaWwocmVhc29uOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGogPSB0aGlzO1xuICAgICAgICBpZiAoIWouZ2V0VHVubmVsKCkpIHtcbiAgICAgICAgICAgIGouZS5sb2coMywgYEpvYiBcIiR7ai5nZXROYW1lKCl9XCIgZmFpbGVkIGJlZm9yZSB0dW5uZWwgd2FzIHNldC5gLCBqKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWouZ2V0TmVzdCgpKSB7XG4gICAgICAgICAgICBqLmUubG9nKDMsIGBKb2IgXCIke2ouZ2V0TmFtZSgpfVwiIGRvZXMgbm90IGhhdmUgYSBuZXN0LmAsIGopO1xuICAgICAgICB9XG5cbiAgICAgICAgai50dW5uZWwuZXhlY3V0ZUZhaWwoaiwgai5nZXROZXN0KCksIHJlYXNvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJhbnNmZXIgYSBqb2IgdG8gYW5vdGhlciB0dW5uZWwgZGlyZWN0bHkuXG4gICAgICogQHBhcmFtIHR1bm5lbFxuICAgICAqL1xuICAgIHB1YmxpYyB0cmFuc2Zlcih0dW5uZWw6IFR1bm5lbCkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IG9sZFR1bm5lbCA9IHRoaXMuZ2V0VHVubmVsKCk7XG4gICAgICAgIGpvYi5zZXRUdW5uZWwodHVubmVsKTtcbiAgICAgICAgdHVubmVsLmFycml2ZShqb2IsIG51bGwpO1xuXG4gICAgICAgIGpvYi5lLmxvZygxLCBgVHJhbnNmZXJyZWQgdG8gVHVubmVsIFwiJHt0dW5uZWwuZ2V0TmFtZSgpfVwiLmAsIGpvYiwgW29sZFR1bm5lbF0pO1xuICAgICAgICBqb2IuY3JlYXRlTGlmZUV2ZW50KFwidHJhbnNmZXJcIiwgb2xkVHVubmVsLmdldE5hbWUoKSwgdHVubmVsLmdldE5hbWUoKSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIGZ1bmN0aW9uIGVycm9yLlxuICAgICAqL1xuICAgIHB1YmxpYyBtb3ZlKGRlc3RpbmF0aW9uTmVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhyb3cgXCJUaGlzIHR5cGUgb2Ygam9iIGNhbm5vdCBiZSBtb3ZlZC5cIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyBhbiBlbWFpbC5cbiAgICAgKiBAcGFyYW0gZW1haWxPcHRpb25zICAgICAgRW1haWwgb3B0aW9uc1xuICAgICAqICMjIyMgU2VuZGluZyBwdWcgdGVtcGxhdGUgZW1haWwgZXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogLy8gbXlfdHVubmVsLmpzXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XG4gICAgICogICAgICBqb2IuZW1haWwoe1xuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCBmcm9tIHB1ZyB0ZW1wbGF0ZVwiLFxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcbiAgICAgKiAgICAgICAgICB0ZW1wbGF0ZTogXCIuL3RlbXBsYXRlX2ZpbGVzL215X2VtYWlsLnB1Z1wiXG4gICAgICogICAgICB9KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogLy8gdGVtcGxhdGVfZmlsZXMvbXlfZW1haWwucHVnXG4gICAgICogaDE9XCJFeGFtcGxlIGVtYWlsIVwiXG4gICAgICogcD1cIkdvdCBqb2IgSUQgXCIgKyBqb2IuZ2V0SWQoKVxuICAgICAqIGBgYFxuICAgICAqICMjIyMgU2VuZGluZyBwbGFpbi10ZXh0IGVtYWlsXG4gICAgICogYGBganNcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIHdpdGggaGFyZC1jb2RlZCBwbGFpbi10ZXh0XCIsXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxuICAgICAqICAgICAgICAgIHRleHQ6IFwiTXkgZW1haWwgYm9keSFcIlxuICAgICAqICAgICAgfSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICogIyMjIyBTZW5kaW5nIGh0bWwgZW1haWxcbiAgICAgKiBgYGBqc1xuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xuICAgICAqICAgICAgam9iLmVtYWlsKHtcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgd2l0aCBoYXJkLWNvZGVkIGh0bWxcIixcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXG4gICAgICogICAgICAgICAgaHRtbDogXCI8aDE+TXkgZW1haWwgYm9keSE8L2gxPlwiXG4gICAgICogICAgICB9KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgZW1haWwoZW1haWxPcHRpb25zOiBFbWFpbE9wdGlvbnMpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBlbWFpbGVyID0gam9iLmUuZ2V0RW1haWxlcigpO1xuXG4gICAgICAgIGVtYWlsZXIuc2VuZE1haWwoZW1haWxPcHRpb25zLCBqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBqb2Igc3BlY2lmaWMgZGF0YSB0byB0aGUgam9iIGluc3RhbmNlLlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiBqb2Iuc2V0UHJvcGVydHlWYWx1ZShcIk15IEpvYiBOdW1iZXJcIiwgMTIzNDU2KTtcbiAgICAgKlxuICAgICAqIGNvbnNvbGUubG9nKGpvYi5nZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiKSk7XG4gICAgICogLy8gMTIzNDU2XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIHZhbHVlXG4gICAgICovXG4gICAgcHVibGljIHNldFByb3BlcnR5VmFsdWUoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBwcm9wID0gbmV3IEpvYlByb3BlcnR5KGtleSwgdmFsdWUpO1xuXG4gICAgICAgIGpvYi5wcm9wZXJ0aWVzW2tleV0gPSBwcm9wO1xuICAgICAgICBqb2IuZS5sb2coMSwgYFByb3BlcnR5IFwiJHtrZXl9XCIgYWRkZWQgdG8gam9iIHByb3BlcnRpZXMuYCwgam9iKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZW50aXJlIGpvYiBwcm9wZXJ0eSBvYmplY3QuXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHtKb2JQcm9wZXJ0eX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UHJvcGVydHkoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllc1trZXldIGFzIEpvYlByb3BlcnR5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpZiBpdCBoYXMgYmVlbiBwcmV2aW91c2x5IHNldC5cbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UHJvcGVydHlWYWx1ZShrZXk6IHN0cmluZykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgaWYgKGpvYi5wcm9wZXJ0aWVzW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiBqb2IucHJvcGVydGllc1trZXldLnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHR5cGUgb2YgYSBwcm9wZXJ0eS5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogam9iLnNldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIsIDEyMzQ1Nik7XG4gICAgICpcbiAgICAgKiBjb25zb2xlLmxvZyhqb2IuZ2V0UHJvcGVydHlUeXBlKFwiTXkgSm9iIE51bWJlclwiKSk7XG4gICAgICogLy8gXCJudW1iZXJcIlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldFByb3BlcnR5VHlwZShrZXk6IHN0cmluZykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgaWYgKGpvYi5wcm9wZXJ0aWVzW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiBqb2IucHJvcGVydGllc1trZXldLmdldFR5cGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFja3MgdGhlIGpvYiBpbnN0YW5jZSBhbmQgZmlsZSB0b2dldGhlciBpbiBhIHppcC5cbiAgICAgKiBSZXR1cm5zIGEgUGFja0pvYiBpbiB0aGUgcGFyYW1ldGVyIG9mIHRoZSBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5wYWNrKGZ1bmN0aW9uKHBhY2tKb2Ipe1xuICAgICAqICAgICAgcGFja0pvYi5tb3ZlKHBhY2tlZF9mb2xkZXJfbmVzdCk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIHBhY2soY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGpvYiA9IHRoaXM7XG4gICAgICAgIGxldCBQYWNrZWRKb2IgPSByZXF1aXJlKFwiLi9wYWNrZWRKb2JcIikuUGFja2VkSm9iO1xuICAgICAgICBsZXQgcGogPSBuZXcgUGFja2VkSm9iKGpvYi5lLCBqb2IpO1xuICAgICAgICBwai5wYWNrKCgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHBqKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHVucGFjayhjYWxsYmFjaykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IFBhY2tlZEpvYiA9IHJlcXVpcmUoXCIuL3BhY2tlZEpvYlwiKS5QYWNrZWRKb2I7XG4gICAgICAgIGxldCBwaiA9IG5ldyBQYWNrZWRKb2Ioam9iLmUsIGpvYik7XG4gICAgICAgIHBqLnVucGFjaygoKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhwaik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgam9iIG9iamVjdCBhcyBKU09OIHdpdGggY2lyY3VsYXIgcmVmZXJlbmNlcyByZW1vdmVkLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldEpTT04oKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQganNvbjtcbiAgICAgICAgbGV0IHJlcGxhY2VyID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gRmlsdGVyaW5nIG91dCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcIm5lc3RcIiB8fCBrZXkgPT09IFwiZVwiIHx8IGtleSA9PT0gXCJ0dW5uZWxcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGpzb24gPSBKU09OLnN0cmluZ2lmeShqb2IsIHJlcGxhY2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBqb2IuZS5sb2coMywgYGdldEpTT04gc3RyaW5naWZ5IGVycm9yOiAke2Vycn1gLCBqb2IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpzb247XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBhdGgoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGlzRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNGb2xkZXIoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEZpbGVzKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRGaWxlKGluZGV4OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0UGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbn0iXX0=
