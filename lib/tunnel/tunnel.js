"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi90dW5uZWwvdHVubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBT0EsSUFBUSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUN4QixFQUFFLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUMxQixPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3JDOztHQUVHO0FBQ0g7SUFrQkksZ0JBQVksQ0FBYyxFQUFFLFVBQWtCO1FBUHBDLGNBQVMsR0FBRztZQUNsQixLQUFLLEVBQUUsRUFBRTtZQUNULEdBQUcsRUFBRSxJQUFJO1lBQ1QsT0FBTyxFQUFFLElBQUk7WUFDYixjQUFjLEVBQUUsSUFBSTtTQUN2QixDQUFDO1FBR0UsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQztRQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRU0seUJBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUVELHNCQUFXLHdCQUFJO2FBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO2FBRUQsVUFBZ0IsSUFBWTtZQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDOzs7T0FKQTtJQU1ELHNCQUFXLHlCQUFLO2FBQWhCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVywyQkFBTzthQUFsQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7OztPQUFBO0lBRUQsc0JBQVcsK0JBQVc7YUFBdEI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUMvQixDQUFDOzs7T0FBQTtJQUVELHNCQUFXLDJCQUFPO2FBQWxCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQzthQUVELFVBQW1CLFFBQWE7WUFDNUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDOUIsQ0FBQzs7O09BSkE7SUFNRCxzQkFBVyxzQkFBRTthQUFiO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDcEIsQ0FBQzs7O09BQUE7SUFFRDs7O09BR0c7SUFDSSxzQkFBSyxHQUFaLFVBQWEsSUFBd0M7UUFDakQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDYixDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRU0sdUJBQU0sR0FBYixVQUFjLEdBQVEsRUFBRSxJQUFXO1FBQy9CLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsU0FBTyxJQUFJLENBQUMsV0FBVyw4QkFBMkIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyRixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksb0JBQUcsR0FBVixVQUFXLFFBQXdDO1FBQy9DLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7O09BR0c7SUFDSSx3QkFBTyxHQUFkLFVBQWUsUUFBMEQ7UUFDckUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLHFCQUFJLEdBQVgsVUFBWSxRQUF3RDtRQUNoRSxJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNPLDJCQUFVLEdBQXBCLFVBQXFCLEdBQVEsRUFBRSxJQUFVO1FBQ3JDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUVkLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRO2dCQUN4QixJQUFJLENBQUM7b0JBQ0QsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDeEIsQ0FBQztnQkFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNULDZCQUE2QjtvQkFDN0IsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDTywrQkFBYyxHQUF4QixVQUF5QixHQUFRLEVBQUUsSUFBVTtRQUN6QyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFZCxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQUMsR0FBRyxFQUFFLFNBQVM7Z0JBQzVDLEVBQUUsQ0FBQyxDQUFDLFlBQVksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUN6QixHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTt3QkFDWCxjQUFjLEVBQUUsQ0FBQzt3QkFDakIsU0FBUyxFQUFFLENBQUM7b0JBQ2hCLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUM7WUFDTCxDQUFDLEVBQUUsVUFBQyxHQUFHO2dCQUNILEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ04sWUFBWSxHQUFHLElBQUksQ0FBQztvQkFDcEIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQyxDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxlQUFhLGNBQWMsU0FBSSxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sOEJBQTJCLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbEgsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksNEJBQVcsR0FBbEIsVUFBbUIsR0FBUSxFQUFFLElBQVUsRUFBRSxNQUFjO1FBQ25ELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSx5QkFBc0IsTUFBTSxRQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0QsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztRQUM5QixFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2YsWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLDJDQUEyQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDcEUsTUFBTSxNQUFNLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLHNCQUFLLEdBQVosVUFBYSxPQUF3QixFQUFFLGFBQXFCLEVBQUUsUUFBYTtRQUN2RSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1FBQzlDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNPLDZCQUFZLEdBQXRCLFVBQXVCLEdBQVEsRUFBRSxJQUFVO1FBRXZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQiw2QkFBNkI7WUFFN0IsSUFBSSxJQUFFLEdBQUcsSUFBSSxDQUFDO1lBRWQsSUFBSSwyQkFBeUIsRUFBRSwwQkFBd0IsQ0FBQztZQUN4RCxJQUFJLGNBQVksR0FBRyxFQUFFLENBQUM7WUFFdEIsSUFBSSxVQUFRLEVBQUUsV0FBUyxDQUFDO1lBRXhCLElBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSw2QkFBNkIsRUFBRSxJQUFFLENBQUMsQ0FBQztZQUUvQyxJQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsQ0FBQztnQkFDN0MsMEJBQXdCLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUN6RCxFQUFFLENBQUMsQ0FBQywwQkFBd0IsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxVQUFRLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUUsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBR0gsSUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPO2dCQUN4RSxJQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxPQUFPO29CQUMxQywyQkFBeUIsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQzNELEVBQUUsQ0FBQyxDQUFDLDJCQUF5QixLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ3JDLFdBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUU3RSxFQUFFLENBQUMsQ0FBQyxVQUFRLEtBQUssV0FBUyxDQUFDLENBQUMsQ0FBQzs0QkFDekIsMkJBQTJCOzRCQUMzQixJQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUMxRCxjQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUN4QixNQUFNLENBQUM7d0JBQ1gsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxXQUFXO1lBQ1gsRUFBRSxDQUFDLENBQUMsY0FBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixjQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QixJQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsYUFBVyxjQUFZLENBQUMsTUFBTSxXQUFRLEVBQUUsSUFBRSxDQUFDLENBQUM7Z0JBQ3hELElBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQVksQ0FBQyxDQUFDO1lBQ25DLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSiwwQ0FBMEM7Z0JBQzFDLElBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBRUQsNENBQTRDO1lBQzVDLFVBQVUsQ0FBQztnQkFDUCxFQUFFLENBQUMsQ0FBQyxJQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbEMsNkJBQTZCO29CQUM3QixJQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJO3dCQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7b0JBQ2pDLENBQUMsQ0FBQyxDQUFDO29CQUVILGlCQUFpQjtvQkFDakIsSUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGdDQUE4QixJQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLFdBQVEsRUFBRSxJQUFFLENBQUMsQ0FBQztvQkFDakYsSUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUM1QixDQUFDO1lBQ0wsQ0FBQyxFQUFFLElBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQzVDLENBQUM7SUFDTCxDQUFDO0lBQ0wsYUFBQztBQUFELENBaFFBLEFBZ1FDLElBQUE7QUFoUVksd0JBQU0iLCJmaWxlIjoibGliL3R1bm5lbC90dW5uZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGb2xkZXJOZXN0IH0gZnJvbSBcIi4uL25lc3QvZm9sZGVyTmVzdFwiO1xyXG5pbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4uL25lc3QvbmVzdFwiO1xyXG5pbXBvcnQgeyBKb2IgfSBmcm9tIFwiLi4vam9iL2pvYlwiO1xyXG5pbXBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xyXG5pbXBvcnQge1dlYmhvb2tOZXN0fSBmcm9tIFwiLi4vbmVzdC93ZWJob29rTmVzdFwiO1xyXG5pbXBvcnQge0Z0cE5lc3R9IGZyb20gXCIuLi9uZXN0L2Z0cE5lc3RcIjtcclxuXHJcbmNvbnN0ICAgYXN5bmMgPSByZXF1aXJlKFwiYXN5bmNcIiksXHJcbiAgICAgICAgbW0gPSByZXF1aXJlKFwibWljcm9tYXRjaFwiKSxcclxuICAgICAgICBzaG9ydGlkID0gcmVxdWlyZShcInNob3J0aWRcIik7XHJcbi8qKlxyXG4gKiBUdW5uZWxzIGFyZSBydW5uYWJsZSB3b3JrIGZsb3cgdW5pdHMgdGhhdCBjYW4gd2F0Y2ggbmVzdHMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVHVubmVsIHtcclxuXHJcbiAgICBwcml2YXRlIF9pZDogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIF9uYW1lOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgX25lc3RzOiBOZXN0W107XHJcbiAgICBwcm90ZWN0ZWQgX3J1bl9saXN0OiBhbnlbXTtcclxuICAgIHByb3RlY3RlZCBfcnVuX3N5bmNfbGlzdDogYW55W107XHJcbiAgICBwcm90ZWN0ZWQgX3J1bl9mYWlsOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XHJcbiAgICBwcm90ZWN0ZWQgam9iX2NvdW50ZXI6IG51bWJlcjtcclxuXHJcbiAgICBwcm90ZWN0ZWQgbWF0Y2hfb2JqID0ge1xyXG4gICAgICAgIHF1ZXVlOiBbXSxcclxuICAgICAgICBydW46IG51bGwsXHJcbiAgICAgICAgcGF0dGVybjogbnVsbCxcclxuICAgICAgICBvcnBoYW5fbWludXRlczogbnVsbFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgdHVubmVsTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5lID0gZTtcclxuICAgICAgICB0aGlzLl9pZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcclxuICAgICAgICB0aGlzLl9uZXN0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX25hbWUgPSB0dW5uZWxOYW1lO1xyXG4gICAgICAgIHRoaXMuX3J1bl9saXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5fcnVuX3N5bmNfbGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuam9iX2NvdW50ZXIgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICByZXR1cm4gXCJUdW5uZWxcIjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbmVzdHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25lc3RzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgcnVuTGlzdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcnVuX2xpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBydW5TeW5jTGlzdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcnVuX3N5bmNfbGlzdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHJ1bkZhaWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3J1bl9mYWlsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgcnVuRmFpbChjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgdGhpcy5fcnVuX2ZhaWwgPSBjYWxsYmFjaztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RydWN0cyB0aGUgdHVubmVsIHRvIHdhdGNoIGEgbmVzdCBmb3IgbmV3IGpvYnMuXHJcbiAgICAgKiBAcGFyYW0gbmVzdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgd2F0Y2gobmVzdDogRm9sZGVyTmVzdCB8IFdlYmhvb2tOZXN0IHwgRnRwTmVzdCkge1xyXG4gICAgICAgIGxldCB0ID0gdGhpcztcclxuICAgICAgICB0LmUubG9nKDAsIGBXYXRjaGluZyBuZXN0LmAsIHQsIFtuZXN0XSk7XHJcbiAgICAgICAgbmVzdC5yZWdpc3Rlcih0KTtcclxuICAgICAgICBuZXN0LmxvYWQoKTtcclxuICAgICAgICBuZXN0LndhdGNoKCk7XHJcbiAgICAgICAgdC5uZXN0cy5wdXNoKG5lc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhcnJpdmUoam9iOiBKb2IsIG5lc3Q/OiBOZXN0KSB7XHJcbiAgICAgICAgdGhpcy5qb2JfY291bnRlcisrO1xyXG4gICAgICAgIHRoaXMuZS5sb2coMSwgYEpvYiAke3RoaXMuam9iX2NvdW50ZXJ9IHRyaWdnZXJlZCB0dW5uZWwgYXJyaXZlLmAsIHRoaXMsIFtqb2IsIG5lc3RdKTtcclxuICAgICAgICB0aGlzLmV4ZWN1dGVSdW4oam9iLCBuZXN0KTtcclxuICAgICAgICB0aGlzLmV4ZWN1dGVSdW5TeW5jKGpvYiwgbmVzdCk7XHJcbiAgICAgICAgdGhpcy5leGVjdXRlTWF0Y2goam9iLCBuZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJ1biBwcm9ncmFtIGxvZ2ljIGFzeW5jaHJvbm91c2x5LlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBydW4oY2FsbGJhY2s6IChqb2I6IEpvYiwgbmVzdDogTmVzdCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucnVuTGlzdC5wdXNoKGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJ1biBwcm9ncmFtIGxvZ2ljIHN5bmNocm9ub3VzbHkuXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJ1blN5bmMoY2FsbGJhY2s6IChqb2I6IEpvYiwgbmVzdDogTmVzdCwgZG9uZTogKCkgPT4gdm9pZCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucnVuU3luY0xpc3QucHVzaChjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGYWlsZWQgam9icyBydW5uZXIuXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgcHVibGljIGZhaWwoY2FsbGJhY2s6IChqb2I6IEpvYiwgbmVzdDogTmVzdCwgcmVhc29uOiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJ1bkZhaWwgPSBjYWxsYmFjaztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFzeW5jaHJvbm91cyBydW4gZXZlbnQuXHJcbiAgICAgKiBAcGFyYW0gam9iXHJcbiAgICAgKiBAcGFyYW0gbmVzdFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZXhlY3V0ZVJ1bihqb2I6IEpvYiwgbmVzdDogTmVzdCkge1xyXG4gICAgICAgIGxldCB0biA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICh0bi5ydW5MaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdG4ucnVuTGlzdC5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhqb2IsIG5lc3QpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEZhaWwgaWYgYW4gZXJyb3IgaXMgdGhyb3duXHJcbiAgICAgICAgICAgICAgICAgICAgdG4uZXhlY3V0ZUZhaWwoam9iLCBuZXN0LCBlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3luY2hyb25vdXMgcnVuIGV2ZW50LlxyXG4gICAgICogQHBhcmFtIGpvYlxyXG4gICAgICogQHBhcmFtIG5lc3RcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGV4ZWN1dGVSdW5TeW5jKGpvYjogSm9iLCBuZXN0OiBOZXN0KSB7XHJcbiAgICAgICAgbGV0IHRuID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IGJyZWFrRmFpbHVyZSA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBzdWNjZXNzZnVsUnVucyA9IDA7XHJcblxyXG4gICAgICAgIGlmICh0bi5ydW5TeW5jTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGFzeW5jLmVhY2hTZXJpZXModG4ucnVuU3luY0xpc3QsIChydW4sIGRvTmV4dFJ1bikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGJyZWFrRmFpbHVyZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBydW4oam9iLCBuZXN0LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWxSdW5zKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvTmV4dFJ1bigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtGYWlsdXJlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0bi5leGVjdXRlRmFpbChqb2IsIG5lc3QsIGVycik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0bi5lLmxvZygwLCBgQ29tcGxldGVkICR7c3VjY2Vzc2Z1bFJ1bnN9LyR7dG4ucnVuU3luY0xpc3QubGVuZ3RofSBzeW5jaHJvbm91cyBydW4gbGlzdChzKS5gLCB0biwgW2pvYiwgbmVzdF0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGYWlsIHJ1biBldmVudC5cclxuICAgICAqIEBwYXJhbSBqb2JcclxuICAgICAqIEBwYXJhbSBuZXN0XHJcbiAgICAgKiBAcGFyYW0gcmVhc29uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBleGVjdXRlRmFpbChqb2I6IEpvYiwgbmVzdDogTmVzdCwgcmVhc29uOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgdG4gPSB0aGlzO1xyXG4gICAgICAgIHRuLmUubG9nKDMsIGBGYWlsZWQgZm9yIHJlYXNvbiBcIiR7cmVhc29ufVwiLmAsIHRuLCBbam9iLCBuZXN0XSk7XHJcbiAgICAgICAgbGV0IGZhaWxDYWxsYmFjayA9IHRuLnJ1bkZhaWw7XHJcbiAgICAgICAgaWYgKGZhaWxDYWxsYmFjaykge1xyXG4gICAgICAgICAgICBmYWlsQ2FsbGJhY2soam9iLCBuZXN0LCByZWFzb24pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRuLmUubG9nKDIsIGBObyBmYWlsIHJ1bm5lciBhdmFpbGFibGUgZm9yIHRoaXMgdHVubmVsLmAsIHRuLCBbam9iXSk7XHJcbiAgICAgICAgICAgIHRocm93IHJlYXNvbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcmZhY2UgZm9yIG1hdGNoaW5nIHR3byBvciBtb3JlIF9maWxlcyB0b2dldGhlciBiYXNlZCBvbiBhbiBhcnJheSBvZiBnbG9iIGZpbGVuYW1lIHBhdHRlcm5zLlxyXG4gICAgICogQHBhcmFtIHBhdHRlcm5cclxuICAgICAqIEBwYXJhbSBvcnBoYW5NaW51dGVzXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgcHVibGljIG1hdGNoKHBhdHRlcm46IHN0cmluZ1tdfHN0cmluZywgb3JwaGFuTWludXRlczogbnVtYmVyLCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgdGhpcy5tYXRjaF9vYmoucGF0dGVybiA9IHBhdHRlcm47XHJcbiAgICAgICAgdGhpcy5tYXRjaF9vYmoub3JwaGFuX21pbnV0ZXMgPSBvcnBoYW5NaW51dGVzO1xyXG4gICAgICAgIHRoaXMubWF0Y2hfb2JqLnJ1biA9IGNhbGxiYWNrO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWF0Y2ggZXhlY3V0aW9uXHJcbiAgICAgKiBAcGFyYW0gam9iXHJcbiAgICAgKiBAcGFyYW0gbmVzdFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZXhlY3V0ZU1hdGNoKGpvYjogSm9iLCBuZXN0OiBOZXN0KSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1hdGNoX29iai5ydW4pIHtcclxuICAgICAgICAgICAgLy8gVHJ5IHRvIGZpbmQgbWF0Y2ggaW4gcXVldWVcclxuXHJcbiAgICAgICAgICAgIGxldCB0biA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBsZXQgcWpvYl9wYXR0ZXJuX21hdGNoX3Jlc3VsdCwgam9iX3BhdHRlcm5fbWF0Y2hfcmVzdWx0O1xyXG4gICAgICAgICAgICBsZXQgbWF0Y2hlZF9qb2JzID0gW107XHJcblxyXG4gICAgICAgICAgICBsZXQgam9iX2Jhc2UsIHFqb2JfYmFzZTtcclxuXHJcbiAgICAgICAgICAgIHRuLmUubG9nKDAsIFwiRXhlY3V0aW5nIG1hdGNoaW5nIHByb2Nlc3MuXCIsIHRuKTtcclxuXHJcbiAgICAgICAgICAgIHRuLm1hdGNoX29iai5wYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHBhdHRlcm4sIGkpIHtcclxuICAgICAgICAgICAgICAgIGpvYl9wYXR0ZXJuX21hdGNoX3Jlc3VsdCA9IG1tLmlzTWF0Y2goam9iLm5hbWUsIHBhdHRlcm4pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGpvYl9wYXR0ZXJuX21hdGNoX3Jlc3VsdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGpvYl9iYXNlID0gam9iLm5hbWUuc3Vic3RyKDAsIGpvYi5uYW1lLmluZGV4T2YocGF0dGVybi5yZXBsYWNlKFwiKlwiLCBcIlwiKSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICB0bi5tYXRjaF9vYmoucXVldWUuc2xpY2UoKS5yZXZlcnNlKCkuZm9yRWFjaChmdW5jdGlvbiAocUpvYiwgcUluZGV4LCBxT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICB0bi5tYXRjaF9vYmoucGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uIChwYXR0ZXJuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcWpvYl9wYXR0ZXJuX21hdGNoX3Jlc3VsdCA9IG1tLmlzTWF0Y2gocUpvYi5uYW1lLCBwYXR0ZXJuKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocWpvYl9wYXR0ZXJuX21hdGNoX3Jlc3VsdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxam9iX2Jhc2UgPSBxSm9iLm5hbWUuc3Vic3RyKDAsIHFKb2IubmFtZS5pbmRleE9mKHBhdHRlcm4ucmVwbGFjZShcIipcIiwgXCJcIikpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqb2JfYmFzZSA9PT0gcWpvYl9iYXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQdWxsIG91dCBxam9iIGZyb20gcXVldWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRuLm1hdGNoX29iai5xdWV1ZS5zcGxpY2UocU9iamVjdC5sZW5ndGggLSAxIC0gcUluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZWRfam9icy5wdXNoKHFKb2IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgZm91bmRcclxuICAgICAgICAgICAgaWYgKG1hdGNoZWRfam9icy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBtYXRjaGVkX2pvYnMucHVzaChqb2IpO1xyXG4gICAgICAgICAgICAgICAgdG4uZS5sb2coMCwgYE1hdGNoZWQgJHttYXRjaGVkX2pvYnMubGVuZ3RofSBqb2JzLmAsIHRuKTtcclxuICAgICAgICAgICAgICAgIHRuLm1hdGNoX29iai5ydW4obWF0Y2hlZF9qb2JzKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIG5vdCBmb3VuZCwgYWRkIHRoaXMgam9iIHRvIHRoZSBxdWV1ZVxyXG4gICAgICAgICAgICAgICAgdG4ubWF0Y2hfb2JqLnF1ZXVlLnB1c2goam9iKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTmVlZCB0byBzZXQgYSB0aW1lb3V0IGZvciB0aGUgam9iIHRvIGZhaWxcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodG4ubWF0Y2hfb2JqLnF1ZXVlLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEZhaWwgYWxsIGpvYnMgaW4gdGhlIHF1ZXVlXHJcbiAgICAgICAgICAgICAgICAgICAgdG4ubWF0Y2hfb2JqLnF1ZXVlLmZvckVhY2goZnVuY3Rpb24gKGZKb2IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZkpvYi5mYWlsKFwiT3JwaGFuIHRpbWVvdXQuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBXaXBlIHRoZSBxdWV1ZVxyXG4gICAgICAgICAgICAgICAgICAgIHRuLmUubG9nKDAsIGBPcnBoYW4gdGltZW91dCBleGVjdXRlZCBvbiAke3RuLm1hdGNoX29iai5xdWV1ZS5sZW5ndGh9IGpvYnMuYCwgdG4pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRuLm1hdGNoX29iai5xdWV1ZSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB0bi5tYXRjaF9vYmoub3JwaGFuX21pbnV0ZXMgKiA2MDAwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19
