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
        _this.path = path_mod.normalize(path);
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
        var handleWatchEvent = function (filepath, event) {
            if (event === "add") {
                var fn_path = path_mod.normalize(fl.path);
                var found_job_path = path_mod.normalize(filepath);
                var found_job_folder = path_mod.dirname(found_job_path);
                if (fn_path !== found_job_folder) {
                    return;
                }
            }
            console.log(event);
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
        var chokOpts = { ignored: /[\/\\]\./, ignoreInitial: true };
        // let chokOpts = {ignored: /[\/\\]\./, ignoreInitial: true, depth: 1};
        var watcherInstance = fl.watcher.watch(fl.path, chokOpts);
        watcherInstance
            .on("add", function (filepath, event) { handleWatchEvent(filepath, "add"); })
            .on("addDir", function (filepath, event) { handleWatchEvent(filepath, "addDir"); })
            .on("error", function (error) { return fl.e.log(3, " Watcher error: " + error, fl); })
            .on("raw", function (event, path, details) {
            fl.e.log(1, "Raw event info: " + event + ", " + path + ", " + details.toString(), fl);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFFLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssS0FBSyxFQUFuQixDQUFtQixDQUFFLENBQUM7UUFDL0QsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssS0FBSyxFQUFuQixDQUFtQixDQUFFLENBQUM7UUFFekUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFlBQVUsS0FBSyxtQ0FBOEIsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sd0JBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUcsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0EvU0EsQUErU0MsQ0EvUytCLFdBQUksR0ErU25DO0FBL1NZLGdDQUFVIiwiZmlsZSI6ImxpYi9uZXN0L2ZvbGRlck5lc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcclxuaW1wb3J0IHsgTmVzdCB9IGZyb20gXCIuL25lc3RcIjtcclxuaW1wb3J0IHsgRmlsZUpvYiB9IGZyb20gXCIuLy4uL2pvYi9maWxlSm9iXCI7XHJcbmltcG9ydCB7IEZvbGRlckpvYiB9IGZyb20gXCIuLy4uL2pvYi9mb2xkZXJKb2JcIjtcclxuaW1wb3J0IHtKb2J9IGZyb20gXCIuLi9qb2Ivam9iXCI7XHJcblxyXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxyXG4gICAgICAgIHBhdGhfbW9kID0gcmVxdWlyZShcInBhdGhcIiksXHJcbiAgICAgICAgdG1wID0gcmVxdWlyZShcInRtcFwiKSxcclxuICAgICAgICBta2RpcnAgPSByZXF1aXJlKFwibWtkaXJwXCIpLFxyXG4gICAgICAgIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xyXG5cclxuLyoqXHJcbiAqIEEgZm9sZGVyIG5lc3QgaXMgYSBuZXN0IHdoaWNoIGNvbnRhaW5zIGEgYmFja2luZyBmb2xkZXIgYXQgYSBzcGVjaWZpYyBfcGF0aC4gSWYgdGhlIGZvbGRlciBkb2VzIG5vdCBleGlzdCxcclxuICogYW50ZmFybSBjYW4gb3B0aW9uYWxseSBjcmVhdGUgaXQuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRm9sZGVyTmVzdCBleHRlbmRzIE5lc3Qge1xyXG5cclxuICAgIHByb3RlY3RlZCBwYXRoOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgYWxsb3dDcmVhdGU6IGJvb2xlYW47XHJcbiAgICBwcm90ZWN0ZWQgaGVsZEpvYnM6IChGaWxlSm9ifEZvbGRlckpvYilbXTtcclxuICAgIHByaXZhdGUgX3dhdGNoZXI6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aD86IHN0cmluZywgYWxsb3dDcmVhdGU/OiBib29sZWFuKSB7XHJcbiAgICAgICAgbGV0IG5lc3RfbmFtZSA9IHBhdGhfbW9kLmJhc2VuYW1lKHBhdGgpO1xyXG4gICAgICAgIHN1cGVyKGUsIG5lc3RfbmFtZSk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuX3dhdGNoZXIgPSByZXF1aXJlKFwibm9kZS13YXRjaFwiKTtcclxuICAgICAgICB0aGlzLl93YXRjaGVyID0gcmVxdWlyZShcImNob2tpZGFyXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmFsbG93Q3JlYXRlID0gYWxsb3dDcmVhdGU7XHJcbiAgICAgICAgdGhpcy5jaGVja0RpcmVjdG9yeVN5bmMocGF0aCk7XHJcbiAgICAgICAgdGhpcy5wYXRoID0gcGF0aF9tb2Qubm9ybWFsaXplKHBhdGgpO1xyXG4gICAgICAgIHRoaXMuaGVsZEpvYnMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldCB3YXRjaGVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl93YXRjaGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2sgaWYgdGhlIF9wYXRoIGZvciB0aGUgYmFja2luZyBmb2xkZXIgaXMgY3JlYXRlZC4gSWYgbm90LCBvcHRpb25hbGx5IGNyZWF0ZSBpdC5cclxuICAgICAqIEBwYXJhbSBkaXJlY3RvcnlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNoZWNrRGlyZWN0b3J5U3luYyhkaXJlY3RvcnkpIHtcclxuICAgICAgICBsZXQgZm4gPSB0aGlzO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGZzLnN0YXRTeW5jKGRpcmVjdG9yeSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBpZiAoZm4uYWxsb3dDcmVhdGUpIHtcclxuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKGRpcmVjdG9yeSk7XHJcbiAgICAgICAgICAgICAgICBmbi5lLmxvZygxLCBgRGlyZWN0b3J5IFwiJHtkaXJlY3Rvcnl9XCIgd2FzIGNyZWF0ZWQgc2luY2UgaXQgZGlkIG5vdCBhbHJlYWR5IGV4aXN0LmAsIHRoaXMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm4uZS5sb2coMywgYERpcmVjdG9yeSBcIiR7ZGlyZWN0b3J5fVwiIGRpZCBub3QgZXhpc3QgYW5kIHdhcyBub3QgY3JlYXRlZC5gLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhbmQgYXJyaXZlcyBuZXcgam9icy4gQ2FuIHByb2R1Y2UgZmlsZSBvciBmb2xkZXIgam9icy5cclxuICAgICAqIEBwYXJhbSBwYXRoXHJcbiAgICAgKiBAcGFyYW0gYXJyaXZlXHJcbiAgICAgKiBAcmV0dXJucyB7Rm9sZGVySm9ifEZpbGVKb2J9XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjcmVhdGVKb2IocGF0aDogc3RyaW5nLCBhcnJpdmUgPSB0cnVlKSB7XHJcblxyXG4gICAgICAgIGxldCBmbCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGpvYjtcclxuICAgICAgICAvLyBWZXJpZnkgZmlsZSBzdGlsbCBleGlzdHMsIG5vZGUtd2F0Y2ggZmlyZXMgb24gYW55IGNoYW5nZSwgZXZlbiBkZWxldGVcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGluY29ycmVjdGx5IGZvdW5kIGZpbGVzXHJcblxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiam9iIHBhdGhcIiwgcGF0aCk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJmb2xkZXIgcGF0aFwiLCBmbC5wYXRoKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInZsYWlkaXRpeVwiLCBmbC5wYXRoLmluZGV4T2YocGF0aCkgPT09IC0xKTtcclxuXHJcbiAgICAgICAgbGV0IGZuX3BhdGggPSBwYXRoX21vZC5ub3JtYWxpemUoZmwucGF0aCk7XHJcbiAgICAgICAgbGV0IGluY29taW5nX2pvYl9wYXRoID0gcGF0aF9tb2Qubm9ybWFsaXplKHBhdGgpO1xyXG5cclxuICAgICAgICBpZiAoaW5jb21pbmdfam9iX3BhdGguaW5kZXhPZihmbl9wYXRoKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgZmwuZS5sb2coMywgYEZvdW5kIGpvYiB0aGF0IGRpZCBub3QgZXhpc3QgaW4gdGhpcyBuZXN0LiBKb2I6ICR7aW5jb21pbmdfam9iX3BhdGh9OiR7Zm5fcGF0aH1gLCBmbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jKHBhdGgsIGZzLkZfT0spO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGpvYiBpcyBmb2xkZXJcclxuICAgICAgICAgICAgICAgIGxldCBwYXRoX3N0YXRzID0gZnMubHN0YXRTeW5jKHBhdGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYXRoX3N0YXRzLmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBqb2IgPSBuZXcgRm9sZGVySm9iKGZsLmUsIHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGpvYi5jcmVhdGVGaWxlcygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnJpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgYXJyaXZlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmwuYXJyaXZlKGpvYik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0aF9zdGF0cy5pc0ZpbGUoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGpvYiA9IG5ldyBGaWxlSm9iKGZsLmUsIHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcnJpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJpZ2dlciBhcnJpdmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsLmFycml2ZShqb2IpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJQYXRoIGlzIG5vdCBhIGZpbGUgb3IgZm9sZGVyIVwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJdCBpc24ndCBhY2Nlc3NpYmxlXHJcbiAgICAgICAgICAgICAgICBmbC5lLmxvZygwLCBcIkpvYiBjcmVhdGlvbiBpZ25vcmVkIGJlY2F1c2UgZmlsZSBkaWQgbm90IGV4aXN0LlwiLCBmbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBqb2I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3Mgd2hldGhlciBhIF9wYXRoIHN0YXJ0cyB3aXRoIG9yIGNvbnRhaW5zIGEgaGlkZGVuIGZpbGUgb3IgYSBmb2xkZXIuXHJcbiAgICAgKiBAcGFyYW0gcGF0aCB7c3RyaW5nfSAgICAgIFRoZSBfcGF0aCBvZiB0aGUgZmlsZSB0aGF0IG5lZWRzIHRvIGJlIHZhbGlkYXRlZC5cclxuICAgICAqIHJldHVybnMge2Jvb2xlYW59IC0gYHRydWVgIGlmIHRoZSBzb3VyY2UgaXMgYmxhY2tsaXN0ZWQgYW5kIG90aGVyd2lzZSBgZmFsc2VgLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgaXNVbml4SGlkZGVuUGF0aCAocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KHBhdGgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWwgbG9hZCBvZiB0aGUgY29udGVudHMgb2YgdGhlIGRpcmVjdG9yeS5cclxuICAgICAqIEBwYXJhbSBob2xkIHtib29sZWFufSAgICBPcHRpb25hbCBmbGFnIHRvIGhvbGQgam9icyBmb3VuZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGxvYWQoaG9sZDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGZsID0gdGhpcztcclxuICAgICAgICBmcy5yZWFkZGlyKGZsLnBhdGgsIChlcnIsIGl0ZW1zKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtcykge1xyXG4gICAgICAgICAgICAgICAgaXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiAhKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QoaXRlbSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGl0ZW1zLmZvckVhY2goKGZpbGVuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGVwYXRoID0gZmwucGF0aCArIHBhdGhfbW9kLnNlcCArIGZpbGVuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBqb2I7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvbGQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgdHJ1ZSk7IC8vIEFycml2ZXMgYXMgd2VsbFxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGpvYiA9IGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmbC5ob2xkSm9iKGpvYik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdhdGNoZXMgdGhlIGZvbGRlci5cclxuICAgICAqIEBwYXJhbSBob2xkIHtib29sZWFufSAgICBPcHRpb25hbCBmbGFnIHRvIGhvbGQgam9icyBmb3VuZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHdhdGNoKGhvbGQ6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBmbCA9IHRoaXM7XHJcbiAgICAgICAgLy8gbGV0IHdhdGNoX29wdGlvbnMgPSB7XHJcbiAgICAgICAgLy8gICAgIHJlY3Vyc2l2ZTogZmFsc2UsXHJcbiAgICAgICAgLy8gICAgIGZvbGxvd1N5bUxpbmtzOiBmYWxzZVxyXG4gICAgICAgIC8vIH07XHJcblxyXG4gICAgICAgIGxldCBoYW5kbGVXYXRjaEV2ZW50ID0gKGZpbGVwYXRoOiBzdHJpbmcsIGV2ZW50OiBzdHJpbmcpID0+IHtcclxuXHJcblxyXG4gICAgICAgICAgICBpZiAoZXZlbnQgPT09IFwiYWRkXCIpIHtcclxuICAgICAgICAgICAgICAgIGxldCBmbl9wYXRoID0gcGF0aF9tb2Qubm9ybWFsaXplKGZsLnBhdGgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvdW5kX2pvYl9wYXRoID0gcGF0aF9tb2Qubm9ybWFsaXplKGZpbGVwYXRoKTtcclxuICAgICAgICAgICAgICAgIGxldCBmb3VuZF9qb2JfZm9sZGVyID0gcGF0aF9tb2QuZGlybmFtZShmb3VuZF9qb2JfcGF0aCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZm5fcGF0aCAhPT0gZm91bmRfam9iX2ZvbGRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXZlbnQpXHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKGZsLnBhdGggIT09IGZpbGVwYXRoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgam9iO1xyXG4gICAgICAgICAgICAgICAgaWYgKGhvbGQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCB0cnVlKTsgLy8gQXJyaXZlcyBhcyB3ZWxsXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGpvYiA9IGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZsLmhvbGRKb2Ioam9iKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmbC5lLmxvZygyLCBgTmVzdCBmb3VuZCBpbiBuZXcgd2F0Y2guYCwgZmwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZmwuZS5sb2coMCwgYFdhdGNoaW5nICR7ZmwucGF0aH1gLCBmbCwgW2ZsLnR1bm5lbF0pO1xyXG5cclxuICAgICAgICBsZXQgY2hva09wdHMgPSB7aWdub3JlZDogL1tcXC9cXFxcXVxcLi8sIGlnbm9yZUluaXRpYWw6IHRydWV9O1xyXG4gICAgICAgIC8vIGxldCBjaG9rT3B0cyA9IHtpZ25vcmVkOiAvW1xcL1xcXFxdXFwuLywgaWdub3JlSW5pdGlhbDogdHJ1ZSwgZGVwdGg6IDF9O1xyXG5cclxuICAgICAgICBsZXQgd2F0Y2hlckluc3RhbmNlID0gZmwud2F0Y2hlci53YXRjaChmbC5wYXRoLCBjaG9rT3B0cyk7XHJcbiAgICAgICAgd2F0Y2hlckluc3RhbmNlXHJcbiAgICAgICAgICAgIC5vbihcImFkZFwiLCAoZmlsZXBhdGgsIGV2ZW50KSA9PiB7IGhhbmRsZVdhdGNoRXZlbnQoZmlsZXBhdGgsIFwiYWRkXCIpOyB9KVxyXG4gICAgICAgICAgICAub24oXCJhZGREaXJcIiwgKGZpbGVwYXRoLCBldmVudCkgPT4geyBoYW5kbGVXYXRjaEV2ZW50KGZpbGVwYXRoLCBcImFkZERpclwiKTsgfSlcclxuICAgICAgICAgICAgLm9uKFwiZXJyb3JcIiwgZXJyb3IgPT4gZmwuZS5sb2coMywgYCBXYXRjaGVyIGVycm9yOiAke2Vycm9yfWAsIGZsKSlcclxuICAgICAgICAgICAgLm9uKFwicmF3XCIsIChldmVudCwgcGF0aCwgZGV0YWlscykgPT4ge1xyXG4gICAgICAgICAgICAgICAgZmwuZS5sb2coMSwgYFJhdyBldmVudCBpbmZvOiAke2V2ZW50fSwgJHtwYXRofSwgJHtkZXRhaWxzLnRvU3RyaW5nKCl9YCwgZmwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdhdGNoZXMgYW5kIGhvbGRzIGpvYnMgZm91bmQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB3YXRjaEhvbGQoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGZsID0gdGhpcztcclxuICAgICAgICBmbC5sb2FkKHRydWUpO1xyXG4gICAgICAgIGZsLndhdGNoKHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXJyaXZlIGZ1bmN0aW9uIHRoYXQgY2FsbHMgdGhlIHN1cGVyLlxyXG4gICAgICogQHBhcmFtIGpvYlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXJyaXZlKGpvYjogRmlsZUpvYikge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQUJPVVQgVE8gQVJSSVZFXCIsIGpvYi5uYW1lLCBcIiBJTiBORVNUIFwiLCB0aGlzLm5hbWUpO1xyXG4gICAgICAgIHN1cGVyLmFycml2ZShqb2IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGlja3MgdXAgYSBqb2IgZnJvbSBhbm90aGVyIG5lc3QuXHJcbiAgICAgKiBAcGFyYW0gam9iXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgICAgICBDYWxsYmFjayBpcyBnaXZlbiB0aGUgam9iIGluIGl0cyBwYXJhbWV0ZXIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0YWtlKGpvYjogKEZpbGVKb2J8Rm9sZGVySm9iKSwgY2FsbGJhY2s6IChqb2I6IEZpbGVKb2J8Rm9sZGVySm9iKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgbGV0IGZuID0gdGhpcztcclxuICAgICAgICAvLyB0aGUgb3RoZXIgbmVzdCB0aGF0IHRoaXMgaXMgdGFraW5nIGZyb20gc2hvdWxkIHByb3ZpZGUgYSB0ZW1wb3JhcnkgbG9jYXRpb24gb3IgbG9jYWwgX3BhdGggb2YgdGhlIGpvYlxyXG4gICAgICAgIGxldCBuZXdfcGF0aCA9IGAke2ZuLnBhdGh9LyR7am9iLm5hbWV9YDtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZnMucmVuYW1lU3luYyhqb2IucGF0aCwgbmV3X3BhdGgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBmbi5lLmxvZygzLCBgSm9iICR7am9iLm5hbWV9IGNvdWxkIG5vdCBiZSByZW5hbWVkIGluIHRha2UgbWV0aG9kLiAke2Vycn1gLCBmbiwgW2pvYl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBqb2IucGF0aCA9IG5ld19wYXRoO1xyXG4gICAgICAgIC8vIGpvYi5uZXN0ID0gZm47XHJcblxyXG4gICAgICAgIGNhbGxiYWNrKGpvYik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2FkcyBqb2JzIHRoYXQgaGF2ZSBwaWxlZCB1cCBpbiB0aGUgbmVzdCBpZiBpdCB3YXMgbm90IHdhdGNoZWQuXHJcbiAgICAgKiBObyBsb25nZXIgdXNlZC5cclxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gICAgIEFycmF5IG9mIGpvYnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFVud2F0Y2hlZEpvYnMoKSB7XHJcbiAgICAgICAgbGV0IGZsID0gdGhpcztcclxuICAgICAgICBsZXQgam9icyA9IFtdO1xyXG4gICAgICAgIGxldCBmaWxlQXJyYXkgPSBmcy5yZWFkZGlyU3luYyhmbC5wYXRoKTtcclxuXHJcbiAgICAgICAgbGV0IGl0ZW1zID0gZmlsZUFycmF5LmZpbHRlcihpdGVtID0+ICEoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChpdGVtKSk7XHJcblxyXG4gICAgICAgIGl0ZW1zLmZvckVhY2goKGZpbGVuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZsLnBhdGggKyBwYXRoX21vZC5zZXAgKyBmaWxlbmFtZTtcclxuICAgICAgICAgICAgbGV0IGpvYiA9IGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgZmFsc2UpO1xyXG4gICAgICAgICAgICBqb2JzLnB1c2goam9iKTtcclxuICAgICAgICAgICAgLy8gZmwuaG9sZEpvYihqb2IpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gam9icztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYWxsIGhlbGQgam9icy5cclxuICAgICAqIEByZXR1cm5zIHsoRmlsZUpvYnxGb2xkZXJKb2IpW119XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRIZWxkSm9icygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oZWxkSm9icztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgam9iIHRvIGFycmF5IG9mIGhlbGQgam9icy5cclxuICAgICAqIEBwYXJhbSBqb2JcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGhvbGRKb2Ioam9iOiAoRmlsZUpvYnxGb2xkZXJKb2IpKSB7XHJcbiAgICAgICAgdGhpcy5oZWxkSm9icy5wdXNoKGpvYik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgYSBoZWxkIGpvYiB3aXRoIGEgam9iIGlkLiBSZW1vdmVzIGl0IGZyb20gdGhlIGhlbGQgam9iIHF1ZXVlLFxyXG4gICAgICogc28geW91IHNob3VsZCBtb3ZlIGl0IG91dCBvZiB0aGUgZm9sZGVyIGFmdGVyIHVzaW5nIHRoaXMuXHJcbiAgICAgKiBAcGFyYW0gam9iSWRcclxuICAgICAqIEByZXR1cm5zIHtGaWxlSm9ifEZvbGRlckpvYn1cclxuICAgICAqICMjIyMgRXhhbXBsZVxyXG4gICAgICogYGBganNcclxuICAgICAqIHZhciB0dW5uZWwgPSBhZi5jcmVhdGVUdW5uZWwoXCJDaGVja3BvaW50IGV4YW1wbGVcIik7XHJcbiAgICAgKiB2YXIgd2ViaG9vayA9IGFmLmNyZWF0ZVdlYmhvb2tOZXN0KFtcInRlc3RcIiwgXCJleGFtcGxlXCJdLCBcImdldFwiKTtcclxuICAgICAqIHZhciBob2xkaW5nX2ZvbGRlciA9IGFmLmNyZWF0ZUF1dG9Gb2xkZXJOZXN0KFtcInRlc3RcIiwgXCJjaGVja3BvaW50XCJdKTtcclxuICAgICAqXHJcbiAgICAgKiB2YXIgaW0gPSB3ZWJob29rLmdldEludGVyZmFjZU1hbmFnZXIoKTtcclxuICAgICAqXHJcbiAgICAgKiAvLyBXYXRjaCBmb3Igam9icywgaG9sZCwgYW5kIHByb3ZpZGUgdG8gdGhlIGludGVyZmFjZS5cclxuICAgICAqIGltLmNoZWNrTmVzdChob2xkaW5nX2ZvbGRlcik7XHJcbiAgICAgKiB0dW5uZWwud2F0Y2god2ViaG9vayk7XHJcbiAgICAgKlxyXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbihqb2IsIG5lc3Qpe1xyXG4gICAgICogICAgICAvLyBHZXQgdGhlIGpvYl9pZCBmcm9tIHRoZSB3ZWJob29rIHJlcXVlc3RcclxuICAgICAqICAgICAgdmFyIGpvYl9pZCA9IGpvYi5nZXRQYXJhbWV0ZXIoXCJqb2JfaWRcIik7XHJcbiAgICAgKiAgICAgIC8vIEdldCB0aGUgaGVsZCBqb2IgZnJvbSB0aGUgaG9sZGluZyBmb2xkZXJcclxuICAgICAqICAgICAgdmFyIGNoZWNrcG9pbnRfam9iID0gaG9sZGluZ19mb2xkZXIuZ2V0SGVsZEpvYihqb2JfaWQpO1xyXG4gICAgICogICAgICAvLyBNb3ZlIHNvbWV3aGVyZSBlbHNlXHJcbiAgICAgKiAgICAgIGNoZWNrcG9pbnRfam9iLm1vdmUoYWYuY3JlYXRlQXV0b0ZvbGRlck5lc3QoW1widGVzdFwiLCBcIm91dGZvbGRlclwiXSkpO1xyXG4gICAgICogfSk7XHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEhlbGRKb2Ioam9iSWQ6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBmID0gdGhpcztcclxuICAgICAgICBsZXQgam9iID0gXy5maW5kKGYuZ2V0SGVsZEpvYnMoKSwgKGopID0+IGouZ2V0SWQoKSA9PT0gam9iSWQgKTtcclxuICAgICAgICBsZXQgam9iSW5kZXggPSBfLmZpbmRJbmRleChmLmdldEhlbGRKb2JzKCksIChqKSA9PiBqLmdldElkKCkgPT09IGpvYklkICk7XHJcblxyXG4gICAgICAgIGlmICgham9iKSB7XHJcbiAgICAgICAgICAgIGYuZS5sb2coMywgYEpvYiBJRCAke2pvYklkfSBjb3VsZCBub3QgYmUgZm91bmQgaW4gdGhlICR7Zi5nZXRIZWxkSm9icygpLmxlbmd0aH0gcGVuZGluZyBoZWxkIGpvYnMuYCwgZik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZi5oZWxkSm9icy5zcGxpY2Uoam9iSW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gam9iO1xyXG4gICAgfVxyXG59Il19
