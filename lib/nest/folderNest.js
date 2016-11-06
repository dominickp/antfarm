"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nest_1 = require("./nest");
var fileJob_1 = require("./../job/fileJob");
var folderJob_1 = require("./../job/folderJob");
var node_watch = require("node-watch"), fs = require("fs"), path_mod = require("path"), tmp = require("tmp"), mkdirp = require("mkdirp"), _ = require("lodash");
/**
 * A folder nest is a nest which contains a backing folder at a specific _path. If the folder does not exist,
 * antfarm can optionally create it.
 */
var FolderNest = (function (_super) {
    __extends(FolderNest, _super);
    function FolderNest(e, path, allowCreate) {
        var nest_name = path_mod.basename(path);
        _super.call(this, e, nest_name);
        this.allowCreate = allowCreate;
        this.checkDirectorySync(path);
        this.path = path;
        this.heldJobs = [];
    }
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
        var watch_options = {
            recursive: false
        };
        fl.e.log(0, "Watching " + fl.path, fl, [fl.tunnel]);
        node_watch(fl.path, watch_options, function (filepath) {
            if (!fl.isUnixHiddenPath(filepath)) {
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
                fl.e.log(2, "Hidden file \"" + filepath + "\" ignored.", fl);
            }
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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bXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7IE5lc3QgfSBmcm9tIFwiLi9uZXN0XCI7XG5pbXBvcnQgeyBGaWxlSm9iIH0gZnJvbSBcIi4vLi4vam9iL2ZpbGVKb2JcIjtcbmltcG9ydCB7IEZvbGRlckpvYiB9IGZyb20gXCIuLy4uL2pvYi9mb2xkZXJKb2JcIjtcbmltcG9ydCB7Sm9ifSBmcm9tIFwiLi4vam9iL2pvYlwiO1xuXG5jb25zdCAgIG5vZGVfd2F0Y2ggPSByZXF1aXJlKFwibm9kZS13YXRjaFwiKSxcbiAgICAgICAgZnMgPSByZXF1aXJlKFwiZnNcIiksXG4gICAgICAgIHBhdGhfbW9kID0gcmVxdWlyZShcInBhdGhcIiksXG4gICAgICAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIiksXG4gICAgICAgIG1rZGlycCA9IHJlcXVpcmUoXCJta2RpcnBcIiksXG4gICAgICAgIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xuXG4vKipcbiAqIEEgZm9sZGVyIG5lc3QgaXMgYSBuZXN0IHdoaWNoIGNvbnRhaW5zIGEgYmFja2luZyBmb2xkZXIgYXQgYSBzcGVjaWZpYyBfcGF0aC4gSWYgdGhlIGZvbGRlciBkb2VzIG5vdCBleGlzdCxcbiAqIGFudGZhcm0gY2FuIG9wdGlvbmFsbHkgY3JlYXRlIGl0LlxuICovXG5leHBvcnQgY2xhc3MgRm9sZGVyTmVzdCBleHRlbmRzIE5lc3Qge1xuXG4gICAgcHJvdGVjdGVkIHBhdGg6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgYWxsb3dDcmVhdGU6IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIGhlbGRKb2JzOiAoRmlsZUpvYnxGb2xkZXJKb2IpW107XG5cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aD86IHN0cmluZywgYWxsb3dDcmVhdGU/OiBib29sZWFuKSB7XG4gICAgICAgIGxldCBuZXN0X25hbWUgPSBwYXRoX21vZC5iYXNlbmFtZShwYXRoKTtcbiAgICAgICAgc3VwZXIoZSwgbmVzdF9uYW1lKTtcblxuICAgICAgICB0aGlzLmFsbG93Q3JlYXRlID0gYWxsb3dDcmVhdGU7XG4gICAgICAgIHRoaXMuY2hlY2tEaXJlY3RvcnlTeW5jKHBhdGgpO1xuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLmhlbGRKb2JzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIF9wYXRoIGZvciB0aGUgYmFja2luZyBmb2xkZXIgaXMgY3JlYXRlZC4gSWYgbm90LCBvcHRpb25hbGx5IGNyZWF0ZSBpdC5cbiAgICAgKiBAcGFyYW0gZGlyZWN0b3J5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNoZWNrRGlyZWN0b3J5U3luYyhkaXJlY3RvcnkpIHtcbiAgICAgICAgbGV0IGZuID0gdGhpcztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnN0YXRTeW5jKGRpcmVjdG9yeSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChmbi5hbGxvd0NyZWF0ZSkge1xuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKGRpcmVjdG9yeSk7XG4gICAgICAgICAgICAgICAgZm4uZS5sb2coMSwgYERpcmVjdG9yeSBcIiR7ZGlyZWN0b3J5fVwiIHdhcyBjcmVhdGVkIHNpbmNlIGl0IGRpZCBub3QgYWxyZWFkeSBleGlzdC5gLCB0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm4uZS5sb2coMywgYERpcmVjdG9yeSBcIiR7ZGlyZWN0b3J5fVwiIGRpZCBub3QgZXhpc3QgYW5kIHdhcyBub3QgY3JlYXRlZC5gLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhbmQgYXJyaXZlcyBuZXcgam9icy4gQ2FuIHByb2R1Y2UgZmlsZSBvciBmb2xkZXIgam9icy5cbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqIEBwYXJhbSBhcnJpdmVcbiAgICAgKiBAcmV0dXJucyB7Rm9sZGVySm9ifEZpbGVKb2J9XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUpvYihwYXRoOiBzdHJpbmcsIGFycml2ZSA9IHRydWUpIHtcblxuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBsZXQgam9iO1xuICAgICAgICAvLyBWZXJpZnkgZmlsZSBzdGlsbCBleGlzdHMsIG5vZGUtd2F0Y2ggZmlyZXMgb24gYW55IGNoYW5nZSwgZXZlbiBkZWxldGVcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMocGF0aCwgZnMuRl9PSyk7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGpvYiBpcyBmb2xkZXJcbiAgICAgICAgICAgIGxldCBwYXRoX3N0YXRzID0gZnMubHN0YXRTeW5jKHBhdGgpO1xuXG4gICAgICAgICAgICBpZiAocGF0aF9zdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgam9iID0gbmV3IEZvbGRlckpvYihmbC5lLCBwYXRoKTtcbiAgICAgICAgICAgICAgICBqb2IuY3JlYXRlRmlsZXMoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyaXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmlnZ2VyIGFycml2ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsLmFycml2ZShqb2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGhfc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgICBqb2IgPSBuZXcgRmlsZUpvYihmbC5lLCBwYXRoKTtcbiAgICAgICAgICAgICAgICBpZiAoYXJyaXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgYXJyaXZlZFxuICAgICAgICAgICAgICAgICAgICBmbC5hcnJpdmUoam9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IFwiUGF0aCBpcyBub3QgYSBmaWxlIG9yIGZvbGRlciFcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gSXQgaXNuJ3QgYWNjZXNzaWJsZVxuICAgICAgICAgICAgZmwuZS5sb2coMCwgXCJKb2IgY3JlYXRpb24gaWdub3JlZCBiZWNhdXNlIGZpbGUgZGlkIG5vdCBleGlzdC5cIiwgZmwpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpvYjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3Mgd2hldGhlciBhIF9wYXRoIHN0YXJ0cyB3aXRoIG9yIGNvbnRhaW5zIGEgaGlkZGVuIGZpbGUgb3IgYSBmb2xkZXIuXG4gICAgICogQHBhcmFtIHBhdGgge3N0cmluZ30gICAgICBUaGUgX3BhdGggb2YgdGhlIGZpbGUgdGhhdCBuZWVkcyB0byBiZSB2YWxpZGF0ZWQuXG4gICAgICogcmV0dXJucyB7Ym9vbGVhbn0gLSBgdHJ1ZWAgaWYgdGhlIHNvdXJjZSBpcyBibGFja2xpc3RlZCBhbmQgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGlzVW5peEhpZGRlblBhdGggKHBhdGg6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QocGF0aCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWwgbG9hZCBvZiB0aGUgY29udGVudHMgb2YgdGhlIGRpcmVjdG9yeS5cbiAgICAgKiBAcGFyYW0gaG9sZCB7Ym9vbGVhbn0gICAgT3B0aW9uYWwgZmxhZyB0byBob2xkIGpvYnMgZm91bmQuXG4gICAgICovXG4gICAgcHVibGljIGxvYWQoaG9sZDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgICAgIGxldCBmbCA9IHRoaXM7XG4gICAgICAgIGZzLnJlYWRkaXIoZmwucGF0aCwgKGVyciwgaXRlbXMpID0+IHtcbiAgICAgICAgICAgIGlmIChpdGVtcykge1xuICAgICAgICAgICAgICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gISgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KGl0ZW0pKTtcblxuICAgICAgICAgICAgICAgIGl0ZW1zLmZvckVhY2goKGZpbGVuYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZsLnBhdGggKyBwYXRoX21vZC5zZXAgKyBmaWxlbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGpvYjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvbGQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIHRydWUpOyAvLyBBcnJpdmVzIGFzIHdlbGxcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGpvYiA9IGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmwuaG9sZEpvYihqb2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoZXMgdGhlIGZvbGRlci5cbiAgICAgKiBAcGFyYW0gaG9sZCB7Ym9vbGVhbn0gICAgT3B0aW9uYWwgZmxhZyB0byBob2xkIGpvYnMgZm91bmQuXG4gICAgICovXG4gICAgcHVibGljIHdhdGNoKGhvbGQ6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBsZXQgd2F0Y2hfb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHJlY3Vyc2l2ZTogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICBmbC5lLmxvZygwLCBgV2F0Y2hpbmcgJHtmbC5wYXRofWAsIGZsLCBbZmwudHVubmVsXSk7XG5cbiAgICAgICAgbm9kZV93YXRjaChmbC5wYXRoLCB3YXRjaF9vcHRpb25zLCBmaWxlcGF0aCA9PiB7XG4gICAgICAgICAgICBpZiAoIWZsLmlzVW5peEhpZGRlblBhdGgoZmlsZXBhdGgpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGpvYjtcbiAgICAgICAgICAgICAgICBpZiAoaG9sZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCB0cnVlKTsgLy8gQXJyaXZlcyBhcyB3ZWxsXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGZsLmhvbGRKb2Ioam9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZsLmUubG9nKDIsIGBIaWRkZW4gZmlsZSBcIiR7ZmlsZXBhdGh9XCIgaWdub3JlZC5gLCBmbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoZXMgYW5kIGhvbGRzIGpvYnMgZm91bmQuXG4gICAgICovXG4gICAgcHVibGljIHdhdGNoSG9sZCgpOiB2b2lkIHtcbiAgICAgICAgbGV0IGZsID0gdGhpcztcbiAgICAgICAgZmwubG9hZCh0cnVlKTtcbiAgICAgICAgZmwud2F0Y2godHJ1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXJyaXZlIGZ1bmN0aW9uIHRoYXQgY2FsbHMgdGhlIHN1cGVyLlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKi9cbiAgICBwdWJsaWMgYXJyaXZlKGpvYjogRmlsZUpvYikge1xuICAgICAgICBzdXBlci5hcnJpdmUoam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQaWNrcyB1cCBhIGpvYiBmcm9tIGFub3RoZXIgbmVzdC5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICogQHBhcmFtIGNhbGxiYWNrICAgICAgQ2FsbGJhY2sgaXMgZ2l2ZW4gdGhlIGpvYiBpbiBpdHMgcGFyYW1ldGVyLlxuICAgICAqL1xuICAgIHB1YmxpYyB0YWtlKGpvYjogKEZpbGVKb2J8Rm9sZGVySm9iKSwgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBsZXQgZm4gPSB0aGlzO1xuICAgICAgICAvLyB0aGUgb3RoZXIgbmVzdCB0aGF0IHRoaXMgaXMgdGFraW5nIGZyb20gc2hvdWxkIHByb3ZpZGUgYSB0ZW1wb3JhcnkgbG9jYXRpb24gb3IgbG9jYWwgX3BhdGggb2YgdGhlIGpvYlxuICAgICAgICBsZXQgbmV3X3BhdGggPSBgJHtmbi5wYXRofS8ke2pvYi5uYW1lfWA7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnJlbmFtZVN5bmMoam9iLnBhdGgsIG5ld19wYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBmbi5lLmxvZygzLCBgSm9iICR7am9iLm5hbWV9IGNvdWxkIG5vdCBiZSByZW5hbWVkIGluIHRha2UgbWV0aG9kLiAke2Vycn1gLCBmbiwgW2pvYl0pO1xuICAgICAgICB9XG4gICAgICAgIGpvYi5wYXRoID0gbmV3X3BhdGg7XG4gICAgICAgIC8vIGpvYi5uZXN0ID0gZm47XG5cbiAgICAgICAgY2FsbGJhY2soam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyBqb2JzIHRoYXQgaGF2ZSBwaWxlZCB1cCBpbiB0aGUgbmVzdCBpZiBpdCB3YXMgbm90IHdhdGNoZWQuXG4gICAgICogTm8gbG9uZ2VyIHVzZWQuXG4gICAgICogQHJldHVybnMge0FycmF5fSAgICAgQXJyYXkgb2Ygam9ic1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRVbndhdGNoZWRKb2JzKCkge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBsZXQgam9icyA9IFtdO1xuICAgICAgICBsZXQgZmlsZUFycmF5ID0gZnMucmVhZGRpclN5bmMoZmwucGF0aCk7XG5cbiAgICAgICAgbGV0IGl0ZW1zID0gZmlsZUFycmF5LmZpbHRlcihpdGVtID0+ICEoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChpdGVtKSk7XG5cbiAgICAgICAgaXRlbXMuZm9yRWFjaCgoZmlsZW5hbWUpID0+IHtcbiAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZsLnBhdGggKyBwYXRoX21vZC5zZXAgKyBmaWxlbmFtZTtcbiAgICAgICAgICAgIGxldCBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcbiAgICAgICAgICAgIGpvYnMucHVzaChqb2IpO1xuICAgICAgICAgICAgLy8gZmwuaG9sZEpvYihqb2IpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gam9icztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCBoZWxkIGpvYnMuXG4gICAgICogQHJldHVybnMgeyhGaWxlSm9ifEZvbGRlckpvYilbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SGVsZEpvYnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlbGRKb2JzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgam9iIHRvIGFycmF5IG9mIGhlbGQgam9icy5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhvbGRKb2Ioam9iOiAoRmlsZUpvYnxGb2xkZXJKb2IpKSB7XG4gICAgICAgIHRoaXMuaGVsZEpvYnMucHVzaChqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIGhlbGQgam9iIHdpdGggYSBqb2IgaWQuIFJlbW92ZXMgaXQgZnJvbSB0aGUgaGVsZCBqb2IgcXVldWUsXG4gICAgICogc28geW91IHNob3VsZCBtb3ZlIGl0IG91dCBvZiB0aGUgZm9sZGVyIGFmdGVyIHVzaW5nIHRoaXMuXG4gICAgICogQHBhcmFtIGpvYklkXG4gICAgICogQHJldHVybnMge0ZpbGVKb2J8Rm9sZGVySm9ifVxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogdmFyIHR1bm5lbCA9IGFmLmNyZWF0ZVR1bm5lbChcIkNoZWNrcG9pbnQgZXhhbXBsZVwiKTtcbiAgICAgKiB2YXIgd2ViaG9vayA9IGFmLmNyZWF0ZVdlYmhvb2tOZXN0KFtcInRlc3RcIiwgXCJleGFtcGxlXCJdLCBcImdldFwiKTtcbiAgICAgKiB2YXIgaG9sZGluZ19mb2xkZXIgPSBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChbXCJ0ZXN0XCIsIFwiY2hlY2twb2ludFwiXSk7XG4gICAgICpcbiAgICAgKiB2YXIgaW0gPSB3ZWJob29rLmdldEludGVyZmFjZU1hbmFnZXIoKTtcbiAgICAgKlxuICAgICAqIC8vIFdhdGNoIGZvciBqb2JzLCBob2xkLCBhbmQgcHJvdmlkZSB0byB0aGUgaW50ZXJmYWNlLlxuICAgICAqIGltLmNoZWNrTmVzdChob2xkaW5nX2ZvbGRlcik7XG4gICAgICogdHVubmVsLndhdGNoKHdlYmhvb2spO1xuICAgICAqXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbihqb2IsIG5lc3Qpe1xuICAgICAqICAgICAgLy8gR2V0IHRoZSBqb2JfaWQgZnJvbSB0aGUgd2ViaG9vayByZXF1ZXN0XG4gICAgICogICAgICB2YXIgam9iX2lkID0gam9iLmdldFBhcmFtZXRlcihcImpvYl9pZFwiKTtcbiAgICAgKiAgICAgIC8vIEdldCB0aGUgaGVsZCBqb2IgZnJvbSB0aGUgaG9sZGluZyBmb2xkZXJcbiAgICAgKiAgICAgIHZhciBjaGVja3BvaW50X2pvYiA9IGhvbGRpbmdfZm9sZGVyLmdldEhlbGRKb2Ioam9iX2lkKTtcbiAgICAgKiAgICAgIC8vIE1vdmUgc29tZXdoZXJlIGVsc2VcbiAgICAgKiAgICAgIGNoZWNrcG9pbnRfam9iLm1vdmUoYWYuY3JlYXRlQXV0b0ZvbGRlck5lc3QoW1widGVzdFwiLCBcIm91dGZvbGRlclwiXSkpO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRIZWxkSm9iKGpvYklkOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGYgPSB0aGlzO1xuICAgICAgICBsZXQgam9iID0gXy5maW5kKGYuZ2V0SGVsZEpvYnMoKSwgKGopID0+IGouZ2V0SWQoKSA9PT0gam9iSWQgKTtcbiAgICAgICAgbGV0IGpvYkluZGV4ID0gXy5maW5kSW5kZXgoZi5nZXRIZWxkSm9icygpLCAoaikgPT4gai5nZXRJZCgpID09PSBqb2JJZCApO1xuXG4gICAgICAgIGlmICgham9iKSB7XG4gICAgICAgICAgICBmLmUubG9nKDMsIGBKb2IgSUQgJHtqb2JJZH0gY291bGQgbm90IGJlIGZvdW5kIGluIHRoZSAke2YuZ2V0SGVsZEpvYnMoKS5sZW5ndGh9IHBlbmRpbmcgaGVsZCBqb2JzLmAsIGYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZi5oZWxkSm9icy5zcGxpY2Uoam9iSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2I7XG4gICAgfVxufSJdfQ==
