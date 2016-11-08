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
        fl.watcher.watch(fl.path, chokOpts).on("add", function (filepath, event) {
            handleWatchEvent(filepath);
        });
        fl.watcher.watch(fl.path, chokOpts).on("addDir", function (filepath, event) {
            // console.log("chokidar " + fl.path,  filepath);
            handleWatchEvent(filepath);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFVLEdBQWpCLFVBQWtCLEtBQWE7UUFDM0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssS0FBSyxFQUFuQixDQUFtQixDQUFFLENBQUM7UUFDL0QsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssS0FBSyxFQUFuQixDQUFtQixDQUFFLENBQUM7UUFFekUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFlBQVUsS0FBSyxtQ0FBOEIsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sd0JBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUcsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0EvUkEsQUErUkMsQ0EvUitCLFdBQUksR0ErUm5DO0FBL1JZLGtCQUFVLGFBK1J0QixDQUFBIiwiZmlsZSI6ImxpYi9uZXN0L2ZvbGRlck5lc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7IE5lc3QgfSBmcm9tIFwiLi9uZXN0XCI7XG5pbXBvcnQgeyBGaWxlSm9iIH0gZnJvbSBcIi4vLi4vam9iL2ZpbGVKb2JcIjtcbmltcG9ydCB7IEZvbGRlckpvYiB9IGZyb20gXCIuLy4uL2pvYi9mb2xkZXJKb2JcIjtcbmltcG9ydCB7Sm9ifSBmcm9tIFwiLi4vam9iL2pvYlwiO1xuXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxuICAgICAgICBwYXRoX21vZCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxuICAgICAgICB0bXAgPSByZXF1aXJlKFwidG1wXCIpLFxuICAgICAgICBta2RpcnAgPSByZXF1aXJlKFwibWtkaXJwXCIpLFxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuLyoqXG4gKiBBIGZvbGRlciBuZXN0IGlzIGEgbmVzdCB3aGljaCBjb250YWlucyBhIGJhY2tpbmcgZm9sZGVyIGF0IGEgc3BlY2lmaWMgX3BhdGguIElmIHRoZSBmb2xkZXIgZG9lcyBub3QgZXhpc3QsXG4gKiBhbnRmYXJtIGNhbiBvcHRpb25hbGx5IGNyZWF0ZSBpdC5cbiAqL1xuZXhwb3J0IGNsYXNzIEZvbGRlck5lc3QgZXh0ZW5kcyBOZXN0IHtcblxuICAgIHByb3RlY3RlZCBwYXRoOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGFsbG93Q3JlYXRlOiBib29sZWFuO1xuICAgIHByb3RlY3RlZCBoZWxkSm9iczogKEZpbGVKb2J8Rm9sZGVySm9iKVtdO1xuICAgIHByaXZhdGUgX3dhdGNoZXI6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBwYXRoPzogc3RyaW5nLCBhbGxvd0NyZWF0ZT86IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IG5lc3RfbmFtZSA9IHBhdGhfbW9kLmJhc2VuYW1lKHBhdGgpO1xuICAgICAgICBzdXBlcihlLCBuZXN0X25hbWUpO1xuXG4gICAgICAgIC8vIHRoaXMuX3dhdGNoZXIgPSByZXF1aXJlKFwibm9kZS13YXRjaFwiKTtcbiAgICAgICAgdGhpcy5fd2F0Y2hlciA9IHJlcXVpcmUoXCJjaG9raWRhclwiKTtcblxuICAgICAgICB0aGlzLmFsbG93Q3JlYXRlID0gYWxsb3dDcmVhdGU7XG4gICAgICAgIHRoaXMuY2hlY2tEaXJlY3RvcnlTeW5jKHBhdGgpO1xuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLmhlbGRKb2JzID0gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgd2F0Y2hlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dhdGNoZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIF9wYXRoIGZvciB0aGUgYmFja2luZyBmb2xkZXIgaXMgY3JlYXRlZC4gSWYgbm90LCBvcHRpb25hbGx5IGNyZWF0ZSBpdC5cbiAgICAgKiBAcGFyYW0gZGlyZWN0b3J5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNoZWNrRGlyZWN0b3J5U3luYyhkaXJlY3RvcnkpIHtcbiAgICAgICAgbGV0IGZuID0gdGhpcztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnN0YXRTeW5jKGRpcmVjdG9yeSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChmbi5hbGxvd0NyZWF0ZSkge1xuICAgICAgICAgICAgICAgIG1rZGlycC5zeW5jKGRpcmVjdG9yeSk7XG4gICAgICAgICAgICAgICAgZm4uZS5sb2coMSwgYERpcmVjdG9yeSBcIiR7ZGlyZWN0b3J5fVwiIHdhcyBjcmVhdGVkIHNpbmNlIGl0IGRpZCBub3QgYWxyZWFkeSBleGlzdC5gLCB0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm4uZS5sb2coMywgYERpcmVjdG9yeSBcIiR7ZGlyZWN0b3J5fVwiIGRpZCBub3QgZXhpc3QgYW5kIHdhcyBub3QgY3JlYXRlZC5gLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhbmQgYXJyaXZlcyBuZXcgam9icy4gQ2FuIHByb2R1Y2UgZmlsZSBvciBmb2xkZXIgam9icy5cbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqIEBwYXJhbSBhcnJpdmVcbiAgICAgKiBAcmV0dXJucyB7Rm9sZGVySm9ifEZpbGVKb2J9XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUpvYihwYXRoOiBzdHJpbmcsIGFycml2ZSA9IHRydWUpIHtcblxuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBsZXQgam9iO1xuICAgICAgICAvLyBWZXJpZnkgZmlsZSBzdGlsbCBleGlzdHMsIG5vZGUtd2F0Y2ggZmlyZXMgb24gYW55IGNoYW5nZSwgZXZlbiBkZWxldGVcblxuICAgICAgICAvLyBDaGVjayBmb3IgaW5jb3JyZWN0bHkgZm91bmQgZmlsZXNcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImpvYiBwYXRoXCIsIHBhdGgpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImZvbGRlciBwYXRoXCIsIGZsLnBhdGgpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInZsYWlkaXRpeVwiLCBmbC5wYXRoLmluZGV4T2YocGF0aCkgPT09IC0xKTtcblxuICAgICAgICBpZiAocGF0aC5pbmRleE9mKGZsLnBhdGgpID09PSAtMSkge1xuICAgICAgICAgICAgZmwuZS5sb2coMywgYEZvdW5kIGpvYiB0aGF0IGRpZCBub3QgZXhpc3QgaW4gdGhpcyBuZXN0LiBKb2I6ICR7cGF0aH1gLCBmbCk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyhwYXRoLCBmcy5GX09LKTtcblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGpvYiBpcyBmb2xkZXJcbiAgICAgICAgICAgICAgICBsZXQgcGF0aF9zdGF0cyA9IGZzLmxzdGF0U3luYyhwYXRoKTtcblxuICAgICAgICAgICAgICAgIGlmIChwYXRoX3N0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgam9iID0gbmV3IEZvbGRlckpvYihmbC5lLCBwYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgam9iLmNyZWF0ZUZpbGVzKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnJpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmlnZ2VyIGFycml2ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbC5hcnJpdmUoam9iKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXRoX3N0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGpvYiA9IG5ldyBGaWxlSm9iKGZsLmUsIHBhdGgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyaXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmlnZ2VyIGFycml2ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsLmFycml2ZShqb2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJQYXRoIGlzIG5vdCBhIGZpbGUgb3IgZm9sZGVyIVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBJdCBpc24ndCBhY2Nlc3NpYmxlXG4gICAgICAgICAgICAgICAgZmwuZS5sb2coMCwgXCJKb2IgY3JlYXRpb24gaWdub3JlZCBiZWNhdXNlIGZpbGUgZGlkIG5vdCBleGlzdC5cIiwgZmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpvYjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3Mgd2hldGhlciBhIF9wYXRoIHN0YXJ0cyB3aXRoIG9yIGNvbnRhaW5zIGEgaGlkZGVuIGZpbGUgb3IgYSBmb2xkZXIuXG4gICAgICogQHBhcmFtIHBhdGgge3N0cmluZ30gICAgICBUaGUgX3BhdGggb2YgdGhlIGZpbGUgdGhhdCBuZWVkcyB0byBiZSB2YWxpZGF0ZWQuXG4gICAgICogcmV0dXJucyB7Ym9vbGVhbn0gLSBgdHJ1ZWAgaWYgdGhlIHNvdXJjZSBpcyBibGFja2xpc3RlZCBhbmQgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGlzVW5peEhpZGRlblBhdGggKHBhdGg6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QocGF0aCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWwgbG9hZCBvZiB0aGUgY29udGVudHMgb2YgdGhlIGRpcmVjdG9yeS5cbiAgICAgKiBAcGFyYW0gaG9sZCB7Ym9vbGVhbn0gICAgT3B0aW9uYWwgZmxhZyB0byBob2xkIGpvYnMgZm91bmQuXG4gICAgICovXG4gICAgcHVibGljIGxvYWQoaG9sZDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgICAgIGxldCBmbCA9IHRoaXM7XG4gICAgICAgIGZzLnJlYWRkaXIoZmwucGF0aCwgKGVyciwgaXRlbXMpID0+IHtcbiAgICAgICAgICAgIGlmIChpdGVtcykge1xuICAgICAgICAgICAgICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gISgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KGl0ZW0pKTtcblxuICAgICAgICAgICAgICAgIGl0ZW1zLmZvckVhY2goKGZpbGVuYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZsLnBhdGggKyBwYXRoX21vZC5zZXAgKyBmaWxlbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGpvYjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvbGQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIHRydWUpOyAvLyBBcnJpdmVzIGFzIHdlbGxcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGpvYiA9IGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmwuaG9sZEpvYihqb2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoZXMgdGhlIGZvbGRlci5cbiAgICAgKiBAcGFyYW0gaG9sZCB7Ym9vbGVhbn0gICAgT3B0aW9uYWwgZmxhZyB0byBob2xkIGpvYnMgZm91bmQuXG4gICAgICovXG4gICAgcHVibGljIHdhdGNoKGhvbGQ6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICAvLyBsZXQgd2F0Y2hfb3B0aW9ucyA9IHtcbiAgICAgICAgLy8gICAgIHJlY3Vyc2l2ZTogZmFsc2UsXG4gICAgICAgIC8vICAgICBmb2xsb3dTeW1MaW5rczogZmFsc2VcbiAgICAgICAgLy8gfTtcblxuICAgICAgICBsZXQgaGFuZGxlV2F0Y2hFdmVudCA9IChmaWxlcGF0aCkgPT4ge1xuICAgICAgICAgICAgaWYgKGZsLnBhdGggIT09IGZpbGVwYXRoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGpvYjtcbiAgICAgICAgICAgICAgICBpZiAoaG9sZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCB0cnVlKTsgLy8gQXJyaXZlcyBhcyB3ZWxsXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGZsLmhvbGRKb2Ioam9iKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmwuZS5sb2coMiwgYE5lc3QgZm91bmQgaW4gbmV3IHdhdGNoLmAsIGZsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBmbC5lLmxvZygwLCBgV2F0Y2hpbmcgJHtmbC5wYXRofWAsIGZsLCBbZmwudHVubmVsXSk7XG5cbiAgICAgICAgbGV0IGNob2tPcHRzID0ge2lnbm9yZWQ6IC9bXFwvXFxcXF1cXC4vfTtcbiAgICAgICAgLy8gbGV0IGNob2tPcHRzID0ge2lnbm9yZWQ6IC9bXFwvXFxcXF1cXC4vLCBpZ25vcmVJbml0aWFsOiB0cnVlLCBkZXB0aDogMX07XG5cblxuICAgICAgICAvLyBmbC53YXRjaGVyKGZsLnBhdGgsIHdhdGNoX29wdGlvbnMsIGZpbGVwYXRoID0+IHtcbiAgICAgICAgZmwud2F0Y2hlci53YXRjaChmbC5wYXRoLCBjaG9rT3B0cykub24oXCJhZGRcIiwgKGZpbGVwYXRoLCBldmVudCkgPT4ge1xuICAgICAgICAgICAgaGFuZGxlV2F0Y2hFdmVudChmaWxlcGF0aCk7XG4gICAgICAgIH0pO1xuICAgICAgICBmbC53YXRjaGVyLndhdGNoKGZsLnBhdGgsIGNob2tPcHRzKS5vbihcImFkZERpclwiLCAoZmlsZXBhdGgsIGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNob2tpZGFyIFwiICsgZmwucGF0aCwgIGZpbGVwYXRoKTtcbiAgICAgICAgICAgIGhhbmRsZVdhdGNoRXZlbnQoZmlsZXBhdGgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYXRjaGVzIGFuZCBob2xkcyBqb2JzIGZvdW5kLlxuICAgICAqL1xuICAgIHB1YmxpYyB3YXRjaEhvbGQoKTogdm9pZCB7XG4gICAgICAgIGxldCBmbCA9IHRoaXM7XG4gICAgICAgIGZsLmxvYWQodHJ1ZSk7XG4gICAgICAgIGZsLndhdGNoKHRydWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFycml2ZSBmdW5jdGlvbiB0aGF0IGNhbGxzIHRoZSBzdXBlci5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICovXG4gICAgcHVibGljIGFycml2ZShqb2I6IEZpbGVKb2IpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJBQk9VVCBUTyBBUlJJVkVcIiwgam9iLm5hbWUsIFwiIElOIE5FU1QgXCIsIHRoaXMubmFtZSk7XG4gICAgICAgIHN1cGVyLmFycml2ZShqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBpY2tzIHVwIGEgam9iIGZyb20gYW5vdGhlciBuZXN0LlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgICAgICBDYWxsYmFjayBpcyBnaXZlbiB0aGUgam9iIGluIGl0cyBwYXJhbWV0ZXIuXG4gICAgICovXG4gICAgcHVibGljIHRha2Uoam9iOiAoRmlsZUpvYnxGb2xkZXJKb2IpLCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIGxldCBmbiA9IHRoaXM7XG4gICAgICAgIC8vIHRoZSBvdGhlciBuZXN0IHRoYXQgdGhpcyBpcyB0YWtpbmcgZnJvbSBzaG91bGQgcHJvdmlkZSBhIHRlbXBvcmFyeSBsb2NhdGlvbiBvciBsb2NhbCBfcGF0aCBvZiB0aGUgam9iXG4gICAgICAgIGxldCBuZXdfcGF0aCA9IGAke2ZuLnBhdGh9LyR7am9iLm5hbWV9YDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMucmVuYW1lU3luYyhqb2IucGF0aCwgbmV3X3BhdGgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGZuLmUubG9nKDMsIGBKb2IgJHtqb2IubmFtZX0gY291bGQgbm90IGJlIHJlbmFtZWQgaW4gdGFrZSBtZXRob2QuICR7ZXJyfWAsIGZuLCBbam9iXSk7XG4gICAgICAgIH1cbiAgICAgICAgam9iLnBhdGggPSBuZXdfcGF0aDtcbiAgICAgICAgLy8gam9iLm5lc3QgPSBmbjtcblxuICAgICAgICBjYWxsYmFjayhqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWRzIGpvYnMgdGhhdCBoYXZlIHBpbGVkIHVwIGluIHRoZSBuZXN0IGlmIGl0IHdhcyBub3Qgd2F0Y2hlZC5cbiAgICAgKiBObyBsb25nZXIgdXNlZC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9ICAgICBBcnJheSBvZiBqb2JzXG4gICAgICovXG4gICAgcHVibGljIGdldFVud2F0Y2hlZEpvYnMoKSB7XG4gICAgICAgIGxldCBmbCA9IHRoaXM7XG4gICAgICAgIGxldCBqb2JzID0gW107XG4gICAgICAgIGxldCBmaWxlQXJyYXkgPSBmcy5yZWFkZGlyU3luYyhmbC5wYXRoKTtcblxuICAgICAgICBsZXQgaXRlbXMgPSBmaWxlQXJyYXkuZmlsdGVyKGl0ZW0gPT4gISgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KGl0ZW0pKTtcblxuICAgICAgICBpdGVtcy5mb3JFYWNoKChmaWxlbmFtZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbGVwYXRoID0gZmwucGF0aCArIHBhdGhfbW9kLnNlcCArIGZpbGVuYW1lO1xuICAgICAgICAgICAgbGV0IGpvYiA9IGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgZmFsc2UpO1xuICAgICAgICAgICAgam9icy5wdXNoKGpvYik7XG4gICAgICAgICAgICAvLyBmbC5ob2xkSm9iKGpvYik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBqb2JzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIGhlbGQgam9icy5cbiAgICAgKiBAcmV0dXJucyB7KEZpbGVKb2J8Rm9sZGVySm9iKVtdfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRIZWxkSm9icygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVsZEpvYnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBqb2IgdG8gYXJyYXkgb2YgaGVsZCBqb2JzLlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaG9sZEpvYihqb2I6IChGaWxlSm9ifEZvbGRlckpvYikpIHtcbiAgICAgICAgdGhpcy5oZWxkSm9icy5wdXNoKGpvYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGEgaGVsZCBqb2Igd2l0aCBhIGpvYiBpZC4gUmVtb3ZlcyBpdCBmcm9tIHRoZSBoZWxkIGpvYiBxdWV1ZSxcbiAgICAgKiBzbyB5b3Ugc2hvdWxkIG1vdmUgaXQgb3V0IG9mIHRoZSBmb2xkZXIgYWZ0ZXIgdXNpbmcgdGhpcy5cbiAgICAgKiBAcGFyYW0gam9iSWRcbiAgICAgKiBAcmV0dXJucyB7RmlsZUpvYnxGb2xkZXJKb2J9XG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiB2YXIgdHVubmVsID0gYWYuY3JlYXRlVHVubmVsKFwiQ2hlY2twb2ludCBleGFtcGxlXCIpO1xuICAgICAqIHZhciB3ZWJob29rID0gYWYuY3JlYXRlV2ViaG9va05lc3QoW1widGVzdFwiLCBcImV4YW1wbGVcIl0sIFwiZ2V0XCIpO1xuICAgICAqIHZhciBob2xkaW5nX2ZvbGRlciA9IGFmLmNyZWF0ZUF1dG9Gb2xkZXJOZXN0KFtcInRlc3RcIiwgXCJjaGVja3BvaW50XCJdKTtcbiAgICAgKlxuICAgICAqIHZhciBpbSA9IHdlYmhvb2suZ2V0SW50ZXJmYWNlTWFuYWdlcigpO1xuICAgICAqXG4gICAgICogLy8gV2F0Y2ggZm9yIGpvYnMsIGhvbGQsIGFuZCBwcm92aWRlIHRvIHRoZSBpbnRlcmZhY2UuXG4gICAgICogaW0uY2hlY2tOZXN0KGhvbGRpbmdfZm9sZGVyKTtcbiAgICAgKiB0dW5uZWwud2F0Y2god2ViaG9vayk7XG4gICAgICpcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uKGpvYiwgbmVzdCl7XG4gICAgICogICAgICAvLyBHZXQgdGhlIGpvYl9pZCBmcm9tIHRoZSB3ZWJob29rIHJlcXVlc3RcbiAgICAgKiAgICAgIHZhciBqb2JfaWQgPSBqb2IuZ2V0UGFyYW1ldGVyKFwiam9iX2lkXCIpO1xuICAgICAqICAgICAgLy8gR2V0IHRoZSBoZWxkIGpvYiBmcm9tIHRoZSBob2xkaW5nIGZvbGRlclxuICAgICAqICAgICAgdmFyIGNoZWNrcG9pbnRfam9iID0gaG9sZGluZ19mb2xkZXIuZ2V0SGVsZEpvYihqb2JfaWQpO1xuICAgICAqICAgICAgLy8gTW92ZSBzb21ld2hlcmUgZWxzZVxuICAgICAqICAgICAgY2hlY2twb2ludF9qb2IubW92ZShhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChbXCJ0ZXN0XCIsIFwib3V0Zm9sZGVyXCJdKSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGdldEhlbGRKb2Ioam9iSWQ6IHN0cmluZykge1xuICAgICAgICBsZXQgZiA9IHRoaXM7XG4gICAgICAgIGxldCBqb2IgPSBfLmZpbmQoZi5nZXRIZWxkSm9icygpLCAoaikgPT4gai5nZXRJZCgpID09PSBqb2JJZCApO1xuICAgICAgICBsZXQgam9iSW5kZXggPSBfLmZpbmRJbmRleChmLmdldEhlbGRKb2JzKCksIChqKSA9PiBqLmdldElkKCkgPT09IGpvYklkICk7XG5cbiAgICAgICAgaWYgKCFqb2IpIHtcbiAgICAgICAgICAgIGYuZS5sb2coMywgYEpvYiBJRCAke2pvYklkfSBjb3VsZCBub3QgYmUgZm91bmQgaW4gdGhlICR7Zi5nZXRIZWxkSm9icygpLmxlbmd0aH0gcGVuZGluZyBoZWxkIGpvYnMuYCwgZik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmLmhlbGRKb2JzLnNwbGljZShqb2JJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGpvYjtcbiAgICB9XG59Il19
