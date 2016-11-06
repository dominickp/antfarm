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
            fn.e.log(3, "Job " + job.name + " could not be renamed in take method.", fn);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFqQixVQUFrQixHQUF3QjtRQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BMEJHO0lBQ0ksK0JBQVUsR0FBakIsVUFBa0IsS0FBYTtRQUMzQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDYixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxLQUFLLEVBQW5CLENBQW1CLENBQUUsQ0FBQztRQUMvRCxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxLQUFLLEVBQW5CLENBQW1CLENBQUUsQ0FBQztRQUV6RSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsWUFBVSxLQUFLLG1DQUE4QixDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSx3QkFBcUIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1RyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUNELE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZixDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQTNQQSxBQTJQQyxDQTNQK0IsV0FBSSxHQTJQbkM7QUEzUFksa0JBQVUsYUEyUHRCLENBQUEiLCJmaWxlIjoibGliL25lc3QvZm9sZGVyTmVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHsgTmVzdCB9IGZyb20gXCIuL25lc3RcIjtcbmltcG9ydCB7IEZpbGVKb2IgfSBmcm9tIFwiLi8uLi9qb2IvZmlsZUpvYlwiO1xuaW1wb3J0IHsgRm9sZGVySm9iIH0gZnJvbSBcIi4vLi4vam9iL2ZvbGRlckpvYlwiO1xuaW1wb3J0IHtKb2J9IGZyb20gXCIuLi9qb2Ivam9iXCI7XG5cbmNvbnN0ICAgbm9kZV93YXRjaCA9IHJlcXVpcmUoXCJub2RlLXdhdGNoXCIpLFxuICAgICAgICBmcyA9IHJlcXVpcmUoXCJmc1wiKSxcbiAgICAgICAgcGF0aF9tb2QgPSByZXF1aXJlKFwicGF0aFwiKSxcbiAgICAgICAgdG1wID0gcmVxdWlyZShcInRtcFwiKSxcbiAgICAgICAgbWtkaXJwID0gcmVxdWlyZShcIm1rZGlycFwiKSxcbiAgICAgICAgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbi8qKlxuICogQSBmb2xkZXIgbmVzdCBpcyBhIG5lc3Qgd2hpY2ggY29udGFpbnMgYSBiYWNraW5nIGZvbGRlciBhdCBhIHNwZWNpZmljIF9wYXRoLiBJZiB0aGUgZm9sZGVyIGRvZXMgbm90IGV4aXN0LFxuICogYW50ZmFybSBjYW4gb3B0aW9uYWxseSBjcmVhdGUgaXQuXG4gKi9cbmV4cG9ydCBjbGFzcyBGb2xkZXJOZXN0IGV4dGVuZHMgTmVzdCB7XG5cbiAgICBwcm90ZWN0ZWQgcGF0aDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBhbGxvd0NyZWF0ZTogYm9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgaGVsZEpvYnM6IChGaWxlSm9ifEZvbGRlckpvYilbXTtcblxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBwYXRoPzogc3RyaW5nLCBhbGxvd0NyZWF0ZT86IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IG5lc3RfbmFtZSA9IHBhdGhfbW9kLmJhc2VuYW1lKHBhdGgpO1xuICAgICAgICBzdXBlcihlLCBuZXN0X25hbWUpO1xuXG4gICAgICAgIHRoaXMuYWxsb3dDcmVhdGUgPSBhbGxvd0NyZWF0ZTtcbiAgICAgICAgdGhpcy5jaGVja0RpcmVjdG9yeVN5bmMocGF0aCk7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgICAgIHRoaXMuaGVsZEpvYnMgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgX3BhdGggZm9yIHRoZSBiYWNraW5nIGZvbGRlciBpcyBjcmVhdGVkLiBJZiBub3QsIG9wdGlvbmFsbHkgY3JlYXRlIGl0LlxuICAgICAqIEBwYXJhbSBkaXJlY3RvcnlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY2hlY2tEaXJlY3RvcnlTeW5jKGRpcmVjdG9yeSkge1xuICAgICAgICBsZXQgZm4gPSB0aGlzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMuc3RhdFN5bmMoZGlyZWN0b3J5KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGZuLmFsbG93Q3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgbWtkaXJwLnN5bmMoZGlyZWN0b3J5KTtcbiAgICAgICAgICAgICAgICBmbi5lLmxvZygxLCBgRGlyZWN0b3J5IFwiJHtkaXJlY3Rvcnl9XCIgd2FzIGNyZWF0ZWQgc2luY2UgaXQgZGlkIG5vdCBhbHJlYWR5IGV4aXN0LmAsIHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmbi5lLmxvZygzLCBgRGlyZWN0b3J5IFwiJHtkaXJlY3Rvcnl9XCIgZGlkIG5vdCBleGlzdCBhbmQgd2FzIG5vdCBjcmVhdGVkLmAsIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdGhhdCBjcmVhdGVzIGFuZCBhcnJpdmVzIG5ldyBqb2JzLiBDYW4gcHJvZHVjZSBmaWxlIG9yIGZvbGRlciBqb2JzLlxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICogQHBhcmFtIGFycml2ZVxuICAgICAqIEByZXR1cm5zIHtGb2xkZXJKb2J8RmlsZUpvYn1cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlSm9iKHBhdGg6IHN0cmluZywgYXJyaXZlID0gdHJ1ZSkge1xuXG4gICAgICAgIGxldCBmbCA9IHRoaXM7XG4gICAgICAgIGxldCBqb2I7XG4gICAgICAgIC8vIFZlcmlmeSBmaWxlIHN0aWxsIGV4aXN0cywgbm9kZS13YXRjaCBmaXJlcyBvbiBhbnkgY2hhbmdlLCBldmVuIGRlbGV0ZVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMuYWNjZXNzU3luYyhwYXRoLCBmcy5GX09LKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgam9iIGlzIGZvbGRlclxuICAgICAgICAgICAgbGV0IHBhdGhfc3RhdHMgPSBmcy5sc3RhdFN5bmMocGF0aCk7XG5cbiAgICAgICAgICAgIGlmIChwYXRoX3N0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICBqb2IgPSBuZXcgRm9sZGVySm9iKGZsLmUsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGpvYi5jcmVhdGVGaWxlcygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcnJpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgYXJyaXZlZFxuICAgICAgICAgICAgICAgICAgICAgICAgZmwuYXJyaXZlKGpvYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0aF9zdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgICAgIGpvYiA9IG5ldyBGaWxlSm9iKGZsLmUsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChhcnJpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJpZ2dlciBhcnJpdmVkXG4gICAgICAgICAgICAgICAgICAgIGZsLmFycml2ZShqb2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgXCJQYXRoIGlzIG5vdCBhIGZpbGUgb3IgZm9sZGVyIVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBJdCBpc24ndCBhY2Nlc3NpYmxlXG4gICAgICAgICAgICBmbC5lLmxvZygwLCBcIkpvYiBjcmVhdGlvbiBpZ25vcmVkIGJlY2F1c2UgZmlsZSBkaWQgbm90IGV4aXN0LlwiLCBmbCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gam9iO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB3aGV0aGVyIGEgX3BhdGggc3RhcnRzIHdpdGggb3IgY29udGFpbnMgYSBoaWRkZW4gZmlsZSBvciBhIGZvbGRlci5cbiAgICAgKiBAcGFyYW0gcGF0aCB7c3RyaW5nfSAgICAgIFRoZSBfcGF0aCBvZiB0aGUgZmlsZSB0aGF0IG5lZWRzIHRvIGJlIHZhbGlkYXRlZC5cbiAgICAgKiByZXR1cm5zIHtib29sZWFufSAtIGB0cnVlYCBpZiB0aGUgc291cmNlIGlzIGJsYWNrbGlzdGVkIGFuZCBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaXNVbml4SGlkZGVuUGF0aCAocGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChwYXRoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbCBsb2FkIG9mIHRoZSBjb250ZW50cyBvZiB0aGUgZGlyZWN0b3J5LlxuICAgICAqIEBwYXJhbSBob2xkIHtib29sZWFufSAgICBPcHRpb25hbCBmbGFnIHRvIGhvbGQgam9icyBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgbG9hZChob2xkOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgbGV0IGZsID0gdGhpcztcbiAgICAgICAgZnMucmVhZGRpcihmbC5wYXRoLCAoZXJyLCBpdGVtcykgPT4ge1xuICAgICAgICAgICAgaWYgKGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgaXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiAhKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QoaXRlbSkpO1xuXG4gICAgICAgICAgICAgICAgaXRlbXMuZm9yRWFjaCgoZmlsZW5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGVwYXRoID0gZmwucGF0aCArIHBhdGhfbW9kLnNlcCArIGZpbGVuYW1lO1xuICAgICAgICAgICAgICAgICAgICBsZXQgam9iO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaG9sZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgdHJ1ZSk7IC8vIEFycml2ZXMgYXMgd2VsbFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbC5ob2xkSm9iKGpvYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2hlcyB0aGUgZm9sZGVyLlxuICAgICAqIEBwYXJhbSBob2xkIHtib29sZWFufSAgICBPcHRpb25hbCBmbGFnIHRvIGhvbGQgam9icyBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgd2F0Y2goaG9sZDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgICAgIGxldCBmbCA9IHRoaXM7XG4gICAgICAgIGxldCB3YXRjaF9vcHRpb25zID0ge1xuICAgICAgICAgICAgcmVjdXJzaXZlOiBmYWxzZVxuICAgICAgICB9O1xuXG4gICAgICAgIGZsLmUubG9nKDAsIGBXYXRjaGluZyAke2ZsLnBhdGh9YCwgZmwsIFtmbC50dW5uZWxdKTtcblxuICAgICAgICBub2RlX3dhdGNoKGZsLnBhdGgsIHdhdGNoX29wdGlvbnMsIGZpbGVwYXRoID0+IHtcbiAgICAgICAgICAgIGlmICghZmwuaXNVbml4SGlkZGVuUGF0aChmaWxlcGF0aCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgam9iO1xuICAgICAgICAgICAgICAgIGlmIChob2xkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIHRydWUpOyAvLyBBcnJpdmVzIGFzIHdlbGxcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZmwuaG9sZEpvYihqb2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmwuZS5sb2coMiwgYEhpZGRlbiBmaWxlIFwiJHtmaWxlcGF0aH1cIiBpZ25vcmVkLmAsIGZsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2hlcyBhbmQgaG9sZHMgam9icyBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgd2F0Y2hIb2xkKCk6IHZvaWQge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBmbC5sb2FkKHRydWUpO1xuICAgICAgICBmbC53YXRjaCh0cnVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcnJpdmUgZnVuY3Rpb24gdGhhdCBjYWxscyB0aGUgc3VwZXIuXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqL1xuICAgIHB1YmxpYyBhcnJpdmUoam9iOiBGaWxlSm9iKSB7XG4gICAgICAgIHN1cGVyLmFycml2ZShqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBpY2tzIHVwIGEgam9iIGZyb20gYW5vdGhlciBuZXN0LlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgICAgICBDYWxsYmFjayBpcyBnaXZlbiB0aGUgam9iIGluIGl0cyBwYXJhbWV0ZXIuXG4gICAgICovXG4gICAgcHVibGljIHRha2Uoam9iOiAoRmlsZUpvYnxGb2xkZXJKb2IpLCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIGxldCBmbiA9IHRoaXM7XG4gICAgICAgIC8vIHRoZSBvdGhlciBuZXN0IHRoYXQgdGhpcyBpcyB0YWtpbmcgZnJvbSBzaG91bGQgcHJvdmlkZSBhIHRlbXBvcmFyeSBsb2NhdGlvbiBvciBsb2NhbCBfcGF0aCBvZiB0aGUgam9iXG4gICAgICAgIGxldCBuZXdfcGF0aCA9IGAke2ZuLnBhdGh9LyR7am9iLm5hbWV9YDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMucmVuYW1lU3luYyhqb2IucGF0aCwgbmV3X3BhdGgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGZuLmUubG9nKDMsIGBKb2IgJHtqb2IubmFtZX0gY291bGQgbm90IGJlIHJlbmFtZWQgaW4gdGFrZSBtZXRob2QuYCwgZm4pO1xuICAgICAgICB9XG4gICAgICAgIGpvYi5wYXRoID0gbmV3X3BhdGg7XG4gICAgICAgIC8vIGpvYi5uZXN0ID0gZm47XG5cbiAgICAgICAgY2FsbGJhY2soam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyBqb2JzIHRoYXQgaGF2ZSBwaWxlZCB1cCBpbiB0aGUgbmVzdCBpZiBpdCB3YXMgbm90IHdhdGNoZWQuXG4gICAgICogTm8gbG9uZ2VyIHVzZWQuXG4gICAgICogQHJldHVybnMge0FycmF5fSAgICAgQXJyYXkgb2Ygam9ic1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRVbndhdGNoZWRKb2JzKCkge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBsZXQgam9icyA9IFtdO1xuICAgICAgICBsZXQgZmlsZUFycmF5ID0gZnMucmVhZGRpclN5bmMoZmwucGF0aCk7XG5cbiAgICAgICAgbGV0IGl0ZW1zID0gZmlsZUFycmF5LmZpbHRlcihpdGVtID0+ICEoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChpdGVtKSk7XG5cbiAgICAgICAgaXRlbXMuZm9yRWFjaCgoZmlsZW5hbWUpID0+IHtcbiAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZsLnBhdGggKyBwYXRoX21vZC5zZXAgKyBmaWxlbmFtZTtcbiAgICAgICAgICAgIGxldCBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcbiAgICAgICAgICAgIGpvYnMucHVzaChqb2IpO1xuICAgICAgICAgICAgLy8gZmwuaG9sZEpvYihqb2IpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gam9icztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCBoZWxkIGpvYnMuXG4gICAgICogQHJldHVybnMgeyhGaWxlSm9ifEZvbGRlckpvYilbXX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SGVsZEpvYnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlbGRKb2JzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgam9iIHRvIGFycmF5IG9mIGhlbGQgam9icy5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhvbGRKb2Ioam9iOiAoRmlsZUpvYnxGb2xkZXJKb2IpKSB7XG4gICAgICAgIHRoaXMuaGVsZEpvYnMucHVzaChqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIGhlbGQgam9iIHdpdGggYSBqb2IgaWQuIFJlbW92ZXMgaXQgZnJvbSB0aGUgaGVsZCBqb2IgcXVldWUsXG4gICAgICogc28geW91IHNob3VsZCBtb3ZlIGl0IG91dCBvZiB0aGUgZm9sZGVyIGFmdGVyIHVzaW5nIHRoaXMuXG4gICAgICogQHBhcmFtIGpvYklkXG4gICAgICogQHJldHVybnMge0ZpbGVKb2J8Rm9sZGVySm9ifVxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogdmFyIHR1bm5lbCA9IGFmLmNyZWF0ZVR1bm5lbChcIkNoZWNrcG9pbnQgZXhhbXBsZVwiKTtcbiAgICAgKiB2YXIgd2ViaG9vayA9IGFmLmNyZWF0ZVdlYmhvb2tOZXN0KFtcInRlc3RcIiwgXCJleGFtcGxlXCJdLCBcImdldFwiKTtcbiAgICAgKiB2YXIgaG9sZGluZ19mb2xkZXIgPSBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChbXCJ0ZXN0XCIsIFwiY2hlY2twb2ludFwiXSk7XG4gICAgICpcbiAgICAgKiB2YXIgaW0gPSB3ZWJob29rLmdldEludGVyZmFjZU1hbmFnZXIoKTtcbiAgICAgKlxuICAgICAqIC8vIFdhdGNoIGZvciBqb2JzLCBob2xkLCBhbmQgcHJvdmlkZSB0byB0aGUgaW50ZXJmYWNlLlxuICAgICAqIGltLmNoZWNrTmVzdChob2xkaW5nX2ZvbGRlcik7XG4gICAgICogdHVubmVsLndhdGNoKHdlYmhvb2spO1xuICAgICAqXG4gICAgICogdHVubmVsLnJ1bihmdW5jdGlvbihqb2IsIG5lc3Qpe1xuICAgICAqICAgICAgLy8gR2V0IHRoZSBqb2JfaWQgZnJvbSB0aGUgd2ViaG9vayByZXF1ZXN0XG4gICAgICogICAgICB2YXIgam9iX2lkID0gam9iLmdldFBhcmFtZXRlcihcImpvYl9pZFwiKTtcbiAgICAgKiAgICAgIC8vIEdldCB0aGUgaGVsZCBqb2IgZnJvbSB0aGUgaG9sZGluZyBmb2xkZXJcbiAgICAgKiAgICAgIHZhciBjaGVja3BvaW50X2pvYiA9IGhvbGRpbmdfZm9sZGVyLmdldEhlbGRKb2Ioam9iX2lkKTtcbiAgICAgKiAgICAgIC8vIE1vdmUgc29tZXdoZXJlIGVsc2VcbiAgICAgKiAgICAgIGNoZWNrcG9pbnRfam9iLm1vdmUoYWYuY3JlYXRlQXV0b0ZvbGRlck5lc3QoW1widGVzdFwiLCBcIm91dGZvbGRlclwiXSkpO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRIZWxkSm9iKGpvYklkOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGYgPSB0aGlzO1xuICAgICAgICBsZXQgam9iID0gXy5maW5kKGYuZ2V0SGVsZEpvYnMoKSwgKGopID0+IGouZ2V0SWQoKSA9PT0gam9iSWQgKTtcbiAgICAgICAgbGV0IGpvYkluZGV4ID0gXy5maW5kSW5kZXgoZi5nZXRIZWxkSm9icygpLCAoaikgPT4gai5nZXRJZCgpID09PSBqb2JJZCApO1xuXG4gICAgICAgIGlmICgham9iKSB7XG4gICAgICAgICAgICBmLmUubG9nKDMsIGBKb2IgSUQgJHtqb2JJZH0gY291bGQgbm90IGJlIGZvdW5kIGluIHRoZSAke2YuZ2V0SGVsZEpvYnMoKS5sZW5ndGh9IHBlbmRpbmcgaGVsZCBqb2JzLmAsIGYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZi5oZWxkSm9icy5zcGxpY2Uoam9iSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2I7XG4gICAgfVxufSJdfQ==
