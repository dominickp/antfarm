"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nest_1 = require("./nest");
var fileJob_1 = require("./../job/fileJob");
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
    FolderNest.prototype.load = function () {
        var fl = this;
        fs.readdir(fl.path, function (err, items) {
            items = items.filter(function (item) { return !(/(^|\/)\.[^\/\.]/g).test(item); });
            items.forEach(function (filename) {
                // Make a new Job and trigger arrived
                var job = new fileJob_1.FileJob(fl.e, fl.path + "/" + filename);
                // job.setPath(fl.path + item);
                fl.arrive(job);
            });
        });
    };
    FolderNest.prototype.watch = function () {
        var fl = this;
        node_watch(fl.path, function (filepath) {
            // Verify file still exists, node-watch fires on any change, even delete
            try {
                fs.accessSync(filepath, fs.F_OK);
                // Make a new Job and trigger arrived
                var job = new fileJob_1.FileJob(fl.e, filepath);
                fl.arrive(job);
            }
            catch (e) {
                // It isn't accessible
                fl.e.log(0, "Nest watch event was ignored because file did not exist.", fl);
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
