"use strict";
var async = require("async"), mm = require("micromatch"), shortid = require("shortid");
/**
 * Tunnels are runnable work flow units that can watch nests.
 */
var Tunnel = (function () {
    function Tunnel(e, tunnelName) {
        this.match_obj = {
            queue: [],
            run: null,
            pattern: null,
            orphan_minutes: null
        };
        this.e = e;
        this._id = shortid.generate();
        this._nests = [];
        this._name = tunnelName;
        this._run_list = [];
        this._run_sync_list = [];
        this.job_counter = 0;
    }
    Tunnel.prototype.toString = function () {
        return "Tunnel";
    };
    Object.defineProperty(Tunnel.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tunnel.prototype, "nests", {
        get: function () {
            return this._nests;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tunnel.prototype, "runList", {
        get: function () {
            return this._run_list;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tunnel.prototype, "runSyncList", {
        get: function () {
            return this._run_sync_list;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tunnel.prototype, "runFail", {
        get: function () {
            return this._run_fail;
        },
        set: function (callback) {
            this._run_fail = callback;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tunnel.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Instructs the tunnel to watch a nest for new jobs.
     * @param nest
     */
    Tunnel.prototype.watch = function (nest) {
        var t = this;
        t.e.log(0, "Watching nest.", t, [nest]);
        nest.register(t);
        nest.load();
        nest.watch();
        t.nests.push(nest);
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
        this.runList.push(callback);
    };
    /**
     * Run program logic synchronously.
     * @param callback
     */
    Tunnel.prototype.runSync = function (callback) {
        this.runSyncList.push(callback);
    };
    /**
     * Failed jobs runner.
     * @param callback
     */
    Tunnel.prototype.fail = function (callback) {
        this.runFail = callback;
    };
    /**
     * Asynchronous run event.
     * @param job
     * @param nest
     */
    Tunnel.prototype.executeRun = function (job, nest) {
        var tn = this;
        if (tn.runList.length > 0) {
            tn.runList.forEach(function (callback) {
                try {
                    callback(job, nest);
                }
                catch (e) {
                    // Fail if an error is thrown
                    tn.executeFail(job, nest, e);
                }
            });
        }
    };
    /**
     * Synchronous run event.
     * @param job
     * @param nest
     */
    Tunnel.prototype.executeRunSync = function (job, nest) {
        var tn = this;
        var breakFailure = false;
        var successfulRuns = 0;
        if (tn.runSyncList.length > 0) {
            async.eachSeries(tn.runSyncList, function (run, doNextRun) {
                if (breakFailure === false) {
                    run(job, nest, function () {
                        successfulRuns++;
                        doNextRun();
                    });
                }
            }, function (err) {
                if (err) {
                    breakFailure = true;
                    tn.executeFail(job, nest, err);
                }
                tn.e.log(0, "Completed " + successfulRuns + "/" + tn.runSyncList.length + " synchronous run list(s).", tn, [job, nest]);
            });
        }
    };
    /**
     * Fail run event.
     * @param job
     * @param nest
     * @param reason
     */
    Tunnel.prototype.executeFail = function (job, nest, reason) {
        var tn = this;
        tn.e.log(3, "Failed for reason \"" + reason + "\".", tn, [job, nest]);
        var failCallback = tn.runFail;
        if (failCallback) {
            failCallback(job, nest, reason);
        }
        else {
            tn.e.log(2, "No fail runner available for this tunnel.", tn, [job]);
            throw reason;
        }
    };
    /**
     * Interface for matching two or more _files together based on an array of glob filename patterns.
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
                job_pattern_match_result_1 = mm.isMatch(job.name, pattern);
                if (job_pattern_match_result_1 === true) {
                    job_base_1 = job.name.substr(0, job.name.indexOf(pattern.replace("*", "")));
                }
            });
            tn_1.match_obj.queue.slice().reverse().forEach(function (qJob, qIndex, qObject) {
                tn_1.match_obj.pattern.forEach(function (pattern) {
                    qjob_pattern_match_result_1 = mm.isMatch(qJob.name, pattern);
                    if (qjob_pattern_match_result_1 === true) {
                        qjob_base_1 = qJob.name.substr(0, qJob.name.indexOf(pattern.replace("*", "")));
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUUsSUFBRSxDQUFDLENBQUM7b0JBQ2pGLElBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDNUIsQ0FBQztZQUNMLENBQUMsRUFBRSxJQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUM1QyxDQUFDO0lBQ0wsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQWhRQSxBQWdRQyxJQUFBO0FBaFFZLGNBQU0sU0FnUWxCLENBQUEiLCJmaWxlIjoibGliL3R1bm5lbC90dW5uZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGb2xkZXJOZXN0IH0gZnJvbSBcIi4uL25lc3QvZm9sZGVyTmVzdFwiO1xuaW1wb3J0IHsgTmVzdCB9IGZyb20gXCIuLi9uZXN0L25lc3RcIjtcbmltcG9ydCB7IEpvYiB9IGZyb20gXCIuLi9qb2Ivam9iXCI7XG5pbXBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtXZWJob29rTmVzdH0gZnJvbSBcIi4uL25lc3Qvd2ViaG9va05lc3RcIjtcbmltcG9ydCB7RnRwTmVzdH0gZnJvbSBcIi4uL25lc3QvZnRwTmVzdFwiO1xuXG5jb25zdCAgIGFzeW5jID0gcmVxdWlyZShcImFzeW5jXCIpLFxuICAgICAgICBtbSA9IHJlcXVpcmUoXCJtaWNyb21hdGNoXCIpLFxuICAgICAgICBzaG9ydGlkID0gcmVxdWlyZShcInNob3J0aWRcIik7XG4vKipcbiAqIFR1bm5lbHMgYXJlIHJ1bm5hYmxlIHdvcmsgZmxvdyB1bml0cyB0aGF0IGNhbiB3YXRjaCBuZXN0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFR1bm5lbCB7XG5cbiAgICBwcml2YXRlIF9pZDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfbmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfbmVzdHM6IE5lc3RbXTtcbiAgICBwcm90ZWN0ZWQgX3J1bl9saXN0OiBhbnlbXTtcbiAgICBwcm90ZWN0ZWQgX3J1bl9zeW5jX2xpc3Q6IGFueVtdO1xuICAgIHByb3RlY3RlZCBfcnVuX2ZhaWw6IGFueTtcbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG4gICAgcHJvdGVjdGVkIGpvYl9jb3VudGVyOiBudW1iZXI7XG5cbiAgICBwcm90ZWN0ZWQgbWF0Y2hfb2JqID0ge1xuICAgICAgICBxdWV1ZTogW10sXG4gICAgICAgIHJ1bjogbnVsbCxcbiAgICAgICAgcGF0dGVybjogbnVsbCxcbiAgICAgICAgb3JwaGFuX21pbnV0ZXM6IG51bGxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHR1bm5lbE5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmUgPSBlO1xuICAgICAgICB0aGlzLl9pZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgdGhpcy5fbmVzdHMgPSBbXTtcbiAgICAgICAgdGhpcy5fbmFtZSA9IHR1bm5lbE5hbWU7XG4gICAgICAgIHRoaXMuX3J1bl9saXN0ID0gW107XG4gICAgICAgIHRoaXMuX3J1bl9zeW5jX2xpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5qb2JfY291bnRlciA9IDA7XG4gICAgfVxuXG4gICAgcHVibGljIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gXCJUdW5uZWxcIjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBuZXN0cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25lc3RzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcnVuTGlzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3J1bl9saXN0O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcnVuU3luY0xpc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ydW5fc3luY19saXN0O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcnVuRmFpbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3J1bl9mYWlsO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgcnVuRmFpbChjYWxsYmFjazogYW55KSB7XG4gICAgICAgIHRoaXMuX3J1bl9mYWlsID0gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluc3RydWN0cyB0aGUgdHVubmVsIHRvIHdhdGNoIGEgbmVzdCBmb3IgbmV3IGpvYnMuXG4gICAgICogQHBhcmFtIG5lc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgd2F0Y2gobmVzdDogRm9sZGVyTmVzdCB8IFdlYmhvb2tOZXN0IHwgRnRwTmVzdCkge1xuICAgICAgICBsZXQgdCA9IHRoaXM7XG4gICAgICAgIHQuZS5sb2coMCwgYFdhdGNoaW5nIG5lc3QuYCwgdCwgW25lc3RdKTtcbiAgICAgICAgbmVzdC5yZWdpc3Rlcih0KTtcbiAgICAgICAgbmVzdC5sb2FkKCk7XG4gICAgICAgIG5lc3Qud2F0Y2goKTtcbiAgICAgICAgdC5uZXN0cy5wdXNoKG5lc3QpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhcnJpdmUoam9iOiBKb2IsIG5lc3Q/OiBOZXN0KSB7XG4gICAgICAgIHRoaXMuam9iX2NvdW50ZXIrKztcbiAgICAgICAgdGhpcy5lLmxvZygxLCBgSm9iICR7dGhpcy5qb2JfY291bnRlcn0gdHJpZ2dlcmVkIHR1bm5lbCBhcnJpdmUuYCwgdGhpcywgW2pvYiwgbmVzdF0pO1xuICAgICAgICB0aGlzLmV4ZWN1dGVSdW4oam9iLCBuZXN0KTtcbiAgICAgICAgdGhpcy5leGVjdXRlUnVuU3luYyhqb2IsIG5lc3QpO1xuICAgICAgICB0aGlzLmV4ZWN1dGVNYXRjaChqb2IsIG5lc3QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1biBwcm9ncmFtIGxvZ2ljIGFzeW5jaHJvbm91c2x5LlxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBydW4oY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5ydW5MaXN0LnB1c2goY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1biBwcm9ncmFtIGxvZ2ljIHN5bmNocm9ub3VzbHkuXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIHJ1blN5bmMoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5ydW5TeW5jTGlzdC5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGYWlsZWQgam9icyBydW5uZXIuXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIGZhaWwoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5ydW5GYWlsID0gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXN5bmNocm9ub3VzIHJ1biBldmVudC5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICogQHBhcmFtIG5lc3RcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZXhlY3V0ZVJ1bihqb2I6IEpvYiwgbmVzdDogTmVzdCkge1xuICAgICAgICBsZXQgdG4gPSB0aGlzO1xuXG4gICAgICAgIGlmICh0bi5ydW5MaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRuLnJ1bkxpc3QuZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhqb2IsIG5lc3QpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmFpbCBpZiBhbiBlcnJvciBpcyB0aHJvd25cbiAgICAgICAgICAgICAgICAgICAgdG4uZXhlY3V0ZUZhaWwoam9iLCBuZXN0LCBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN5bmNocm9ub3VzIHJ1biBldmVudC5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICogQHBhcmFtIG5lc3RcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZXhlY3V0ZVJ1blN5bmMoam9iOiBKb2IsIG5lc3Q6IE5lc3QpIHtcbiAgICAgICAgbGV0IHRuID0gdGhpcztcblxuICAgICAgICBsZXQgYnJlYWtGYWlsdXJlID0gZmFsc2U7XG4gICAgICAgIGxldCBzdWNjZXNzZnVsUnVucyA9IDA7XG5cbiAgICAgICAgaWYgKHRuLnJ1blN5bmNMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFzeW5jLmVhY2hTZXJpZXModG4ucnVuU3luY0xpc3QsIChydW4sIGRvTmV4dFJ1bikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChicmVha0ZhaWx1cmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bihqb2IsIG5lc3QsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWxSdW5zKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb05leHRSdW4oKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtGYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdG4uZXhlY3V0ZUZhaWwoam9iLCBuZXN0LCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0bi5lLmxvZygwLCBgQ29tcGxldGVkICR7c3VjY2Vzc2Z1bFJ1bnN9LyR7dG4ucnVuU3luY0xpc3QubGVuZ3RofSBzeW5jaHJvbm91cyBydW4gbGlzdChzKS5gLCB0biwgW2pvYiwgbmVzdF0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGYWlsIHJ1biBldmVudC5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICogQHBhcmFtIG5lc3RcbiAgICAgKiBAcGFyYW0gcmVhc29uXG4gICAgICovXG4gICAgcHVibGljIGV4ZWN1dGVGYWlsKGpvYjogSm9iLCBuZXN0OiBOZXN0LCByZWFzb246IHN0cmluZykge1xuICAgICAgICBsZXQgdG4gPSB0aGlzO1xuICAgICAgICB0bi5lLmxvZygzLCBgRmFpbGVkIGZvciByZWFzb24gXCIke3JlYXNvbn1cIi5gLCB0biwgW2pvYiwgbmVzdF0pO1xuICAgICAgICBsZXQgZmFpbENhbGxiYWNrID0gdG4ucnVuRmFpbDtcbiAgICAgICAgaWYgKGZhaWxDYWxsYmFjaykge1xuICAgICAgICAgICAgZmFpbENhbGxiYWNrKGpvYiwgbmVzdCwgcmVhc29uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRuLmUubG9nKDIsIGBObyBmYWlsIHJ1bm5lciBhdmFpbGFibGUgZm9yIHRoaXMgdHVubmVsLmAsIHRuLCBbam9iXSk7XG4gICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnRlcmZhY2UgZm9yIG1hdGNoaW5nIHR3byBvciBtb3JlIF9maWxlcyB0b2dldGhlciBiYXNlZCBvbiBhbiBhcnJheSBvZiBnbG9iIGZpbGVuYW1lIHBhdHRlcm5zLlxuICAgICAqIEBwYXJhbSBwYXR0ZXJuXG4gICAgICogQHBhcmFtIG9ycGhhbk1pbnV0ZXNcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgbWF0Y2gocGF0dGVybjogc3RyaW5nW118c3RyaW5nLCBvcnBoYW5NaW51dGVzOiBudW1iZXIsIGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgdGhpcy5tYXRjaF9vYmoucGF0dGVybiA9IHBhdHRlcm47XG4gICAgICAgIHRoaXMubWF0Y2hfb2JqLm9ycGhhbl9taW51dGVzID0gb3JwaGFuTWludXRlcztcbiAgICAgICAgdGhpcy5tYXRjaF9vYmoucnVuID0gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWF0Y2ggZXhlY3V0aW9uXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGV4ZWN1dGVNYXRjaChqb2I6IEpvYiwgbmVzdDogTmVzdCkge1xuXG4gICAgICAgIGlmICh0aGlzLm1hdGNoX29iai5ydW4pIHtcbiAgICAgICAgICAgIC8vIFRyeSB0byBmaW5kIG1hdGNoIGluIHF1ZXVlXG5cbiAgICAgICAgICAgIGxldCB0biA9IHRoaXM7XG5cbiAgICAgICAgICAgIGxldCBxam9iX3BhdHRlcm5fbWF0Y2hfcmVzdWx0LCBqb2JfcGF0dGVybl9tYXRjaF9yZXN1bHQ7XG4gICAgICAgICAgICBsZXQgbWF0Y2hlZF9qb2JzID0gW107XG5cbiAgICAgICAgICAgIGxldCBqb2JfYmFzZSwgcWpvYl9iYXNlO1xuXG4gICAgICAgICAgICB0bi5lLmxvZygwLCBcIkV4ZWN1dGluZyBtYXRjaGluZyBwcm9jZXNzLlwiLCB0bik7XG5cbiAgICAgICAgICAgIHRuLm1hdGNoX29iai5wYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHBhdHRlcm4sIGkpIHtcbiAgICAgICAgICAgICAgICBqb2JfcGF0dGVybl9tYXRjaF9yZXN1bHQgPSBtbS5pc01hdGNoKGpvYi5uYW1lLCBwYXR0ZXJuKTtcbiAgICAgICAgICAgICAgICBpZiAoam9iX3BhdHRlcm5fbWF0Y2hfcmVzdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGpvYl9iYXNlID0gam9iLm5hbWUuc3Vic3RyKDAsIGpvYi5uYW1lLmluZGV4T2YocGF0dGVybi5yZXBsYWNlKFwiKlwiLCBcIlwiKSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgIHRuLm1hdGNoX29iai5xdWV1ZS5zbGljZSgpLnJldmVyc2UoKS5mb3JFYWNoKGZ1bmN0aW9uIChxSm9iLCBxSW5kZXgsIHFPYmplY3QpIHtcbiAgICAgICAgICAgICAgICB0bi5tYXRjaF9vYmoucGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gICAgICAgICAgICAgICAgICAgIHFqb2JfcGF0dGVybl9tYXRjaF9yZXN1bHQgPSBtbS5pc01hdGNoKHFKb2IubmFtZSwgcGF0dGVybik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChxam9iX3BhdHRlcm5fbWF0Y2hfcmVzdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxam9iX2Jhc2UgPSBxSm9iLm5hbWUuc3Vic3RyKDAsIHFKb2IubmFtZS5pbmRleE9mKHBhdHRlcm4ucmVwbGFjZShcIipcIiwgXCJcIikpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpvYl9iYXNlID09PSBxam9iX2Jhc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQdWxsIG91dCBxam9iIGZyb20gcXVldWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bi5tYXRjaF9vYmoucXVldWUuc3BsaWNlKHFPYmplY3QubGVuZ3RoIC0gMSAtIHFJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlZF9qb2JzLnB1c2gocUpvYik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gaWYgZm91bmRcbiAgICAgICAgICAgIGlmIChtYXRjaGVkX2pvYnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG1hdGNoZWRfam9icy5wdXNoKGpvYik7XG4gICAgICAgICAgICAgICAgdG4uZS5sb2coMCwgYE1hdGNoZWQgJHttYXRjaGVkX2pvYnMubGVuZ3RofSBqb2JzLmAsIHRuKTtcbiAgICAgICAgICAgICAgICB0bi5tYXRjaF9vYmoucnVuKG1hdGNoZWRfam9icyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElmIG5vdCBmb3VuZCwgYWRkIHRoaXMgam9iIHRvIHRoZSBxdWV1ZVxuICAgICAgICAgICAgICAgIHRuLm1hdGNoX29iai5xdWV1ZS5wdXNoKGpvYik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5lZWQgdG8gc2V0IGEgdGltZW91dCBmb3IgdGhlIGpvYiB0byBmYWlsXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodG4ubWF0Y2hfb2JqLnF1ZXVlLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBGYWlsIGFsbCBqb2JzIGluIHRoZSBxdWV1ZVxuICAgICAgICAgICAgICAgICAgICB0bi5tYXRjaF9vYmoucXVldWUuZm9yRWFjaChmdW5jdGlvbiAoZkpvYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZkpvYi5mYWlsKFwiT3JwaGFuIHRpbWVvdXQuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBXaXBlIHRoZSBxdWV1ZVxuICAgICAgICAgICAgICAgICAgICB0bi5lLmxvZygwLCBgT3JwaGFuIHRpbWVvdXQgZXhlY3V0ZWQgb24gJHt0bi5tYXRjaF9vYmoucXVldWUubGVuZ3RofSBqb2JzLmAsIHRuKTtcbiAgICAgICAgICAgICAgICAgICAgdG4ubWF0Y2hfb2JqLnF1ZXVlID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdG4ubWF0Y2hfb2JqLm9ycGhhbl9taW51dGVzICogNjAwMDApO1xuICAgICAgICB9XG4gICAgfVxufSJdfQ==
