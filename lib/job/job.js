"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var environment_1 = require("../environment/environment");
var Job = (function (_super) {
    __extends(Job, _super);
    function Job(name) {
        _super.call(this);
        this.name = name;
        _super.prototype.log.call(this, 1, "New Job \"" + name + "\" created.");
    }
    Job.prototype.fail = function (reason) {
        if (!this.tunnel) {
            _super.prototype.log.call(this, 3, "Job \"" + name + "\" failed before tunnel was set.");
        }
        this.tunnel.executeFail(this, this.nest, reason);
    };
    Job.prototype.setPath = function (path) {
        this.path = path;
    };
    return Job;
}(environment_1.Environment));
exports.Job = Job;
