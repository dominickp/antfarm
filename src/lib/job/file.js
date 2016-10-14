"use strict";
var mime = require("mime-types"), fileExtension = require("file-extension"), node_path = require("path"), fs = require("fs");
var File = (function () {
    /**
     * File constructor
     * @param e
     * @param path
     */
    function File(e, path) {
        this.path = path;
        this.basename = node_path.basename(this.path);
        this.dirname = node_path.dirname(this.path);
        // verify path leads to a valid, readable file, handle error if not
        this.getStatistics();
    }
    /**
     * Refresh the file statistics after a rename or modification.
     */
    File.prototype.getStatistics = function () {
        this.contentType = mime.lookup(this.getPath());
        this.extension = fileExtension(this.getPath());
    };
    /**
     * Get the basename.
     * @returns {string}
     */
    File.prototype.getName = function () {
        return this.basename;
    };
    /**
     * Set a new file name.
     * @param filename
     */
    File.prototype.setName = function (filename) {
        this.basename = filename;
    };
    /**
     * Get the file name of the job without the file extension.
     * @returns {string}
     */
    File.prototype.getNameProper = function () {
        return node_path.basename(this.getBasename(), node_path.extname(this.getBasename()));
    };
    /**
     * Get the top level directory name.
     * @returns {string}
     */
    File.prototype.getDirname = function () {
        return this.dirname;
    };
    /**
     * Get the complete directory path.
     * @returns {string}
     */
    File.prototype.getPath = function () {
        return this.path;
    };
    /**
     * Set the complete directory path.
     * @param path
     */
    File.prototype.setPath = function (path) {
        this.path = path;
    };
    /**
     * Get the content-type of the file.
     * @returns {string}
     */
    File.prototype.getContentType = function () {
        return this.contentType;
    };
    /**
     * Get the file extension.
     * @returns {string}
     */
    File.prototype.getExtension = function () {
        return this.extension;
    };
    /**
     * Get the basename.
     * @returns {string}
     */
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
//# sourceMappingURL=file.js.map