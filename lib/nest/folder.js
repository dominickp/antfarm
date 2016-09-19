"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var node_watch = require('node-watch');
var nest_1 = require('./nest');
var job_1 = require('./../job/job');
var Folder = (function (_super) {
    __extends(Folder, _super);
    function Folder(path) {
        _super.call(this, "folder");
        this.path = path;
        this.watch();
    }
    Folder.prototype.watch = function () {
        node_watch(this.path, function (filename) {
            console.log(filename, ' changed.');
            // Make a new Job and trigger arrived
            var job = new job_1.Job(filename);
            job.setPath(this.path + filename);
            this.arrive(job);
        });
    };
    Folder.prototype.arrive = function (job) {
        _super.prototype.arrive.call(this, job);
    };
    return Folder;
}(nest_1.Nest));
exports.Folder = Folder;
