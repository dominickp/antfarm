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
 * A folder nest is a nest which contains a backing folder at a specific path. If the folder does not exist,
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
     * Check if the path for the backing folder is created. If not, optionally create it.
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
     * Checks whether a path starts with or contains a hidden file or a folder.
     * @param path {string}      The path of the file that needs to be validated.
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
        // the other nest that this is taking from should provide a temporary location or local path of the job
        var new_path = this.path + "/" + job.getBasename();
        fs.renameSync(job.getPath(), new_path);
        job.setPath(new_path);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Qy9ELElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEtBQUssRUFBbkIsQ0FBbUIsQ0FBRSxDQUFDO1FBRXpFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxZQUFVLEtBQUssbUNBQThCLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLHdCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVHLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFDTCxpQkFBQztBQUFELENBblBBLEFBbVBDLENBblArQixXQUFJLEdBbVBuQztBQW5QWSxrQkFBVSxhQW1QdEIsQ0FBQSIsImZpbGUiOiJsaWIvbmVzdC9mb2xkZXJOZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4vbmVzdFwiO1xuaW1wb3J0IHsgRmlsZUpvYiB9IGZyb20gXCIuLy4uL2pvYi9maWxlSm9iXCI7XG5pbXBvcnQgeyBGb2xkZXJKb2IgfSBmcm9tIFwiLi8uLi9qb2IvZm9sZGVySm9iXCI7XG5pbXBvcnQge0pvYn0gZnJvbSBcIi4uL2pvYi9qb2JcIjtcblxuY29uc3QgICBub2RlX3dhdGNoID0gcmVxdWlyZShcIm5vZGUtd2F0Y2hcIiksXG4gICAgICAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxuICAgICAgICBwYXRoX21vZCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxuICAgICAgICB0bXAgPSByZXF1aXJlKFwidG1wXCIpLFxuICAgICAgICBta2RpcnAgPSByZXF1aXJlKFwibWtkaXJwXCIpLFxuICAgICAgICBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuLyoqXG4gKiBBIGZvbGRlciBuZXN0IGlzIGEgbmVzdCB3aGljaCBjb250YWlucyBhIGJhY2tpbmcgZm9sZGVyIGF0IGEgc3BlY2lmaWMgcGF0aC4gSWYgdGhlIGZvbGRlciBkb2VzIG5vdCBleGlzdCxcbiAqIGFudGZhcm0gY2FuIG9wdGlvbmFsbHkgY3JlYXRlIGl0LlxuICovXG5leHBvcnQgY2xhc3MgRm9sZGVyTmVzdCBleHRlbmRzIE5lc3Qge1xuXG4gICAgcHJvdGVjdGVkIHBhdGg6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgYWxsb3dDcmVhdGU6IGJvb2xlYW47XG4gICAgcHJvdGVjdGVkIGhlbGRKb2JzOiAoRmlsZUpvYnxGb2xkZXJKb2IpW107XG5cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aD86IHN0cmluZywgYWxsb3dDcmVhdGU/OiBib29sZWFuKSB7XG4gICAgICAgIGxldCBuZXN0X25hbWUgPSBwYXRoX21vZC5iYXNlbmFtZShwYXRoKTtcbiAgICAgICAgc3VwZXIoZSwgbmVzdF9uYW1lKTtcblxuICAgICAgICB0aGlzLmFsbG93Q3JlYXRlID0gYWxsb3dDcmVhdGU7XG4gICAgICAgIHRoaXMuY2hlY2tEaXJlY3RvcnlTeW5jKHBhdGgpO1xuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLmhlbGRKb2JzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIHBhdGggZm9yIHRoZSBiYWNraW5nIGZvbGRlciBpcyBjcmVhdGVkLiBJZiBub3QsIG9wdGlvbmFsbHkgY3JlYXRlIGl0LlxuICAgICAqIEBwYXJhbSBkaXJlY3RvcnlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY2hlY2tEaXJlY3RvcnlTeW5jKGRpcmVjdG9yeSkge1xuICAgICAgICBsZXQgZm4gPSB0aGlzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMuc3RhdFN5bmMoZGlyZWN0b3J5KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGZuLmFsbG93Q3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgbWtkaXJwLnN5bmMoZGlyZWN0b3J5KTtcbiAgICAgICAgICAgICAgICBmbi5lLmxvZygxLCBgRGlyZWN0b3J5IFwiJHtkaXJlY3Rvcnl9XCIgd2FzIGNyZWF0ZWQgc2luY2UgaXQgZGlkIG5vdCBhbHJlYWR5IGV4aXN0LmAsIHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmbi5lLmxvZygzLCBgRGlyZWN0b3J5IFwiJHtkaXJlY3Rvcnl9XCIgZGlkIG5vdCBleGlzdCBhbmQgd2FzIG5vdCBjcmVhdGVkLmAsIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdGhhdCBjcmVhdGVzIGFuZCBhcnJpdmVzIG5ldyBqb2JzLiBDYW4gcHJvZHVjZSBmaWxlIG9yIGZvbGRlciBqb2JzLlxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICogQHBhcmFtIGFycml2ZVxuICAgICAqIEByZXR1cm5zIHtGb2xkZXJKb2J8RmlsZUpvYn1cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlSm9iKHBhdGg6IHN0cmluZywgYXJyaXZlID0gdHJ1ZSkge1xuXG4gICAgICAgIGxldCBmbCA9IHRoaXM7XG4gICAgICAgIGxldCBqb2I7XG4gICAgICAgIC8vIFZlcmlmeSBmaWxlIHN0aWxsIGV4aXN0cywgbm9kZS13YXRjaCBmaXJlcyBvbiBhbnkgY2hhbmdlLCBldmVuIGRlbGV0ZVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMuYWNjZXNzU3luYyhwYXRoLCBmcy5GX09LKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgam9iIGlzIGZvbGRlclxuICAgICAgICAgICAgbGV0IHBhdGhfc3RhdHMgPSBmcy5sc3RhdFN5bmMocGF0aCk7XG5cbiAgICAgICAgICAgIGlmIChwYXRoX3N0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICBqb2IgPSBuZXcgRm9sZGVySm9iKGZsLmUsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGpvYi5jcmVhdGVGaWxlcyhmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyaXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmlnZ2VyIGFycml2ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsLmFycml2ZShqb2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGhfc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgICBqb2IgPSBuZXcgRmlsZUpvYihmbC5lLCBwYXRoKTtcbiAgICAgICAgICAgICAgICBpZiAoYXJyaXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRyaWdnZXIgYXJyaXZlZFxuICAgICAgICAgICAgICAgICAgICBmbC5hcnJpdmUoam9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IFwiUGF0aCBpcyBub3QgYSBmaWxlIG9yIGZvbGRlciFcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gSXQgaXNuJ3QgYWNjZXNzaWJsZVxuICAgICAgICAgICAgZmwuZS5sb2coMCwgXCJKb2IgY3JlYXRpb24gaWdub3JlZCBiZWNhdXNlIGZpbGUgZGlkIG5vdCBleGlzdC5cIiwgZmwpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpvYjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3Mgd2hldGhlciBhIHBhdGggc3RhcnRzIHdpdGggb3IgY29udGFpbnMgYSBoaWRkZW4gZmlsZSBvciBhIGZvbGRlci5cbiAgICAgKiBAcGFyYW0gcGF0aCB7c3RyaW5nfSAgICAgIFRoZSBwYXRoIG9mIHRoZSBmaWxlIHRoYXQgbmVlZHMgdG8gYmUgdmFsaWRhdGVkLlxuICAgICAqIHJldHVybnMge2Jvb2xlYW59IC0gYHRydWVgIGlmIHRoZSBzb3VyY2UgaXMgYmxhY2tsaXN0ZWQgYW5kIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBpc1VuaXhIaWRkZW5QYXRoIChwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuICgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KHBhdGgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsIGxvYWQgb2YgdGhlIGNvbnRlbnRzIG9mIHRoZSBkaXJlY3RvcnkuXG4gICAgICogQHBhcmFtIGhvbGQge2Jvb2xlYW59ICAgIE9wdGlvbmFsIGZsYWcgdG8gaG9sZCBqb2JzIGZvdW5kLlxuICAgICAqL1xuICAgIHB1YmxpYyBsb2FkKGhvbGQ6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBmcy5yZWFkZGlyKGZsLnBhdGgsIChlcnIsIGl0ZW1zKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBpdGVtcyA9IGl0ZW1zLmZpbHRlcihpdGVtID0+ICEoLyhefFxcLylcXC5bXlxcL1xcLl0vZykudGVzdChpdGVtKSk7XG5cbiAgICAgICAgICAgICAgICBpdGVtcy5mb3JFYWNoKChmaWxlbmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZmlsZXBhdGggPSBmbC5wYXRoICsgcGF0aF9tb2Quc2VwICsgZmlsZW5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGxldCBqb2I7XG4gICAgICAgICAgICAgICAgICAgIGlmIChob2xkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmwuY3JlYXRlSm9iKGZpbGVwYXRoLCB0cnVlKTsgLy8gQXJyaXZlcyBhcyB3ZWxsXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsLmhvbGRKb2Ioam9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYXRjaGVzIHRoZSBmb2xkZXIuXG4gICAgICogQHBhcmFtIGhvbGQge2Jvb2xlYW59ICAgIE9wdGlvbmFsIGZsYWcgdG8gaG9sZCBqb2JzIGZvdW5kLlxuICAgICAqL1xuICAgIHB1YmxpYyB3YXRjaChob2xkOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgbGV0IGZsID0gdGhpcztcbiAgICAgICAgbGV0IHdhdGNoX29wdGlvbnMgPSB7XG4gICAgICAgICAgICByZWN1cnNpdmU6IGZhbHNlXG4gICAgICAgIH07XG5cbiAgICAgICAgbm9kZV93YXRjaChmbC5wYXRoLCB3YXRjaF9vcHRpb25zLCBmdW5jdGlvbiAoZmlsZXBhdGgpIHtcbiAgICAgICAgICAgIGlmICghZmwuaXNVbml4SGlkZGVuUGF0aChmaWxlcGF0aCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgam9iO1xuICAgICAgICAgICAgICAgIGlmIChob2xkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIHRydWUpOyAvLyBBcnJpdmVzIGFzIHdlbGxcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBqb2IgPSBmbC5jcmVhdGVKb2IoZmlsZXBhdGgsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZmwuaG9sZEpvYihqb2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmwuZS5sb2coMiwgYEhpZGRlbiBmaWxlIFwiJHtmaWxlcGF0aH1cIiBpZ25vcmVkLmAsIGZsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2hlcyBhbmQgaG9sZHMgam9icyBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgd2F0Y2hIb2xkKCk6IHZvaWQge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBmbC5sb2FkKHRydWUpO1xuICAgICAgICBmbC53YXRjaCh0cnVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcnJpdmUgZnVuY3Rpb24gdGhhdCBjYWxscyB0aGUgc3VwZXIuXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqL1xuICAgIHB1YmxpYyBhcnJpdmUoam9iOiBGaWxlSm9iKSB7XG4gICAgICAgIHN1cGVyLmFycml2ZShqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBpY2tzIHVwIGEgam9iIGZyb20gYW5vdGhlciBuZXN0LlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgICAgICBDYWxsYmFjayBpcyBnaXZlbiB0aGUgam9iIGluIGl0cyBwYXJhbWV0ZXIuXG4gICAgICovXG4gICAgcHVibGljIHRha2Uoam9iOiBGaWxlSm9iLCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIC8vIHRoZSBvdGhlciBuZXN0IHRoYXQgdGhpcyBpcyB0YWtpbmcgZnJvbSBzaG91bGQgcHJvdmlkZSBhIHRlbXBvcmFyeSBsb2NhdGlvbiBvciBsb2NhbCBwYXRoIG9mIHRoZSBqb2JcbiAgICAgICAgbGV0IG5ld19wYXRoID0gYCR7dGhpcy5wYXRofS8ke2pvYi5nZXRCYXNlbmFtZSgpfWA7XG5cbiAgICAgICAgZnMucmVuYW1lU3luYyhqb2IuZ2V0UGF0aCgpLCBuZXdfcGF0aCk7XG4gICAgICAgIGpvYi5zZXRQYXRoKG5ld19wYXRoKTtcblxuICAgICAgICBjYWxsYmFjayhqb2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWRzIGpvYnMgdGhhdCBoYXZlIHBpbGVkIHVwIGluIHRoZSBuZXN0IGlmIGl0IHdhcyBub3Qgd2F0Y2hlZC5cbiAgICAgKiBObyBsb25nZXIgdXNlZC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9ICAgICBBcnJheSBvZiBqb2JzXG4gICAgICovXG4gICAgcHVibGljIGdldFVud2F0Y2hlZEpvYnMoKSB7XG4gICAgICAgIGxldCBmbCA9IHRoaXM7XG4gICAgICAgIGxldCBqb2JzID0gW107XG4gICAgICAgIGxldCBmaWxlQXJyYXkgPSBmcy5yZWFkZGlyU3luYyhmbC5wYXRoKTtcblxuICAgICAgICBsZXQgaXRlbXMgPSBmaWxlQXJyYXkuZmlsdGVyKGl0ZW0gPT4gISgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KGl0ZW0pKTtcblxuICAgICAgICBpdGVtcy5mb3JFYWNoKChmaWxlbmFtZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbGVwYXRoID0gZmwucGF0aCArIHBhdGhfbW9kLnNlcCArIGZpbGVuYW1lO1xuICAgICAgICAgICAgbGV0IGpvYiA9IGZsLmNyZWF0ZUpvYihmaWxlcGF0aCwgZmFsc2UpO1xuICAgICAgICAgICAgam9icy5wdXNoKGpvYik7XG4gICAgICAgICAgICAvLyBmbC5ob2xkSm9iKGpvYik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBqb2JzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIGhlbGQgam9icy5cbiAgICAgKiBAcmV0dXJucyB7KEZpbGVKb2J8Rm9sZGVySm9iKVtdfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRIZWxkSm9icygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVsZEpvYnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBqb2IgdG8gYXJyYXkgb2YgaGVsZCBqb2JzLlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaG9sZEpvYihqb2I6IChGaWxlSm9ifEZvbGRlckpvYikpIHtcbiAgICAgICAgdGhpcy5oZWxkSm9icy5wdXNoKGpvYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGEgaGVsZCBqb2Igd2l0aCBhIGpvYiBpZC4gUmVtb3ZlcyBpdCBmcm9tIHRoZSBoZWxkIGpvYiBxdWV1ZSxcbiAgICAgKiBzbyB5b3Ugc2hvdWxkIG1vdmUgaXQgb3V0IG9mIHRoZSBmb2xkZXIgYWZ0ZXIgdXNpbmcgdGhpcy5cbiAgICAgKiBAcGFyYW0gam9iSWRcbiAgICAgKiBAcmV0dXJucyB7RmlsZUpvYnxGb2xkZXJKb2J9XG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiB2YXIgdHVubmVsID0gYWYuY3JlYXRlVHVubmVsKFwiQ2hlY2twb2ludCBleGFtcGxlXCIpO1xuICAgICAqIHZhciB3ZWJob29rID0gYWYuY3JlYXRlV2ViaG9va05lc3QoW1widGVzdFwiLCBcImV4YW1wbGVcIl0sIFwiZ2V0XCIpO1xuICAgICAqIHZhciBob2xkaW5nX2ZvbGRlciA9IGFmLmNyZWF0ZUF1dG9Gb2xkZXJOZXN0KFtcInRlc3RcIiwgXCJjaGVja3BvaW50XCJdKTtcbiAgICAgKlxuICAgICAqIHZhciBpbSA9IHdlYmhvb2suZ2V0SW50ZXJmYWNlTWFuYWdlcigpO1xuICAgICAqXG4gICAgICogLy8gV2F0Y2ggZm9yIGpvYnMsIGhvbGQsIGFuZCBwcm92aWRlIHRvIHRoZSBpbnRlcmZhY2UuXG4gICAgICogaW0uY2hlY2tOZXN0KGhvbGRpbmdfZm9sZGVyKTtcbiAgICAgKiB0dW5uZWwud2F0Y2god2ViaG9vayk7XG4gICAgICpcbiAgICAgKiB0dW5uZWwucnVuKGZ1bmN0aW9uKGpvYiwgbmVzdCl7XG4gICAgICogICAgICAvLyBHZXQgdGhlIGpvYl9pZCBmcm9tIHRoZSB3ZWJob29rIHJlcXVlc3RcbiAgICAgKiAgICAgIHZhciBqb2JfaWQgPSBqb2IuZ2V0UGFyYW1ldGVyKFwiam9iX2lkXCIpO1xuICAgICAqICAgICAgLy8gR2V0IHRoZSBoZWxkIGpvYiBmcm9tIHRoZSBob2xkaW5nIGZvbGRlclxuICAgICAqICAgICAgdmFyIGNoZWNrcG9pbnRfam9iID0gaG9sZGluZ19mb2xkZXIuZ2V0SGVsZEpvYihqb2JfaWQpO1xuICAgICAqICAgICAgLy8gTW92ZSBzb21ld2hlcmUgZWxzZVxuICAgICAqICAgICAgY2hlY2twb2ludF9qb2IubW92ZShhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChbXCJ0ZXN0XCIsIFwib3V0Zm9sZGVyXCJdKSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGdldEhlbGRKb2Ioam9iSWQ6IHN0cmluZykge1xuICAgICAgICBsZXQgZiA9IHRoaXM7XG4gICAgICAgIGxldCBqb2IgPSBfLmZpbmQoZi5nZXRIZWxkSm9icygpLCAoaikgPT4gai5nZXRJZCgpID09PSBqb2JJZCApO1xuICAgICAgICBsZXQgam9iSW5kZXggPSBfLmZpbmRJbmRleChmLmdldEhlbGRKb2JzKCksIChqKSA9PiBqLmdldElkKCkgPT09IGpvYklkICk7XG5cbiAgICAgICAgaWYgKCFqb2IpIHtcbiAgICAgICAgICAgIGYuZS5sb2coMywgYEpvYiBJRCAke2pvYklkfSBjb3VsZCBub3QgYmUgZm91bmQgaW4gdGhlICR7Zi5nZXRIZWxkSm9icygpLmxlbmd0aH0gcGVuZGluZyBoZWxkIGpvYnMuYCwgZik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmLmhlbGRKb2JzLnNwbGljZShqb2JJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGpvYjtcbiAgICB9XG59Il19
