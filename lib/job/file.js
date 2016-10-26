"use strict";
var mime = require("mime-types"), fileExtension = require("file-extension"), node_path = require("path"), fs = require("fs");
var File = (function () {
    /**
     * File constructor
     * @param e
     * @param path
     */
    function File(e, path) {
        this.e = e;
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
        this.getStatistics();
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
    /**
     * Deletes the local file.
     * @returns {boolean}
     */
    File.prototype.removeLocal = function () {
        var f = this;
        try {
            fs.unlinkSync(f.getPath());
            return true;
        }
        catch (e) {
            f.e.log(3, "File \"" + f.getPath() + "\" could not be deleted. " + e, f);
            return false;
        }
    };
    return File;
}());
exports.File = File;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0ksMEJBQVcsR0FBbEI7UUFDSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDYixJQUFJLENBQUM7WUFDRCxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBRTtRQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsWUFBUyxDQUFDLENBQUMsT0FBTyxFQUFFLGlDQUEyQixDQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO0lBQ0wsQ0FBQztJQUVMLFdBQUM7QUFBRCxDQXBJQSxBQW9JQyxJQUFBO0FBcElZLFlBQUksT0FvSWhCLENBQUEiLCJmaWxlIjoibGliL2pvYi9maWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5cbmNvbnN0ICAgbWltZSA9IHJlcXVpcmUoXCJtaW1lLXR5cGVzXCIpLFxuICAgICAgICBmaWxlRXh0ZW5zaW9uID0gcmVxdWlyZShcImZpbGUtZXh0ZW5zaW9uXCIpLFxuICAgICAgICBub2RlX3BhdGggPSByZXF1aXJlKFwicGF0aFwiKSxcbiAgICAgICAgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5cbmV4cG9ydCBjbGFzcyBGaWxlIHtcblxuICAgIHByb3RlY3RlZCBwYXRoOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGRpcm5hbWU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgYmFzZW5hbWU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgY29udGVudFR5cGU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgZXh0ZW5zaW9uOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuXG4gICAgLyoqXG4gICAgICogRmlsZSBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZSA9IGU7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG5cbiAgICAgICAgdGhpcy5iYXNlbmFtZSA9IG5vZGVfcGF0aC5iYXNlbmFtZSh0aGlzLnBhdGgpO1xuICAgICAgICB0aGlzLmRpcm5hbWUgPSBub2RlX3BhdGguZGlybmFtZSh0aGlzLnBhdGgpO1xuXG4gICAgICAgIC8vIHZlcmlmeSBwYXRoIGxlYWRzIHRvIGEgdmFsaWQsIHJlYWRhYmxlIGZpbGUsIGhhbmRsZSBlcnJvciBpZiBub3RcblxuICAgICAgICB0aGlzLmdldFN0YXRpc3RpY3MoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWZyZXNoIHRoZSBmaWxlIHN0YXRpc3RpY3MgYWZ0ZXIgYSByZW5hbWUgb3IgbW9kaWZpY2F0aW9uLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRTdGF0aXN0aWNzKCkge1xuICAgICAgICB0aGlzLmNvbnRlbnRUeXBlID0gbWltZS5sb29rdXAodGhpcy5nZXRQYXRoKCkpO1xuICAgICAgICB0aGlzLmV4dGVuc2lvbiA9IGZpbGVFeHRlbnNpb24odGhpcy5nZXRQYXRoKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYmFzZW5hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgbmV3IGZpbGUgbmFtZS5cbiAgICAgKiBAcGFyYW0gZmlsZW5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0TmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYmFzZW5hbWUgPSBmaWxlbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgbmFtZSBvZiB0aGUgam9iIHdpdGhvdXQgdGhlIGZpbGUgZXh0ZW5zaW9uLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldE5hbWVQcm9wZXIoKSB7XG4gICAgICAgIHJldHVybiBub2RlX3BhdGguYmFzZW5hbWUodGhpcy5nZXRCYXNlbmFtZSgpLCBub2RlX3BhdGguZXh0bmFtZSh0aGlzLmdldEJhc2VuYW1lKCkpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHRvcCBsZXZlbCBkaXJlY3RvcnkgbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXREaXJuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXJuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY29tcGxldGUgZGlyZWN0b3J5IHBhdGguXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGNvbXBsZXRlIGRpcmVjdG9yeSBwYXRoLlxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgcHVibGljIHNldFBhdGgocGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgICAgIHRoaXMuZ2V0U3RhdGlzdGljcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY29udGVudC10eXBlIG9mIHRoZSBmaWxlLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldENvbnRlbnRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50VHlwZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgZXh0ZW5zaW9uLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldEV4dGVuc2lvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZW5zaW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYmFzZW5hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QmFzZW5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2VuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmFtZXMgdGhlIGxvY2FsIGpvYiBmaWxlIHRvIHRoZSBjdXJyZW50IG5hbWUuXG4gICAgICovXG4gICAgcHVibGljIHJlbmFtZUxvY2FsKCkge1xuICAgICAgICBsZXQgbmV3X3BhdGggPSB0aGlzLmdldERpcm5hbWUoKSArIG5vZGVfcGF0aC5zZXAgKyB0aGlzLmdldE5hbWUoKTtcbiAgICAgICAgZnMucmVuYW1lU3luYyh0aGlzLmdldFBhdGgoKSwgbmV3X3BhdGgpO1xuICAgICAgICB0aGlzLnNldFBhdGgobmV3X3BhdGgpO1xuICAgICAgICB0aGlzLmdldFN0YXRpc3RpY3MoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIHRoZSBsb2NhbCBmaWxlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHB1YmxpYyByZW1vdmVMb2NhbCgpIHtcbiAgICAgICAgbGV0IGYgPSB0aGlzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMudW5saW5rU3luYyhmLmdldFBhdGgoKSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZi5lLmxvZygzLCBgRmlsZSBcIiR7Zi5nZXRQYXRoKCl9XCIgY291bGQgbm90IGJlIGRlbGV0ZWQuICR7ZX1gLCBmKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxufSJdfQ==
