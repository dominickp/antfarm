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
        }).on("error", function (error) { return fl.e.log(3, "add watcher error: " + error, fl); });
        fl.watcher.watch(fl.path, chokOpts).on("addDir", function (filepath, event) {
            // console.log("chokidar " + fl.path,  filepath);
            handleWatchEvent(filepath);
        }).on("error", function (error) { return fl.e.log(3, "addDir watcher error: " + error, fl); });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFBRCxDQWhTQSxBQWdTQyxDQWhTK0IsV0FBSSxHQWdTbkM7QUFoU1ksa0JBQVUsYUFnU3RCLENBQUEiLCJmaWxlIjoibGliL25lc3QvZm9sZGVyTmVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHsgTmVzdCB9IGZyb20gXCIuL25lc3RcIjtcbmltcG9ydCB7IEZpbGVKb2IgfSBmcm9tIFwiLi8uLi9qb2IvZmlsZUpvYlwiO1xuaW1wb3J0IHsgRm9sZGVySm9iIH0gZnJvbSBcIi4vLi4vam9iL2ZvbGRlckpvYlwiO1xuaW1wb3J0IHtKb2J9IGZyb20gXCIuLi9qb2Ivam9iXCI7XG5cbmNvbnN0ICAgZnMgPSByZXF1aXJlKFwiZnNcIiksXG4gICAgICAgIHBhdGhfbW9kID0gcmVxdWlyZShcInBhdGhcIiksXG4gICAgICAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIiksXG4gICAgICAgIG1rZGlycCA9IHJlcXVpcmUoXCJta2RpcnBcIiksXG4gICAgICAgIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xuXG4vKipcbiAqIEEgZm9sZGVyIG5lc3QgaXMgYSBuZXN0IHdoaWNoIGNvbnRhaW5zIGEgYmFja2luZyBmb2xkZXIgYXQgYSBzcGVjaWZpYyBfcGF0aC4gSWYgdGhlIGZvbGRlciBkb2VzIG5vdCBleGlzdCxcbiAqIGFudGZhcm0gY2FuIG9wdGlvbmFsbHkgY3JlYXRlIGl0LlxuICovXG5leHBvcnQgY2xhc3MgRm9sZGVyTmVzdCBleHRlbmRzIE5lc3Qge1xuXG4gICAgcHJvdGVjdGVkIHBhdGg6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgYWxsb3dDcmVhdGU6IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIGhlbGRKb2JzOiAoRmlsZUpvYnxGb2xkZXJKb2IpW107XG4gICAgcHJpdmF0ZSBfd2F0Y2hlcjogYW55O1xuXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHBhdGg/OiBzdHJpbmcsIGFsbG93Q3JlYXRlPzogYm9vbGVhbikge1xuICAgICAgICBsZXQgbmVzdF9uYW1lID0gcGF0aF9tb2QuYmFzZW5hbWUocGF0aCk7XG4gICAgICAgIHN1cGVyKGUsIG5lc3RfbmFtZSk7XG5cbiAgICAgICAgLy8gdGhpcy5fd2F0Y2hlciA9IHJlcXVpcmUoXCJub2RlLXdhdGNoXCIpO1xuICAgICAgICB0aGlzLl93YXRjaGVyID0gcmVxdWlyZShcImNob2tpZGFyXCIpO1xuXG4gICAgICAgIHRoaXMuYWxsb3dDcmVhdGUgPSBhbGxvd0NyZWF0ZTtcbiAgICAgICAgdGhpcy5jaGVja0RpcmVjdG9yeVN5bmMocGF0aCk7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgICAgIHRoaXMuaGVsZEpvYnMgPSBbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCB3YXRjaGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fd2F0Y2hlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgX3BhdGggZm9yIHRoZSBiYWNraW5nIGZvbGRlciBpcyBjcmVhdGVkLiBJZiBub3QsIG9wdGlvbmFsbHkgY3JlYXRlIGl0LlxuICAgICAqIEBwYXJhbSBkaXJlY3RvcnlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY2hlY2tEaXJlY3RvcnlTeW5jKGRpcmVjdG9yeSkge1xuICAgICAgICBsZXQgZm4gPSB0aGlzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMuc3RhdFN5bmMoZGlyZWN0b3J5KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGZuLmFsbG93Q3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgbWtkaXJwLnN5bmMoZGlyZWN0b3J5KTtcbiAgICAgICAgICAgICAgICBmbi5lLmxvZygxLCBgRGlyZWN0b3J5IFwiJHtkaXJlY3Rvcnl9XCIgd2FzIGNyZWF0ZWQgc2luY2UgaXQgZGlkIG5vdCBhbHJlYWR5IGV4aXN0LmAsIHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmbi5lLmxvZygzLCBgRGlyZWN0b3J5IFwiJHtkaXJlY3Rvcnl9XCIgZGlkIG5vdCBleGlzdCBhbmQgd2FzIG5vdCBjcmVhdGVkLmAsIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdGhhdCBjcmVhdGVzIGFuZCBhcnJpdmVzIG5ldyBqb2JzLiBDYW4gcHJvZHVjZSBmaWxlIG9yIGZvbGRlciBqb2JzLlxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICogQHBhcmFtIGFycml2ZVxuICAgICAqIEByZXR1cm5zIHtGb2xkZXJKb2J8RmlsZUpvYn1cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlSm9iKHBhdGg6IHN0cmluZywgYXJyaXZlID0gdHJ1ZSkge1xuXG4gICAgICAgIGxldCBmbCA9IHRoaXM7XG4gICAgICAgIGxldCBqb2I7XG4gICAgICAgIC8vIFZlcmlmeSBmaWxlIHN0aWxsIGV4aXN0cywgbm9kZS13YXRjaCBmaXJlcyBvbiBhbnkgY2hhbmdlLCBldmVuIGRlbGV0ZVxuXG4gICAgICAgIC8vIENoZWNrIGZvciBpbmNvcnJlY3RseSBmb3VuZCBmaWxlc1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiam9iIHBhdGhcIiwgcGF0aCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZm9sZGVyIHBhdGhcIiwgZmwucGF0aCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwidmxhaWRpdGl5XCIsIGZsLnBhdGguaW5kZXhPZihwYXRoKSA9PT0gLTEpO1xuXG4gICAgICAgIGlmIChwYXRoLmluZGV4T2YoZmwucGF0aCkgPT09IC0xKSB7XG4gICAgICAgICAgICBmbC5lLmxvZygzLCBgRm91bmQgam9iIHRoYXQgZGlkIG5vdCBleGlzdCBpbiB0aGlzIG5lc3QuIEpvYjogJHtwYXRofWAsIGZsKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jKHBhdGgsIGZzLkZfT0spO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgam9iIGlzIGZvbGRlclxuICAgICAgICAgICAgICAgIGxldCBwYXRoX3N0YXRzID0gZnMubHN0YXRTeW5jKHBhdGgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhdGhfc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICBqb2IgPSBuZXcgRm9sZGVySm9iKGZsLmUsIHBhdGgpO1xuICAgICAgICAgICAgICAgICAgICBqb2IuY3JlYXRlRmlsZXMoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFycml2ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgYXJyaXZlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsLmFycml2ZShqb2IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGhfc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgam9iID0gbmV3IEZpbGVKb2IoZmwuZSwgcGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcnJpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgYXJyaXZlZFxuICAgICAgICAgICAgICAgICAgICAgICAgZmwuYXJyaXZlKGpvYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIlBhdGggaXMgbm90IGEgZmlsZSBvciBmb2xkZXIhXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIEl0IGlzbid0IGFjY2Vzc2libGVcbiAgICAgICAgICAgICAgICBmbC5lLmxvZygwLCBcIkpvYiBjcmVhdGlvbiBpZ25vcmVkIGJlY2F1c2UgZmlsZSBkaWQgbm90IGV4aXN0LlwiLCBmbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gam9iO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB3aGV0aGVyIGEgX3BhdGggc3RhcnRzIHdpdGggb3IgY29udGFpbnMgYSBoaWRkZW4gZmlsZSBvciBhIGZvbGRlci5cbiAgICAgKiBAcGFyYW0gcGF0aCB7c3RyaW5nfSAgICAgIFRoZSBfcGF0aCBvZiB0aGUgZmlsZSB0aGF0IG5lZWRzIHRvIGJlIHZhbGlkYXRlZC5cbiAgICAgKiByZXR1cm5zIHtib29sZWFufSAtIGB0cnVlYCBpZiB0aGUgc291cmNlIGlzIGJsYWNrbGlzdGVkIGFuZCBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaXNVbml4SGlkZGVuUGF0aCAocGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChwYXRoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbCBsb2FkIG9mIHRoZSBjb250ZW50cyBvZiB0aGUgZGlyZWN0b3J5LlxuICAgICAqIEBwYXJhbSBob2xkIHtib29sZWFufSAgICBPcHRpb25hbCBmbGFnIHRvIGhvbGQgam9icyBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgbG9hZChob2xkOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgbGV0IGZsID0gdGhpcztcbiAgICAgICAgZnMucmVhZGRpcihmbC5wYXRoLCAoZXJyLCBpdGVtcykgPT4ge1xuICAgICAgICAgICAgaWYgKGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgaXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiAhKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QoaXRlbSkpO1xuXG4gICAgICAgICAgICAgICAgaXRlbXMuZm9yRWFjaCgoZmlsZW5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGVwYXRoID0gZmwucGF0aCArIHBhdGhfbW9kLnNlcCArIGZpbGVuYW1lO1xuICAgICAgICAgICAgICAgICAgICBsZXQgam9iO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaG9sZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgdHJ1ZSk7IC8vIEFycml2ZXMgYXMgd2VsbFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbC5ob2xkSm9iKGpvYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2hlcyB0aGUgZm9sZGVyLlxuICAgICAqIEBwYXJhbSBob2xkIHtib29sZWFufSAgICBPcHRpb25hbCBmbGFnIHRvIGhvbGQgam9icyBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgd2F0Y2goaG9sZDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgICAgIGxldCBmbCA9IHRoaXM7XG4gICAgICAgIC8vIGxldCB3YXRjaF9vcHRpb25zID0ge1xuICAgICAgICAvLyAgICAgcmVjdXJzaXZlOiBmYWxzZSxcbiAgICAgICAgLy8gICAgIGZvbGxvd1N5bUxpbmtzOiBmYWxzZVxuICAgICAgICAvLyB9O1xuXG4gICAgICAgIGxldCBoYW5kbGVXYXRjaEV2ZW50ID0gKGZpbGVwYXRoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmwucGF0aCAhPT0gZmlsZXBhdGgpIHtcbiAgICAgICAgICAgICAgICBsZXQgam9iO1xuICAgICAgICAgICAgICAgIGlmIChob2xkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIHRydWUpOyAvLyBBcnJpdmVzIGFzIHdlbGxcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZmwuaG9sZEpvYihqb2IpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmbC5lLmxvZygyLCBgTmVzdCBmb3VuZCBpbiBuZXcgd2F0Y2guYCwgZmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGZsLmUubG9nKDAsIGBXYXRjaGluZyAke2ZsLnBhdGh9YCwgZmwsIFtmbC50dW5uZWxdKTtcblxuICAgICAgICBsZXQgY2hva09wdHMgPSB7aWdub3JlZDogL1tcXC9cXFxcXVxcLi99O1xuICAgICAgICAvLyBsZXQgY2hva09wdHMgPSB7aWdub3JlZDogL1tcXC9cXFxcXVxcLi8sIGlnbm9yZUluaXRpYWw6IHRydWUsIGRlcHRoOiAxfTtcblxuXG4gICAgICAgIC8vIGZsLndhdGNoZXIoZmwucGF0aCwgd2F0Y2hfb3B0aW9ucywgZmlsZXBhdGggPT4ge1xuICAgICAgICBmbC53YXRjaGVyLndhdGNoKGZsLnBhdGgsIGNob2tPcHRzKS5vbihcImFkZFwiLCAoZmlsZXBhdGgsIGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBoYW5kbGVXYXRjaEV2ZW50KGZpbGVwYXRoKTtcbiAgICAgICAgfSkub24oXCJlcnJvclwiLCBlcnJvciA9PiBmbC5lLmxvZygzLCBgYWRkIHdhdGNoZXIgZXJyb3I6ICR7ZXJyb3J9YCwgZmwpKTtcbiAgICAgICAgXG4gICAgICAgIGZsLndhdGNoZXIud2F0Y2goZmwucGF0aCwgY2hva09wdHMpLm9uKFwiYWRkRGlyXCIsIChmaWxlcGF0aCwgZXZlbnQpID0+IHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiY2hva2lkYXIgXCIgKyBmbC5wYXRoLCAgZmlsZXBhdGgpO1xuICAgICAgICAgICAgaGFuZGxlV2F0Y2hFdmVudChmaWxlcGF0aCk7XG4gICAgICAgIH0pLm9uKFwiZXJyb3JcIiwgZXJyb3IgPT4gZmwuZS5sb2coMywgYGFkZERpciB3YXRjaGVyIGVycm9yOiAke2Vycm9yfWAsIGZsKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2hlcyBhbmQgaG9sZHMgam9icyBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgd2F0Y2hIb2xkKCk6IHZvaWQge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBmbC5sb2FkKHRydWUpO1xuICAgICAgICBmbC53YXRjaCh0cnVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcnJpdmUgZnVuY3Rpb24gdGhhdCBjYWxscyB0aGUgc3VwZXIuXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqL1xuICAgIHB1YmxpYyBhcnJpdmUoam9iOiBGaWxlSm9iKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQUJPVVQgVE8gQVJSSVZFXCIsIGpvYi5uYW1lLCBcIiBJTiBORVNUIFwiLCB0aGlzLm5hbWUpO1xuICAgICAgICBzdXBlci5hcnJpdmUoam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQaWNrcyB1cCBhIGpvYiBmcm9tIGFub3RoZXIgbmVzdC5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICogQHBhcmFtIGNhbGxiYWNrICAgICAgQ2FsbGJhY2sgaXMgZ2l2ZW4gdGhlIGpvYiBpbiBpdHMgcGFyYW1ldGVyLlxuICAgICAqL1xuICAgIHB1YmxpYyB0YWtlKGpvYjogKEZpbGVKb2J8Rm9sZGVySm9iKSwgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBsZXQgZm4gPSB0aGlzO1xuICAgICAgICAvLyB0aGUgb3RoZXIgbmVzdCB0aGF0IHRoaXMgaXMgdGFraW5nIGZyb20gc2hvdWxkIHByb3ZpZGUgYSB0ZW1wb3JhcnkgbG9jYXRpb24gb3IgbG9jYWwgX3BhdGggb2YgdGhlIGpvYlxuICAgICAgICBsZXQgbmV3X3BhdGggPSBgJHtmbi5wYXRofS8ke2pvYi5uYW1lfWA7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnJlbmFtZVN5bmMoam9iLnBhdGgsIG5ld19wYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBmbi5lLmxvZygzLCBgSm9iICR7am9iLm5hbWV9IGNvdWxkIG5vdCBiZSByZW5hbWVkIGluIHRha2UgbWV0aG9kLiAke2Vycn1gLCBmbiwgW2pvYl0pO1xuICAgICAgICB9XG4gICAgICAgIGpvYi5wYXRoID0gbmV3X3BhdGg7XG4gICAgICAgIC8vIGpvYi5uZXN0ID0gZm47XG5cbiAgICAgICAgY2FsbGJhY2soam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyBqb2JzIHRoYXQgaGF2ZSBwaWxlZCB1cCBpbiB0aGUgbmVzdCBpZiBpdCB3YXMgbm90IHdhdGNoZWQuXG4gICAgICogTm8gbG9uZ2VyIHVzZWQuXG4gICAgICogQHJldHVybnMge0FycmF5fSAgICAgQXJyYXkgb2Ygam9ic1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRVbndhdGNoZWRKb2JzKCkge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBsZXQgam9icyA9IFtdO1xuICAgICAgICBsZXQgZmlsZUFycmF5ID0gZnMucmVhZGRpclN5bmMoZmwucGF0aCk7XG5cbiAgICAgICAgbGV0IGl0ZW1zID0gZmlsZUFycmF5LmZpbHRlcihpdGVtID0+ICEoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChpdGVtKSk7XG5cbiAgICAgICAgaXRlbXMuZm9yRWFjaCgoZmlsZW5hbWUpID0+IHtcbiAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZsLnBhdGggKyBwYXRoX21vZC5zZXAgKyBmaWxlbmFtZTtcbiAgICAgICAgICAgIGxldCBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcbiAgICAgICAgICAgIGpvYnMucHVzaChqb2IpO1xuICAgICAgICAgICAgLy8gZmwuaG9sZEpvYihqb2IpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gam9icztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCBoZWxkIGpvYnMuXG4gICAgICogQHJldHVybnMgeyhGaWxlSm9ifEZvbGRlckpvYilbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SGVsZEpvYnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlbGRKb2JzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgam9iIHRvIGFycmF5IG9mIGhlbGQgam9icy5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhvbGRKb2Ioam9iOiAoRmlsZUpvYnxGb2xkZXJKb2IpKSB7XG4gICAgICAgIHRoaXMuaGVsZEpvYnMucHVzaChqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIGhlbGQgam9iIHdpdGggYSBqb2IgaWQuIFJlbW92ZXMgaXQgZnJvbSB0aGUgaGVsZCBqb2IgcXVldWUsXG4gICAgICogc28geW91IHNob3VsZCBtb3ZlIGl0IG91dCBvZiB0aGUgZm9sZGVyIGFmdGVyIHVzaW5nIHRoaXMuXG4gICAgICogQHBhcmFtIGpvYklkXG4gICAgICogQHJldHVybnMge0ZpbGVKb2J8Rm9sZGVySm9ifVxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogdmFyIHR1bm5lbCA9IGFmLmNyZWF0ZVR1bm5lbChcIkNoZWNrcG9pbnQgZXhhbXBsZVwiKTtcbiAgICAgKiB2YXIgd2ViaG9vayA9IGFmLmNyZWF0ZVdlYmhvb2tOZXN0KFtcInRlc3RcIiwgXCJleGFtcGxlXCJdLCBcImdldFwiKTtcbiAgICAgKiB2YXIgaG9sZGluZ19mb2xkZXIgPSBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChbXCJ0ZXN0XCIsIFwiY2hlY2twb2ludFwiXSk7XG4gICAgICpcbiAgICAgKiB2YXIgaW0gPSB3ZWJob29rLmdldEludGVyZmFjZU1hbmFnZXIoKTtcbiAgICAgKlxuICAgICAqIC8vIFdhdGNoIGZvciBqb2JzLCBob2xkLCBhbmQgcHJvdmlkZSB0byB0aGUgaW50ZXJmYWNlLlxuICAgICAqIGltLmNoZWNrTmVzdChob2xkaW5nX2ZvbGRlcik7XG4gICAgICogdHVubmVsLndhdGNoKHdlYmhvb2spO1xuICAgICAqXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbihqb2IsIG5lc3Qpe1xuICAgICAqICAgICAgLy8gR2V0IHRoZSBqb2JfaWQgZnJvbSB0aGUgd2ViaG9vayByZXF1ZXN0XG4gICAgICogICAgICB2YXIgam9iX2lkID0gam9iLmdldFBhcmFtZXRlcihcImpvYl9pZFwiKTtcbiAgICAgKiAgICAgIC8vIEdldCB0aGUgaGVsZCBqb2IgZnJvbSB0aGUgaG9sZGluZyBmb2xkZXJcbiAgICAgKiAgICAgIHZhciBjaGVja3BvaW50X2pvYiA9IGhvbGRpbmdfZm9sZGVyLmdldEhlbGRKb2Ioam9iX2lkKTtcbiAgICAgKiAgICAgIC8vIE1vdmUgc29tZXdoZXJlIGVsc2VcbiAgICAgKiAgICAgIGNoZWNrcG9pbnRfam9iLm1vdmUoYWYuY3JlYXRlQXV0b0ZvbGRlck5lc3QoW1widGVzdFwiLCBcIm91dGZvbGRlclwiXSkpO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRIZWxkSm9iKGpvYklkOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGYgPSB0aGlzO1xuICAgICAgICBsZXQgam9iID0gXy5maW5kKGYuZ2V0SGVsZEpvYnMoKSwgKGopID0+IGouZ2V0SWQoKSA9PT0gam9iSWQgKTtcbiAgICAgICAgbGV0IGpvYkluZGV4ID0gXy5maW5kSW5kZXgoZi5nZXRIZWxkSm9icygpLCAoaikgPT4gai5nZXRJZCgpID09PSBqb2JJZCApO1xuXG4gICAgICAgIGlmICgham9iKSB7XG4gICAgICAgICAgICBmLmUubG9nKDMsIGBKb2IgSUQgJHtqb2JJZH0gY291bGQgbm90IGJlIGZvdW5kIGluIHRoZSAke2YuZ2V0SGVsZEpvYnMoKS5sZW5ndGh9IHBlbmRpbmcgaGVsZCBqb2JzLmAsIGYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZi5oZWxkSm9icy5zcGxpY2Uoam9iSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2I7XG4gICAgfVxufSJdfQ==
