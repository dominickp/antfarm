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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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USxFQUFFLElBQUUsQ0FBQyxDQUFDO29CQUNqRixJQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQzVCLENBQUM7WUFDTCxDQUFDLEVBQUUsSUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDNUMsQ0FBQztJQUNMLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0FoUUEsQUFnUUMsSUFBQTtBQWhRWSxjQUFNLFNBZ1FsQixDQUFBIiwiZmlsZSI6ImxpYi90dW5uZWwvdHVubmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRm9sZGVyTmVzdCB9IGZyb20gXCIuLi9uZXN0L2ZvbGRlck5lc3RcIjtcbmltcG9ydCB7IE5lc3QgfSBmcm9tIFwiLi4vbmVzdC9uZXN0XCI7XG5pbXBvcnQgeyBKb2IgfSBmcm9tIFwiLi4vam9iL2pvYlwiO1xuaW1wb3J0IHsgRW52aXJvbm1lbnQgfSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7V2ViaG9va05lc3R9IGZyb20gXCIuLi9uZXN0L3dlYmhvb2tOZXN0XCI7XG5pbXBvcnQge0Z0cE5lc3R9IGZyb20gXCIuLi9uZXN0L2Z0cE5lc3RcIjtcblxuY29uc3QgICBhc3luYyA9IHJlcXVpcmUoXCJhc3luY1wiKSxcbiAgICAgICAgbW0gPSByZXF1aXJlKFwibWljcm9tYXRjaFwiKSxcbiAgICAgICAgc2hvcnRpZCA9IHJlcXVpcmUoXCJzaG9ydGlkXCIpO1xuLyoqXG4gKiBUdW5uZWxzIGFyZSBydW5uYWJsZSB3b3JrIGZsb3cgdW5pdHMgdGhhdCBjYW4gd2F0Y2ggbmVzdHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUdW5uZWwge1xuXG4gICAgcHJpdmF0ZSBfaWQ6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX25hbWU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX25lc3RzOiBOZXN0W107XG4gICAgcHJvdGVjdGVkIF9ydW5fbGlzdDogYW55W107XG4gICAgcHJvdGVjdGVkIF9ydW5fc3luY19saXN0OiBhbnlbXTtcbiAgICBwcm90ZWN0ZWQgX3J1bl9mYWlsOiBhbnk7XG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuICAgIHByb3RlY3RlZCBqb2JfY291bnRlcjogbnVtYmVyO1xuXG4gICAgcHJvdGVjdGVkIG1hdGNoX29iaiA9IHtcbiAgICAgICAgcXVldWU6IFtdLFxuICAgICAgICBydW46IG51bGwsXG4gICAgICAgIHBhdHRlcm46IG51bGwsXG4gICAgICAgIG9ycGhhbl9taW51dGVzOiBudWxsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCB0dW5uZWxOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5lID0gZTtcbiAgICAgICAgdGhpcy5faWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XG4gICAgICAgIHRoaXMuX25lc3RzID0gW107XG4gICAgICAgIHRoaXMuX25hbWUgPSB0dW5uZWxOYW1lO1xuICAgICAgICB0aGlzLl9ydW5fbGlzdCA9IFtdO1xuICAgICAgICB0aGlzLl9ydW5fc3luY19saXN0ID0gW107XG4gICAgICAgIHRoaXMuam9iX2NvdW50ZXIgPSAwO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIFwiVHVubmVsXCI7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IG5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgbmVzdHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZXN0cztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHJ1bkxpc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ydW5fbGlzdDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHJ1blN5bmNMaXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcnVuX3N5bmNfbGlzdDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHJ1bkZhaWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ydW5fZmFpbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHJ1bkZhaWwoY2FsbGJhY2s6IGFueSkge1xuICAgICAgICB0aGlzLl9ydW5fZmFpbCA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnN0cnVjdHMgdGhlIHR1bm5lbCB0byB3YXRjaCBhIG5lc3QgZm9yIG5ldyBqb2JzLlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHVibGljIHdhdGNoKG5lc3Q6IEZvbGRlck5lc3QgfCBXZWJob29rTmVzdCB8IEZ0cE5lc3QpIHtcbiAgICAgICAgbGV0IHQgPSB0aGlzO1xuICAgICAgICB0LmUubG9nKDAsIGBXYXRjaGluZyBuZXN0LmAsIHQsIFtuZXN0XSk7XG4gICAgICAgIG5lc3QucmVnaXN0ZXIodCk7XG4gICAgICAgIG5lc3QubG9hZCgpO1xuICAgICAgICBuZXN0LndhdGNoKCk7XG4gICAgICAgIHQubmVzdHMucHVzaChuZXN0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXJyaXZlKGpvYjogSm9iLCBuZXN0PzogTmVzdCkge1xuICAgICAgICB0aGlzLmpvYl9jb3VudGVyKys7XG4gICAgICAgIHRoaXMuZS5sb2coMSwgYEpvYiAke3RoaXMuam9iX2NvdW50ZXJ9IHRyaWdnZXJlZCB0dW5uZWwgYXJyaXZlLmAsIHRoaXMsIFtqb2IsIG5lc3RdKTtcbiAgICAgICAgdGhpcy5leGVjdXRlUnVuKGpvYiwgbmVzdCk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZVJ1blN5bmMoam9iLCBuZXN0KTtcbiAgICAgICAgdGhpcy5leGVjdXRlTWF0Y2goam9iLCBuZXN0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW4gcHJvZ3JhbSBsb2dpYyBhc3luY2hyb25vdXNseS5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgcnVuKGNhbGxiYWNrOiAoam9iOiBKb2IsIG5lc3Q6IE5lc3QpID0+IHZvaWQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ydW5MaXN0LnB1c2goY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1biBwcm9ncmFtIGxvZ2ljIHN5bmNocm9ub3VzbHkuXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIHJ1blN5bmMoY2FsbGJhY2s6IChqb2I6IEpvYiwgbmVzdDogTmVzdCwgZG9uZTogKCkgPT4gdm9pZCkgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgICB0aGlzLnJ1blN5bmNMaXN0LnB1c2goY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZhaWxlZCBqb2JzIHJ1bm5lci5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgZmFpbChjYWxsYmFjazogKGpvYjogSm9iLCBuZXN0OiBOZXN0LCByZWFzb246IHN0cmluZykgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgICB0aGlzLnJ1bkZhaWwgPSBjYWxsYmFjaztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBc3luY2hyb25vdXMgcnVuIGV2ZW50LlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKiBAcGFyYW0gbmVzdFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBleGVjdXRlUnVuKGpvYjogSm9iLCBuZXN0OiBOZXN0KSB7XG4gICAgICAgIGxldCB0biA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHRuLnJ1bkxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdG4ucnVuTGlzdC5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGpvYiwgbmVzdCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBGYWlsIGlmIGFuIGVycm9yIGlzIHRocm93blxuICAgICAgICAgICAgICAgICAgICB0bi5leGVjdXRlRmFpbChqb2IsIG5lc3QsIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3luY2hyb25vdXMgcnVuIGV2ZW50LlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKiBAcGFyYW0gbmVzdFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBleGVjdXRlUnVuU3luYyhqb2I6IEpvYiwgbmVzdDogTmVzdCkge1xuICAgICAgICBsZXQgdG4gPSB0aGlzO1xuXG4gICAgICAgIGxldCBicmVha0ZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgbGV0IHN1Y2Nlc3NmdWxSdW5zID0gMDtcblxuICAgICAgICBpZiAodG4ucnVuU3luY0xpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYXN5bmMuZWFjaFNlcmllcyh0bi5ydW5TeW5jTGlzdCwgKHJ1biwgZG9OZXh0UnVuKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGJyZWFrRmFpbHVyZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVuKGpvYiwgbmVzdCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bFJ1bnMrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvTmV4dFJ1bigpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBicmVha0ZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0bi5leGVjdXRlRmFpbChqb2IsIG5lc3QsIGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRuLmUubG9nKDAsIGBDb21wbGV0ZWQgJHtzdWNjZXNzZnVsUnVuc30vJHt0bi5ydW5TeW5jTGlzdC5sZW5ndGh9IHN5bmNocm9ub3VzIHJ1biBsaXN0KHMpLmAsIHRuLCBbam9iLCBuZXN0XSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZhaWwgcnVuIGV2ZW50LlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKiBAcGFyYW0gbmVzdFxuICAgICAqIEBwYXJhbSByZWFzb25cbiAgICAgKi9cbiAgICBwdWJsaWMgZXhlY3V0ZUZhaWwoam9iOiBKb2IsIG5lc3Q6IE5lc3QsIHJlYXNvbjogc3RyaW5nKSB7XG4gICAgICAgIGxldCB0biA9IHRoaXM7XG4gICAgICAgIHRuLmUubG9nKDMsIGBGYWlsZWQgZm9yIHJlYXNvbiBcIiR7cmVhc29ufVwiLmAsIHRuLCBbam9iLCBuZXN0XSk7XG4gICAgICAgIGxldCBmYWlsQ2FsbGJhY2sgPSB0bi5ydW5GYWlsO1xuICAgICAgICBpZiAoZmFpbENhbGxiYWNrKSB7XG4gICAgICAgICAgICBmYWlsQ2FsbGJhY2soam9iLCBuZXN0LCByZWFzb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG4uZS5sb2coMiwgYE5vIGZhaWwgcnVubmVyIGF2YWlsYWJsZSBmb3IgdGhpcyB0dW5uZWwuYCwgdG4sIFtqb2JdKTtcbiAgICAgICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludGVyZmFjZSBmb3IgbWF0Y2hpbmcgdHdvIG9yIG1vcmUgX2ZpbGVzIHRvZ2V0aGVyIGJhc2VkIG9uIGFuIGFycmF5IG9mIGdsb2IgZmlsZW5hbWUgcGF0dGVybnMuXG4gICAgICogQHBhcmFtIHBhdHRlcm5cbiAgICAgKiBAcGFyYW0gb3JwaGFuTWludXRlc1xuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBtYXRjaChwYXR0ZXJuOiBzdHJpbmdbXXxzdHJpbmcsIG9ycGhhbk1pbnV0ZXM6IG51bWJlciwgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICB0aGlzLm1hdGNoX29iai5wYXR0ZXJuID0gcGF0dGVybjtcbiAgICAgICAgdGhpcy5tYXRjaF9vYmoub3JwaGFuX21pbnV0ZXMgPSBvcnBoYW5NaW51dGVzO1xuICAgICAgICB0aGlzLm1hdGNoX29iai5ydW4gPSBjYWxsYmFjaztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYXRjaCBleGVjdXRpb25cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICogQHBhcmFtIG5lc3RcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZXhlY3V0ZU1hdGNoKGpvYjogSm9iLCBuZXN0OiBOZXN0KSB7XG5cbiAgICAgICAgaWYgKHRoaXMubWF0Y2hfb2JqLnJ1bikge1xuICAgICAgICAgICAgLy8gVHJ5IHRvIGZpbmQgbWF0Y2ggaW4gcXVldWVcblxuICAgICAgICAgICAgbGV0IHRuID0gdGhpcztcblxuICAgICAgICAgICAgbGV0IHFqb2JfcGF0dGVybl9tYXRjaF9yZXN1bHQsIGpvYl9wYXR0ZXJuX21hdGNoX3Jlc3VsdDtcbiAgICAgICAgICAgIGxldCBtYXRjaGVkX2pvYnMgPSBbXTtcblxuICAgICAgICAgICAgbGV0IGpvYl9iYXNlLCBxam9iX2Jhc2U7XG5cbiAgICAgICAgICAgIHRuLmUubG9nKDAsIFwiRXhlY3V0aW5nIG1hdGNoaW5nIHByb2Nlc3MuXCIsIHRuKTtcblxuICAgICAgICAgICAgdG4ubWF0Y2hfb2JqLnBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAocGF0dGVybiwgaSkge1xuICAgICAgICAgICAgICAgIGpvYl9wYXR0ZXJuX21hdGNoX3Jlc3VsdCA9IG1tLmlzTWF0Y2goam9iLm5hbWUsIHBhdHRlcm4pO1xuICAgICAgICAgICAgICAgIGlmIChqb2JfcGF0dGVybl9tYXRjaF9yZXN1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgam9iX2Jhc2UgPSBqb2IubmFtZS5zdWJzdHIoMCwgam9iLm5hbWUuaW5kZXhPZihwYXR0ZXJuLnJlcGxhY2UoXCIqXCIsIFwiXCIpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgdG4ubWF0Y2hfb2JqLnF1ZXVlLnNsaWNlKCkucmV2ZXJzZSgpLmZvckVhY2goZnVuY3Rpb24gKHFKb2IsIHFJbmRleCwgcU9iamVjdCkge1xuICAgICAgICAgICAgICAgIHRuLm1hdGNoX29iai5wYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgICAgICAgICAgICAgICAgICAgcWpvYl9wYXR0ZXJuX21hdGNoX3Jlc3VsdCA9IG1tLmlzTWF0Y2gocUpvYi5uYW1lLCBwYXR0ZXJuKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHFqb2JfcGF0dGVybl9tYXRjaF9yZXN1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHFqb2JfYmFzZSA9IHFKb2IubmFtZS5zdWJzdHIoMCwgcUpvYi5uYW1lLmluZGV4T2YocGF0dGVybi5yZXBsYWNlKFwiKlwiLCBcIlwiKSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoam9iX2Jhc2UgPT09IHFqb2JfYmFzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFB1bGwgb3V0IHFqb2IgZnJvbSBxdWV1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRuLm1hdGNoX29iai5xdWV1ZS5zcGxpY2UocU9iamVjdC5sZW5ndGggLSAxIC0gcUluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVkX2pvYnMucHVzaChxSm9iKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBpZiBmb3VuZFxuICAgICAgICAgICAgaWYgKG1hdGNoZWRfam9icy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2hlZF9qb2JzLnB1c2goam9iKTtcbiAgICAgICAgICAgICAgICB0bi5lLmxvZygwLCBgTWF0Y2hlZCAke21hdGNoZWRfam9icy5sZW5ndGh9IGpvYnMuYCwgdG4pO1xuICAgICAgICAgICAgICAgIHRuLm1hdGNoX29iai5ydW4obWF0Y2hlZF9qb2JzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgbm90IGZvdW5kLCBhZGQgdGhpcyBqb2IgdG8gdGhlIHF1ZXVlXG4gICAgICAgICAgICAgICAgdG4ubWF0Y2hfb2JqLnF1ZXVlLnB1c2goam9iKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTmVlZCB0byBzZXQgYSB0aW1lb3V0IGZvciB0aGUgam9iIHRvIGZhaWxcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0bi5tYXRjaF9vYmoucXVldWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZhaWwgYWxsIGpvYnMgaW4gdGhlIHF1ZXVlXG4gICAgICAgICAgICAgICAgICAgIHRuLm1hdGNoX29iai5xdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uIChmSm9iKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmSm9iLmZhaWwoXCJPcnBoYW4gdGltZW91dC5cIik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFdpcGUgdGhlIHF1ZXVlXG4gICAgICAgICAgICAgICAgICAgIHRuLmUubG9nKDAsIGBPcnBoYW4gdGltZW91dCBleGVjdXRlZCBvbiAke3RuLm1hdGNoX29iai5xdWV1ZS5sZW5ndGh9IGpvYnMuYCwgdG4pO1xuICAgICAgICAgICAgICAgICAgICB0bi5tYXRjaF9vYmoucXVldWUgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0bi5tYXRjaF9vYmoub3JwaGFuX21pbnV0ZXMgKiA2MDAwMCk7XG4gICAgICAgIH1cbiAgICB9XG59Il19
