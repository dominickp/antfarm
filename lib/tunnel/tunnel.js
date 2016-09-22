"use strict";
var async = require("async"), minimatch = require("minimatch");
var Tunnel = (function () {
    function Tunnel(e, theName) {
        this.match_obj = {
            queue: [],
            run: null,
            pattern: null,
            orphan_minutes: null
        };
        this.e = e;
        this.nests = [];
        this.name = theName;
        this.run_list = [];
        this.run_sync_list = [];
        this.job_counter = 0;
    }
    Tunnel.prototype.getName = function () {
        return this.name;
    };
    Tunnel.prototype.getNests = function () {
        return this.nests;
    };
    Tunnel.prototype.getRunList = function () {
        return this.run_list;
    };
    Tunnel.prototype.getRunSyncList = function () {
        return this.run_sync_list;
    };
    Tunnel.prototype.watch = function (nest) {
        nest.register(this);
        nest.load();
        nest.watch();
        this.nests.push(nest);
    };
    Tunnel.prototype.arrive = function (job, nest) {
        this.job_counter++;
        this.e.log(1, "Job " + this.job_counter + " Nest \"" + nest.name + "\" triggered Tunnel \"" + this.name + "\" run.", this);
        this.executeRun(job, nest);
        this.executeRunSync(job, nest);
        this.executeMatch(job, nest);
    };
    /**
     * Run program logic asynchronously.
     * @param callback
     */
    Tunnel.prototype.run = function (callback) {
        this.run_list.push(callback);
    };
    /**
     * Run program logic synchronously.
     * @param callback
     */
    Tunnel.prototype.runSync = function (callback) {
        this.run_sync_list.push(callback);
    };
    Tunnel.prototype.fail = function (callback) {
        this.run_fail = callback;
    };
    Tunnel.prototype.executeRun = function (job, nest) {
        var tn = this;
        this.run_list.forEach(function (callback) {
            try {
                callback(job, nest);
            }
            catch (e) {
                // Fail if an error is thrown
                tn.executeFail(job, nest, e);
            }
        });
    };
    Tunnel.prototype.executeRunSync = function (job, nest) {
        var tn = this;
        async.eachSeries(tn.run_sync_list, function (run, callback) {
            run(job, nest, function () {
                callback();
            });
        }, function (err) {
            if (err) {
                tn.executeFail(job, nest, err);
            }
            tn.e.log(0, "Completed " + tn.getRunSyncList().length + " synchronous run list(s).", tn);
        });
    };
    Tunnel.prototype.executeFail = function (job, nest, reason) {
        this.e.log(3, "Job \"" + job.getName() + "\" failed for reason \"" + reason + "\".", this);
        this.run_fail(job, nest, reason);
    };
    /**
     * Interface for matching two or more files together based on an array of glob filename patterns.
     * @param pattern
     * @param orphanMinutes
     * @param callback
     */
    Tunnel.prototype.match = function (pattern, orphanMinutes, callback) {
        this.match_obj.pattern = pattern;
        this.match_obj.orphan_minutes = orphanMinutes;
        this.match_obj.run = callback;
    };
    /**
     * Match execution
     * @param job
     * @param nest
     */
    Tunnel.prototype.executeMatch = function (job, nest) {
        // Try to find match in queue
        var tn = this;
        var match_result;
        var matched_jobs = [];
        tn.e.log(0, "Executing matching process.", tn);
        tn.match_obj.pattern.forEach(function (pattern, i) {
            tn.match_obj.queue.forEach(function (qJob) {
                match_result = minimatch(qJob.getName(), pattern);
                if (match_result === true) {
                    matched_jobs.push(job);
                }
                console.log(match_result);
            });
        });
        // if found
        if (matched_jobs.length > 0) {
            tn.match_obj.run(matched_jobs);
        }
        // If not found, add this job to the queue
        tn.match_obj.queue.push(job);
        // Need to set a timeout for the job to fail
    };
    return Tunnel;
}());
exports.Tunnel = Tunnel;
