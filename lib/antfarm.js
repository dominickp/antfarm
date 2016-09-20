"use strict";
var tunnel_1 = require("./tunnel/tunnel");
var ftp_1 = require("./nest/ftp");
var folder_1 = require("./nest/folder");
var environment_1 = require("./environment/environment");
/**
 * Expose `Antfarm`.
 */
var Antfarm = (function () {
    function Antfarm(options) {
        this.e = new environment_1.Environment(options);
        //this.hello = options.hello;
    }
    Antfarm.prototype.version = function () {
        return "1.0";
    };
    Antfarm.prototype.createTunnel = function (name) {
        return new tunnel_1.Tunnel(this.e, name);
    };
    Antfarm.prototype.createFolderNest = function (name) {
        return new folder_1.Folder(this.e, name);
    };
    Antfarm.prototype.createFTPNest = function (host, port, username, password, checkEvery) {
        return new ftp_1.Ftp(this.e, host, port, username, password, checkEvery);
    };
    return Antfarm;
}());
;
module.exports = Antfarm;
