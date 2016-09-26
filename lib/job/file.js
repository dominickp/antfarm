"use strict";
var mime = require("mime-types"), fileExtension = require("file-extension"), node_path = require("path"), fs = require("fs");
var File = (function () {
    function File(e, path) {
        this.path = path;
        this.basename = node_path.basename(this.path);
        this.dirname = node_path.dirname(this.path);
        // verify path leads to a valid, readable file, handle error if not
        this.getStatistics();
    }
    File.prototype.getStatistics = function () {
        this.contentType = mime.lookup(this.getPath());
        this.extension = fileExtension(this.getPath());
    };
    File.prototype.getName = function () {
        return this.basename;
    };
    File.prototype.getDirname = function () {
        return this.dirname;
    };
    File.prototype.getPath = function () {
        return this.path;
    };
    File.prototype.setPath = function (path) {
        this.path = path;
    };
    File.prototype.setName = function (filename) {
        this.basename = filename;
    };
    File.prototype.getContentType = function () {
        return this.contentType;
    };
    File.prototype.getExtension = function () {
        return this.extension;
    };
    File.prototype.getBasename = function () {
        return this.basename;
    };
    /**
     * Renames the local job file to the current name.
     */
    File.prototype.renameLocal = function () {
        var new_path = this.getDirname() + node_path.sep + this.getName();
        fs.renameSync(this.getPath(), new_path);
        this.setPath(new_path);
        this.getStatistics();
    };
    return File;
}());
exports.File = File;
