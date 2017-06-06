"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var nest_1 = require("./nest");
var fileJob_1 = require("./../job/fileJob");
var folderJob_1 = require("./../job/folderJob");
var fs = require("fs"), path_mod = require("path"), tmp = require("tmp"), mkdirp = require("mkdirp"), _ = require("lodash");
/**
 * A folder nest is a nest which contains a backing folder at a specific _path. If the folder does not exist,
 * antfarm can optionally create it.
 */
var FolderNest = (function (_super) {
    __extends(FolderNest, _super);
    function FolderNest(e, path, allowCreate) {
        var _this = this;
        var nest_name = path_mod.basename(path);
        _this = _super.call(this, e, nest_name) || this;
        // this._watcher = require("node-watch");
        _this._watcher = require("chokidar");
        _this.allowCreate = allowCreate;
        _this.checkDirectorySync(path);
        _this.path = path;
        _this.heldJobs = [];
        return _this;
    }
    Object.defineProperty(FolderNest.prototype, "watcher", {
        get: function () {
            return this._watcher;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Check if the _path for the backing folder is created. If not, optionally create it.
     * @param directory
     */
    FolderNest.prototype.checkDirectorySync = function (directory) {
        var fn = this;
        try {
            fs.statSync(directory);
        }
        catch (e) {
            if (fn.allowCreate) {
                mkdirp.sync(directory);
                fn.e.log(1, "Directory \"" + directory + "\" was created since it did not already exist.", this);
            }
            else {
                fn.e.log(3, "Directory \"" + directory + "\" did not exist and was not created.", this);
            }
        }
    };
    /**
     * Function that creates and arrives new jobs. Can produce file or folder jobs.
     * @param path
     * @param arrive
     * @returns {FolderJob|FileJob}
     */
    FolderNest.prototype.createJob = function (path, arrive) {
        if (arrive === void 0) { arrive = true; }
        var fl = this;
        var job;
        // Verify file still exists, node-watch fires on any change, even delete
        // Check for incorrectly found files
        // console.log("job path", path);
        // console.log("folder path", fl.path);
        // console.log("vlaiditiy", fl.path.indexOf(path) === -1);
        var fn_path = path_mod.normalize(fl.path);
        var incoming_job_path = path_mod.normalize(path);
        if (incoming_job_path.indexOf(fn_path) === -1) {
            fl.e.log(3, "Found job that did not exist in this nest. Job: " + incoming_job_path + ":" + fn_path, fl);
        }
        else {
            try {
                fs.accessSync(path, fs.F_OK);
                // Check job is folder
                var path_stats = fs.lstatSync(path);
                if (path_stats.isDirectory()) {
                    job = new folderJob_1.FolderJob(fl.e, path);
                    job.createFiles(function () {
                        if (arrive) {
                            // Trigger arrived
                            fl.arrive(job);
                        }
                    });
                }
                else if (path_stats.isFile()) {
                    job = new fileJob_1.FileJob(fl.e, path);
                    if (arrive) {
                        // Trigger arrived
                        fl.arrive(job);
                    }
                }
                else {
                    throw "Path is not a file or folder!";
                }
            }
            catch (e) {
                // It isn't accessible
                fl.e.log(0, "Job creation ignored because file did not exist.", fl);
            }
        }
        return job;
    };
    /**
     * Checks whether a _path starts with or contains a hidden file or a folder.
     * @param path {string}      The _path of the file that needs to be validated.
     * returns {boolean} - `true` if the source is blacklisted and otherwise `false`.
     */
    FolderNest.prototype.isUnixHiddenPath = function (path) {
        return (/(^|\/)\.[^\/\.]/g).test(path);
    };
    ;
    /**
     * Initial load of the contents of the directory.
     * @param hold {boolean}    Optional flag to hold jobs found.
     */
    FolderNest.prototype.load = function (hold) {
        if (hold === void 0) { hold = false; }
        var fl = this;
        fs.readdir(fl.path, function (err, items) {
            if (items) {
                items = items.filter(function (item) { return !(/(^|\/)\.[^\/\.]/g).test(item); });
                items.forEach(function (filename) {
                    var filepath = fl.path + path_mod.sep + filename;
                    var job;
                    if (hold === false) {
                        fl.createJob(filepath, true); // Arrives as well
                    }
                    else {
                        job = fl.createJob(filepath, false);
                        fl.holdJob(job);
                    }
                });
            }
        });
    };
    /**
     * Watches the folder.
     * @param hold {boolean}    Optional flag to hold jobs found.
     */
    FolderNest.prototype.watch = function (hold) {
        if (hold === void 0) { hold = false; }
        var fl = this;
        // let watch_options = {
        //     recursive: false,
        //     followSymLinks: false
        // };
        var handleWatchEvent = function (filepath) {
            if (fl.path !== filepath) {
                var job = void 0;
                if (hold === false) {
                    job = fl.createJob(filepath, true); // Arrives as well
                }
                else {
                    job = fl.createJob(filepath, false);
                    fl.holdJob(job);
                }
            }
            else {
                fl.e.log(2, "Nest found in new watch.", fl);
            }
        };
        fl.e.log(0, "Watching " + fl.path, fl, [fl.tunnel]);
        var chokOpts = { ignored: /[\/\\]\./ };
        // let chokOpts = {ignored: /[\/\\]\./, ignoreInitial: true, depth: 1};
        // fl.watcher(fl.path, watch_options, filepath => {
        var watcherInstance = fl.watcher.watch(fl.path, chokOpts);
        watcherInstance
            .on("add", function (filepath, event) { handleWatchEvent(filepath); })
            .on("addDir", function (filepath, event) { handleWatchEvent(filepath); })
            .on("error", function (error) { return fl.e.log(3, " Watcher error: " + error, fl); })
            .on("raw", function (event, path, details) {
            fl.e.log(0, "Raw event info: " + event + ", " + path + ", " + details.toString(), fl);
        });
    };
    /**
     * Watches and holds jobs found.
     */
    FolderNest.prototype.watchHold = function () {
        var fl = this;
        fl.load(true);
        fl.watch(true);
    };
    /**
     * Arrive function that calls the super.
     * @param job
     */
    FolderNest.prototype.arrive = function (job) {
        // console.log("ABOUT TO ARRIVE", job.name, " IN NEST ", this.name);
        _super.prototype.arrive.call(this, job);
    };
    /**
     * Picks up a job from another nest.
     * @param job
     * @param callback      Callback is given the job in its parameter.
     */
    FolderNest.prototype.take = function (job, callback) {
        var fn = this;
        // the other nest that this is taking from should provide a temporary location or local _path of the job
        var new_path = fn.path + "/" + job.name;
        try {
            fs.renameSync(job.path, new_path);
        }
        catch (err) {
            fn.e.log(3, "Job " + job.name + " could not be renamed in take method. " + err, fn, [job]);
        }
        job.path = new_path;
        // job.nest = fn;
        callback(job);
    };
    /**
     * Loads jobs that have piled up in the nest if it was not watched.
     * No longer used.
     * @returns {Array}     Array of jobs
     */
    FolderNest.prototype.getUnwatchedJobs = function () {
        var fl = this;
        var jobs = [];
        var fileArray = fs.readdirSync(fl.path);
        var items = fileArray.filter(function (item) { return !(/(^|\/)\.[^\/\.]/g).test(item); });
        items.forEach(function (filename) {
            var filepath = fl.path + path_mod.sep + filename;
            var job = fl.createJob(filepath, false);
            jobs.push(job);
            // fl.holdJob(job);
        });
        return jobs;
    };
    /**
     * Returns all held jobs.
     * @returns {(FileJob|FolderJob)[]}
     */
    FolderNest.prototype.getHeldJobs = function () {
        return this.heldJobs;
    };
    /**
     * Adds job to array of held jobs.
     * @param job
     */
    FolderNest.prototype.holdJob = function (job) {
        this.heldJobs.push(job);
    };
    /**
     * Get a held job with a job id. Removes it from the held job queue,
     * so you should move it out of the folder after using this.
     * @param jobId
     * @returns {FileJob|FolderJob}
     * #### Example
     * ```js
     * var tunnel = af.createTunnel("Checkpoint example");
     * var webhook = af.createWebhookNest(["test", "example"], "get");
     * var holding_folder = af.createAutoFolderNest(["test", "checkpoint"]);
     *
     * var im = webhook.getInterfaceManager();
     *
     * // Watch for jobs, hold, and provide to the interface.
     * im.checkNest(holding_folder);
     * tunnel.watch(webhook);
     *
     * tunnel.run(function(job, nest){
     *      // Get the job_id from the webhook request
     *      var job_id = job.getParameter("job_id");
     *      // Get the held job from the holding folder
     *      var checkpoint_job = holding_folder.getHeldJob(job_id);
     *      // Move somewhere else
     *      checkpoint_job.move(af.createAutoFolderNest(["test", "outfolder"]));
     * });
     * ```
     */
    FolderNest.prototype.getHeldJob = function (jobId) {
        var f = this;
        var job = _.find(f.getHeldJobs(), function (j) { return j.getId() === jobId; });
        var jobIndex = _.findIndex(f.getHeldJobs(), function (j) { return j.getId() === jobId; });
        if (!job) {
            f.e.log(3, "Job ID " + jobId + " could not be found in the " + f.getHeldJobs().length + " pending held jobs.", f);
        }
        else {
            f.heldJobs.splice(jobIndex, 1);
        }
        return job;
    };
    return FolderNest;
}(nest_1.Nest));
exports.FolderNest = FolderNest;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0FuU0EsQUFtU0MsQ0FuUytCLFdBQUksR0FtU25DO0FBblNZLGdDQUFVIiwiZmlsZSI6ImxpYi9uZXN0L2ZvbGRlck5lc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcclxuaW1wb3J0IHsgTmVzdCB9IGZyb20gXCIuL25lc3RcIjtcclxuaW1wb3J0IHsgRmlsZUpvYiB9IGZyb20gXCIuLy4uL2pvYi9maWxlSm9iXCI7XHJcbmltcG9ydCB7IEZvbGRlckpvYiB9IGZyb20gXCIuLy4uL2pvYi9mb2xkZXJKb2JcIjtcclxuaW1wb3J0IHtKb2J9IGZyb20gXCIuLi9qb2Ivam9iXCI7XHJcblxyXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxyXG4gICAgICAgIHBhdGhfbW9kID0gcmVxdWlyZShcInBhdGhcIiksXHJcbiAgICAgICAgdG1wID0gcmVxdWlyZShcInRtcFwiKSxcclxuICAgICAgICBta2RpcnAgPSByZXF1aXJlKFwibWtkaXJwXCIpLFxyXG4gICAgICAgIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xyXG5cclxuLyoqXHJcbiAqIEEgZm9sZGVyIG5lc3QgaXMgYSBuZXN0IHdoaWNoIGNvbnRhaW5zIGEgYmFja2luZyBmb2xkZXIgYXQgYSBzcGVjaWZpYyBfcGF0aC4gSWYgdGhlIGZvbGRlciBkb2VzIG5vdCBleGlzdCxcclxuICogYW50ZmFybSBjYW4gb3B0aW9uYWxseSBjcmVhdGUgaXQuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRm9sZGVyTmVzdCBleHRlbmRzIE5lc3Qge1xyXG5cclxuICAgIHByb3RlY3RlZCBwYXRoOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgYWxsb3dDcmVhdGU6IGJvb2xlYW47XHJcbiAgICBwcm90ZWN0ZWQgaGVsZEpvYnM6IChGaWxlSm9ifEZvbGRlckpvYilbXTtcclxuICAgIHByaXZhdGUgX3dhdGNoZXI6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aD86IHN0cmluZywgYWxsb3dDcmVhdGU/OiBib29sZWFuKSB7XHJcbiAgICAgICAgbGV0IG5lc3RfbmFtZSA9IHBhdGhfbW9kLmJhc2VuYW1lKHBhdGgpO1xyXG4gICAgICAgIHN1cGVyKGUsIG5lc3RfbmFtZSk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuX3dhdGNoZXIgPSByZXF1aXJlKFwibm9kZS13YXRjaFwiKTtcclxuICAgICAgICB0aGlzLl93YXRjaGVyID0gcmVxdWlyZShcImNob2tpZGFyXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmFsbG93Q3JlYXRlID0gYWxsb3dDcmVhdGU7XHJcbiAgICAgICAgdGhpcy5jaGVja0RpcmVjdG9yeVN5bmMocGF0aCk7XHJcbiAgICAgICAgdGhpcy5wYXRoID0gcGF0aDtcclxuICAgICAgICB0aGlzLmhlbGRKb2JzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXQgd2F0Y2hlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fd2F0Y2hlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIHRoZSBfcGF0aCBmb3IgdGhlIGJhY2tpbmcgZm9sZGVyIGlzIGNyZWF0ZWQuIElmIG5vdCwgb3B0aW9uYWxseSBjcmVhdGUgaXQuXHJcbiAgICAgKiBAcGFyYW0gZGlyZWN0b3J5XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjaGVja0RpcmVjdG9yeVN5bmMoZGlyZWN0b3J5KSB7XHJcbiAgICAgICAgbGV0IGZuID0gdGhpcztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBmcy5zdGF0U3luYyhkaXJlY3RvcnkpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYgKGZuLmFsbG93Q3JlYXRlKSB7XHJcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhkaXJlY3RvcnkpO1xyXG4gICAgICAgICAgICAgICAgZm4uZS5sb2coMSwgYERpcmVjdG9yeSBcIiR7ZGlyZWN0b3J5fVwiIHdhcyBjcmVhdGVkIHNpbmNlIGl0IGRpZCBub3QgYWxyZWFkeSBleGlzdC5gLCB0aGlzKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZuLmUubG9nKDMsIGBEaXJlY3RvcnkgXCIke2RpcmVjdG9yeX1cIiBkaWQgbm90IGV4aXN0IGFuZCB3YXMgbm90IGNyZWF0ZWQuYCwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYW5kIGFycml2ZXMgbmV3IGpvYnMuIENhbiBwcm9kdWNlIGZpbGUgb3IgZm9sZGVyIGpvYnMuXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICogQHBhcmFtIGFycml2ZVxyXG4gICAgICogQHJldHVybnMge0ZvbGRlckpvYnxGaWxlSm9ifVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlSm9iKHBhdGg6IHN0cmluZywgYXJyaXZlID0gdHJ1ZSkge1xyXG5cclxuICAgICAgICBsZXQgZmwgPSB0aGlzO1xyXG4gICAgICAgIGxldCBqb2I7XHJcbiAgICAgICAgLy8gVmVyaWZ5IGZpbGUgc3RpbGwgZXhpc3RzLCBub2RlLXdhdGNoIGZpcmVzIG9uIGFueSBjaGFuZ2UsIGV2ZW4gZGVsZXRlXHJcblxyXG4gICAgICAgIC8vIENoZWNrIGZvciBpbmNvcnJlY3RseSBmb3VuZCBmaWxlc1xyXG5cclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImpvYiBwYXRoXCIsIHBhdGgpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZm9sZGVyIHBhdGhcIiwgZmwucGF0aCk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJ2bGFpZGl0aXlcIiwgZmwucGF0aC5pbmRleE9mKHBhdGgpID09PSAtMSk7XHJcblxyXG4gICAgICAgIGxldCBmbl9wYXRoID0gcGF0aF9tb2Qubm9ybWFsaXplKGZsLnBhdGgpO1xyXG4gICAgICAgIGxldCBpbmNvbWluZ19qb2JfcGF0aCA9IHBhdGhfbW9kLm5vcm1hbGl6ZShwYXRoKTtcclxuXHJcbiAgICAgICAgaWYgKGluY29taW5nX2pvYl9wYXRoLmluZGV4T2YoZm5fcGF0aCkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIGZsLmUubG9nKDMsIGBGb3VuZCBqb2IgdGhhdCBkaWQgbm90IGV4aXN0IGluIHRoaXMgbmVzdC4gSm9iOiAke2luY29taW5nX2pvYl9wYXRofToke2ZuX3BhdGh9YCwgZmwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyhwYXRoLCBmcy5GX09LKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBqb2IgaXMgZm9sZGVyXHJcbiAgICAgICAgICAgICAgICBsZXQgcGF0aF9zdGF0cyA9IGZzLmxzdGF0U3luYyhwYXRoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGF0aF9zdGF0cy5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgam9iID0gbmV3IEZvbGRlckpvYihmbC5lLCBwYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICBqb2IuY3JlYXRlRmlsZXMoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyaXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmlnZ2VyIGFycml2ZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsLmFycml2ZShqb2IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGhfc3RhdHMuaXNGaWxlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBqb2IgPSBuZXcgRmlsZUpvYihmbC5lLCBwYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyaXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgYXJyaXZlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmbC5hcnJpdmUoam9iKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiUGF0aCBpcyBub3QgYSBmaWxlIG9yIGZvbGRlciFcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gSXQgaXNuJ3QgYWNjZXNzaWJsZVxyXG4gICAgICAgICAgICAgICAgZmwuZS5sb2coMCwgXCJKb2IgY3JlYXRpb24gaWdub3JlZCBiZWNhdXNlIGZpbGUgZGlkIG5vdCBleGlzdC5cIiwgZmwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gam9iO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgYSBfcGF0aCBzdGFydHMgd2l0aCBvciBjb250YWlucyBhIGhpZGRlbiBmaWxlIG9yIGEgZm9sZGVyLlxyXG4gICAgICogQHBhcmFtIHBhdGgge3N0cmluZ30gICAgICBUaGUgX3BhdGggb2YgdGhlIGZpbGUgdGhhdCBuZWVkcyB0byBiZSB2YWxpZGF0ZWQuXHJcbiAgICAgKiByZXR1cm5zIHtib29sZWFufSAtIGB0cnVlYCBpZiB0aGUgc291cmNlIGlzIGJsYWNrbGlzdGVkIGFuZCBvdGhlcndpc2UgYGZhbHNlYC5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGlzVW5peEhpZGRlblBhdGggKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChwYXRoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbml0aWFsIGxvYWQgb2YgdGhlIGNvbnRlbnRzIG9mIHRoZSBkaXJlY3RvcnkuXHJcbiAgICAgKiBAcGFyYW0gaG9sZCB7Ym9vbGVhbn0gICAgT3B0aW9uYWwgZmxhZyB0byBob2xkIGpvYnMgZm91bmQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBsb2FkKGhvbGQ6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBmbCA9IHRoaXM7XHJcbiAgICAgICAgZnMucmVhZGRpcihmbC5wYXRoLCAoZXJyLCBpdGVtcykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gISgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KGl0ZW0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5mb3JFYWNoKChmaWxlbmFtZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZsLnBhdGggKyBwYXRoX21vZC5zZXAgKyBmaWxlbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgam9iO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChob2xkID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIHRydWUpOyAvLyBBcnJpdmVzIGFzIHdlbGxcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmwuaG9sZEpvYihqb2IpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaGVzIHRoZSBmb2xkZXIuXHJcbiAgICAgKiBAcGFyYW0gaG9sZCB7Ym9vbGVhbn0gICAgT3B0aW9uYWwgZmxhZyB0byBob2xkIGpvYnMgZm91bmQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB3YXRjaChob2xkOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcclxuICAgICAgICBsZXQgZmwgPSB0aGlzO1xyXG4gICAgICAgIC8vIGxldCB3YXRjaF9vcHRpb25zID0ge1xyXG4gICAgICAgIC8vICAgICByZWN1cnNpdmU6IGZhbHNlLFxyXG4gICAgICAgIC8vICAgICBmb2xsb3dTeW1MaW5rczogZmFsc2VcclxuICAgICAgICAvLyB9O1xyXG5cclxuICAgICAgICBsZXQgaGFuZGxlV2F0Y2hFdmVudCA9IChmaWxlcGF0aCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZmwucGF0aCAhPT0gZmlsZXBhdGgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBqb2I7XHJcbiAgICAgICAgICAgICAgICBpZiAoaG9sZCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIHRydWUpOyAvLyBBcnJpdmVzIGFzIHdlbGxcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZmwuaG9sZEpvYihqb2IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZsLmUubG9nKDIsIGBOZXN0IGZvdW5kIGluIG5ldyB3YXRjaC5gLCBmbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmbC5lLmxvZygwLCBgV2F0Y2hpbmcgJHtmbC5wYXRofWAsIGZsLCBbZmwudHVubmVsXSk7XHJcblxyXG4gICAgICAgIGxldCBjaG9rT3B0cyA9IHtpZ25vcmVkOiAvW1xcL1xcXFxdXFwuL307XHJcbiAgICAgICAgLy8gbGV0IGNob2tPcHRzID0ge2lnbm9yZWQ6IC9bXFwvXFxcXF1cXC4vLCBpZ25vcmVJbml0aWFsOiB0cnVlLCBkZXB0aDogMX07XHJcblxyXG5cclxuICAgICAgICAvLyBmbC53YXRjaGVyKGZsLnBhdGgsIHdhdGNoX29wdGlvbnMsIGZpbGVwYXRoID0+IHtcclxuICAgICAgICBsZXQgd2F0Y2hlckluc3RhbmNlID0gZmwud2F0Y2hlci53YXRjaChmbC5wYXRoLCBjaG9rT3B0cyk7XHJcbiAgICAgICAgd2F0Y2hlckluc3RhbmNlXHJcbiAgICAgICAgICAgIC5vbihcImFkZFwiLCAoZmlsZXBhdGgsIGV2ZW50KSA9PiB7IGhhbmRsZVdhdGNoRXZlbnQoZmlsZXBhdGgpOyB9KVxyXG4gICAgICAgICAgICAub24oXCJhZGREaXJcIiwgKGZpbGVwYXRoLCBldmVudCkgPT4geyBoYW5kbGVXYXRjaEV2ZW50KGZpbGVwYXRoKTsgfSlcclxuICAgICAgICAgICAgLm9uKFwiZXJyb3JcIiwgZXJyb3IgPT4gZmwuZS5sb2coMywgYCBXYXRjaGVyIGVycm9yOiAke2Vycm9yfWAsIGZsKSlcclxuICAgICAgICAgICAgLm9uKFwicmF3XCIsIChldmVudCwgcGF0aCwgZGV0YWlscykgPT4ge1xyXG4gICAgICAgICAgICAgICAgZmwuZS5sb2coMCwgYFJhdyBldmVudCBpbmZvOiAke2V2ZW50fSwgJHtwYXRofSwgJHtkZXRhaWxzLnRvU3RyaW5nKCl9YCwgZmwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdhdGNoZXMgYW5kIGhvbGRzIGpvYnMgZm91bmQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB3YXRjaEhvbGQoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGZsID0gdGhpcztcclxuICAgICAgICBmbC5sb2FkKHRydWUpO1xyXG4gICAgICAgIGZsLndhdGNoKHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXJyaXZlIGZ1bmN0aW9uIHRoYXQgY2FsbHMgdGhlIHN1cGVyLlxyXG4gICAgICogQHBhcmFtIGpvYlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXJyaXZlKGpvYjogRmlsZUpvYikge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQUJPVVQgVE8gQVJSSVZFXCIsIGpvYi5uYW1lLCBcIiBJTiBORVNUIFwiLCB0aGlzLm5hbWUpO1xyXG4gICAgICAgIHN1cGVyLmFycml2ZShqb2IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGlja3MgdXAgYSBqb2IgZnJvbSBhbm90aGVyIG5lc3QuXHJcbiAgICAgKiBAcGFyYW0gam9iXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgICAgICBDYWxsYmFjayBpcyBnaXZlbiB0aGUgam9iIGluIGl0cyBwYXJhbWV0ZXIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0YWtlKGpvYjogKEZpbGVKb2J8Rm9sZGVySm9iKSwgY2FsbGJhY2s6IChqb2I6IEZpbGVKb2J8Rm9sZGVySm9iKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgbGV0IGZuID0gdGhpcztcclxuICAgICAgICAvLyB0aGUgb3RoZXIgbmVzdCB0aGF0IHRoaXMgaXMgdGFraW5nIGZyb20gc2hvdWxkIHByb3ZpZGUgYSB0ZW1wb3JhcnkgbG9jYXRpb24gb3IgbG9jYWwgX3BhdGggb2YgdGhlIGpvYlxyXG4gICAgICAgIGxldCBuZXdfcGF0aCA9IGAke2ZuLnBhdGh9LyR7am9iLm5hbWV9YDtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZnMucmVuYW1lU3luYyhqb2IucGF0aCwgbmV3X3BhdGgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBmbi5lLmxvZygzLCBgSm9iICR7am9iLm5hbWV9IGNvdWxkIG5vdCBiZSByZW5hbWVkIGluIHRha2UgbWV0aG9kLiAke2Vycn1gLCBmbiwgW2pvYl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBqb2IucGF0aCA9IG5ld19wYXRoO1xyXG4gICAgICAgIC8vIGpvYi5uZXN0ID0gZm47XHJcblxyXG4gICAgICAgIGNhbGxiYWNrKGpvYik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2FkcyBqb2JzIHRoYXQgaGF2ZSBwaWxlZCB1cCBpbiB0aGUgbmVzdCBpZiBpdCB3YXMgbm90IHdhdGNoZWQuXHJcbiAgICAgKiBObyBsb25nZXIgdXNlZC5cclxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gICAgIEFycmF5IG9mIGpvYnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFVud2F0Y2hlZEpvYnMoKSB7XHJcbiAgICAgICAgbGV0IGZsID0gdGhpcztcclxuICAgICAgICBsZXQgam9icyA9IFtdO1xyXG4gICAgICAgIGxldCBmaWxlQXJyYXkgPSBmcy5yZWFkZGlyU3luYyhmbC5wYXRoKTtcclxuXHJcbiAgICAgICAgbGV0IGl0ZW1zID0gZmlsZUFycmF5LmZpbHRlcihpdGVtID0+ICEoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChpdGVtKSk7XHJcblxyXG4gICAgICAgIGl0ZW1zLmZvckVhY2goKGZpbGVuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZsLnBhdGggKyBwYXRoX21vZC5zZXAgKyBmaWxlbmFtZTtcclxuICAgICAgICAgICAgbGV0IGpvYiA9IGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgZmFsc2UpO1xyXG4gICAgICAgICAgICBqb2JzLnB1c2goam9iKTtcclxuICAgICAgICAgICAgLy8gZmwuaG9sZEpvYihqb2IpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gam9icztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYWxsIGhlbGQgam9icy5cclxuICAgICAqIEByZXR1cm5zIHsoRmlsZUpvYnxGb2xkZXJKb2IpW119XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRIZWxkSm9icygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oZWxkSm9icztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgam9iIHRvIGFycmF5IG9mIGhlbGQgam9icy5cclxuICAgICAqIEBwYXJhbSBqb2JcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGhvbGRKb2Ioam9iOiAoRmlsZUpvYnxGb2xkZXJKb2IpKSB7XHJcbiAgICAgICAgdGhpcy5oZWxkSm9icy5wdXNoKGpvYik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgYSBoZWxkIGpvYiB3aXRoIGEgam9iIGlkLiBSZW1vdmVzIGl0IGZyb20gdGhlIGhlbGQgam9iIHF1ZXVlLFxyXG4gICAgICogc28geW91IHNob3VsZCBtb3ZlIGl0IG91dCBvZiB0aGUgZm9sZGVyIGFmdGVyIHVzaW5nIHRoaXMuXHJcbiAgICAgKiBAcGFyYW0gam9iSWRcclxuICAgICAqIEByZXR1cm5zIHtGaWxlSm9ifEZvbGRlckpvYn1cclxuICAgICAqICMjIyMgRXhhbXBsZVxyXG4gICAgICogYGBganNcclxuICAgICAqIHZhciB0dW5uZWwgPSBhZi5jcmVhdGVUdW5uZWwoXCJDaGVja3BvaW50IGV4YW1wbGVcIik7XHJcbiAgICAgKiB2YXIgd2ViaG9vayA9IGFmLmNyZWF0ZVdlYmhvb2tOZXN0KFtcInRlc3RcIiwgXCJleGFtcGxlXCJdLCBcImdldFwiKTtcclxuICAgICAqIHZhciBob2xkaW5nX2ZvbGRlciA9IGFmLmNyZWF0ZUF1dG9Gb2xkZXJOZXN0KFtcInRlc3RcIiwgXCJjaGVja3BvaW50XCJdKTtcclxuICAgICAqXHJcbiAgICAgKiB2YXIgaW0gPSB3ZWJob29rLmdldEludGVyZmFjZU1hbmFnZXIoKTtcclxuICAgICAqXHJcbiAgICAgKiAvLyBXYXRjaCBmb3Igam9icywgaG9sZCwgYW5kIHByb3ZpZGUgdG8gdGhlIGludGVyZmFjZS5cclxuICAgICAqIGltLmNoZWNrTmVzdChob2xkaW5nX2ZvbGRlcik7XHJcbiAgICAgKiB0dW5uZWwud2F0Y2god2ViaG9vayk7XHJcbiAgICAgKlxyXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbihqb2IsIG5lc3Qpe1xyXG4gICAgICogICAgICAvLyBHZXQgdGhlIGpvYl9pZCBmcm9tIHRoZSB3ZWJob29rIHJlcXVlc3RcclxuICAgICAqICAgICAgdmFyIGpvYl9pZCA9IGpvYi5nZXRQYXJhbWV0ZXIoXCJqb2JfaWRcIik7XHJcbiAgICAgKiAgICAgIC8vIEdldCB0aGUgaGVsZCBqb2IgZnJvbSB0aGUgaG9sZGluZyBmb2xkZXJcclxuICAgICAqICAgICAgdmFyIGNoZWNrcG9pbnRfam9iID0gaG9sZGluZ19mb2xkZXIuZ2V0SGVsZEpvYihqb2JfaWQpO1xyXG4gICAgICogICAgICAvLyBNb3ZlIHNvbWV3aGVyZSBlbHNlXHJcbiAgICAgKiAgICAgIGNoZWNrcG9pbnRfam9iLm1vdmUoYWYuY3JlYXRlQXV0b0ZvbGRlck5lc3QoW1widGVzdFwiLCBcIm91dGZvbGRlclwiXSkpO1xyXG4gICAgICogfSk7XHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEhlbGRKb2Ioam9iSWQ6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBmID0gdGhpcztcclxuICAgICAgICBsZXQgam9iID0gXy5maW5kKGYuZ2V0SGVsZEpvYnMoKSwgKGopID0+IGouZ2V0SWQoKSA9PT0gam9iSWQgKTtcclxuICAgICAgICBsZXQgam9iSW5kZXggPSBfLmZpbmRJbmRleChmLmdldEhlbGRKb2JzKCksIChqKSA9PiBqLmdldElkKCkgPT09IGpvYklkICk7XHJcblxyXG4gICAgICAgIGlmICgham9iKSB7XHJcbiAgICAgICAgICAgIGYuZS5sb2coMywgYEpvYiBJRCAke2pvYklkfSBjb3VsZCBub3QgYmUgZm91bmQgaW4gdGhlICR7Zi5nZXRIZWxkSm9icygpLmxlbmd0aH0gcGVuZGluZyBoZWxkIGpvYnMuYCwgZik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZi5oZWxkSm9icy5zcGxpY2Uoam9iSW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gam9iO1xyXG4gICAgfVxyXG59Il19
