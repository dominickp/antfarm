"use strict";
var tunnel_1 = require("./tunnel/tunnel");
var ftpNest_1 = require("./nest/ftpNest");
var folderNest_1 = require("./nest/folderNest");
var environment_1 = require("./environment/environment");
/**
 * Expose `Antfarm`.
 */
var Antfarm = (function () {
    function Antfarm(options) {
        this.e = new environment_1.Environment(options);
        this.e.log(1, "Started antfarm", this);
    }
    Antfarm.prototype.version = function () {
        return "0.0.1";
    };
    Antfarm.prototype.createTunnel = function (name) {
        return new tunnel_1.Tunnel(this.e, name);
    };
    Antfarm.prototype.createFolderNest = function (name) {
        return new folderNest_1.FolderNest(this.e, name);
    };
    Antfarm.prototype.createFtpNest = function (host, port, username, password, checkEvery) {
        return new ftpNest_1.FtpNest(this.e, host, port, username, password, checkEvery);
    };
    /**
     * Load an entire directory of workflow modules.
     * @param directory
     */
    Antfarm.prototype.loadDir = function (directory) {
        var af = this;
        var workflows = require("require-dir-all")(directory, {
            _parentsToSkip: 1,
            indexAsParent: true,
            throwNoDir: true
        });
        var loaded_counter = 0;
        for (var workflow in workflows) {
            try {
                new workflows[workflow](af);
                loaded_counter++;
            }
            catch (e) {
                af.e.log(3, "Couldn't load workflow module \"" + workflow + "\". " + e, af);
            }
        }
        af.e.log(1, "Loaded " + loaded_counter + " workflows.", af);
    };
    return Antfarm;
}());
module.exports = Antfarm;
