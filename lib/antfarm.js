"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tunnel_1 = require("./tunnel/tunnel");
var ftp_1 = require("./nest/ftp");
var folder_1 = require("./nest/folder");
var environment_1 = require("./environment/environment");
/**
 * Expose `Antfarm`.
 */
var Antfarm = (function (_super) {
    __extends(Antfarm, _super);
    function Antfarm(options) {
        _super.call(this, options);
        //this.hello = options.hello;
    }
    Antfarm.prototype.version = function () {
        return "1.0";
    };
    Antfarm.prototype.createTunnel = function (name) {
        return new tunnel_1.Tunnel(name);
    };
    Antfarm.prototype.createFolderNest = function (name) {
        return new folder_1.Folder(name);
    };
    Antfarm.prototype.createFTPNest = function (host, port, username, password, checkEvery) {
        return new ftp_1.Ftp(host, port, username, password, checkEvery);
    };
    return Antfarm;
}(environment_1.Environment));
;
module.exports = Antfarm;
