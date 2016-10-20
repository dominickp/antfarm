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
        return new PackedJob(job.e, "whatever");
    };
    return Job;
}());
exports.Job = Job;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFLLENBQUM7UUFDckMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7O09BYUc7SUFDSSw2QkFBZSxHQUF0QixVQUF1QixHQUFXO1FBQzlCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztRQUNmLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNJLHFCQUFPLEdBQWQ7UUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDZixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFTCxVQUFDO0FBQUQsQ0ExU0EsQUEwU0MsSUFBQTtBQTFTcUIsV0FBRyxNQTBTeEIsQ0FBQSIsImZpbGUiOiJsaWIvam9iL2pvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFR1bm5lbCB9IGZyb20gXCIuLi90dW5uZWwvdHVubmVsXCI7XG5pbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4uL25lc3QvbmVzdFwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0xpZmVFdmVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2xpZmVFdmVudFwiO1xuaW1wb3J0IHtFbWFpbE9wdGlvbnN9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbWFpbE9wdGlvbnNcIjtcbmltcG9ydCB7Sm9iUHJvcGVydHl9IGZyb20gXCIuL2pvYlByb3BlcnR5XCI7XG5cbi8vIEhhbmRsZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeSBieSBzdGFzaGluZyB0aGUgdHlwZSBpbiBhIHZhcmlhYmxlIGZvciByZXF1aXJpbmcgbGF0ZXIuXG4vLyBpbXBvcnQgKiBhcyBQYWNrZWRKb2JUeXBlcyBmcm9tIFwiLi9wYWNrZWRKb2JcIjtcbi8vIGxldCBQYWNrZWRKb2I6IHR5cGVvZiBQYWNrZWRKb2JUeXBlcy5QYWNrZWRKb2I7XG5cbmNvbnN0ICAgc2hvcnRpZCA9IHJlcXVpcmUoXCJzaG9ydGlkXCIpLFxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEpvYiB7XG5cbiAgICBwcm90ZWN0ZWQgbmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCB0dW5uZWw6IFR1bm5lbDtcbiAgICBwcm90ZWN0ZWQgbmVzdDogTmVzdDtcbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG4gICAgcHJvdGVjdGVkIGxvY2FsbHlBdmFpbGFibGU6IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIGxpZmVDeWNsZTogTGlmZUV2ZW50W107XG4gICAgcHJvdGVjdGVkIGlkOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIHByb3BlcnRpZXM7XG5cbiAgICAvKipcbiAgICAgKiBKb2IgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIG5hbWU6IHN0cmluZykge1xuICAgICAgICBsZXQgaiA9IHRoaXM7XG4gICAgICAgIGouZSA9IGU7XG4gICAgICAgIGouaWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XG4gICAgICAgIGoubmFtZSA9IG5hbWU7XG4gICAgICAgIGoubGlmZUN5Y2xlID0gW107XG4gICAgICAgIGoucHJvcGVydGllcyA9IHt9O1xuXG4gICAgICAgIGouY3JlYXRlTGlmZUV2ZW50KFwiY3JlYXRlZFwiLCBudWxsLCBuYW1lKTtcbiAgICAgICAgai5lLmxvZygxLCBgTmV3IEpvYiBcIiR7bmFtZX1cIiBjcmVhdGVkLmAsIGopO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsYXNzIG5hbWUgZm9yIGxvZ2dpbmcuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBcIkpvYlwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGpvYiBpcyBsb2NhbGx5IGF2YWlsYWJsZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNMb2NhbGx5QXZhaWxhYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGx5QXZhaWxhYmxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBpZiB0aGUgam9iIGlzIGxvY2FsbHkgYXZhaWxhYmxlLlxuICAgICAqIEBwYXJhbSBhdmFpbGFibGVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0TG9jYWxseUF2YWlsYWJsZShhdmFpbGFibGU6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5sb2NhbGx5QXZhaWxhYmxlID0gYXZhaWxhYmxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbGlmZSBjeWNsZSBvYmplY3QuXG4gICAgICogQHJldHVybnMge0xpZmVFdmVudFtdfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRMaWZlQ3ljbGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpZmVDeWNsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlmZSBldmVudC5cbiAgICAgKiBAcGFyYW0gdmVyYlxuICAgICAqIEBwYXJhbSBzdGFydFxuICAgICAqIEBwYXJhbSBmaW5pc2hcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlTGlmZUV2ZW50KHZlcmI6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZmluaXNoOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5saWZlQ3ljbGUucHVzaChuZXcgTGlmZUV2ZW50KHZlcmIsIHN0YXJ0LCBmaW5pc2gpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBuZXcgbmFtZS5cbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXROYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgSUQuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmFtZSBwcm9wZXIuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TmFtZVByb3BlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TmFtZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgbmVzdC5cbiAgICAgKiBAcGFyYW0gbmVzdFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXROZXN0KG5lc3Q6IE5lc3QpIHtcbiAgICAgICAgdGhpcy5uZXN0ID0gbmVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG5lc3QuXG4gICAgICogQHJldHVybnMge05lc3R9XG4gICAgICovXG4gICAgcHVibGljIGdldE5lc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5lc3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSB0dW5uZWwuXG4gICAgICogQHBhcmFtIHR1bm5lbFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRUdW5uZWwodHVubmVsOiBUdW5uZWwpIHtcbiAgICAgICAgdGhpcy50dW5uZWwgPSB0dW5uZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB0dW5uZWwuXG4gICAgICogQHJldHVybnMge1R1bm5lbH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VHVubmVsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50dW5uZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gY2FsbCB0byBmYWlsIGEgam9iIHdoaWxlIGluIGEgdHVubmVsLlxuICAgICAqIEBwYXJhbSByZWFzb25cbiAgICAgKi9cbiAgICBwdWJsaWMgZmFpbChyZWFzb246IHN0cmluZykge1xuICAgICAgICBsZXQgaiA9IHRoaXM7XG4gICAgICAgIGlmICghai5nZXRUdW5uZWwoKSkge1xuICAgICAgICAgICAgai5lLmxvZygzLCBgSm9iIFwiJHtqLmdldE5hbWUoKX1cIiBmYWlsZWQgYmVmb3JlIHR1bm5lbCB3YXMgc2V0LmAsIGopO1xuICAgICAgICB9XG4gICAgICAgIGlmICghai5nZXROZXN0KCkpIHtcbiAgICAgICAgICAgIGouZS5sb2coMywgYEpvYiBcIiR7ai5nZXROYW1lKCl9XCIgZG9lcyBub3QgaGF2ZSBhIG5lc3QuYCwgaik7XG4gICAgICAgIH1cblxuICAgICAgICBqLnR1bm5lbC5leGVjdXRlRmFpbChqLCBqLmdldE5lc3QoKSwgcmVhc29uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2ZlciBhIGpvYiB0byBhbm90aGVyIHR1bm5lbCBkaXJlY3RseS5cbiAgICAgKiBAcGFyYW0gdHVubmVsXG4gICAgICovXG4gICAgcHVibGljIHRyYW5zZmVyKHR1bm5lbDogVHVubmVsKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBsZXQgb2xkVHVubmVsID0gdGhpcy5nZXRUdW5uZWwoKTtcbiAgICAgICAgam9iLnNldFR1bm5lbCh0dW5uZWwpO1xuICAgICAgICB0dW5uZWwuYXJyaXZlKGpvYiwgbnVsbCk7XG5cbiAgICAgICAgam9iLmUubG9nKDEsIGBUcmFuc2ZlcnJlZCB0byBUdW5uZWwgXCIke3R1bm5lbC5nZXROYW1lKCl9XCIuYCwgam9iLCBbb2xkVHVubmVsXSk7XG4gICAgICAgIGpvYi5jcmVhdGVMaWZlRXZlbnQoXCJ0cmFuc2ZlclwiLCBvbGRUdW5uZWwuZ2V0TmFtZSgpLCB0dW5uZWwuZ2V0TmFtZSgpKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIE1vdmUgZnVuY3Rpb24gZXJyb3IuXG4gICAgICovXG4gICAgcHVibGljIG1vdmUoZGVzdGluYXRpb25OZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB0aHJvdyBcIlRoaXMgdHlwZSBvZiBqb2IgY2Fubm90IGJlIG1vdmVkLlwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmRzIGFuIGVtYWlsLlxuICAgICAqIEBwYXJhbSBlbWFpbE9wdGlvbnMgICAgICBFbWFpbCBvcHRpb25zXG4gICAgICogIyMjIyBTZW5kaW5nIHB1ZyB0ZW1wbGF0ZSBlbWFpbCBleGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiAvLyBteV90dW5uZWwuanNcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uIChqb2IsIG5lc3QpIHtcbiAgICAgKiAgICAgIGpvYi5lbWFpbCh7XG4gICAgICogICAgICAgICAgc3ViamVjdDogXCJUZXN0IGVtYWlsIGZyb20gcHVnIHRlbXBsYXRlXCIsXG4gICAgICogICAgICAgICAgdG86IFwiam9obi5zbWl0aEBleGFtcGxlLmNvbVwiLFxuICAgICAqICAgICAgICAgIHRlbXBsYXRlOiBcIi4vdGVtcGxhdGVfZmlsZXMvbXlfZW1haWwucHVnXCJcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiAvLyB0ZW1wbGF0ZV9maWxlcy9teV9lbWFpbC5wdWdcbiAgICAgKiBoMT1cIkV4YW1wbGUgZW1haWwhXCJcbiAgICAgKiBwPVwiR290IGpvYiBJRCBcIiArIGpvYi5nZXRJZCgpXG4gICAgICogYGBgXG4gICAgICogIyMjIyBTZW5kaW5nIHBsYWluLXRleHQgZW1haWxcbiAgICAgKiBgYGBqc1xuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24gKGpvYiwgbmVzdCkge1xuICAgICAqICAgICAgam9iLmVtYWlsKHtcbiAgICAgKiAgICAgICAgICBzdWJqZWN0OiBcIlRlc3QgZW1haWwgd2l0aCBoYXJkLWNvZGVkIHBsYWluLXRleHRcIixcbiAgICAgKiAgICAgICAgICB0bzogXCJqb2huLnNtaXRoQGV4YW1wbGUuY29tXCIsXG4gICAgICogICAgICAgICAgdGV4dDogXCJNeSBlbWFpbCBib2R5IVwiXG4gICAgICogICAgICB9KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKiAjIyMjIFNlbmRpbmcgaHRtbCBlbWFpbFxuICAgICAqIGBgYGpzXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbiAoam9iLCBuZXN0KSB7XG4gICAgICogICAgICBqb2IuZW1haWwoe1xuICAgICAqICAgICAgICAgIHN1YmplY3Q6IFwiVGVzdCBlbWFpbCB3aXRoIGhhcmQtY29kZWQgaHRtbFwiLFxuICAgICAqICAgICAgICAgIHRvOiBcImpvaG4uc21pdGhAZXhhbXBsZS5jb21cIixcbiAgICAgKiAgICAgICAgICBodG1sOiBcIjxoMT5NeSBlbWFpbCBib2R5ITwvaDE+XCJcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBlbWFpbChlbWFpbE9wdGlvbnM6IEVtYWlsT3B0aW9ucykge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IGVtYWlsZXIgPSBqb2IuZS5nZXRFbWFpbGVyKCk7XG5cbiAgICAgICAgZW1haWxlci5zZW5kTWFpbChlbWFpbE9wdGlvbnMsIGpvYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGpvYiBzcGVjaWZpYyBkYXRhIHRvIHRoZSBqb2IgaW5zdGFuY2UuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5zZXRQcm9wZXJ0eVZhbHVlKFwiTXkgSm9iIE51bWJlclwiLCAxMjM0NTYpO1xuICAgICAqXG4gICAgICogY29uc29sZS5sb2coam9iLmdldFByb3BlcnR5VmFsdWUoXCJNeSBKb2IgTnVtYmVyXCIpKTtcbiAgICAgKiAvLyAxMjM0NTZcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UHJvcGVydHlWYWx1ZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IHByb3AgPSBuZXcgSm9iUHJvcGVydHkoa2V5LCB2YWx1ZSk7XG5cbiAgICAgICAgam9iLnByb3BlcnRpZXNba2V5XSA9IHByb3A7XG4gICAgICAgIGpvYi5lLmxvZygxLCBgUHJvcGVydHkgXCIke2tleX1cIiBhZGRlZCB0byBqb2IgcHJvcGVydGllcy5gLCBqb2IpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBlbnRpcmUgam9iIHByb3BlcnR5IG9iamVjdC5cbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnMge0pvYlByb3BlcnR5fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eShrZXk6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzW2tleV0gYXMgSm9iUHJvcGVydHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGlmIGl0IGhhcyBiZWVuIHByZXZpb3VzbHkgc2V0LlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQcm9wZXJ0eVZhbHVlKGtleTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBpZiAoam9iLnByb3BlcnRpZXNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGpvYi5wcm9wZXJ0aWVzW2tleV0udmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdHlwZSBvZiBhIHByb3BlcnR5LlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiBqb2Iuc2V0UHJvcGVydHlWYWx1ZShcIk15IEpvYiBOdW1iZXJcIiwgMTIzNDU2KTtcbiAgICAgKlxuICAgICAqIGNvbnNvbGUubG9nKGpvYi5nZXRQcm9wZXJ0eVR5cGUoXCJNeSBKb2IgTnVtYmVyXCIpKTtcbiAgICAgKiAvLyBcIm51bWJlclwiXG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UHJvcGVydHlUeXBlKGtleTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBqb2IgPSB0aGlzO1xuICAgICAgICBpZiAoam9iLnByb3BlcnRpZXNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGpvYi5wcm9wZXJ0aWVzW2tleV0uZ2V0VHlwZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYWNrcyB0aGUgam9iIGluc3RhbmNlIGFuZCBmaWxlIHRvZ2V0aGVyIGluIGEgemlwLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQYWNrKCkge1xuICAgICAgICBsZXQgam9iID0gdGhpcztcbiAgICAgICAgbGV0IFBhY2tlZEpvYiA9IHJlcXVpcmUoXCIuL3BhY2tlZEpvYlwiKS5QYWNrZWRKb2I7XG4gICAgICAgIHJldHVybiBuZXcgUGFja2VkSm9iKGpvYi5lLCBcIndoYXRldmVyXCIpO1xuICAgIH1cblxufSJdfQ==
