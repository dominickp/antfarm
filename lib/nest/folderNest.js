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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUssRUFBRSxLQUFLLEtBQUssRUFBbkIsQ0FBbUIsQ0FBRSxDQUFDO1FBQy9ELElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEtBQUssRUFBbkIsQ0FBbUIsQ0FBRSxDQUFDO1FBRXpFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxZQUFVLEtBQUssbUNBQThCLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLHdCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVHLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFDTCxpQkFBQztBQUFELENBNVNBLEFBNFNDLENBNVMrQixXQUFJLEdBNFNuQztBQTVTWSxnQ0FBVSIsImZpbGUiOiJsaWIvbmVzdC9mb2xkZXJOZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XHJcbmltcG9ydCB7IE5lc3QgfSBmcm9tIFwiLi9uZXN0XCI7XHJcbmltcG9ydCB7IEZpbGVKb2IgfSBmcm9tIFwiLi8uLi9qb2IvZmlsZUpvYlwiO1xyXG5pbXBvcnQgeyBGb2xkZXJKb2IgfSBmcm9tIFwiLi8uLi9qb2IvZm9sZGVySm9iXCI7XHJcbmltcG9ydCB7Sm9ifSBmcm9tIFwiLi4vam9iL2pvYlwiO1xyXG5cclxuY29uc3QgICBmcyA9IHJlcXVpcmUoXCJmc1wiKSxcclxuICAgICAgICBwYXRoX21vZCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxyXG4gICAgICAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIiksXHJcbiAgICAgICAgbWtkaXJwID0gcmVxdWlyZShcIm1rZGlycFwiKSxcclxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcclxuXHJcbi8qKlxyXG4gKiBBIGZvbGRlciBuZXN0IGlzIGEgbmVzdCB3aGljaCBjb250YWlucyBhIGJhY2tpbmcgZm9sZGVyIGF0IGEgc3BlY2lmaWMgX3BhdGguIElmIHRoZSBmb2xkZXIgZG9lcyBub3QgZXhpc3QsXHJcbiAqIGFudGZhcm0gY2FuIG9wdGlvbmFsbHkgY3JlYXRlIGl0LlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEZvbGRlck5lc3QgZXh0ZW5kcyBOZXN0IHtcclxuXHJcbiAgICBwcm90ZWN0ZWQgcGF0aDogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIGFsbG93Q3JlYXRlOiBib29sZWFuO1xyXG4gICAgcHJvdGVjdGVkIGhlbGRKb2JzOiAoRmlsZUpvYnxGb2xkZXJKb2IpW107XHJcbiAgICBwcml2YXRlIF93YXRjaGVyOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHBhdGg/OiBzdHJpbmcsIGFsbG93Q3JlYXRlPzogYm9vbGVhbikge1xyXG4gICAgICAgIGxldCBuZXN0X25hbWUgPSBwYXRoX21vZC5iYXNlbmFtZShwYXRoKTtcclxuICAgICAgICBzdXBlcihlLCBuZXN0X25hbWUpO1xyXG5cclxuICAgICAgICAvLyB0aGlzLl93YXRjaGVyID0gcmVxdWlyZShcIm5vZGUtd2F0Y2hcIik7XHJcbiAgICAgICAgdGhpcy5fd2F0Y2hlciA9IHJlcXVpcmUoXCJjaG9raWRhclwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5hbGxvd0NyZWF0ZSA9IGFsbG93Q3JlYXRlO1xyXG4gICAgICAgIHRoaXMuY2hlY2tEaXJlY3RvcnlTeW5jKHBhdGgpO1xyXG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGhfbW9kLm5vcm1hbGl6ZShwYXRoKTtcclxuICAgICAgICB0aGlzLmhlbGRKb2JzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXQgd2F0Y2hlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fd2F0Y2hlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIHRoZSBfcGF0aCBmb3IgdGhlIGJhY2tpbmcgZm9sZGVyIGlzIGNyZWF0ZWQuIElmIG5vdCwgb3B0aW9uYWxseSBjcmVhdGUgaXQuXHJcbiAgICAgKiBAcGFyYW0gZGlyZWN0b3J5XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjaGVja0RpcmVjdG9yeVN5bmMoZGlyZWN0b3J5KSB7XHJcbiAgICAgICAgbGV0IGZuID0gdGhpcztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBmcy5zdGF0U3luYyhkaXJlY3RvcnkpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYgKGZuLmFsbG93Q3JlYXRlKSB7XHJcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhkaXJlY3RvcnkpO1xyXG4gICAgICAgICAgICAgICAgZm4uZS5sb2coMSwgYERpcmVjdG9yeSBcIiR7ZGlyZWN0b3J5fVwiIHdhcyBjcmVhdGVkIHNpbmNlIGl0IGRpZCBub3QgYWxyZWFkeSBleGlzdC5gLCB0aGlzKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZuLmUubG9nKDMsIGBEaXJlY3RvcnkgXCIke2RpcmVjdG9yeX1cIiBkaWQgbm90IGV4aXN0IGFuZCB3YXMgbm90IGNyZWF0ZWQuYCwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYW5kIGFycml2ZXMgbmV3IGpvYnMuIENhbiBwcm9kdWNlIGZpbGUgb3IgZm9sZGVyIGpvYnMuXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICogQHBhcmFtIGFycml2ZVxyXG4gICAgICogQHJldHVybnMge0ZvbGRlckpvYnxGaWxlSm9ifVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlSm9iKHBhdGg6IHN0cmluZywgYXJyaXZlID0gdHJ1ZSkge1xyXG5cclxuICAgICAgICBsZXQgZmwgPSB0aGlzO1xyXG4gICAgICAgIGxldCBqb2I7XHJcbiAgICAgICAgLy8gVmVyaWZ5IGZpbGUgc3RpbGwgZXhpc3RzLCBub2RlLXdhdGNoIGZpcmVzIG9uIGFueSBjaGFuZ2UsIGV2ZW4gZGVsZXRlXHJcblxyXG4gICAgICAgIC8vIENoZWNrIGZvciBpbmNvcnJlY3RseSBmb3VuZCBmaWxlc1xyXG5cclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImpvYiBwYXRoXCIsIHBhdGgpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZm9sZGVyIHBhdGhcIiwgZmwucGF0aCk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJ2bGFpZGl0aXlcIiwgZmwucGF0aC5pbmRleE9mKHBhdGgpID09PSAtMSk7XHJcblxyXG4gICAgICAgIGxldCBmbl9wYXRoID0gcGF0aF9tb2Qubm9ybWFsaXplKGZsLnBhdGgpO1xyXG4gICAgICAgIGxldCBpbmNvbWluZ19qb2JfcGF0aCA9IHBhdGhfbW9kLm5vcm1hbGl6ZShwYXRoKTtcclxuXHJcbiAgICAgICAgaWYgKGluY29taW5nX2pvYl9wYXRoLmluZGV4T2YoZm5fcGF0aCkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIGZsLmUubG9nKDMsIGBGb3VuZCBqb2IgdGhhdCBkaWQgbm90IGV4aXN0IGluIHRoaXMgbmVzdC4gSm9iOiAke2luY29taW5nX2pvYl9wYXRofToke2ZuX3BhdGh9YCwgZmwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyhwYXRoLCBmcy5GX09LKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBqb2IgaXMgZm9sZGVyXHJcbiAgICAgICAgICAgICAgICBsZXQgcGF0aF9zdGF0cyA9IGZzLmxzdGF0U3luYyhwYXRoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGF0aF9zdGF0cy5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgam9iID0gbmV3IEZvbGRlckpvYihmbC5lLCBwYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICBqb2IuY3JlYXRlRmlsZXMoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyaXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmlnZ2VyIGFycml2ZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsLmFycml2ZShqb2IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGhfc3RhdHMuaXNGaWxlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBqb2IgPSBuZXcgRmlsZUpvYihmbC5lLCBwYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyaXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgYXJyaXZlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmbC5hcnJpdmUoam9iKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiUGF0aCBpcyBub3QgYSBmaWxlIG9yIGZvbGRlciFcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gSXQgaXNuJ3QgYWNjZXNzaWJsZVxyXG4gICAgICAgICAgICAgICAgZmwuZS5sb2coMCwgXCJKb2IgY3JlYXRpb24gaWdub3JlZCBiZWNhdXNlIGZpbGUgZGlkIG5vdCBleGlzdC5cIiwgZmwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gam9iO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgYSBfcGF0aCBzdGFydHMgd2l0aCBvciBjb250YWlucyBhIGhpZGRlbiBmaWxlIG9yIGEgZm9sZGVyLlxyXG4gICAgICogQHBhcmFtIHBhdGgge3N0cmluZ30gICAgICBUaGUgX3BhdGggb2YgdGhlIGZpbGUgdGhhdCBuZWVkcyB0byBiZSB2YWxpZGF0ZWQuXHJcbiAgICAgKiByZXR1cm5zIHtib29sZWFufSAtIGB0cnVlYCBpZiB0aGUgc291cmNlIGlzIGJsYWNrbGlzdGVkIGFuZCBvdGhlcndpc2UgYGZhbHNlYC5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGlzVW5peEhpZGRlblBhdGggKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChwYXRoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbml0aWFsIGxvYWQgb2YgdGhlIGNvbnRlbnRzIG9mIHRoZSBkaXJlY3RvcnkuXHJcbiAgICAgKiBAcGFyYW0gaG9sZCB7Ym9vbGVhbn0gICAgT3B0aW9uYWwgZmxhZyB0byBob2xkIGpvYnMgZm91bmQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBsb2FkKGhvbGQ6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBmbCA9IHRoaXM7XHJcbiAgICAgICAgZnMucmVhZGRpcihmbC5wYXRoLCAoZXJyLCBpdGVtcykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gISgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KGl0ZW0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5mb3JFYWNoKChmaWxlbmFtZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZsLnBhdGggKyBwYXRoX21vZC5zZXAgKyBmaWxlbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgam9iO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChob2xkID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIHRydWUpOyAvLyBBcnJpdmVzIGFzIHdlbGxcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmwuaG9sZEpvYihqb2IpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaGVzIHRoZSBmb2xkZXIuXHJcbiAgICAgKiBAcGFyYW0gaG9sZCB7Ym9vbGVhbn0gICAgT3B0aW9uYWwgZmxhZyB0byBob2xkIGpvYnMgZm91bmQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB3YXRjaChob2xkOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcclxuICAgICAgICBsZXQgZmwgPSB0aGlzO1xyXG4gICAgICAgIC8vIGxldCB3YXRjaF9vcHRpb25zID0ge1xyXG4gICAgICAgIC8vICAgICByZWN1cnNpdmU6IGZhbHNlLFxyXG4gICAgICAgIC8vICAgICBmb2xsb3dTeW1MaW5rczogZmFsc2VcclxuICAgICAgICAvLyB9O1xyXG5cclxuICAgICAgICBsZXQgaGFuZGxlV2F0Y2hFdmVudCA9IChmaWxlcGF0aDogc3RyaW5nLCBldmVudDogc3RyaW5nKSA9PiB7XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50ID09PSBcImFkZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm5fcGF0aCA9IHBhdGhfbW9kLm5vcm1hbGl6ZShmbC5wYXRoKTtcclxuICAgICAgICAgICAgICAgIGxldCBmb3VuZF9qb2JfcGF0aCA9IHBhdGhfbW9kLm5vcm1hbGl6ZShmaWxlcGF0aCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm91bmRfam9iX2ZvbGRlciA9IHBhdGhfbW9kLmRpcm5hbWUoZm91bmRfam9iX3BhdGgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZuX3BhdGggIT09IGZvdW5kX2pvYl9mb2xkZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChmbC5wYXRoICE9PSBmaWxlcGF0aCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGpvYjtcclxuICAgICAgICAgICAgICAgIGlmIChob2xkID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGpvYiA9IGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgdHJ1ZSk7IC8vIEFycml2ZXMgYXMgd2VsbFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICBmbC5ob2xkSm9iKGpvYik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZmwuZS5sb2coMiwgYE5lc3QgZm91bmQgaW4gbmV3IHdhdGNoLmAsIGZsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZsLmUubG9nKDAsIGBXYXRjaGluZyAke2ZsLnBhdGh9YCwgZmwsIFtmbC50dW5uZWxdKTtcclxuXHJcbiAgICAgICAgbGV0IGNob2tPcHRzID0ge2lnbm9yZWQ6IC9bXFwvXFxcXF1cXC4vLCBpZ25vcmVJbml0aWFsOiB0cnVlfTtcclxuICAgICAgICAvLyBsZXQgY2hva09wdHMgPSB7aWdub3JlZDogL1tcXC9cXFxcXVxcLi8sIGlnbm9yZUluaXRpYWw6IHRydWUsIGRlcHRoOiAxfTtcclxuXHJcbiAgICAgICAgbGV0IHdhdGNoZXJJbnN0YW5jZSA9IGZsLndhdGNoZXIud2F0Y2goZmwucGF0aCwgY2hva09wdHMpO1xyXG4gICAgICAgIHdhdGNoZXJJbnN0YW5jZVxyXG4gICAgICAgICAgICAub24oXCJhZGRcIiwgKGZpbGVwYXRoLCBldmVudCkgPT4geyBoYW5kbGVXYXRjaEV2ZW50KGZpbGVwYXRoLCBcImFkZFwiKTsgfSlcclxuICAgICAgICAgICAgLm9uKFwiYWRkRGlyXCIsIChmaWxlcGF0aCwgZXZlbnQpID0+IHsgaGFuZGxlV2F0Y2hFdmVudChmaWxlcGF0aCwgXCJhZGREaXJcIik7IH0pXHJcbiAgICAgICAgICAgIC5vbihcImVycm9yXCIsIGVycm9yID0+IGZsLmUubG9nKDMsIGAgV2F0Y2hlciBlcnJvcjogJHtlcnJvcn1gLCBmbCkpXHJcbiAgICAgICAgICAgIC5vbihcInJhd1wiLCAoZXZlbnQsIHBhdGgsIGRldGFpbHMpID0+IHtcclxuICAgICAgICAgICAgICAgIGZsLmUubG9nKDAsIGBSYXcgZXZlbnQgaW5mbzogJHtldmVudH0sICR7cGF0aH0sICR7ZGV0YWlscy50b1N0cmluZygpfWAsIGZsKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaGVzIGFuZCBob2xkcyBqb2JzIGZvdW5kLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgd2F0Y2hIb2xkKCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBmbCA9IHRoaXM7XHJcbiAgICAgICAgZmwubG9hZCh0cnVlKTtcclxuICAgICAgICBmbC53YXRjaCh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFycml2ZSBmdW5jdGlvbiB0aGF0IGNhbGxzIHRoZSBzdXBlci5cclxuICAgICAqIEBwYXJhbSBqb2JcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFycml2ZShqb2I6IEZpbGVKb2IpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkFCT1VUIFRPIEFSUklWRVwiLCBqb2IubmFtZSwgXCIgSU4gTkVTVCBcIiwgdGhpcy5uYW1lKTtcclxuICAgICAgICBzdXBlci5hcnJpdmUoam9iKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBpY2tzIHVwIGEgam9iIGZyb20gYW5vdGhlciBuZXN0LlxyXG4gICAgICogQHBhcmFtIGpvYlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrICAgICAgQ2FsbGJhY2sgaXMgZ2l2ZW4gdGhlIGpvYiBpbiBpdHMgcGFyYW1ldGVyLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdGFrZShqb2I6IChGaWxlSm9ifEZvbGRlckpvYiksIGNhbGxiYWNrOiAoam9iOiBGaWxlSm9ifEZvbGRlckpvYikgPT4gdm9pZCkge1xyXG4gICAgICAgIGxldCBmbiA9IHRoaXM7XHJcbiAgICAgICAgLy8gdGhlIG90aGVyIG5lc3QgdGhhdCB0aGlzIGlzIHRha2luZyBmcm9tIHNob3VsZCBwcm92aWRlIGEgdGVtcG9yYXJ5IGxvY2F0aW9uIG9yIGxvY2FsIF9wYXRoIG9mIHRoZSBqb2JcclxuICAgICAgICBsZXQgbmV3X3BhdGggPSBgJHtmbi5wYXRofS8ke2pvYi5uYW1lfWA7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGZzLnJlbmFtZVN5bmMoam9iLnBhdGgsIG5ld19wYXRoKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgZm4uZS5sb2coMywgYEpvYiAke2pvYi5uYW1lfSBjb3VsZCBub3QgYmUgcmVuYW1lZCBpbiB0YWtlIG1ldGhvZC4gJHtlcnJ9YCwgZm4sIFtqb2JdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgam9iLnBhdGggPSBuZXdfcGF0aDtcclxuICAgICAgICAvLyBqb2IubmVzdCA9IGZuO1xyXG5cclxuICAgICAgICBjYWxsYmFjayhqb2IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTG9hZHMgam9icyB0aGF0IGhhdmUgcGlsZWQgdXAgaW4gdGhlIG5lc3QgaWYgaXQgd2FzIG5vdCB3YXRjaGVkLlxyXG4gICAgICogTm8gbG9uZ2VyIHVzZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9ICAgICBBcnJheSBvZiBqb2JzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRVbndhdGNoZWRKb2JzKCkge1xyXG4gICAgICAgIGxldCBmbCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGpvYnMgPSBbXTtcclxuICAgICAgICBsZXQgZmlsZUFycmF5ID0gZnMucmVhZGRpclN5bmMoZmwucGF0aCk7XHJcblxyXG4gICAgICAgIGxldCBpdGVtcyA9IGZpbGVBcnJheS5maWx0ZXIoaXRlbSA9PiAhKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QoaXRlbSkpO1xyXG5cclxuICAgICAgICBpdGVtcy5mb3JFYWNoKChmaWxlbmFtZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZmlsZXBhdGggPSBmbC5wYXRoICsgcGF0aF9tb2Quc2VwICsgZmlsZW5hbWU7XHJcbiAgICAgICAgICAgIGxldCBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcclxuICAgICAgICAgICAgam9icy5wdXNoKGpvYik7XHJcbiAgICAgICAgICAgIC8vIGZsLmhvbGRKb2Ioam9iKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGpvYnM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFsbCBoZWxkIGpvYnMuXHJcbiAgICAgKiBAcmV0dXJucyB7KEZpbGVKb2J8Rm9sZGVySm9iKVtdfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0SGVsZEpvYnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVsZEpvYnM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGpvYiB0byBhcnJheSBvZiBoZWxkIGpvYnMuXHJcbiAgICAgKiBAcGFyYW0gam9iXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBob2xkSm9iKGpvYjogKEZpbGVKb2J8Rm9sZGVySm9iKSkge1xyXG4gICAgICAgIHRoaXMuaGVsZEpvYnMucHVzaChqb2IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGEgaGVsZCBqb2Igd2l0aCBhIGpvYiBpZC4gUmVtb3ZlcyBpdCBmcm9tIHRoZSBoZWxkIGpvYiBxdWV1ZSxcclxuICAgICAqIHNvIHlvdSBzaG91bGQgbW92ZSBpdCBvdXQgb2YgdGhlIGZvbGRlciBhZnRlciB1c2luZyB0aGlzLlxyXG4gICAgICogQHBhcmFtIGpvYklkXHJcbiAgICAgKiBAcmV0dXJucyB7RmlsZUpvYnxGb2xkZXJKb2J9XHJcbiAgICAgKiAjIyMjIEV4YW1wbGVcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiB2YXIgdHVubmVsID0gYWYuY3JlYXRlVHVubmVsKFwiQ2hlY2twb2ludCBleGFtcGxlXCIpO1xyXG4gICAgICogdmFyIHdlYmhvb2sgPSBhZi5jcmVhdGVXZWJob29rTmVzdChbXCJ0ZXN0XCIsIFwiZXhhbXBsZVwiXSwgXCJnZXRcIik7XHJcbiAgICAgKiB2YXIgaG9sZGluZ19mb2xkZXIgPSBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChbXCJ0ZXN0XCIsIFwiY2hlY2twb2ludFwiXSk7XHJcbiAgICAgKlxyXG4gICAgICogdmFyIGltID0gd2ViaG9vay5nZXRJbnRlcmZhY2VNYW5hZ2VyKCk7XHJcbiAgICAgKlxyXG4gICAgICogLy8gV2F0Y2ggZm9yIGpvYnMsIGhvbGQsIGFuZCBwcm92aWRlIHRvIHRoZSBpbnRlcmZhY2UuXHJcbiAgICAgKiBpbS5jaGVja05lc3QoaG9sZGluZ19mb2xkZXIpO1xyXG4gICAgICogdHVubmVsLndhdGNoKHdlYmhvb2spO1xyXG4gICAgICpcclxuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24oam9iLCBuZXN0KXtcclxuICAgICAqICAgICAgLy8gR2V0IHRoZSBqb2JfaWQgZnJvbSB0aGUgd2ViaG9vayByZXF1ZXN0XHJcbiAgICAgKiAgICAgIHZhciBqb2JfaWQgPSBqb2IuZ2V0UGFyYW1ldGVyKFwiam9iX2lkXCIpO1xyXG4gICAgICogICAgICAvLyBHZXQgdGhlIGhlbGQgam9iIGZyb20gdGhlIGhvbGRpbmcgZm9sZGVyXHJcbiAgICAgKiAgICAgIHZhciBjaGVja3BvaW50X2pvYiA9IGhvbGRpbmdfZm9sZGVyLmdldEhlbGRKb2Ioam9iX2lkKTtcclxuICAgICAqICAgICAgLy8gTW92ZSBzb21ld2hlcmUgZWxzZVxyXG4gICAgICogICAgICBjaGVja3BvaW50X2pvYi5tb3ZlKGFmLmNyZWF0ZUF1dG9Gb2xkZXJOZXN0KFtcInRlc3RcIiwgXCJvdXRmb2xkZXJcIl0pKTtcclxuICAgICAqIH0pO1xyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRIZWxkSm9iKGpvYklkOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGpvYiA9IF8uZmluZChmLmdldEhlbGRKb2JzKCksIChqKSA9PiBqLmdldElkKCkgPT09IGpvYklkICk7XHJcbiAgICAgICAgbGV0IGpvYkluZGV4ID0gXy5maW5kSW5kZXgoZi5nZXRIZWxkSm9icygpLCAoaikgPT4gai5nZXRJZCgpID09PSBqb2JJZCApO1xyXG5cclxuICAgICAgICBpZiAoIWpvYikge1xyXG4gICAgICAgICAgICBmLmUubG9nKDMsIGBKb2IgSUQgJHtqb2JJZH0gY291bGQgbm90IGJlIGZvdW5kIGluIHRoZSAke2YuZ2V0SGVsZEpvYnMoKS5sZW5ndGh9IHBlbmRpbmcgaGVsZCBqb2JzLmAsIGYpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGYuaGVsZEpvYnMuc3BsaWNlKGpvYkluZGV4LCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGpvYjtcclxuICAgIH1cclxufSJdfQ==
