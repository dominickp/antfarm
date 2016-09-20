"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var node_watch = require('node-watch');
var nest_1 = require('./nest');
var job_1 = require('./../job/job');
var fs = require('fs');
var path_mod = require('path');
var Folder = (function (_super) {
    __extends(Folder, _super);
    function Folder(e, path) {
        var nest_name = path_mod.basename(path);
        _super.call(this, e, nest_name);
        this.path = path;
        this.load();
        this.watch();
    }
    Folder.prototype.load = function () {
        var fl = this;
        fs.readdir(fl.path, function (err, items) {
            items = items.filter(function (item) { return !(/(^|\/)\.[^\/\.]/g).test(item); });
            items.forEach(function (item) {
                // Make a new Job and trigger arrived
                var job = new job_1.Job(fl.e, item);
                job.setPath(fl.path + item);
                fl.arrive(job);
            });
        });
    };
    Folder.prototype.watch = function () {
        var fl = this;
        node_watch(fl.path, function (filename) {
            // Make a new Job and trigger arrived
            var job = new job_1.Job(fl.e, filename);
            job.setPath(fl.path + filename);
            fl.arrive(job);
        });
    };
    Folder.prototype.arrive = function (job) {
        _super.prototype.arrive.call(this, job);
    };
    return Folder;
}(nest_1.Nest));
exports.Folder = Folder;
