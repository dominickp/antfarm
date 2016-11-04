"use strict";
var async = require("async"), mm = require("micromatch");
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
        failCallback(job, nest, reason);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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RUFBRSxJQUFFLENBQUMsQ0FBQztnQkFDeEQsSUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBWSxDQUFDLENBQUM7WUFDbkMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLDBDQUEwQztnQkFDMUMsSUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFFRCw0Q0FBNEM7WUFDNUMsVUFBVSxDQUFDO2dCQUNQLEVBQUUsQ0FBQyxDQUFDLElBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQyw2QkFBNkI7b0JBQzdCLElBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUk7d0JBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztvQkFDakMsQ0FBQyxDQUFDLENBQUM7b0JBRUgsaUJBQWlCO29CQUNqQixJQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsZ0NBQThCLElBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sV0FBUSxFQUFFLElBQUUsQ0FBQyxDQUFDO29CQUNqRixJQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQzVCLENBQUM7WUFDTCxDQUFDLEVBQUUsSUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDNUMsQ0FBQztJQUNMLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0FyUEEsQUFxUEMsSUFBQTtBQXJQWSxjQUFNLFNBcVBsQixDQUFBIiwiZmlsZSI6ImxpYi90dW5uZWwvdHVubmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRm9sZGVyTmVzdCB9IGZyb20gXCIuLi9uZXN0L2ZvbGRlck5lc3RcIjtcbmltcG9ydCB7IE5lc3QgfSBmcm9tIFwiLi4vbmVzdC9uZXN0XCI7XG5pbXBvcnQgeyBKb2IgfSBmcm9tIFwiLi4vam9iL2pvYlwiO1xuaW1wb3J0IHsgRW52aXJvbm1lbnQgfSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7V2ViaG9va05lc3R9IGZyb20gXCIuLi9uZXN0L3dlYmhvb2tOZXN0XCI7XG5pbXBvcnQge0Z0cE5lc3R9IGZyb20gXCIuLi9uZXN0L2Z0cE5lc3RcIjtcblxuY29uc3QgICBhc3luYyA9IHJlcXVpcmUoXCJhc3luY1wiKSxcbiAgICAgICAgbW0gPSByZXF1aXJlKFwibWljcm9tYXRjaFwiKTtcbi8qKlxuICogVHVubmVscyBhcmUgcnVubmFibGUgd29yayBmbG93IHVuaXRzIHRoYXQgY2FuIHdhdGNoIG5lc3RzLlxuICovXG5leHBvcnQgY2xhc3MgVHVubmVsIHtcblxuICAgIHByb3RlY3RlZCBfbmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfbmVzdHM6IE5lc3RbXTtcbiAgICBwcm90ZWN0ZWQgX3J1bl9saXN0OiBhbnlbXTtcbiAgICBwcm90ZWN0ZWQgX3J1bl9zeW5jX2xpc3Q6IGFueVtdO1xuICAgIHByb3RlY3RlZCBfcnVuX2ZhaWw6IGFueTtcbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG4gICAgcHJvdGVjdGVkIGpvYl9jb3VudGVyOiBudW1iZXI7XG5cbiAgICBwcm90ZWN0ZWQgbWF0Y2hfb2JqID0ge1xuICAgICAgICBxdWV1ZTogW10sXG4gICAgICAgIHJ1bjogbnVsbCxcbiAgICAgICAgcGF0dGVybjogbnVsbCxcbiAgICAgICAgb3JwaGFuX21pbnV0ZXM6IG51bGxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHR1bm5lbE5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmUgPSBlO1xuICAgICAgICB0aGlzLl9uZXN0cyA9IFtdO1xuICAgICAgICB0aGlzLl9uYW1lID0gdHVubmVsTmFtZTtcbiAgICAgICAgdGhpcy5fcnVuX2xpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5fcnVuX3N5bmNfbGlzdCA9IFtdO1xuICAgICAgICB0aGlzLmpvYl9jb3VudGVyID0gMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBcIlR1bm5lbFwiO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IG5lc3RzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmVzdHM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBydW5MaXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcnVuX2xpc3Q7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBydW5TeW5jTGlzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3J1bl9zeW5jX2xpc3Q7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBydW5GYWlsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcnVuX2ZhaWw7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBydW5GYWlsKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgdGhpcy5fcnVuX2ZhaWwgPSBjYWxsYmFjaztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnN0cnVjdHMgdGhlIHR1bm5lbCB0byB3YXRjaCBhIG5lc3QgZm9yIG5ldyBqb2JzLlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHVibGljIHdhdGNoKG5lc3Q6IEZvbGRlck5lc3QgfCBXZWJob29rTmVzdCB8IEZ0cE5lc3QpIHtcbiAgICAgICAgbGV0IHQgPSB0aGlzO1xuICAgICAgICB0LmUubG9nKDAsIGBXYXRjaGluZyBuZXN0LmAsIHQsIFtuZXN0XSk7XG4gICAgICAgIG5lc3QucmVnaXN0ZXIodCk7XG4gICAgICAgIG5lc3QubG9hZCgpO1xuICAgICAgICBuZXN0LndhdGNoKCk7XG4gICAgICAgIHQubmVzdHMucHVzaChuZXN0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXJyaXZlKGpvYjogSm9iLCBuZXN0PzogTmVzdCkge1xuICAgICAgICB0aGlzLmpvYl9jb3VudGVyKys7XG4gICAgICAgIHRoaXMuZS5sb2coMSwgYEpvYiAke3RoaXMuam9iX2NvdW50ZXJ9IHRyaWdnZXJlZCB0dW5uZWwgYXJyaXZlLmAsIHRoaXMsIFtqb2IsIG5lc3RdKTtcbiAgICAgICAgdGhpcy5leGVjdXRlUnVuKGpvYiwgbmVzdCk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZVJ1blN5bmMoam9iLCBuZXN0KTtcbiAgICAgICAgdGhpcy5leGVjdXRlTWF0Y2goam9iLCBuZXN0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW4gcHJvZ3JhbSBsb2dpYyBhc3luY2hyb25vdXNseS5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgcnVuKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMucnVuTGlzdC5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW4gcHJvZ3JhbSBsb2dpYyBzeW5jaHJvbm91c2x5LlxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBydW5TeW5jKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMucnVuU3luY0xpc3QucHVzaChjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmFpbGVkIGpvYnMgcnVubmVyLlxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBmYWlsKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMucnVuRmFpbCA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFzeW5jaHJvbm91cyBydW4gZXZlbnQuXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGV4ZWN1dGVSdW4oam9iOiBKb2IsIG5lc3Q6IE5lc3QpIHtcbiAgICAgICAgbGV0IHRuID0gdGhpcztcblxuICAgICAgICBpZiAodG4ucnVuTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0bi5ydW5MaXN0LmZvckVhY2goKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soam9iLCBuZXN0KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZhaWwgaWYgYW4gZXJyb3IgaXMgdGhyb3duXG4gICAgICAgICAgICAgICAgICAgIHRuLmV4ZWN1dGVGYWlsKGpvYiwgbmVzdCwgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTeW5jaHJvbm91cyBydW4gZXZlbnQuXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGV4ZWN1dGVSdW5TeW5jKGpvYjogSm9iLCBuZXN0OiBOZXN0KSB7XG4gICAgICAgIGxldCB0biA9IHRoaXM7XG5cbiAgICAgICAgbGV0IGJyZWFrRmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICBsZXQgc3VjY2Vzc2Z1bFJ1bnMgPSAwO1xuXG4gICAgICAgIGlmICh0bi5ydW5TeW5jTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhc3luYy5lYWNoU2VyaWVzKHRuLnJ1blN5bmNMaXN0LCAocnVuLCBkb05leHRSdW4pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYnJlYWtGYWlsdXJlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBydW4oam9iLCBuZXN0LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsUnVucysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9OZXh0UnVuKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrRmFpbHVyZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRuLmV4ZWN1dGVGYWlsKGpvYiwgbmVzdCwgZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdG4uZS5sb2coMCwgYENvbXBsZXRlZCAke3N1Y2Nlc3NmdWxSdW5zfS8ke3RuLnJ1blN5bmNMaXN0Lmxlbmd0aH0gc3luY2hyb25vdXMgcnVuIGxpc3QocykuYCwgdG4sIFtqb2IsIG5lc3RdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmFpbCBydW4gZXZlbnQuXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqIEBwYXJhbSBuZXN0XG4gICAgICogQHBhcmFtIHJlYXNvblxuICAgICAqL1xuICAgIHB1YmxpYyBleGVjdXRlRmFpbChqb2I6IEpvYiwgbmVzdDogTmVzdCwgcmVhc29uOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHRuID0gdGhpcztcbiAgICAgICAgdG4uZS5sb2coMywgYEZhaWxlZCBmb3IgcmVhc29uIFwiJHtyZWFzb259XCIuYCwgdG4sIFtqb2IsIG5lc3RdKTtcbiAgICAgICAgbGV0IGZhaWxDYWxsYmFjayA9IHRuLnJ1bkZhaWw7XG4gICAgICAgIGZhaWxDYWxsYmFjayhqb2IsIG5lc3QsIHJlYXNvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW50ZXJmYWNlIGZvciBtYXRjaGluZyB0d28gb3IgbW9yZSBfZmlsZXMgdG9nZXRoZXIgYmFzZWQgb24gYW4gYXJyYXkgb2YgZ2xvYiBmaWxlbmFtZSBwYXR0ZXJucy5cbiAgICAgKiBAcGFyYW0gcGF0dGVyblxuICAgICAqIEBwYXJhbSBvcnBoYW5NaW51dGVzXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG1hdGNoKHBhdHRlcm46IHN0cmluZ1tdfHN0cmluZywgb3JwaGFuTWludXRlczogbnVtYmVyLCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIHRoaXMubWF0Y2hfb2JqLnBhdHRlcm4gPSBwYXR0ZXJuO1xuICAgICAgICB0aGlzLm1hdGNoX29iai5vcnBoYW5fbWludXRlcyA9IG9ycGhhbk1pbnV0ZXM7XG4gICAgICAgIHRoaXMubWF0Y2hfb2JqLnJ1biA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1hdGNoIGV4ZWN1dGlvblxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKiBAcGFyYW0gbmVzdFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBleGVjdXRlTWF0Y2goam9iOiBKb2IsIG5lc3Q6IE5lc3QpIHtcblxuICAgICAgICBpZiAodGhpcy5tYXRjaF9vYmoucnVuKSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gZmluZCBtYXRjaCBpbiBxdWV1ZVxuXG4gICAgICAgICAgICBsZXQgdG4gPSB0aGlzO1xuXG4gICAgICAgICAgICBsZXQgcWpvYl9wYXR0ZXJuX21hdGNoX3Jlc3VsdCwgam9iX3BhdHRlcm5fbWF0Y2hfcmVzdWx0O1xuICAgICAgICAgICAgbGV0IG1hdGNoZWRfam9icyA9IFtdO1xuXG4gICAgICAgICAgICBsZXQgam9iX2Jhc2UsIHFqb2JfYmFzZTtcblxuICAgICAgICAgICAgdG4uZS5sb2coMCwgXCJFeGVjdXRpbmcgbWF0Y2hpbmcgcHJvY2Vzcy5cIiwgdG4pO1xuXG4gICAgICAgICAgICB0bi5tYXRjaF9vYmoucGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uIChwYXR0ZXJuLCBpKSB7XG4gICAgICAgICAgICAgICAgam9iX3BhdHRlcm5fbWF0Y2hfcmVzdWx0ID0gbW0uaXNNYXRjaChqb2IubmFtZSwgcGF0dGVybik7XG4gICAgICAgICAgICAgICAgaWYgKGpvYl9wYXR0ZXJuX21hdGNoX3Jlc3VsdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBqb2JfYmFzZSA9IGpvYi5uYW1lLnN1YnN0cigwLCBqb2IubmFtZS5pbmRleE9mKHBhdHRlcm4ucmVwbGFjZShcIipcIiwgXCJcIikpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICB0bi5tYXRjaF9vYmoucXVldWUuc2xpY2UoKS5yZXZlcnNlKCkuZm9yRWFjaChmdW5jdGlvbiAocUpvYiwgcUluZGV4LCBxT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgdG4ubWF0Y2hfb2JqLnBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAocGF0dGVybikge1xuICAgICAgICAgICAgICAgICAgICBxam9iX3BhdHRlcm5fbWF0Y2hfcmVzdWx0ID0gbW0uaXNNYXRjaChxSm9iLm5hbWUsIHBhdHRlcm4pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocWpvYl9wYXR0ZXJuX21hdGNoX3Jlc3VsdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcWpvYl9iYXNlID0gcUpvYi5uYW1lLnN1YnN0cigwLCBxSm9iLm5hbWUuaW5kZXhPZihwYXR0ZXJuLnJlcGxhY2UoXCIqXCIsIFwiXCIpKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqb2JfYmFzZSA9PT0gcWpvYl9iYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHVsbCBvdXQgcWpvYiBmcm9tIHF1ZXVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG4ubWF0Y2hfb2JqLnF1ZXVlLnNwbGljZShxT2JqZWN0Lmxlbmd0aCAtIDEgLSBxSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZWRfam9icy5wdXNoKHFKb2IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGlmIGZvdW5kXG4gICAgICAgICAgICBpZiAobWF0Y2hlZF9qb2JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBtYXRjaGVkX2pvYnMucHVzaChqb2IpO1xuICAgICAgICAgICAgICAgIHRuLmUubG9nKDAsIGBNYXRjaGVkICR7bWF0Y2hlZF9qb2JzLmxlbmd0aH0gam9icy5gLCB0bik7XG4gICAgICAgICAgICAgICAgdG4ubWF0Y2hfb2JqLnJ1bihtYXRjaGVkX2pvYnMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBub3QgZm91bmQsIGFkZCB0aGlzIGpvYiB0byB0aGUgcXVldWVcbiAgICAgICAgICAgICAgICB0bi5tYXRjaF9vYmoucXVldWUucHVzaChqb2IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBOZWVkIHRvIHNldCBhIHRpbWVvdXQgZm9yIHRoZSBqb2IgdG8gZmFpbFxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRuLm1hdGNoX29iai5xdWV1ZS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmFpbCBhbGwgam9icyBpbiB0aGUgcXVldWVcbiAgICAgICAgICAgICAgICAgICAgdG4ubWF0Y2hfb2JqLnF1ZXVlLmZvckVhY2goZnVuY3Rpb24gKGZKb2IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZKb2IuZmFpbChcIk9ycGhhbiB0aW1lb3V0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gV2lwZSB0aGUgcXVldWVcbiAgICAgICAgICAgICAgICAgICAgdG4uZS5sb2coMCwgYE9ycGhhbiB0aW1lb3V0IGV4ZWN1dGVkIG9uICR7dG4ubWF0Y2hfb2JqLnF1ZXVlLmxlbmd0aH0gam9icy5gLCB0bik7XG4gICAgICAgICAgICAgICAgICAgIHRuLm1hdGNoX29iai5xdWV1ZSA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRuLm1hdGNoX29iai5vcnBoYW5fbWludXRlcyAqIDYwMDAwKTtcbiAgICAgICAgfVxuICAgIH1cbn0iXX0=
