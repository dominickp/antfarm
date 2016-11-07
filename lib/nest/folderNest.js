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
            if (!fl.isUnixHiddenPath(filepath)) {
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
                    fl.e.log(2, "Hidden file \"" + filepath + "\" ignored.", fl);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QSIsImZpbGUiOiJsaWIvbmVzdC9mb2xkZXJOZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4vbmVzdFwiO1xuaW1wb3J0IHsgRmlsZUpvYiB9IGZyb20gXCIuLy4uL2pvYi9maWxlSm9iXCI7XG5pbXBvcnQgeyBGb2xkZXJKb2IgfSBmcm9tIFwiLi8uLi9qb2IvZm9sZGVySm9iXCI7XG5pbXBvcnQge0pvYn0gZnJvbSBcIi4uL2pvYi9qb2JcIjtcblxuY29uc3QgICBmcyA9IHJlcXVpcmUoXCJmc1wiKSxcbiAgICAgICAgcGF0aF9tb2QgPSByZXF1aXJlKFwicGF0aFwiKSxcbiAgICAgICAgdG1wID0gcmVxdWlyZShcInRtcFwiKSxcbiAgICAgICAgbWtkaXJwID0gcmVxdWlyZShcIm1rZGlycFwiKSxcbiAgICAgICAgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbi8qKlxuICogQSBmb2xkZXIgbmVzdCBpcyBhIG5lc3Qgd2hpY2ggY29udGFpbnMgYSBiYWNraW5nIGZvbGRlciBhdCBhIHNwZWNpZmljIF9wYXRoLiBJZiB0aGUgZm9sZGVyIGRvZXMgbm90IGV4aXN0LFxuICogYW50ZmFybSBjYW4gb3B0aW9uYWxseSBjcmVhdGUgaXQuXG4gKi9cbmV4cG9ydCBjbGFzcyBGb2xkZXJOZXN0IGV4dGVuZHMgTmVzdCB7XG5cbiAgICBwcm90ZWN0ZWQgcGF0aDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBhbGxvd0NyZWF0ZTogYm9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgaGVsZEpvYnM6IChGaWxlSm9ifEZvbGRlckpvYilbXTtcbiAgICBwcml2YXRlIF93YXRjaGVyOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aD86IHN0cmluZywgYWxsb3dDcmVhdGU/OiBib29sZWFuKSB7XG4gICAgICAgIGxldCBuZXN0X25hbWUgPSBwYXRoX21vZC5iYXNlbmFtZShwYXRoKTtcbiAgICAgICAgc3VwZXIoZSwgbmVzdF9uYW1lKTtcblxuICAgICAgICAvLyB0aGlzLl93YXRjaGVyID0gcmVxdWlyZShcIm5vZGUtd2F0Y2hcIik7XG4gICAgICAgIHRoaXMuX3dhdGNoZXIgPSByZXF1aXJlKFwiY2hva2lkYXJcIik7XG5cbiAgICAgICAgdGhpcy5hbGxvd0NyZWF0ZSA9IGFsbG93Q3JlYXRlO1xuICAgICAgICB0aGlzLmNoZWNrRGlyZWN0b3J5U3luYyhwYXRoKTtcbiAgICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgICAgdGhpcy5oZWxkSm9icyA9IFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IHdhdGNoZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl93YXRjaGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBfcGF0aCBmb3IgdGhlIGJhY2tpbmcgZm9sZGVyIGlzIGNyZWF0ZWQuIElmIG5vdCwgb3B0aW9uYWxseSBjcmVhdGUgaXQuXG4gICAgICogQHBhcmFtIGRpcmVjdG9yeVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjaGVja0RpcmVjdG9yeVN5bmMoZGlyZWN0b3J5KSB7XG4gICAgICAgIGxldCBmbiA9IHRoaXM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy5zdGF0U3luYyhkaXJlY3RvcnkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZm4uYWxsb3dDcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhkaXJlY3RvcnkpO1xuICAgICAgICAgICAgICAgIGZuLmUubG9nKDEsIGBEaXJlY3RvcnkgXCIke2RpcmVjdG9yeX1cIiB3YXMgY3JlYXRlZCBzaW5jZSBpdCBkaWQgbm90IGFscmVhZHkgZXhpc3QuYCwgdGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZuLmUubG9nKDMsIGBEaXJlY3RvcnkgXCIke2RpcmVjdG9yeX1cIiBkaWQgbm90IGV4aXN0IGFuZCB3YXMgbm90IGNyZWF0ZWQuYCwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYW5kIGFycml2ZXMgbmV3IGpvYnMuIENhbiBwcm9kdWNlIGZpbGUgb3IgZm9sZGVyIGpvYnMuXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKiBAcGFyYW0gYXJyaXZlXG4gICAgICogQHJldHVybnMge0ZvbGRlckpvYnxGaWxlSm9ifVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVKb2IocGF0aDogc3RyaW5nLCBhcnJpdmUgPSB0cnVlKSB7XG5cbiAgICAgICAgbGV0IGZsID0gdGhpcztcbiAgICAgICAgbGV0IGpvYjtcbiAgICAgICAgLy8gVmVyaWZ5IGZpbGUgc3RpbGwgZXhpc3RzLCBub2RlLXdhdGNoIGZpcmVzIG9uIGFueSBjaGFuZ2UsIGV2ZW4gZGVsZXRlXG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIGluY29ycmVjdGx5IGZvdW5kIGZpbGVzXG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJqb2IgcGF0aFwiLCBwYXRoKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJmb2xkZXIgcGF0aFwiLCBmbC5wYXRoKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJ2bGFpZGl0aXlcIiwgZmwucGF0aC5pbmRleE9mKHBhdGgpID09PSAtMSk7XG5cbiAgICAgICAgaWYgKHBhdGguaW5kZXhPZihmbC5wYXRoKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGZsLmUubG9nKDMsIGBGb3VuZCBqb2IgdGhhdCBkaWQgbm90IGV4aXN0IGluIHRoaXMgbmVzdC4gSm9iOiAke3BhdGh9YCwgZmwpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMocGF0aCwgZnMuRl9PSyk7XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBqb2IgaXMgZm9sZGVyXG4gICAgICAgICAgICAgICAgbGV0IHBhdGhfc3RhdHMgPSBmcy5sc3RhdFN5bmMocGF0aCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocGF0aF9zdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGpvYiA9IG5ldyBGb2xkZXJKb2IoZmwuZSwgcGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGpvYi5jcmVhdGVGaWxlcygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyaXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJpZ2dlciBhcnJpdmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmwuYXJyaXZlKGpvYik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0aF9zdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgICAgICAgICBqb2IgPSBuZXcgRmlsZUpvYihmbC5lLCBwYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFycml2ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJpZ2dlciBhcnJpdmVkXG4gICAgICAgICAgICAgICAgICAgICAgICBmbC5hcnJpdmUoam9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiUGF0aCBpcyBub3QgYSBmaWxlIG9yIGZvbGRlciFcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy8gSXQgaXNuJ3QgYWNjZXNzaWJsZVxuICAgICAgICAgICAgICAgIGZsLmUubG9nKDAsIFwiSm9iIGNyZWF0aW9uIGlnbm9yZWQgYmVjYXVzZSBmaWxlIGRpZCBub3QgZXhpc3QuXCIsIGZsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBqb2I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgYSBfcGF0aCBzdGFydHMgd2l0aCBvciBjb250YWlucyBhIGhpZGRlbiBmaWxlIG9yIGEgZm9sZGVyLlxuICAgICAqIEBwYXJhbSBwYXRoIHtzdHJpbmd9ICAgICAgVGhlIF9wYXRoIG9mIHRoZSBmaWxlIHRoYXQgbmVlZHMgdG8gYmUgdmFsaWRhdGVkLlxuICAgICAqIHJldHVybnMge2Jvb2xlYW59IC0gYHRydWVgIGlmIHRoZSBzb3VyY2UgaXMgYmxhY2tsaXN0ZWQgYW5kIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBpc1VuaXhIaWRkZW5QYXRoIChwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuICgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KHBhdGgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsIGxvYWQgb2YgdGhlIGNvbnRlbnRzIG9mIHRoZSBkaXJlY3RvcnkuXG4gICAgICogQHBhcmFtIGhvbGQge2Jvb2xlYW59ICAgIE9wdGlvbmFsIGZsYWcgdG8gaG9sZCBqb2JzIGZvdW5kLlxuICAgICAqL1xuICAgIHB1YmxpYyBsb2FkKGhvbGQ6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBmcy5yZWFkZGlyKGZsLnBhdGgsIChlcnIsIGl0ZW1zKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBpdGVtcyA9IGl0ZW1zLmZpbHRlcihpdGVtID0+ICEoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChpdGVtKSk7XG5cbiAgICAgICAgICAgICAgICBpdGVtcy5mb3JFYWNoKChmaWxlbmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZmlsZXBhdGggPSBmbC5wYXRoICsgcGF0aF9tb2Quc2VwICsgZmlsZW5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGxldCBqb2I7XG4gICAgICAgICAgICAgICAgICAgIGlmIChob2xkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCB0cnVlKTsgLy8gQXJyaXZlcyBhcyB3ZWxsXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsLmhvbGRKb2Ioam9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYXRjaGVzIHRoZSBmb2xkZXIuXG4gICAgICogQHBhcmFtIGhvbGQge2Jvb2xlYW59ICAgIE9wdGlvbmFsIGZsYWcgdG8gaG9sZCBqb2JzIGZvdW5kLlxuICAgICAqL1xuICAgIHB1YmxpYyB3YXRjaChob2xkOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgbGV0IGZsID0gdGhpcztcbiAgICAgICAgLy8gbGV0IHdhdGNoX29wdGlvbnMgPSB7XG4gICAgICAgIC8vICAgICByZWN1cnNpdmU6IGZhbHNlLFxuICAgICAgICAvLyAgICAgZm9sbG93U3ltTGlua3M6IGZhbHNlXG4gICAgICAgIC8vIH07XG5cbiAgICAgICAgbGV0IGhhbmRsZVdhdGNoRXZlbnQgPSAoZmlsZXBhdGgpID0+IHtcbiAgICAgICAgICAgIGlmICghZmwuaXNVbml4SGlkZGVuUGF0aChmaWxlcGF0aCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZmwucGF0aCAhPT0gZmlsZXBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGpvYjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvbGQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIHRydWUpOyAvLyBBcnJpdmVzIGFzIHdlbGxcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGpvYiA9IGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmwuaG9sZEpvYihqb2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZmwuZS5sb2coMiwgYEhpZGRlbiBmaWxlIFwiJHtmaWxlcGF0aH1cIiBpZ25vcmVkLmAsIGZsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZsLmUubG9nKDIsIGBOZXN0IGZvdW5kIGluIG5ldyB3YXRjaC5gLCBmbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZmwuZS5sb2coMCwgYFdhdGNoaW5nICR7ZmwucGF0aH1gLCBmbCwgW2ZsLnR1bm5lbF0pO1xuXG4gICAgICAgIGxldCBjaG9rT3B0cyA9IHtpZ25vcmVkOiAvW1xcL1xcXFxdXFwuL307XG4gICAgICAgIC8vIGxldCBjaG9rT3B0cyA9IHtpZ25vcmVkOiAvW1xcL1xcXFxdXFwuLywgaWdub3JlSW5pdGlhbDogdHJ1ZSwgZGVwdGg6IDF9O1xuXG5cbiAgICAgICAgLy8gZmwud2F0Y2hlcihmbC5wYXRoLCB3YXRjaF9vcHRpb25zLCBmaWxlcGF0aCA9PiB7XG4gICAgICAgIGZsLndhdGNoZXIud2F0Y2goZmwucGF0aCwgY2hva09wdHMpLm9uKFwiYWRkXCIsIChmaWxlcGF0aCwgZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGhhbmRsZVdhdGNoRXZlbnQoZmlsZXBhdGgpO1xuICAgICAgICB9KTtcbiAgICAgICAgZmwud2F0Y2hlci53YXRjaChmbC5wYXRoLCBjaG9rT3B0cykub24oXCJhZGREaXJcIiwgKGZpbGVwYXRoLCBldmVudCkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJjaG9raWRhciBcIiArIGZsLnBhdGgsICBmaWxlcGF0aCk7XG4gICAgICAgICAgICBoYW5kbGVXYXRjaEV2ZW50KGZpbGVwYXRoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2hlcyBhbmQgaG9sZHMgam9icyBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgd2F0Y2hIb2xkKCk6IHZvaWQge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBmbC5sb2FkKHRydWUpO1xuICAgICAgICBmbC53YXRjaCh0cnVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcnJpdmUgZnVuY3Rpb24gdGhhdCBjYWxscyB0aGUgc3VwZXIuXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqL1xuICAgIHB1YmxpYyBhcnJpdmUoam9iOiBGaWxlSm9iKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQUJPVVQgVE8gQVJSSVZFXCIsIGpvYi5uYW1lLCBcIiBJTiBORVNUIFwiLCB0aGlzLm5hbWUpO1xuICAgICAgICBzdXBlci5hcnJpdmUoam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQaWNrcyB1cCBhIGpvYiBmcm9tIGFub3RoZXIgbmVzdC5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICogQHBhcmFtIGNhbGxiYWNrICAgICAgQ2FsbGJhY2sgaXMgZ2l2ZW4gdGhlIGpvYiBpbiBpdHMgcGFyYW1ldGVyLlxuICAgICAqL1xuICAgIHB1YmxpYyB0YWtlKGpvYjogKEZpbGVKb2J8Rm9sZGVySm9iKSwgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBsZXQgZm4gPSB0aGlzO1xuICAgICAgICAvLyB0aGUgb3RoZXIgbmVzdCB0aGF0IHRoaXMgaXMgdGFraW5nIGZyb20gc2hvdWxkIHByb3ZpZGUgYSB0ZW1wb3JhcnkgbG9jYXRpb24gb3IgbG9jYWwgX3BhdGggb2YgdGhlIGpvYlxuICAgICAgICBsZXQgbmV3X3BhdGggPSBgJHtmbi5wYXRofS8ke2pvYi5uYW1lfWA7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnJlbmFtZVN5bmMoam9iLnBhdGgsIG5ld19wYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBmbi5lLmxvZygzLCBgSm9iICR7am9iLm5hbWV9IGNvdWxkIG5vdCBiZSByZW5hbWVkIGluIHRha2UgbWV0aG9kLiAke2Vycn1gLCBmbiwgW2pvYl0pO1xuICAgICAgICB9XG4gICAgICAgIGpvYi5wYXRoID0gbmV3X3BhdGg7XG4gICAgICAgIC8vIGpvYi5uZXN0ID0gZm47XG5cbiAgICAgICAgY2FsbGJhY2soam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyBqb2JzIHRoYXQgaGF2ZSBwaWxlZCB1cCBpbiB0aGUgbmVzdCBpZiBpdCB3YXMgbm90IHdhdGNoZWQuXG4gICAgICogTm8gbG9uZ2VyIHVzZWQuXG4gICAgICogQHJldHVybnMge0FycmF5fSAgICAgQXJyYXkgb2Ygam9ic1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRVbndhdGNoZWRKb2JzKCkge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBsZXQgam9icyA9IFtdO1xuICAgICAgICBsZXQgZmlsZUFycmF5ID0gZnMucmVhZGRpclN5bmMoZmwucGF0aCk7XG5cbiAgICAgICAgbGV0IGl0ZW1zID0gZmlsZUFycmF5LmZpbHRlcihpdGVtID0+ICEoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChpdGVtKSk7XG5cbiAgICAgICAgaXRlbXMuZm9yRWFjaCgoZmlsZW5hbWUpID0+IHtcbiAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZsLnBhdGggKyBwYXRoX21vZC5zZXAgKyBmaWxlbmFtZTtcbiAgICAgICAgICAgIGxldCBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcbiAgICAgICAgICAgIGpvYnMucHVzaChqb2IpO1xuICAgICAgICAgICAgLy8gZmwuaG9sZEpvYihqb2IpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gam9icztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCBoZWxkIGpvYnMuXG4gICAgICogQHJldHVybnMgeyhGaWxlSm9ifEZvbGRlckpvYilbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SGVsZEpvYnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlbGRKb2JzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgam9iIHRvIGFycmF5IG9mIGhlbGQgam9icy5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhvbGRKb2Ioam9iOiAoRmlsZUpvYnxGb2xkZXJKb2IpKSB7XG4gICAgICAgIHRoaXMuaGVsZEpvYnMucHVzaChqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIGhlbGQgam9iIHdpdGggYSBqb2IgaWQuIFJlbW92ZXMgaXQgZnJvbSB0aGUgaGVsZCBqb2IgcXVldWUsXG4gICAgICogc28geW91IHNob3VsZCBtb3ZlIGl0IG91dCBvZiB0aGUgZm9sZGVyIGFmdGVyIHVzaW5nIHRoaXMuXG4gICAgICogQHBhcmFtIGpvYklkXG4gICAgICogQHJldHVybnMge0ZpbGVKb2J8Rm9sZGVySm9ifVxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogdmFyIHR1bm5lbCA9IGFmLmNyZWF0ZVR1bm5lbChcIkNoZWNrcG9pbnQgZXhhbXBsZVwiKTtcbiAgICAgKiB2YXIgd2ViaG9vayA9IGFmLmNyZWF0ZVdlYmhvb2tOZXN0KFtcInRlc3RcIiwgXCJleGFtcGxlXCJdLCBcImdldFwiKTtcbiAgICAgKiB2YXIgaG9sZGluZ19mb2xkZXIgPSBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChbXCJ0ZXN0XCIsIFwiY2hlY2twb2ludFwiXSk7XG4gICAgICpcbiAgICAgKiB2YXIgaW0gPSB3ZWJob29rLmdldEludGVyZmFjZU1hbmFnZXIoKTtcbiAgICAgKlxuICAgICAqIC8vIFdhdGNoIGZvciBqb2JzLCBob2xkLCBhbmQgcHJvdmlkZSB0byB0aGUgaW50ZXJmYWNlLlxuICAgICAqIGltLmNoZWNrTmVzdChob2xkaW5nX2ZvbGRlcik7XG4gICAgICogdHVubmVsLndhdGNoKHdlYmhvb2spO1xuICAgICAqXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbihqb2IsIG5lc3Qpe1xuICAgICAqICAgICAgLy8gR2V0IHRoZSBqb2JfaWQgZnJvbSB0aGUgd2ViaG9vayByZXF1ZXN0XG4gICAgICogICAgICB2YXIgam9iX2lkID0gam9iLmdldFBhcmFtZXRlcihcImpvYl9pZFwiKTtcbiAgICAgKiAgICAgIC8vIEdldCB0aGUgaGVsZCBqb2IgZnJvbSB0aGUgaG9sZGluZyBmb2xkZXJcbiAgICAgKiAgICAgIHZhciBjaGVja3BvaW50X2pvYiA9IGhvbGRpbmdfZm9sZGVyLmdldEhlbGRKb2Ioam9iX2lkKTtcbiAgICAgKiAgICAgIC8vIE1vdmUgc29tZXdoZXJlIGVsc2VcbiAgICAgKiAgICAgIGNoZWNrcG9pbnRfam9iLm1vdmUoYWYuY3JlYXRlQXV0b0ZvbGRlck5lc3QoW1widGVzdFwiLCBcIm91dGZvbGRlclwiXSkpO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRIZWxkSm9iKGpvYklkOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGYgPSB0aGlzO1xuICAgICAgICBsZXQgam9iID0gXy5maW5kKGYuZ2V0SGVsZEpvYnMoKSwgKGopID0+IGouZ2V0SWQoKSA9PT0gam9iSWQgKTtcbiAgICAgICAgbGV0IGpvYkluZGV4ID0gXy5maW5kSW5kZXgoZi5nZXRIZWxkSm9icygpLCAoaikgPT4gai5nZXRJZCgpID09PSBqb2JJZCApO1xuXG4gICAgICAgIGlmICgham9iKSB7XG4gICAgICAgICAgICBmLmUubG9nKDMsIGBKb2IgSUQgJHtqb2JJZH0gY291bGQgbm90IGJlIGZvdW5kIGluIHRoZSAke2YuZ2V0SGVsZEpvYnMoKS5sZW5ndGh9IHBlbmRpbmcgaGVsZCBqb2JzLmAsIGYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZi5oZWxkSm9icy5zcGxpY2Uoam9iSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2I7XG4gICAgfVxufSJdfQ==
