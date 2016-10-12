"use strict";
var lifeEvent_1 = require("../environment/lifeEvent");
var shortid = require("shortid");
var Job = (function () {
    /**
     * Job constructor
     * @param e
     * @param name
     */
    function Job(e, name) {
        this.e = e;
        this.id = shortid.generate();
        this.name = name;
        this.lifeCycle = [];
        this.createLifeEvent("created", null, name);
        this.e.log(1, "New Job \"" + name + "\" created.", this);
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
        if (!this.tunnel) {
            this.e.log(3, "Job \"" + this.getName() + "\" failed before tunnel was set.", this);
        }
        this.tunnel.executeFail(this, this.nest, reason);
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
    return Job;
}());
exports.Job = Job;
