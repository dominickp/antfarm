"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var environment_1 = require("../environment/environment");
var Nest = (function (_super) {
    __extends(Nest, _super);
    function Nest(name) {
        _super.call(this);
        this.name = name;
    }
    Nest.prototype.register = function (tunnel) {
        this.tunnel = tunnel;
    };
    Nest.prototype.arrive = function (job) {
        _super.prototype.log.call(this, 1, "Job \"" + job.name + "\" arrived in Nest \"" + this.name + "\".");
        job.tunnel = this.tunnel;
        this.tunnel.arrive(job, this);
    };
    return Nest;
}(environment_1.Environment));
exports.Nest = Nest;
