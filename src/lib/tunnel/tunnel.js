"use strict";
var async = require("async"), mm = require("micromatch");
/**
 * Tunnels are runnable work flow units that can watch nests.
 */
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
    Tunnel.prototype.toString = function () {
        return "Tunnel";
    };
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
        this.e.log(1, "Job " + this.job_counter + " triggered tunnel arrive.", this, [job, nest]);
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
            tn.e.log(0, "Completed " + tn.getRunSyncList().length + " synchronous run list(s).", tn, [job, nest]);
        });
    };
    Tunnel.prototype.executeFail = function (job, nest, reason) {
        this.e.log(3, "Failed for reason \"" + reason + "\".", this, [job, nest]);
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
        if (this.match_obj.run) {
            // Try to find match in queue
            var tn_1 = this;
            var qjob_pattern_match_result_1, job_pattern_match_result_1;
            var matched_jobs_1 = [];
            var job_base_1, qjob_base_1;
            tn_1.e.log(0, "Executing matching process.", tn_1);
            tn_1.match_obj.pattern.forEach(function (pattern, i) {
                job_pattern_match_result_1 = mm.isMatch(job.getName(), pattern);
                if (job_pattern_match_result_1 === true) {
                    job_base_1 = job.getName().substr(0, job.getName().indexOf(pattern.replace("*", "")));
                }
            });
            tn_1.match_obj.queue.slice().reverse().forEach(function (qJob, qIndex, qObject) {
                tn_1.match_obj.pattern.forEach(function (pattern) {
                    qjob_pattern_match_result_1 = mm.isMatch(qJob.getName(), pattern);
                    if (qjob_pattern_match_result_1 === true) {
                        qjob_base_1 = qJob.getName().substr(0, qJob.getName().indexOf(pattern.replace("*", "")));
                        if (job_base_1 === qjob_base_1) {
                            // Pull out qjob from queue
                            tn_1.match_obj.queue.splice(qObject.length - 1 - qIndex, 1);
                            matched_jobs_1.push(qJob);
                            return;
                        }
                    }
                });
            });
            // if found
            if (matched_jobs_1.length > 0) {
                matched_jobs_1.push(job);
                tn_1.e.log(0, "Matched " + matched_jobs_1.length + " jobs.", tn_1);
                tn_1.match_obj.run(matched_jobs_1);
            }
            else {
                // If not found, add this job to the queue
                tn_1.match_obj.queue.push(job);
            }
            // Need to set a timeout for the job to fail
            setTimeout(function () {
                if (tn_1.match_obj.queue.length !== 0) {
                    // Fail all jobs in the queue
                    tn_1.match_obj.queue.forEach(function (fJob) {
                        fJob.fail("Orphan timeout.");
                    });
                    // Wipe the queue
                    tn_1.e.log(0, "Orphan timeout executed on " + tn_1.match_obj.queue.length + " jobs.", tn_1);
                    tn_1.match_obj.queue = [];
                }
            }, tn_1.match_obj.orphan_minutes * 60000);
        }
    };
    return Tunnel;
}());
exports.Tunnel = Tunnel;
//# sourceMappingURL=tunnel.js.map