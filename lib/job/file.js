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
        // verify path leads to a valid, readable file, handle error if not
        this.getStatistics();
    }
    /**
     * Refresh the file statistics after a rename or modification.
     */
    File.prototype.getStatistics = function () {
        var f = this;
        f.contentType = mime.lookup(f.getPath());
        f.extension = fileExtension(f.getPath());
        f.basename = node_path.basename(f.getPath());
        f.dirname = node_path.dirname(f.getPath());
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
        var f = this;
        var new_path = f.getDirname() + node_path.sep + f.getName();
        fs.renameSync(f.getPath(), new_path);
        console.log(new_path);
        f.setPath(new_path);
        f.getStatistics();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFRLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksMEJBQVcsR0FBbEI7UUFDSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDYixJQUFJLENBQUM7WUFDRCxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBRTtRQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsWUFBUyxDQUFDLENBQUMsT0FBTyxFQUFFLGlDQUEyQixDQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO0lBQ0wsQ0FBQztJQUVMLFdBQUM7QUFBRCxDQXRJQSxBQXNJQyxJQUFBO0FBdElZLFlBQUksT0FzSWhCLENBQUEiLCJmaWxlIjoibGliL2pvYi9maWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5cbmNvbnN0ICAgbWltZSA9IHJlcXVpcmUoXCJtaW1lLXR5cGVzXCIpLFxuICAgICAgICBmaWxlRXh0ZW5zaW9uID0gcmVxdWlyZShcImZpbGUtZXh0ZW5zaW9uXCIpLFxuICAgICAgICBub2RlX3BhdGggPSByZXF1aXJlKFwicGF0aFwiKSxcbiAgICAgICAgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5cbmV4cG9ydCBjbGFzcyBGaWxlIHtcblxuICAgIHByb3RlY3RlZCBwYXRoOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGRpcm5hbWU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgYmFzZW5hbWU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgY29udGVudFR5cGU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgZXh0ZW5zaW9uOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuXG4gICAgLyoqXG4gICAgICogRmlsZSBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZSA9IGU7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG5cbiAgICAgICAgLy8gdmVyaWZ5IHBhdGggbGVhZHMgdG8gYSB2YWxpZCwgcmVhZGFibGUgZmlsZSwgaGFuZGxlIGVycm9yIGlmIG5vdFxuXG4gICAgICAgIHRoaXMuZ2V0U3RhdGlzdGljcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZnJlc2ggdGhlIGZpbGUgc3RhdGlzdGljcyBhZnRlciBhIHJlbmFtZSBvciBtb2RpZmljYXRpb24uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFN0YXRpc3RpY3MoKSB7XG4gICAgICAgIGxldCBmID0gdGhpcztcbiAgICAgICAgZi5jb250ZW50VHlwZSA9IG1pbWUubG9va3VwKGYuZ2V0UGF0aCgpKTtcbiAgICAgICAgZi5leHRlbnNpb24gPSBmaWxlRXh0ZW5zaW9uKGYuZ2V0UGF0aCgpKTtcbiAgICAgICAgZi5iYXNlbmFtZSA9IG5vZGVfcGF0aC5iYXNlbmFtZShmLmdldFBhdGgoKSk7XG4gICAgICAgIGYuZGlybmFtZSA9IG5vZGVfcGF0aC5kaXJuYW1lKGYuZ2V0UGF0aCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGJhc2VuYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2VuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBmaWxlIG5hbWUuXG4gICAgICogQHBhcmFtIGZpbGVuYW1lXG4gICAgICovXG4gICAgcHVibGljIHNldE5hbWUoZmlsZW5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmJhc2VuYW1lID0gZmlsZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIG5hbWUgb2YgdGhlIGpvYiB3aXRob3V0IHRoZSBmaWxlIGV4dGVuc2lvbi5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROYW1lUHJvcGVyKCkge1xuICAgICAgICByZXR1cm4gbm9kZV9wYXRoLmJhc2VuYW1lKHRoaXMuZ2V0QmFzZW5hbWUoKSwgbm9kZV9wYXRoLmV4dG5hbWUodGhpcy5nZXRCYXNlbmFtZSgpKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB0b3AgbGV2ZWwgZGlyZWN0b3J5IG5hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RGlybmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlybmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGNvbXBsZXRlIGRpcmVjdG9yeSBwYXRoLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldFBhdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBjb21wbGV0ZSBkaXJlY3RvcnkgcGF0aC5cbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRQYXRoKHBhdGg6IHN0cmluZykge1xuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLmdldFN0YXRpc3RpY3MoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGNvbnRlbnQtdHlwZSBvZiB0aGUgZmlsZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRDb250ZW50VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudFR5cGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIGV4dGVuc2lvbi5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRFeHRlbnNpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4dGVuc2lvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGJhc2VuYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldEJhc2VuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNlbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5hbWVzIHRoZSBsb2NhbCBqb2IgZmlsZSB0byB0aGUgY3VycmVudCBuYW1lLlxuICAgICAqL1xuICAgIHB1YmxpYyByZW5hbWVMb2NhbCgpIHtcbiAgICAgICAgbGV0IGYgPSB0aGlzO1xuICAgICAgICBsZXQgbmV3X3BhdGggPSBmLmdldERpcm5hbWUoKSArIG5vZGVfcGF0aC5zZXAgKyBmLmdldE5hbWUoKTtcbiAgICAgICAgZnMucmVuYW1lU3luYyhmLmdldFBhdGgoKSwgbmV3X3BhdGgpO1xuICAgICAgICBjb25zb2xlLmxvZyhuZXdfcGF0aCk7XG4gICAgICAgIGYuc2V0UGF0aChuZXdfcGF0aCk7XG4gICAgICAgIGYuZ2V0U3RhdGlzdGljcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgdGhlIGxvY2FsIGZpbGUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIHJlbW92ZUxvY2FsKCkge1xuICAgICAgICBsZXQgZiA9IHRoaXM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy51bmxpbmtTeW5jKGYuZ2V0UGF0aCgpKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBmLmUubG9nKDMsIGBGaWxlIFwiJHtmLmdldFBhdGgoKX1cIiBjb3VsZCBub3QgYmUgZGVsZXRlZC4gJHtlfWAsIGYpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG59Il19
