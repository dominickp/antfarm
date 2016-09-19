"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var environment_1 = require('../environment/environment');
var Tunnel = (function (_super) {
    __extends(Tunnel, _super);
    function Tunnel(theName) {
        _super.call(this);
        this.nests = [];
        this.name = theName;
        this.run_list = [];
    }
    Tunnel.prototype.move = function (distanceInMeters) {
        if (distanceInMeters === void 0) { distanceInMeters = 0; }
        console.log(this.name + " moved " + distanceInMeters + "m.");
    };
    Tunnel.prototype.watch = function (nest) {
        nest.register(this);
        this.nests.push(nest);
    };
    Tunnel.prototype.arrive = function (job, nest) {
        _super.prototype.log.call(this, 1, "New job arrived. " + job.name + " in nest " + nest.name);
        this.executeRun(job, nest);
    };
    Tunnel.prototype.run = function (callback) {
        this.run_list.push(callback);
    };
    Tunnel.prototype.fail = function (callback) {
        this.run_fail = callback;
    };
    Tunnel.prototype.executeRun = function (job, nest) {
        this.run_list.forEach(function (callback) {
            callback(job, nest);
        });
    };
    Tunnel.prototype.executeFail = function (job, nest, reason) {
        _super.prototype.log.call(this, 3, "Job failed " + job.name);
        this.run_fail(job, nest, reason);
    };
    return Tunnel;
}(environment_1.Environment));
exports.Tunnel = Tunnel;
