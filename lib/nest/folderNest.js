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
        // the other nest that this is taking from should provide a temporary location or local _path of the job
        var new_path = this.path + "/" + job.basename;
        fs.renameSync(job.path, new_path);
        job.path = new_path;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEtBQUssRUFBbkIsQ0FBbUIsQ0FBRSxDQUFDO1FBRXpFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxZQUFVLEtBQUssbUNBQThCLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLHdCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVHLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFDTCxpQkFBQztBQUFELENBblBBLEFBbVBDLENBblArQixXQUFJLEdBbVBuQztBQW5QWSxrQkFBVSxhQW1QdEIsQ0FBQSIsImZpbGUiOiJsaWIvbmVzdC9mb2xkZXJOZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4vbmVzdFwiO1xuaW1wb3J0IHsgRmlsZUpvYiB9IGZyb20gXCIuLy4uL2pvYi9maWxlSm9iXCI7XG5pbXBvcnQgeyBGb2xkZXJKb2IgfSBmcm9tIFwiLi8uLi9qb2IvZm9sZGVySm9iXCI7XG5pbXBvcnQge0pvYn0gZnJvbSBcIi4uL2pvYi9qb2JcIjtcblxuY29uc3QgICBub2RlX3dhdGNoID0gcmVxdWlyZShcIm5vZGUtd2F0Y2hcIiksXG4gICAgICAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxuICAgICAgICBwYXRoX21vZCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxuICAgICAgICB0bXAgPSByZXF1aXJlKFwidG1wXCIpLFxuICAgICAgICBta2RpcnAgPSByZXF1aXJlKFwibWtkaXJwXCIpLFxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuLyoqXG4gKiBBIGZvbGRlciBuZXN0IGlzIGEgbmVzdCB3aGljaCBjb250YWlucyBhIGJhY2tpbmcgZm9sZGVyIGF0IGEgc3BlY2lmaWMgX3BhdGguIElmIHRoZSBmb2xkZXIgZG9lcyBub3QgZXhpc3QsXG4gKiBhbnRmYXJtIGNhbiBvcHRpb25hbGx5IGNyZWF0ZSBpdC5cbiAqL1xuZXhwb3J0IGNsYXNzIEZvbGRlck5lc3QgZXh0ZW5kcyBOZXN0IHtcblxuICAgIHByb3RlY3RlZCBwYXRoOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGFsbG93Q3JlYXRlOiBib29sZWFuO1xuICAgIHByb3RlY3RlZCBoZWxkSm9iczogKEZpbGVKb2J8Rm9sZGVySm9iKVtdO1xuXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHBhdGg/OiBzdHJpbmcsIGFsbG93Q3JlYXRlPzogYm9vbGVhbikge1xuICAgICAgICBsZXQgbmVzdF9uYW1lID0gcGF0aF9tb2QuYmFzZW5hbWUocGF0aCk7XG4gICAgICAgIHN1cGVyKGUsIG5lc3RfbmFtZSk7XG5cbiAgICAgICAgdGhpcy5hbGxvd0NyZWF0ZSA9IGFsbG93Q3JlYXRlO1xuICAgICAgICB0aGlzLmNoZWNrRGlyZWN0b3J5U3luYyhwYXRoKTtcbiAgICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgICAgdGhpcy5oZWxkSm9icyA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBfcGF0aCBmb3IgdGhlIGJhY2tpbmcgZm9sZGVyIGlzIGNyZWF0ZWQuIElmIG5vdCwgb3B0aW9uYWxseSBjcmVhdGUgaXQuXG4gICAgICogQHBhcmFtIGRpcmVjdG9yeVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjaGVja0RpcmVjdG9yeVN5bmMoZGlyZWN0b3J5KSB7XG4gICAgICAgIGxldCBmbiA9IHRoaXM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy5zdGF0U3luYyhkaXJlY3RvcnkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZm4uYWxsb3dDcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBta2RpcnAuc3luYyhkaXJlY3RvcnkpO1xuICAgICAgICAgICAgICAgIGZuLmUubG9nKDEsIGBEaXJlY3RvcnkgXCIke2RpcmVjdG9yeX1cIiB3YXMgY3JlYXRlZCBzaW5jZSBpdCBkaWQgbm90IGFscmVhZHkgZXhpc3QuYCwgdGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZuLmUubG9nKDMsIGBEaXJlY3RvcnkgXCIke2RpcmVjdG9yeX1cIiBkaWQgbm90IGV4aXN0IGFuZCB3YXMgbm90IGNyZWF0ZWQuYCwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYW5kIGFycml2ZXMgbmV3IGpvYnMuIENhbiBwcm9kdWNlIGZpbGUgb3IgZm9sZGVyIGpvYnMuXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKiBAcGFyYW0gYXJyaXZlXG4gICAgICogQHJldHVybnMge0ZvbGRlckpvYnxGaWxlSm9ifVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVKb2IocGF0aDogc3RyaW5nLCBhcnJpdmUgPSB0cnVlKSB7XG5cbiAgICAgICAgbGV0IGZsID0gdGhpcztcbiAgICAgICAgbGV0IGpvYjtcbiAgICAgICAgLy8gVmVyaWZ5IGZpbGUgc3RpbGwgZXhpc3RzLCBub2RlLXdhdGNoIGZpcmVzIG9uIGFueSBjaGFuZ2UsIGV2ZW4gZGVsZXRlXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy5hY2Nlc3NTeW5jKHBhdGgsIGZzLkZfT0spO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBqb2IgaXMgZm9sZGVyXG4gICAgICAgICAgICBsZXQgcGF0aF9zdGF0cyA9IGZzLmxzdGF0U3luYyhwYXRoKTtcblxuICAgICAgICAgICAgaWYgKHBhdGhfc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIGpvYiA9IG5ldyBGb2xkZXJKb2IoZmwuZSwgcGF0aCk7XG4gICAgICAgICAgICAgICAgam9iLmNyZWF0ZUZpbGVzKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcnJpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgYXJyaXZlZFxuICAgICAgICAgICAgICAgICAgICAgICAgZmwuYXJyaXZlKGpvYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0aF9zdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgICAgIGpvYiA9IG5ldyBGaWxlSm9iKGZsLmUsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChhcnJpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJpZ2dlciBhcnJpdmVkXG4gICAgICAgICAgICAgICAgICAgIGZsLmFycml2ZShqb2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgXCJQYXRoIGlzIG5vdCBhIGZpbGUgb3IgZm9sZGVyIVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBJdCBpc24ndCBhY2Nlc3NpYmxlXG4gICAgICAgICAgICBmbC5lLmxvZygwLCBcIkpvYiBjcmVhdGlvbiBpZ25vcmVkIGJlY2F1c2UgZmlsZSBkaWQgbm90IGV4aXN0LlwiLCBmbCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gam9iO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB3aGV0aGVyIGEgX3BhdGggc3RhcnRzIHdpdGggb3IgY29udGFpbnMgYSBoaWRkZW4gZmlsZSBvciBhIGZvbGRlci5cbiAgICAgKiBAcGFyYW0gcGF0aCB7c3RyaW5nfSAgICAgIFRoZSBfcGF0aCBvZiB0aGUgZmlsZSB0aGF0IG5lZWRzIHRvIGJlIHZhbGlkYXRlZC5cbiAgICAgKiByZXR1cm5zIHtib29sZWFufSAtIGB0cnVlYCBpZiB0aGUgc291cmNlIGlzIGJsYWNrbGlzdGVkIGFuZCBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaXNVbml4SGlkZGVuUGF0aCAocGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChwYXRoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbCBsb2FkIG9mIHRoZSBjb250ZW50cyBvZiB0aGUgZGlyZWN0b3J5LlxuICAgICAqIEBwYXJhbSBob2xkIHtib29sZWFufSAgICBPcHRpb25hbCBmbGFnIHRvIGhvbGQgam9icyBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgbG9hZChob2xkOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgbGV0IGZsID0gdGhpcztcbiAgICAgICAgZnMucmVhZGRpcihmbC5wYXRoLCAoZXJyLCBpdGVtcykgPT4ge1xuICAgICAgICAgICAgaWYgKGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgaXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiAhKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QoaXRlbSkpO1xuXG4gICAgICAgICAgICAgICAgaXRlbXMuZm9yRWFjaCgoZmlsZW5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGVwYXRoID0gZmwucGF0aCArIHBhdGhfbW9kLnNlcCArIGZpbGVuYW1lO1xuICAgICAgICAgICAgICAgICAgICBsZXQgam9iO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaG9sZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgdHJ1ZSk7IC8vIEFycml2ZXMgYXMgd2VsbFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbC5ob2xkSm9iKGpvYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2hlcyB0aGUgZm9sZGVyLlxuICAgICAqIEBwYXJhbSBob2xkIHtib29sZWFufSAgICBPcHRpb25hbCBmbGFnIHRvIGhvbGQgam9icyBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgd2F0Y2goaG9sZDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgICAgIGxldCBmbCA9IHRoaXM7XG4gICAgICAgIGxldCB3YXRjaF9vcHRpb25zID0ge1xuICAgICAgICAgICAgcmVjdXJzaXZlOiBmYWxzZVxuICAgICAgICB9O1xuXG4gICAgICAgIG5vZGVfd2F0Y2goZmwucGF0aCwgd2F0Y2hfb3B0aW9ucywgZnVuY3Rpb24gKGZpbGVwYXRoKSB7XG4gICAgICAgICAgICBpZiAoIWZsLmlzVW5peEhpZGRlblBhdGgoZmlsZXBhdGgpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGpvYjtcbiAgICAgICAgICAgICAgICBpZiAoaG9sZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCB0cnVlKTsgLy8gQXJyaXZlcyBhcyB3ZWxsXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGZsLmhvbGRKb2Ioam9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZsLmUubG9nKDIsIGBIaWRkZW4gZmlsZSBcIiR7ZmlsZXBhdGh9XCIgaWdub3JlZC5gLCBmbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoZXMgYW5kIGhvbGRzIGpvYnMgZm91bmQuXG4gICAgICovXG4gICAgcHVibGljIHdhdGNoSG9sZCgpOiB2b2lkIHtcbiAgICAgICAgbGV0IGZsID0gdGhpcztcbiAgICAgICAgZmwubG9hZCh0cnVlKTtcbiAgICAgICAgZmwud2F0Y2godHJ1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXJyaXZlIGZ1bmN0aW9uIHRoYXQgY2FsbHMgdGhlIHN1cGVyLlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKi9cbiAgICBwdWJsaWMgYXJyaXZlKGpvYjogRmlsZUpvYikge1xuICAgICAgICBzdXBlci5hcnJpdmUoam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQaWNrcyB1cCBhIGpvYiBmcm9tIGFub3RoZXIgbmVzdC5cbiAgICAgKiBAcGFyYW0gam9iXG4gICAgICogQHBhcmFtIGNhbGxiYWNrICAgICAgQ2FsbGJhY2sgaXMgZ2l2ZW4gdGhlIGpvYiBpbiBpdHMgcGFyYW1ldGVyLlxuICAgICAqL1xuICAgIHB1YmxpYyB0YWtlKGpvYjogRmlsZUpvYiwgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICAvLyB0aGUgb3RoZXIgbmVzdCB0aGF0IHRoaXMgaXMgdGFraW5nIGZyb20gc2hvdWxkIHByb3ZpZGUgYSB0ZW1wb3JhcnkgbG9jYXRpb24gb3IgbG9jYWwgX3BhdGggb2YgdGhlIGpvYlxuICAgICAgICBsZXQgbmV3X3BhdGggPSBgJHt0aGlzLnBhdGh9LyR7am9iLmJhc2VuYW1lfWA7XG5cbiAgICAgICAgZnMucmVuYW1lU3luYyhqb2IucGF0aCwgbmV3X3BhdGgpO1xuICAgICAgICBqb2IucGF0aCA9IG5ld19wYXRoO1xuXG4gICAgICAgIGNhbGxiYWNrKGpvYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZHMgam9icyB0aGF0IGhhdmUgcGlsZWQgdXAgaW4gdGhlIG5lc3QgaWYgaXQgd2FzIG5vdCB3YXRjaGVkLlxuICAgICAqIE5vIGxvbmdlciB1c2VkLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gICAgIEFycmF5IG9mIGpvYnNcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VW53YXRjaGVkSm9icygpIHtcbiAgICAgICAgbGV0IGZsID0gdGhpcztcbiAgICAgICAgbGV0IGpvYnMgPSBbXTtcbiAgICAgICAgbGV0IGZpbGVBcnJheSA9IGZzLnJlYWRkaXJTeW5jKGZsLnBhdGgpO1xuXG4gICAgICAgIGxldCBpdGVtcyA9IGZpbGVBcnJheS5maWx0ZXIoaXRlbSA9PiAhKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QoaXRlbSkpO1xuXG4gICAgICAgIGl0ZW1zLmZvckVhY2goKGZpbGVuYW1lKSA9PiB7XG4gICAgICAgICAgICBsZXQgZmlsZXBhdGggPSBmbC5wYXRoICsgcGF0aF9tb2Quc2VwICsgZmlsZW5hbWU7XG4gICAgICAgICAgICBsZXQgam9iID0gZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCBmYWxzZSk7XG4gICAgICAgICAgICBqb2JzLnB1c2goam9iKTtcbiAgICAgICAgICAgIC8vIGZsLmhvbGRKb2Ioam9iKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGpvYnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbGwgaGVsZCBqb2JzLlxuICAgICAqIEByZXR1cm5zIHsoRmlsZUpvYnxGb2xkZXJKb2IpW119XG4gICAgICovXG4gICAgcHVibGljIGdldEhlbGRKb2JzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZWxkSm9icztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGpvYiB0byBhcnJheSBvZiBoZWxkIGpvYnMuXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBob2xkSm9iKGpvYjogKEZpbGVKb2J8Rm9sZGVySm9iKSkge1xuICAgICAgICB0aGlzLmhlbGRKb2JzLnB1c2goam9iKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBoZWxkIGpvYiB3aXRoIGEgam9iIGlkLiBSZW1vdmVzIGl0IGZyb20gdGhlIGhlbGQgam9iIHF1ZXVlLFxuICAgICAqIHNvIHlvdSBzaG91bGQgbW92ZSBpdCBvdXQgb2YgdGhlIGZvbGRlciBhZnRlciB1c2luZyB0aGlzLlxuICAgICAqIEBwYXJhbSBqb2JJZFxuICAgICAqIEByZXR1cm5zIHtGaWxlSm9ifEZvbGRlckpvYn1cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIHZhciB0dW5uZWwgPSBhZi5jcmVhdGVUdW5uZWwoXCJDaGVja3BvaW50IGV4YW1wbGVcIik7XG4gICAgICogdmFyIHdlYmhvb2sgPSBhZi5jcmVhdGVXZWJob29rTmVzdChbXCJ0ZXN0XCIsIFwiZXhhbXBsZVwiXSwgXCJnZXRcIik7XG4gICAgICogdmFyIGhvbGRpbmdfZm9sZGVyID0gYWYuY3JlYXRlQXV0b0ZvbGRlck5lc3QoW1widGVzdFwiLCBcImNoZWNrcG9pbnRcIl0pO1xuICAgICAqXG4gICAgICogdmFyIGltID0gd2ViaG9vay5nZXRJbnRlcmZhY2VNYW5hZ2VyKCk7XG4gICAgICpcbiAgICAgKiAvLyBXYXRjaCBmb3Igam9icywgaG9sZCwgYW5kIHByb3ZpZGUgdG8gdGhlIGludGVyZmFjZS5cbiAgICAgKiBpbS5jaGVja05lc3QoaG9sZGluZ19mb2xkZXIpO1xuICAgICAqIHR1bm5lbC53YXRjaCh3ZWJob29rKTtcbiAgICAgKlxuICAgICAqIHR1bm5lbC5ydW4oZnVuY3Rpb24oam9iLCBuZXN0KXtcbiAgICAgKiAgICAgIC8vIEdldCB0aGUgam9iX2lkIGZyb20gdGhlIHdlYmhvb2sgcmVxdWVzdFxuICAgICAqICAgICAgdmFyIGpvYl9pZCA9IGpvYi5nZXRQYXJhbWV0ZXIoXCJqb2JfaWRcIik7XG4gICAgICogICAgICAvLyBHZXQgdGhlIGhlbGQgam9iIGZyb20gdGhlIGhvbGRpbmcgZm9sZGVyXG4gICAgICogICAgICB2YXIgY2hlY2twb2ludF9qb2IgPSBob2xkaW5nX2ZvbGRlci5nZXRIZWxkSm9iKGpvYl9pZCk7XG4gICAgICogICAgICAvLyBNb3ZlIHNvbWV3aGVyZSBlbHNlXG4gICAgICogICAgICBjaGVja3BvaW50X2pvYi5tb3ZlKGFmLmNyZWF0ZUF1dG9Gb2xkZXJOZXN0KFtcInRlc3RcIiwgXCJvdXRmb2xkZXJcIl0pKTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SGVsZEpvYihqb2JJZDogc3RyaW5nKSB7XG4gICAgICAgIGxldCBmID0gdGhpcztcbiAgICAgICAgbGV0IGpvYiA9IF8uZmluZChmLmdldEhlbGRKb2JzKCksIChqKSA9PiBqLmdldElkKCkgPT09IGpvYklkICk7XG4gICAgICAgIGxldCBqb2JJbmRleCA9IF8uZmluZEluZGV4KGYuZ2V0SGVsZEpvYnMoKSwgKGopID0+IGouZ2V0SWQoKSA9PT0gam9iSWQgKTtcblxuICAgICAgICBpZiAoIWpvYikge1xuICAgICAgICAgICAgZi5lLmxvZygzLCBgSm9iIElEICR7am9iSWR9IGNvdWxkIG5vdCBiZSBmb3VuZCBpbiB0aGUgJHtmLmdldEhlbGRKb2JzKCkubGVuZ3RofSBwZW5kaW5nIGhlbGQgam9icy5gLCBmKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGYuaGVsZEpvYnMuc3BsaWNlKGpvYkluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gam9iO1xuICAgIH1cbn0iXX0=
