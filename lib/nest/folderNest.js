"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
        var nest_name = path_mod.basename(path);
        _super.call(this, e, nest_name);
        // this._watcher = require("node-watch");
        this._watcher = require("chokidar");
        this.allowCreate = allowCreate;
        this.checkDirectorySync(path);
        this.path = path;
        this.heldJobs = [];
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
        if (path.indexOf(fl.path) === -1) {
            fl.e.log(3, "Found job that did not exist in this nest. Job: " + path, fl);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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O0FBQUQsQ0FoU0EsQUFnU0MsQ0FoUytCLFdBQUksR0FnU25DO0FBaFNZLGtCQUFVLGFBZ1N0QixDQUFBIiwiZmlsZSI6ImxpYi9uZXN0L2ZvbGRlck5lc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7IE5lc3QgfSBmcm9tIFwiLi9uZXN0XCI7XG5pbXBvcnQgeyBGaWxlSm9iIH0gZnJvbSBcIi4vLi4vam9iL2ZpbGVKb2JcIjtcbmltcG9ydCB7IEZvbGRlckpvYiB9IGZyb20gXCIuLy4uL2pvYi9mb2xkZXJKb2JcIjtcbmltcG9ydCB7Sm9ifSBmcm9tIFwiLi4vam9iL2pvYlwiO1xuXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxuICAgICAgICBwYXRoX21vZCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxuICAgICAgICB0bXAgPSByZXF1aXJlKFwidG1wXCIpLFxuICAgICAgICBta2RpcnAgPSByZXF1aXJlKFwibWtkaXJwXCIpLFxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuLyoqXG4gKiBBIGZvbGRlciBuZXN0IGlzIGEgbmVzdCB3aGljaCBjb250YWlucyBhIGJhY2tpbmcgZm9sZGVyIGF0IGEgc3BlY2lmaWMgX3BhdGguIElmIHRoZSBmb2xkZXIgZG9lcyBub3QgZXhpc3QsXG4gKiBhbnRmYXJtIGNhbiBvcHRpb25hbGx5IGNyZWF0ZSBpdC5cbiAqL1xuZXhwb3J0IGNsYXNzIEZvbGRlck5lc3QgZXh0ZW5kcyBOZXN0IHtcblxuICAgIHByb3RlY3RlZCBwYXRoOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGFsbG93Q3JlYXRlOiBib29sZWFuO1xuICAgIHByb3RlY3RlZCBoZWxkSm9iczogKEZpbGVKb2J8Rm9sZGVySm9iKVtdO1xuICAgIHByaXZhdGUgX3dhdGNoZXI6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBwYXRoPzogc3RyaW5nLCBhbGxvd0NyZWF0ZT86IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IG5lc3RfbmFtZSA9IHBhdGhfbW9kLmJhc2VuYW1lKHBhdGgpO1xuICAgICAgICBzdXBlcihlLCBuZXN0X25hbWUpO1xuXG4gICAgICAgIC8vIHRoaXMuX3dhdGNoZXIgPSByZXF1aXJlKFwibm9kZS13YXRjaFwiKTtcbiAgICAgICAgdGhpcy5fd2F0Y2hlciA9IHJlcXVpcmUoXCJjaG9raWRhclwiKTtcblxuICAgICAgICB0aGlzLmFsbG93Q3JlYXRlID0gYWxsb3dDcmVhdGU7XG4gICAgICAgIHRoaXMuY2hlY2tEaXJlY3RvcnlTeW5jKHBhdGgpO1xuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLmhlbGRKb2JzID0gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgd2F0Y2hlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dhdGNoZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIF9wYXRoIGZvciB0aGUgYmFja2luZyBmb2xkZXIgaXMgY3JlYXRlZC4gSWYgbm90LCBvcHRpb25hbGx5IGNyZWF0ZSBpdC5cbiAgICAgKiBAcGFyYW0gZGlyZWN0b3J5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNoZWNrRGlyZWN0b3J5U3luYyhkaXJlY3RvcnkpIHtcbiAgICAgICAgbGV0IGZuID0gdGhpcztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnN0YXRTeW5jKGRpcmVjdG9yeSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChmbi5hbGxvd0NyZWF0ZSkge1xuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKGRpcmVjdG9yeSk7XG4gICAgICAgICAgICAgICAgZm4uZS5sb2coMSwgYERpcmVjdG9yeSBcIiR7ZGlyZWN0b3J5fVwiIHdhcyBjcmVhdGVkIHNpbmNlIGl0IGRpZCBub3QgYWxyZWFkeSBleGlzdC5gLCB0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm4uZS5sb2coMywgYERpcmVjdG9yeSBcIiR7ZGlyZWN0b3J5fVwiIGRpZCBub3QgZXhpc3QgYW5kIHdhcyBub3QgY3JlYXRlZC5gLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhbmQgYXJyaXZlcyBuZXcgam9icy4gQ2FuIHByb2R1Y2UgZmlsZSBvciBmb2xkZXIgam9icy5cbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqIEBwYXJhbSBhcnJpdmVcbiAgICAgKiBAcmV0dXJucyB7Rm9sZGVySm9ifEZpbGVKb2J9XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUpvYihwYXRoOiBzdHJpbmcsIGFycml2ZSA9IHRydWUpIHtcblxuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBsZXQgam9iO1xuICAgICAgICAvLyBWZXJpZnkgZmlsZSBzdGlsbCBleGlzdHMsIG5vZGUtd2F0Y2ggZmlyZXMgb24gYW55IGNoYW5nZSwgZXZlbiBkZWxldGVcblxuICAgICAgICAvLyBDaGVjayBmb3IgaW5jb3JyZWN0bHkgZm91bmQgZmlsZXNcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImpvYiBwYXRoXCIsIHBhdGgpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImZvbGRlciBwYXRoXCIsIGZsLnBhdGgpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInZsYWlkaXRpeVwiLCBmbC5wYXRoLmluZGV4T2YocGF0aCkgPT09IC0xKTtcblxuICAgICAgICBpZiAocGF0aC5pbmRleE9mKGZsLnBhdGgpID09PSAtMSkge1xuICAgICAgICAgICAgZmwuZS5sb2coMywgYEZvdW5kIGpvYiB0aGF0IGRpZCBub3QgZXhpc3QgaW4gdGhpcyBuZXN0LiBKb2I6ICR7cGF0aH1gLCBmbCk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyhwYXRoLCBmcy5GX09LKTtcblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGpvYiBpcyBmb2xkZXJcbiAgICAgICAgICAgICAgICBsZXQgcGF0aF9zdGF0cyA9IGZzLmxzdGF0U3luYyhwYXRoKTtcblxuICAgICAgICAgICAgICAgIGlmIChwYXRoX3N0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgam9iID0gbmV3IEZvbGRlckpvYihmbC5lLCBwYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgam9iLmNyZWF0ZUZpbGVzKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnJpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmlnZ2VyIGFycml2ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbC5hcnJpdmUoam9iKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXRoX3N0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGpvYiA9IG5ldyBGaWxlSm9iKGZsLmUsIHBhdGgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyaXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmlnZ2VyIGFycml2ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsLmFycml2ZShqb2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJQYXRoIGlzIG5vdCBhIGZpbGUgb3IgZm9sZGVyIVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBJdCBpc24ndCBhY2Nlc3NpYmxlXG4gICAgICAgICAgICAgICAgZmwuZS5sb2coMCwgXCJKb2IgY3JlYXRpb24gaWdub3JlZCBiZWNhdXNlIGZpbGUgZGlkIG5vdCBleGlzdC5cIiwgZmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpvYjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3Mgd2hldGhlciBhIF9wYXRoIHN0YXJ0cyB3aXRoIG9yIGNvbnRhaW5zIGEgaGlkZGVuIGZpbGUgb3IgYSBmb2xkZXIuXG4gICAgICogQHBhcmFtIHBhdGgge3N0cmluZ30gICAgICBUaGUgX3BhdGggb2YgdGhlIGZpbGUgdGhhdCBuZWVkcyB0byBiZSB2YWxpZGF0ZWQuXG4gICAgICogcmV0dXJucyB7Ym9vbGVhbn0gLSBgdHJ1ZWAgaWYgdGhlIHNvdXJjZSBpcyBibGFja2xpc3RlZCBhbmQgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGlzVW5peEhpZGRlblBhdGggKHBhdGg6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QocGF0aCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWwgbG9hZCBvZiB0aGUgY29udGVudHMgb2YgdGhlIGRpcmVjdG9yeS5cbiAgICAgKiBAcGFyYW0gaG9sZCB7Ym9vbGVhbn0gICAgT3B0aW9uYWwgZmxhZyB0byBob2xkIGpvYnMgZm91bmQuXG4gICAgICovXG4gICAgcHVibGljIGxvYWQoaG9sZDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgICAgIGxldCBmbCA9IHRoaXM7XG4gICAgICAgIGZzLnJlYWRkaXIoZmwucGF0aCwgKGVyciwgaXRlbXMpID0+IHtcbiAgICAgICAgICAgIGlmIChpdGVtcykge1xuICAgICAgICAgICAgICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gISgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KGl0ZW0pKTtcblxuICAgICAgICAgICAgICAgIGl0ZW1zLmZvckVhY2goKGZpbGVuYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZsLnBhdGggKyBwYXRoX21vZC5zZXAgKyBmaWxlbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGpvYjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvbGQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIHRydWUpOyAvLyBBcnJpdmVzIGFzIHdlbGxcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGpvYiA9IGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmwuaG9sZEpvYihqb2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoZXMgdGhlIGZvbGRlci5cbiAgICAgKiBAcGFyYW0gaG9sZCB7Ym9vbGVhbn0gICAgT3B0aW9uYWwgZmxhZyB0byBob2xkIGpvYnMgZm91bmQuXG4gICAgICovXG4gICAgcHVibGljIHdhdGNoKGhvbGQ6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICAvLyBsZXQgd2F0Y2hfb3B0aW9ucyA9IHtcbiAgICAgICAgLy8gICAgIHJlY3Vyc2l2ZTogZmFsc2UsXG4gICAgICAgIC8vICAgICBmb2xsb3dTeW1MaW5rczogZmFsc2VcbiAgICAgICAgLy8gfTtcblxuICAgICAgICBsZXQgaGFuZGxlV2F0Y2hFdmVudCA9IChmaWxlcGF0aCkgPT4ge1xuICAgICAgICAgICAgaWYgKGZsLnBhdGggIT09IGZpbGVwYXRoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGpvYjtcbiAgICAgICAgICAgICAgICBpZiAoaG9sZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCB0cnVlKTsgLy8gQXJyaXZlcyBhcyB3ZWxsXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGZsLmhvbGRKb2Ioam9iKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmwuZS5sb2coMiwgYE5lc3QgZm91bmQgaW4gbmV3IHdhdGNoLmAsIGZsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBmbC5lLmxvZygwLCBgV2F0Y2hpbmcgJHtmbC5wYXRofWAsIGZsLCBbZmwudHVubmVsXSk7XG5cbiAgICAgICAgbGV0IGNob2tPcHRzID0ge2lnbm9yZWQ6IC9bXFwvXFxcXF1cXC4vfTtcbiAgICAgICAgLy8gbGV0IGNob2tPcHRzID0ge2lnbm9yZWQ6IC9bXFwvXFxcXF1cXC4vLCBpZ25vcmVJbml0aWFsOiB0cnVlLCBkZXB0aDogMX07XG5cblxuICAgICAgICAvLyBmbC53YXRjaGVyKGZsLnBhdGgsIHdhdGNoX29wdGlvbnMsIGZpbGVwYXRoID0+IHtcbiAgICAgICAgbGV0IHdhdGNoZXJJbnN0YW5jZSA9IGZsLndhdGNoZXIud2F0Y2goZmwucGF0aCwgY2hva09wdHMpO1xuICAgICAgICB3YXRjaGVySW5zdGFuY2VcbiAgICAgICAgICAgIC5vbihcImFkZFwiLCAoZmlsZXBhdGgsIGV2ZW50KSA9PiB7IGhhbmRsZVdhdGNoRXZlbnQoZmlsZXBhdGgpOyB9KVxuICAgICAgICAgICAgLm9uKFwiYWRkRGlyXCIsIChmaWxlcGF0aCwgZXZlbnQpID0+IHsgaGFuZGxlV2F0Y2hFdmVudChmaWxlcGF0aCk7IH0pXG4gICAgICAgICAgICAub24oXCJlcnJvclwiLCBlcnJvciA9PiBmbC5lLmxvZygzLCBgIFdhdGNoZXIgZXJyb3I6ICR7ZXJyb3J9YCwgZmwpKVxuICAgICAgICAgICAgLm9uKFwicmF3XCIsIChldmVudCwgcGF0aCwgZGV0YWlscykgPT4ge1xuICAgICAgICAgICAgICAgIGZsLmUubG9nKDAsIGBSYXcgZXZlbnQgaW5mbzogJHtldmVudH0sICR7cGF0aH0sICR7ZGV0YWlscy50b1N0cmluZygpfWAsIGZsKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoZXMgYW5kIGhvbGRzIGpvYnMgZm91bmQuXG4gICAgICovXG4gICAgcHVibGljIHdhdGNoSG9sZCgpOiB2b2lkIHtcbiAgICAgICAgbGV0IGZsID0gdGhpcztcbiAgICAgICAgZmwubG9hZCh0cnVlKTtcbiAgICAgICAgZmwud2F0Y2godHJ1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXJyaXZlIGZ1bmN0aW9uIHRoYXQgY2FsbHMgdGhlIHN1cGVyLlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKi9cbiAgICBwdWJsaWMgYXJyaXZlKGpvYjogRmlsZUpvYikge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkFCT1VUIFRPIEFSUklWRVwiLCBqb2IubmFtZSwgXCIgSU4gTkVTVCBcIiwgdGhpcy5uYW1lKTtcbiAgICAgICAgc3VwZXIuYXJyaXZlKGpvYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGlja3MgdXAgYSBqb2IgZnJvbSBhbm90aGVyIG5lc3QuXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqIEBwYXJhbSBjYWxsYmFjayAgICAgIENhbGxiYWNrIGlzIGdpdmVuIHRoZSBqb2IgaW4gaXRzIHBhcmFtZXRlci5cbiAgICAgKi9cbiAgICBwdWJsaWMgdGFrZShqb2I6IChGaWxlSm9ifEZvbGRlckpvYiksIGNhbGxiYWNrOiAoam9iOiBGaWxlSm9ifEZvbGRlckpvYikgPT4gdm9pZCkge1xuICAgICAgICBsZXQgZm4gPSB0aGlzO1xuICAgICAgICAvLyB0aGUgb3RoZXIgbmVzdCB0aGF0IHRoaXMgaXMgdGFraW5nIGZyb20gc2hvdWxkIHByb3ZpZGUgYSB0ZW1wb3JhcnkgbG9jYXRpb24gb3IgbG9jYWwgX3BhdGggb2YgdGhlIGpvYlxuICAgICAgICBsZXQgbmV3X3BhdGggPSBgJHtmbi5wYXRofS8ke2pvYi5uYW1lfWA7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnJlbmFtZVN5bmMoam9iLnBhdGgsIG5ld19wYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBmbi5lLmxvZygzLCBgSm9iICR7am9iLm5hbWV9IGNvdWxkIG5vdCBiZSByZW5hbWVkIGluIHRha2UgbWV0aG9kLiAke2Vycn1gLCBmbiwgW2pvYl0pO1xuICAgICAgICB9XG4gICAgICAgIGpvYi5wYXRoID0gbmV3X3BhdGg7XG4gICAgICAgIC8vIGpvYi5uZXN0ID0gZm47XG5cbiAgICAgICAgY2FsbGJhY2soam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyBqb2JzIHRoYXQgaGF2ZSBwaWxlZCB1cCBpbiB0aGUgbmVzdCBpZiBpdCB3YXMgbm90IHdhdGNoZWQuXG4gICAgICogTm8gbG9uZ2VyIHVzZWQuXG4gICAgICogQHJldHVybnMge0FycmF5fSAgICAgQXJyYXkgb2Ygam9ic1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRVbndhdGNoZWRKb2JzKCkge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBsZXQgam9icyA9IFtdO1xuICAgICAgICBsZXQgZmlsZUFycmF5ID0gZnMucmVhZGRpclN5bmMoZmwucGF0aCk7XG5cbiAgICAgICAgbGV0IGl0ZW1zID0gZmlsZUFycmF5LmZpbHRlcihpdGVtID0+ICEoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChpdGVtKSk7XG5cbiAgICAgICAgaXRlbXMuZm9yRWFjaCgoZmlsZW5hbWUpID0+IHtcbiAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZsLnBhdGggKyBwYXRoX21vZC5zZXAgKyBmaWxlbmFtZTtcbiAgICAgICAgICAgIGxldCBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcbiAgICAgICAgICAgIGpvYnMucHVzaChqb2IpO1xuICAgICAgICAgICAgLy8gZmwuaG9sZEpvYihqb2IpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gam9icztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCBoZWxkIGpvYnMuXG4gICAgICogQHJldHVybnMgeyhGaWxlSm9ifEZvbGRlckpvYilbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SGVsZEpvYnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlbGRKb2JzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgam9iIHRvIGFycmF5IG9mIGhlbGQgam9icy5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhvbGRKb2Ioam9iOiAoRmlsZUpvYnxGb2xkZXJKb2IpKSB7XG4gICAgICAgIHRoaXMuaGVsZEpvYnMucHVzaChqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIGhlbGQgam9iIHdpdGggYSBqb2IgaWQuIFJlbW92ZXMgaXQgZnJvbSB0aGUgaGVsZCBqb2IgcXVldWUsXG4gICAgICogc28geW91IHNob3VsZCBtb3ZlIGl0IG91dCBvZiB0aGUgZm9sZGVyIGFmdGVyIHVzaW5nIHRoaXMuXG4gICAgICogQHBhcmFtIGpvYklkXG4gICAgICogQHJldHVybnMge0ZpbGVKb2J8Rm9sZGVySm9ifVxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogdmFyIHR1bm5lbCA9IGFmLmNyZWF0ZVR1bm5lbChcIkNoZWNrcG9pbnQgZXhhbXBsZVwiKTtcbiAgICAgKiB2YXIgd2ViaG9vayA9IGFmLmNyZWF0ZVdlYmhvb2tOZXN0KFtcInRlc3RcIiwgXCJleGFtcGxlXCJdLCBcImdldFwiKTtcbiAgICAgKiB2YXIgaG9sZGluZ19mb2xkZXIgPSBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChbXCJ0ZXN0XCIsIFwiY2hlY2twb2ludFwiXSk7XG4gICAgICpcbiAgICAgKiB2YXIgaW0gPSB3ZWJob29rLmdldEludGVyZmFjZU1hbmFnZXIoKTtcbiAgICAgKlxuICAgICAqIC8vIFdhdGNoIGZvciBqb2JzLCBob2xkLCBhbmQgcHJvdmlkZSB0byB0aGUgaW50ZXJmYWNlLlxuICAgICAqIGltLmNoZWNrTmVzdChob2xkaW5nX2ZvbGRlcik7XG4gICAgICogdHVubmVsLndhdGNoKHdlYmhvb2spO1xuICAgICAqXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbihqb2IsIG5lc3Qpe1xuICAgICAqICAgICAgLy8gR2V0IHRoZSBqb2JfaWQgZnJvbSB0aGUgd2ViaG9vayByZXF1ZXN0XG4gICAgICogICAgICB2YXIgam9iX2lkID0gam9iLmdldFBhcmFtZXRlcihcImpvYl9pZFwiKTtcbiAgICAgKiAgICAgIC8vIEdldCB0aGUgaGVsZCBqb2IgZnJvbSB0aGUgaG9sZGluZyBmb2xkZXJcbiAgICAgKiAgICAgIHZhciBjaGVja3BvaW50X2pvYiA9IGhvbGRpbmdfZm9sZGVyLmdldEhlbGRKb2Ioam9iX2lkKTtcbiAgICAgKiAgICAgIC8vIE1vdmUgc29tZXdoZXJlIGVsc2VcbiAgICAgKiAgICAgIGNoZWNrcG9pbnRfam9iLm1vdmUoYWYuY3JlYXRlQXV0b0ZvbGRlck5lc3QoW1widGVzdFwiLCBcIm91dGZvbGRlclwiXSkpO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRIZWxkSm9iKGpvYklkOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGYgPSB0aGlzO1xuICAgICAgICBsZXQgam9iID0gXy5maW5kKGYuZ2V0SGVsZEpvYnMoKSwgKGopID0+IGouZ2V0SWQoKSA9PT0gam9iSWQgKTtcbiAgICAgICAgbGV0IGpvYkluZGV4ID0gXy5maW5kSW5kZXgoZi5nZXRIZWxkSm9icygpLCAoaikgPT4gai5nZXRJZCgpID09PSBqb2JJZCApO1xuXG4gICAgICAgIGlmICgham9iKSB7XG4gICAgICAgICAgICBmLmUubG9nKDMsIGBKb2IgSUQgJHtqb2JJZH0gY291bGQgbm90IGJlIGZvdW5kIGluIHRoZSAke2YuZ2V0SGVsZEpvYnMoKS5sZW5ndGh9IHBlbmRpbmcgaGVsZCBqb2JzLmAsIGYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZi5oZWxkSm9icy5zcGxpY2Uoam9iSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2I7XG4gICAgfVxufSJdfQ==
