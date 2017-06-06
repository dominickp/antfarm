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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0FuU0EsQUFtU0MsQ0FuUytCLFdBQUksR0FtU25DO0FBblNZLGdDQUFVIiwiZmlsZSI6ImxpYi9uZXN0L2ZvbGRlck5lc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcclxuaW1wb3J0IHsgTmVzdCB9IGZyb20gXCIuL25lc3RcIjtcclxuaW1wb3J0IHsgRmlsZUpvYiB9IGZyb20gXCIuLy4uL2pvYi9maWxlSm9iXCI7XHJcbmltcG9ydCB7IEZvbGRlckpvYiB9IGZyb20gXCIuLy4uL2pvYi9mb2xkZXJKb2JcIjtcclxuaW1wb3J0IHtKb2J9IGZyb20gXCIuLi9qb2Ivam9iXCI7XHJcblxyXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxyXG4gICAgICAgIHBhdGhfbW9kID0gcmVxdWlyZShcInBhdGhcIiksXHJcbiAgICAgICAgdG1wID0gcmVxdWlyZShcInRtcFwiKSxcclxuICAgICAgICBta2RpcnAgPSByZXF1aXJlKFwibWtkaXJwXCIpLFxyXG4gICAgICAgIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xyXG5cclxuLyoqXHJcbiAqIEEgZm9sZGVyIG5lc3QgaXMgYSBuZXN0IHdoaWNoIGNvbnRhaW5zIGEgYmFja2luZyBmb2xkZXIgYXQgYSBzcGVjaWZpYyBfcGF0aC4gSWYgdGhlIGZvbGRlciBkb2VzIG5vdCBleGlzdCxcclxuICogYW50ZmFybSBjYW4gb3B0aW9uYWxseSBjcmVhdGUgaXQuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRm9sZGVyTmVzdCBleHRlbmRzIE5lc3Qge1xyXG5cclxuICAgIHByb3RlY3RlZCBwYXRoOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgYWxsb3dDcmVhdGU6IGJvb2xlYW47XHJcbiAgICBwcm90ZWN0ZWQgaGVsZEpvYnM6IChGaWxlSm9ifEZvbGRlckpvYilbXTtcclxuICAgIHByaXZhdGUgX3dhdGNoZXI6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aD86IHN0cmluZywgYWxsb3dDcmVhdGU/OiBib29sZWFuKSB7XHJcbiAgICAgICAgbGV0IG5lc3RfbmFtZSA9IHBhdGhfbW9kLmJhc2VuYW1lKHBhdGgpO1xyXG4gICAgICAgIHN1cGVyKGUsIG5lc3RfbmFtZSk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuX3dhdGNoZXIgPSByZXF1aXJlKFwibm9kZS13YXRjaFwiKTtcclxuICAgICAgICB0aGlzLl93YXRjaGVyID0gcmVxdWlyZShcImNob2tpZGFyXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmFsbG93Q3JlYXRlID0gYWxsb3dDcmVhdGU7XHJcbiAgICAgICAgdGhpcy5jaGVja0RpcmVjdG9yeVN5bmMocGF0aCk7XHJcbiAgICAgICAgdGhpcy5wYXRoID0gcGF0aDtcclxuICAgICAgICB0aGlzLmhlbGRKb2JzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXQgd2F0Y2hlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fd2F0Y2hlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIHRoZSBfcGF0aCBmb3IgdGhlIGJhY2tpbmcgZm9sZGVyIGlzIGNyZWF0ZWQuIElmIG5vdCwgb3B0aW9uYWxseSBjcmVhdGUgaXQuXHJcbiAgICAgKiBAcGFyYW0gZGlyZWN0b3J5XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjaGVja0RpcmVjdG9yeVN5bmMoZGlyZWN0b3J5KSB7XHJcbiAgICAgICAgbGV0IGZuID0gdGhpcztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBmcy5zdGF0U3luYyhkaXJlY3RvcnkpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYgKGZuLmFsbG93Q3JlYXRlKSB7XHJcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhkaXJlY3RvcnkpO1xyXG4gICAgICAgICAgICAgICAgZm4uZS5sb2coMSwgYERpcmVjdG9yeSBcIiR7ZGlyZWN0b3J5fVwiIHdhcyBjcmVhdGVkIHNpbmNlIGl0IGRpZCBub3QgYWxyZWFkeSBleGlzdC5gLCB0aGlzKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZuLmUubG9nKDMsIGBEaXJlY3RvcnkgXCIke2RpcmVjdG9yeX1cIiBkaWQgbm90IGV4aXN0IGFuZCB3YXMgbm90IGNyZWF0ZWQuYCwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYW5kIGFycml2ZXMgbmV3IGpvYnMuIENhbiBwcm9kdWNlIGZpbGUgb3IgZm9sZGVyIGpvYnMuXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICogQHBhcmFtIGFycml2ZVxyXG4gICAgICogQHJldHVybnMge0ZvbGRlckpvYnxGaWxlSm9ifVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlSm9iKHBhdGg6IHN0cmluZywgYXJyaXZlID0gdHJ1ZSkge1xyXG5cclxuICAgICAgICBsZXQgZmwgPSB0aGlzO1xyXG4gICAgICAgIGxldCBqb2I7XHJcbiAgICAgICAgLy8gVmVyaWZ5IGZpbGUgc3RpbGwgZXhpc3RzLCBub2RlLXdhdGNoIGZpcmVzIG9uIGFueSBjaGFuZ2UsIGV2ZW4gZGVsZXRlXHJcblxyXG4gICAgICAgIC8vIENoZWNrIGZvciBpbmNvcnJlY3RseSBmb3VuZCBmaWxlc1xyXG5cclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImpvYiBwYXRoXCIsIHBhdGgpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZm9sZGVyIHBhdGhcIiwgZmwucGF0aCk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJ2bGFpZGl0aXlcIiwgZmwucGF0aC5pbmRleE9mKHBhdGgpID09PSAtMSk7XHJcblxyXG4gICAgICAgIGxldCBmbl9wYXRoID0gcGF0aF9tb2Qubm9ybWFsaXplKGZsLnBhdGgpXHJcbiAgICAgICAgbGV0IGluY29taW5nX2pvYl9wYXRoID0gcGF0aF9tb2Qubm9ybWFsaXplKHBhdGgpXHJcblxyXG4gICAgICAgIGlmIChpbmNvbWluZ19qb2JfcGF0aC5pbmRleE9mKGZuX3BhdGgpID09PSAtMSkge1xyXG4gICAgICAgICAgICBmbC5lLmxvZygzLCBgRm91bmQgam9iIHRoYXQgZGlkIG5vdCBleGlzdCBpbiB0aGlzIG5lc3QuIEpvYjogJHtpbmNvbWluZ19qb2JfcGF0aH06JHtmbl9wYXRofWAsIGZsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMocGF0aCwgZnMuRl9PSyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgam9iIGlzIGZvbGRlclxyXG4gICAgICAgICAgICAgICAgbGV0IHBhdGhfc3RhdHMgPSBmcy5sc3RhdFN5bmMocGF0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBhdGhfc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGpvYiA9IG5ldyBGb2xkZXJKb2IoZmwuZSwgcGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgam9iLmNyZWF0ZUZpbGVzKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFycml2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJpZ2dlciBhcnJpdmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbC5hcnJpdmUoam9iKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXRoX3N0YXRzLmlzRmlsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgam9iID0gbmV3IEZpbGVKb2IoZmwuZSwgcGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFycml2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmlnZ2VyIGFycml2ZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmwuYXJyaXZlKGpvYik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIlBhdGggaXMgbm90IGEgZmlsZSBvciBmb2xkZXIhXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIEl0IGlzbid0IGFjY2Vzc2libGVcclxuICAgICAgICAgICAgICAgIGZsLmUubG9nKDAsIFwiSm9iIGNyZWF0aW9uIGlnbm9yZWQgYmVjYXVzZSBmaWxlIGRpZCBub3QgZXhpc3QuXCIsIGZsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGpvYjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGV0aGVyIGEgX3BhdGggc3RhcnRzIHdpdGggb3IgY29udGFpbnMgYSBoaWRkZW4gZmlsZSBvciBhIGZvbGRlci5cclxuICAgICAqIEBwYXJhbSBwYXRoIHtzdHJpbmd9ICAgICAgVGhlIF9wYXRoIG9mIHRoZSBmaWxlIHRoYXQgbmVlZHMgdG8gYmUgdmFsaWRhdGVkLlxyXG4gICAgICogcmV0dXJucyB7Ym9vbGVhbn0gLSBgdHJ1ZWAgaWYgdGhlIHNvdXJjZSBpcyBibGFja2xpc3RlZCBhbmQgb3RoZXJ3aXNlIGBmYWxzZWAuXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBpc1VuaXhIaWRkZW5QYXRoIChwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QocGF0aCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbCBsb2FkIG9mIHRoZSBjb250ZW50cyBvZiB0aGUgZGlyZWN0b3J5LlxyXG4gICAgICogQHBhcmFtIGhvbGQge2Jvb2xlYW59ICAgIE9wdGlvbmFsIGZsYWcgdG8gaG9sZCBqb2JzIGZvdW5kLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbG9hZChob2xkOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcclxuICAgICAgICBsZXQgZmwgPSB0aGlzO1xyXG4gICAgICAgIGZzLnJlYWRkaXIoZmwucGF0aCwgKGVyciwgaXRlbXMpID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtcyA9IGl0ZW1zLmZpbHRlcihpdGVtID0+ICEoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChpdGVtKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbXMuZm9yRWFjaCgoZmlsZW5hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZmlsZXBhdGggPSBmbC5wYXRoICsgcGF0aF9tb2Quc2VwICsgZmlsZW5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGpvYjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaG9sZCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCB0cnVlKTsgLy8gQXJyaXZlcyBhcyB3ZWxsXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsLmhvbGRKb2Ioam9iKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2F0Y2hlcyB0aGUgZm9sZGVyLlxyXG4gICAgICogQHBhcmFtIGhvbGQge2Jvb2xlYW59ICAgIE9wdGlvbmFsIGZsYWcgdG8gaG9sZCBqb2JzIGZvdW5kLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgd2F0Y2goaG9sZDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGZsID0gdGhpcztcclxuICAgICAgICAvLyBsZXQgd2F0Y2hfb3B0aW9ucyA9IHtcclxuICAgICAgICAvLyAgICAgcmVjdXJzaXZlOiBmYWxzZSxcclxuICAgICAgICAvLyAgICAgZm9sbG93U3ltTGlua3M6IGZhbHNlXHJcbiAgICAgICAgLy8gfTtcclxuXHJcbiAgICAgICAgbGV0IGhhbmRsZVdhdGNoRXZlbnQgPSAoZmlsZXBhdGgpID0+IHtcclxuICAgICAgICAgICAgaWYgKGZsLnBhdGggIT09IGZpbGVwYXRoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgam9iO1xyXG4gICAgICAgICAgICAgICAgaWYgKGhvbGQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCB0cnVlKTsgLy8gQXJyaXZlcyBhcyB3ZWxsXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGpvYiA9IGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZsLmhvbGRKb2Ioam9iKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmbC5lLmxvZygyLCBgTmVzdCBmb3VuZCBpbiBuZXcgd2F0Y2guYCwgZmwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZmwuZS5sb2coMCwgYFdhdGNoaW5nICR7ZmwucGF0aH1gLCBmbCwgW2ZsLnR1bm5lbF0pO1xyXG5cclxuICAgICAgICBsZXQgY2hva09wdHMgPSB7aWdub3JlZDogL1tcXC9cXFxcXVxcLi99O1xyXG4gICAgICAgIC8vIGxldCBjaG9rT3B0cyA9IHtpZ25vcmVkOiAvW1xcL1xcXFxdXFwuLywgaWdub3JlSW5pdGlhbDogdHJ1ZSwgZGVwdGg6IDF9O1xyXG5cclxuXHJcbiAgICAgICAgLy8gZmwud2F0Y2hlcihmbC5wYXRoLCB3YXRjaF9vcHRpb25zLCBmaWxlcGF0aCA9PiB7XHJcbiAgICAgICAgbGV0IHdhdGNoZXJJbnN0YW5jZSA9IGZsLndhdGNoZXIud2F0Y2goZmwucGF0aCwgY2hva09wdHMpO1xyXG4gICAgICAgIHdhdGNoZXJJbnN0YW5jZVxyXG4gICAgICAgICAgICAub24oXCJhZGRcIiwgKGZpbGVwYXRoLCBldmVudCkgPT4geyBoYW5kbGVXYXRjaEV2ZW50KGZpbGVwYXRoKTsgfSlcclxuICAgICAgICAgICAgLm9uKFwiYWRkRGlyXCIsIChmaWxlcGF0aCwgZXZlbnQpID0+IHsgaGFuZGxlV2F0Y2hFdmVudChmaWxlcGF0aCk7IH0pXHJcbiAgICAgICAgICAgIC5vbihcImVycm9yXCIsIGVycm9yID0+IGZsLmUubG9nKDMsIGAgV2F0Y2hlciBlcnJvcjogJHtlcnJvcn1gLCBmbCkpXHJcbiAgICAgICAgICAgIC5vbihcInJhd1wiLCAoZXZlbnQsIHBhdGgsIGRldGFpbHMpID0+IHtcclxuICAgICAgICAgICAgICAgIGZsLmUubG9nKDAsIGBSYXcgZXZlbnQgaW5mbzogJHtldmVudH0sICR7cGF0aH0sICR7ZGV0YWlscy50b1N0cmluZygpfWAsIGZsKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaGVzIGFuZCBob2xkcyBqb2JzIGZvdW5kLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgd2F0Y2hIb2xkKCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBmbCA9IHRoaXM7XHJcbiAgICAgICAgZmwubG9hZCh0cnVlKTtcclxuICAgICAgICBmbC53YXRjaCh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFycml2ZSBmdW5jdGlvbiB0aGF0IGNhbGxzIHRoZSBzdXBlci5cclxuICAgICAqIEBwYXJhbSBqb2JcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFycml2ZShqb2I6IEZpbGVKb2IpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkFCT1VUIFRPIEFSUklWRVwiLCBqb2IubmFtZSwgXCIgSU4gTkVTVCBcIiwgdGhpcy5uYW1lKTtcclxuICAgICAgICBzdXBlci5hcnJpdmUoam9iKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBpY2tzIHVwIGEgam9iIGZyb20gYW5vdGhlciBuZXN0LlxyXG4gICAgICogQHBhcmFtIGpvYlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrICAgICAgQ2FsbGJhY2sgaXMgZ2l2ZW4gdGhlIGpvYiBpbiBpdHMgcGFyYW1ldGVyLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdGFrZShqb2I6IChGaWxlSm9ifEZvbGRlckpvYiksIGNhbGxiYWNrOiAoam9iOiBGaWxlSm9ifEZvbGRlckpvYikgPT4gdm9pZCkge1xyXG4gICAgICAgIGxldCBmbiA9IHRoaXM7XHJcbiAgICAgICAgLy8gdGhlIG90aGVyIG5lc3QgdGhhdCB0aGlzIGlzIHRha2luZyBmcm9tIHNob3VsZCBwcm92aWRlIGEgdGVtcG9yYXJ5IGxvY2F0aW9uIG9yIGxvY2FsIF9wYXRoIG9mIHRoZSBqb2JcclxuICAgICAgICBsZXQgbmV3X3BhdGggPSBgJHtmbi5wYXRofS8ke2pvYi5uYW1lfWA7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGZzLnJlbmFtZVN5bmMoam9iLnBhdGgsIG5ld19wYXRoKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgZm4uZS5sb2coMywgYEpvYiAke2pvYi5uYW1lfSBjb3VsZCBub3QgYmUgcmVuYW1lZCBpbiB0YWtlIG1ldGhvZC4gJHtlcnJ9YCwgZm4sIFtqb2JdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgam9iLnBhdGggPSBuZXdfcGF0aDtcclxuICAgICAgICAvLyBqb2IubmVzdCA9IGZuO1xyXG5cclxuICAgICAgICBjYWxsYmFjayhqb2IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTG9hZHMgam9icyB0aGF0IGhhdmUgcGlsZWQgdXAgaW4gdGhlIG5lc3QgaWYgaXQgd2FzIG5vdCB3YXRjaGVkLlxyXG4gICAgICogTm8gbG9uZ2VyIHVzZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9ICAgICBBcnJheSBvZiBqb2JzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRVbndhdGNoZWRKb2JzKCkge1xyXG4gICAgICAgIGxldCBmbCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGpvYnMgPSBbXTtcclxuICAgICAgICBsZXQgZmlsZUFycmF5ID0gZnMucmVhZGRpclN5bmMoZmwucGF0aCk7XHJcblxyXG4gICAgICAgIGxldCBpdGVtcyA9IGZpbGVBcnJheS5maWx0ZXIoaXRlbSA9PiAhKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QoaXRlbSkpO1xyXG5cclxuICAgICAgICBpdGVtcy5mb3JFYWNoKChmaWxlbmFtZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZmlsZXBhdGggPSBmbC5wYXRoICsgcGF0aF9tb2Quc2VwICsgZmlsZW5hbWU7XHJcbiAgICAgICAgICAgIGxldCBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcclxuICAgICAgICAgICAgam9icy5wdXNoKGpvYik7XHJcbiAgICAgICAgICAgIC8vIGZsLmhvbGRKb2Ioam9iKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGpvYnM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFsbCBoZWxkIGpvYnMuXHJcbiAgICAgKiBAcmV0dXJucyB7KEZpbGVKb2J8Rm9sZGVySm9iKVtdfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0SGVsZEpvYnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVsZEpvYnM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGpvYiB0byBhcnJheSBvZiBoZWxkIGpvYnMuXHJcbiAgICAgKiBAcGFyYW0gam9iXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBob2xkSm9iKGpvYjogKEZpbGVKb2J8Rm9sZGVySm9iKSkge1xyXG4gICAgICAgIHRoaXMuaGVsZEpvYnMucHVzaChqb2IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGEgaGVsZCBqb2Igd2l0aCBhIGpvYiBpZC4gUmVtb3ZlcyBpdCBmcm9tIHRoZSBoZWxkIGpvYiBxdWV1ZSxcclxuICAgICAqIHNvIHlvdSBzaG91bGQgbW92ZSBpdCBvdXQgb2YgdGhlIGZvbGRlciBhZnRlciB1c2luZyB0aGlzLlxyXG4gICAgICogQHBhcmFtIGpvYklkXHJcbiAgICAgKiBAcmV0dXJucyB7RmlsZUpvYnxGb2xkZXJKb2J9XHJcbiAgICAgKiAjIyMjIEV4YW1wbGVcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiB2YXIgdHVubmVsID0gYWYuY3JlYXRlVHVubmVsKFwiQ2hlY2twb2ludCBleGFtcGxlXCIpO1xyXG4gICAgICogdmFyIHdlYmhvb2sgPSBhZi5jcmVhdGVXZWJob29rTmVzdChbXCJ0ZXN0XCIsIFwiZXhhbXBsZVwiXSwgXCJnZXRcIik7XHJcbiAgICAgKiB2YXIgaG9sZGluZ19mb2xkZXIgPSBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChbXCJ0ZXN0XCIsIFwiY2hlY2twb2ludFwiXSk7XHJcbiAgICAgKlxyXG4gICAgICogdmFyIGltID0gd2ViaG9vay5nZXRJbnRlcmZhY2VNYW5hZ2VyKCk7XHJcbiAgICAgKlxyXG4gICAgICogLy8gV2F0Y2ggZm9yIGpvYnMsIGhvbGQsIGFuZCBwcm92aWRlIHRvIHRoZSBpbnRlcmZhY2UuXHJcbiAgICAgKiBpbS5jaGVja05lc3QoaG9sZGluZ19mb2xkZXIpO1xyXG4gICAgICogdHVubmVsLndhdGNoKHdlYmhvb2spO1xyXG4gICAgICpcclxuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24oam9iLCBuZXN0KXtcclxuICAgICAqICAgICAgLy8gR2V0IHRoZSBqb2JfaWQgZnJvbSB0aGUgd2ViaG9vayByZXF1ZXN0XHJcbiAgICAgKiAgICAgIHZhciBqb2JfaWQgPSBqb2IuZ2V0UGFyYW1ldGVyKFwiam9iX2lkXCIpO1xyXG4gICAgICogICAgICAvLyBHZXQgdGhlIGhlbGQgam9iIGZyb20gdGhlIGhvbGRpbmcgZm9sZGVyXHJcbiAgICAgKiAgICAgIHZhciBjaGVja3BvaW50X2pvYiA9IGhvbGRpbmdfZm9sZGVyLmdldEhlbGRKb2Ioam9iX2lkKTtcclxuICAgICAqICAgICAgLy8gTW92ZSBzb21ld2hlcmUgZWxzZVxyXG4gICAgICogICAgICBjaGVja3BvaW50X2pvYi5tb3ZlKGFmLmNyZWF0ZUF1dG9Gb2xkZXJOZXN0KFtcInRlc3RcIiwgXCJvdXRmb2xkZXJcIl0pKTtcclxuICAgICAqIH0pO1xyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRIZWxkSm9iKGpvYklkOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGpvYiA9IF8uZmluZChmLmdldEhlbGRKb2JzKCksIChqKSA9PiBqLmdldElkKCkgPT09IGpvYklkICk7XHJcbiAgICAgICAgbGV0IGpvYkluZGV4ID0gXy5maW5kSW5kZXgoZi5nZXRIZWxkSm9icygpLCAoaikgPT4gai5nZXRJZCgpID09PSBqb2JJZCApO1xyXG5cclxuICAgICAgICBpZiAoIWpvYikge1xyXG4gICAgICAgICAgICBmLmUubG9nKDMsIGBKb2IgSUQgJHtqb2JJZH0gY291bGQgbm90IGJlIGZvdW5kIGluIHRoZSAke2YuZ2V0SGVsZEpvYnMoKS5sZW5ndGh9IHBlbmRpbmcgaGVsZCBqb2JzLmAsIGYpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGYuaGVsZEpvYnMuc3BsaWNlKGpvYkluZGV4LCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGpvYjtcclxuICAgIH1cclxufSJdfQ==
