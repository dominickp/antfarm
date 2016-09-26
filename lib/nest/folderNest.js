"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nest_1 = require("./nest");
var fileJob_1 = require("./../job/fileJob");
var folderJob_1 = require("./../job/folderJob");
var node_watch = require("node-watch"), fs = require("fs"), path_mod = require("path");
var FolderNest = (function (_super) {
    __extends(FolderNest, _super);
    function FolderNest(e, path) {
        var nest_name = path_mod.basename(path);
        _super.call(this, e, nest_name);
        this.checkDirectorySync(path);
        this.path = path;
    }
    FolderNest.prototype.checkDirectorySync = function (directory) {
        var fn = this;
        try {
            fs.statSync(directory);
        }
        catch (e) {
            fs.mkdirSync(directory);
            fn.e.log(1, "Directory \"" + directory + "\" was created since it did not already exist.", this);
        }
    };
    FolderNest.prototype.createJob = function (path) {
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
                    // Trigger arrived
                    fl.arrive(job);
                });
            }
            else if (path_stats.isFile()) {
                job = new fileJob_1.FileJob(fl.e, path);
                // Trigger arrived
                fl.arrive(job);
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
    FolderNest.prototype.load = function () {
        var fl = this;
        fs.readdir(fl.path, function (err, items) {
            items = items.filter(function (item) { return !(/(^|\/)\.[^\/\.]/g).test(item); });
            items.forEach(function (filename) {
                var filepath = fl.path + path_mod.sep + filename;
                var job = fl.createJob(filepath);
                if (job) {
                    fl.arrive(job);
                }
            });
        });
    };
    FolderNest.prototype.watch = function () {
        var fl = this;
        var watch_options = {
            recursive: false
        };
        node_watch(fl.path, watch_options, function (filepath) {
            // Verify file still exists, node-watch fires on any change, even delete
            var job = fl.createJob(filepath);
            if (job) {
                fl.arrive(job);
            }
        });
    };
    FolderNest.prototype.arrive = function (job) {
        _super.prototype.arrive.call(this, job);
    };
    FolderNest.prototype.take = function (job, callback) {
        // the other nest that this is taking from should provide a temporary location or local path of the job
        var new_path = this.path + "/" + job.getBasename();
        fs.renameSync(job.getPath(), new_path);
        job.setPath(new_path);
        callback(new_path);
    };
    return FolderNest;
}(nest_1.Nest));
exports.FolderNest = FolderNest;
