"use strict";
var lifeEvent_1 = require("../environment/lifeEvent");
var Job = (function () {
    function Job(e, name) {
        this.e = e;
        this.name = name;
        this.lifeCycle = [];
        this.createLifeEvent("created", null, name);
        this.e.log(1, "New Job \"" + name + "\" created.", this);
    }
    Job.prototype.isLocallyAvailable = function () {
        return this.locallyAvailable;
    };
    Job.prototype.setLocallyAvailable = function (available) {
        this.locallyAvailable = available;
    };
    Job.prototype.getLifeCycle = function () {
        return this.lifeCycle;
    };
    Job.prototype.createLifeEvent = function (verb, start, finish) {
        this.lifeCycle.push(new lifeEvent_1.LifeEvent(verb, start, finish));
    };
    Job.prototype.setName = function (name) {
        this.name = name;
    };
    Job.prototype.getName = function () {
        return this.name;
    };
    Job.prototype.setNest = function (nest) {
        this.nest = nest;
    };
    Job.prototype.getNest = function () {
        return this.nest;
    };
    Job.prototype.setTunnel = function (tunnel) {
        this.tunnel = tunnel;
    };
    Job.prototype.getTunnel = function () {
        return this.tunnel;
    };
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
        job.e.log(1, "Job \"" + job.getName() + "\" transferred to Tunnel \"" + oldTunnel.getName() + "\".", job);
        job.createLifeEvent("transfer", oldTunnel.getName(), tunnel.getName());
    };
    return Job;
}());
exports.Job = Job;
