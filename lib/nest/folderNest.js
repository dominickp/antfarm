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
     * Initial load of the contents of the directory.
     * @param hold {boolean}    Optional flag to hold jobs found.
     */
    FolderNest.prototype.load = function (hold) {
        if (hold === void 0) { hold = false; }
        var fl = this;
        fs.readdir(fl.path, function (err, items) {
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
            var job;
            if (hold === false) {
                job = fl.createJob(filepath, true); // Arrives as well
            }
            else {
                job = fl.createJob(filepath, false);
                fl.holdJob(job);
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
    // Need to fix the fact that new jobs are created every time. That means the ID is different and it isn't predictable.
    FolderNest.prototype.getJob = function (jobId) {
        var f = this;
        var job = _.find(f.getHeldJobs(), function (j) { return j.getId() === jobId; });
        if (!job) {
            f.e.log(3, "Job ID " + jobId + " could not be found in the " + f.getHeldJobs().length + " pending held jobs.", f);
        }
        return job;
    };
    return FolderNest;
}(nest_1.Nest));
exports.FolderNest = FolderNest;
