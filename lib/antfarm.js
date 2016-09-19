"use strict";
var tunnel_1 = require("./tunnel/tunnel");
var ftp_1 = require("./nest/ftp");
var folder_1 = require("./nest/folder");
/**
 * Expose `Antfarm`.
 */
module.exports = {
    version: function () {
        return "1.0";
    },
    createTunnel: function (name) {
        return new tunnel_1.Tunnel(name);
    },
    createFolderNest: function (name) {
        return new folder_1.Folder(name);
    },
    createFTPNest: function (host, port, username, password, checkEvery) {
        return new ftp_1.Ftp(host, port, username, password, checkEvery);
    }
};
