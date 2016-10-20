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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcblxuY29uc3QgICBtaW1lID0gcmVxdWlyZShcIm1pbWUtdHlwZXNcIiksXG4gICAgICAgIGZpbGVFeHRlbnNpb24gPSByZXF1aXJlKFwiZmlsZS1leHRlbnNpb25cIiksXG4gICAgICAgIG5vZGVfcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxuICAgICAgICBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcblxuZXhwb3J0IGNsYXNzIEZpbGUge1xuXG4gICAgcHJvdGVjdGVkIHBhdGg6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgZGlybmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBiYXNlbmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBjb250ZW50VHlwZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBleHRlbnNpb246IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEZpbGUgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHBhdGg6IHN0cmluZykge1xuXG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG5cbiAgICAgICAgdGhpcy5iYXNlbmFtZSA9IG5vZGVfcGF0aC5iYXNlbmFtZSh0aGlzLnBhdGgpO1xuICAgICAgICB0aGlzLmRpcm5hbWUgPSBub2RlX3BhdGguZGlybmFtZSh0aGlzLnBhdGgpO1xuXG4gICAgICAgIC8vIHZlcmlmeSBwYXRoIGxlYWRzIHRvIGEgdmFsaWQsIHJlYWRhYmxlIGZpbGUsIGhhbmRsZSBlcnJvciBpZiBub3RcblxuICAgICAgICB0aGlzLmdldFN0YXRpc3RpY3MoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWZyZXNoIHRoZSBmaWxlIHN0YXRpc3RpY3MgYWZ0ZXIgYSByZW5hbWUgb3IgbW9kaWZpY2F0aW9uLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRTdGF0aXN0aWNzKCkge1xuICAgICAgICB0aGlzLmNvbnRlbnRUeXBlID0gbWltZS5sb29rdXAodGhpcy5nZXRQYXRoKCkpO1xuICAgICAgICB0aGlzLmV4dGVuc2lvbiA9IGZpbGVFeHRlbnNpb24odGhpcy5nZXRQYXRoKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYmFzZW5hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgbmV3IGZpbGUgbmFtZS5cbiAgICAgKiBAcGFyYW0gZmlsZW5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0TmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYmFzZW5hbWUgPSBmaWxlbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgbmFtZSBvZiB0aGUgam9iIHdpdGhvdXQgdGhlIGZpbGUgZXh0ZW5zaW9uLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldE5hbWVQcm9wZXIoKSB7XG4gICAgICAgIHJldHVybiBub2RlX3BhdGguYmFzZW5hbWUodGhpcy5nZXRCYXNlbmFtZSgpLCBub2RlX3BhdGguZXh0bmFtZSh0aGlzLmdldEJhc2VuYW1lKCkpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHRvcCBsZXZlbCBkaXJlY3RvcnkgbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXREaXJuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXJuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY29tcGxldGUgZGlyZWN0b3J5IHBhdGguXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGNvbXBsZXRlIGRpcmVjdG9yeSBwYXRoLlxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgcHVibGljIHNldFBhdGgocGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjb250ZW50LXR5cGUgb2YgdGhlIGZpbGUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q29udGVudFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnRUeXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBleHRlbnNpb24uXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RXh0ZW5zaW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlbnNpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBiYXNlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRCYXNlbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVuYW1lcyB0aGUgbG9jYWwgam9iIGZpbGUgdG8gdGhlIGN1cnJlbnQgbmFtZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVuYW1lTG9jYWwoKSB7XG4gICAgICAgIGxldCBuZXdfcGF0aCA9IHRoaXMuZ2V0RGlybmFtZSgpICsgbm9kZV9wYXRoLnNlcCArIHRoaXMuZ2V0TmFtZSgpO1xuICAgICAgICBmcy5yZW5hbWVTeW5jKHRoaXMuZ2V0UGF0aCgpLCBuZXdfcGF0aCk7XG4gICAgICAgIHRoaXMuc2V0UGF0aChuZXdfcGF0aCk7XG4gICAgICAgIHRoaXMuZ2V0U3RhdGlzdGljcygpO1xuICAgIH1cblxufSJdfQ==
