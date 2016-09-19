"use strict";
var tunnel_1 = require("./tunnel/tunnel");
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
    createFolder: function (name) {
        return new folder_1.Folder(name);
    }
};
