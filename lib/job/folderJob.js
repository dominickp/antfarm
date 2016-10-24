"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var job_1 = require("./job");
var file_1 = require("./file");
var node_path = require("path"), fs = require("fs");
var FolderJob = (function (_super) {
    __extends(FolderJob, _super);
    /**
     * FolderJob constructor
     * @param e
     * @param path
     */
    function FolderJob(e, path) {
        _super.call(this, e, path);
        this.type = "folder";
        this.path = path;
        this.files = [];
        this.getStatistics();
        // verify path leads to a valid, readable file, handle error if not
    }
    FolderJob.prototype.getStatistics = function () {
        this.basename = node_path.basename(this.getPath());
        this.dirname = node_path.dirname(this.getPath());
    };
    /**
     * Creates file objects for folder contents. Async operation returns a callback on completion.
     * @param callback
     */
    FolderJob.prototype.createFiles = function (callback) {
        var fl = this;
        var folder_path = this.getPath();
        fs.readdir(folder_path, function (err, items) {
            items = items.filter(function (item) { return !(/(^|\/)\.[^\/\.]/g).test(item); });
            items.forEach(function (filename) {
                var filepath = folder_path + node_path.sep + filename;
                var file = new file_1.File(fl.e, filepath);
                fl.addFile(file);
            });
            callback();
        });
    };
    /**
     * Gets the job name.
     * @returns {string}
     */
    FolderJob.prototype.getName = function () {
        return this.getBasename();
    };
    /**
     * Get the basename.
     * @returns {string}
     */
    FolderJob.prototype.getBasename = function () {
        return this.basename;
    };
    /**
     * Get the directory name.
     * @returns {string}
     */
    FolderJob.prototype.getDirname = function () {
        return this.dirname;
    };
    /**
     * Get the path.
     * @returns {string}
     */
    FolderJob.prototype.getPath = function () {
        return this.path;
    };
    /**
     * Set a new path.
     * @param path
     */
    FolderJob.prototype.setPath = function (path) {
        this.path = path;
        this.getStatistics();
    };
    /**
     * Add a file object to the job.
     * @param file
     */
    FolderJob.prototype.addFile = function (file) {
        this.files.push(file);
        this.e.log(0, "Adding file \"" + file.getName() + "\" to job.", this);
    };
    /**
     * Get a file object from the job.
     * @param index
     * @returns {File}
     */
    FolderJob.prototype.getFile = function (index) {
        return this.files[index];
    };
    /**
     * Get all files associated with the job.
     * @returns {File[]}
     */
    FolderJob.prototype.getFiles = function () {
        return this.files;
    };
    /**
     * Get the number of files in this folder.
     * @returns {number}
     */
    FolderJob.prototype.count = function () {
        return this.files.length;
    };
    /**
     * Get the extension.
     * @returns {null}
     */
    FolderJob.prototype.getExtension = function () {
        return null;
    };
    /**
     * Check if job is a folder.
     * @returns {boolean}
     */
    FolderJob.prototype.isFolder = function () {
        return true;
    };
    /**
     * Check if job is a file.
     * @returns {boolean}
     */
    FolderJob.prototype.isFile = function () {
        return false;
    };
    /**
     * Moves a folder to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest
     * @param callback
     */
    FolderJob.prototype.move = function (destinationNest, callback) {
        var fj = this;
        try {
            destinationNest.take(fj, function (new_path) {
                fj.setPath(new_path);
                fj.e.log(1, "Job \"" + fj.getName() + "\" was moved to Nest \"" + destinationNest.name + "\".", fj);
                if (callback) {
                    callback();
                }
            });
        }
        catch (e) {
            fj.e.log(3, "Job \"" + fj.getName() + "\" was not moved to Nest \"" + destinationNest.name + "\". " + e, fj);
            if (callback) {
                callback();
            }
        }
    };
    /**
     * Renames the job folder, leaving its content's names alone.
     * @param newName
     */
    FolderJob.prototype.rename = function (newName) {
        var fj = this;
        var new_path = fj.getDirname() + node_path.sep + newName;
        try {
            fj.e.log(0, "Renaming folder to \"" + new_path + "\".", fj);
            fs.renameSync(fj.getPath(), new_path);
        }
        catch (err) {
            fj.e.log(3, "Rename folder error: " + err + ".", fj);
        }
        fj.setPath(new_path);
    };
    FolderJob.prototype.remove = function () {
        var fj = this;
        fj.getFiles().forEach(function (file) {
            file.removeLocal();
        });
    };
    ;
    return FolderJob;
}(job_1.Job));
exports.FolderJob = FolderJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFDLENBQUM7SUFDUCxDQUFDOztJQUVMLGdCQUFDO0FBQUQsQ0FsTUEsQUFrTUMsQ0FsTThCLFNBQUcsR0FrTWpDO0FBbE1ZLGlCQUFTLFlBa01yQixDQUFBIiwiZmlsZSI6ImxpYi9qb2IvZm9sZGVySm9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0pvYn0gZnJvbSBcIi4vam9iXCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcblxuY29uc3QgICBub2RlX3BhdGggPSByZXF1aXJlKFwicGF0aFwiKSxcbiAgICAgICAgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5cbmV4cG9ydCBjbGFzcyBGb2xkZXJKb2IgZXh0ZW5kcyBKb2Ige1xuICAgIHByb3RlY3RlZCBwYXRoOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGRpcm5hbWU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgYmFzZW5hbWU6IHN0cmluZztcblxuICAgIHByb3RlY3RlZCBmaWxlczogRmlsZVtdO1xuXG4gICAgLyoqXG4gICAgICogRm9sZGVySm9iIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIGVcbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoZSwgcGF0aCk7XG4gICAgICAgIHRoaXMudHlwZSA9IFwiZm9sZGVyXCI7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgICAgIHRoaXMuZmlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XG5cbiAgICAgICAgLy8gdmVyaWZ5IHBhdGggbGVhZHMgdG8gYSB2YWxpZCwgcmVhZGFibGUgZmlsZSwgaGFuZGxlIGVycm9yIGlmIG5vdFxuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRTdGF0aXN0aWNzKCkge1xuICAgICAgICB0aGlzLmJhc2VuYW1lID0gbm9kZV9wYXRoLmJhc2VuYW1lKHRoaXMuZ2V0UGF0aCgpKTtcbiAgICAgICAgdGhpcy5kaXJuYW1lID0gbm9kZV9wYXRoLmRpcm5hbWUodGhpcy5nZXRQYXRoKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgZmlsZSBvYmplY3RzIGZvciBmb2xkZXIgY29udGVudHMuIEFzeW5jIG9wZXJhdGlvbiByZXR1cm5zIGEgY2FsbGJhY2sgb24gY29tcGxldGlvbi5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlRmlsZXMoY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBsZXQgZm9sZGVyX3BhdGggPSB0aGlzLmdldFBhdGgoKTtcbiAgICAgICAgZnMucmVhZGRpcihmb2xkZXJfcGF0aCwgZnVuY3Rpb24oZXJyLCBpdGVtcykge1xuICAgICAgICAgICAgaXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiAhKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QoaXRlbSkpO1xuXG4gICAgICAgICAgICBpdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGZpbGVuYW1lKXtcbiAgICAgICAgICAgICAgICBsZXQgZmlsZXBhdGggPSBmb2xkZXJfcGF0aCArIG5vZGVfcGF0aC5zZXAgKyBmaWxlbmFtZTtcbiAgICAgICAgICAgICAgICBsZXQgZmlsZSA9IG5ldyBGaWxlKGZsLmUsIGZpbGVwYXRoKTtcbiAgICAgICAgICAgICAgICBmbC5hZGRGaWxlKGZpbGUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGpvYiBuYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEJhc2VuYW1lKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBiYXNlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRCYXNlbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBkaXJlY3RvcnkgbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXREaXJuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXJuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcGF0aC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBwYXRoLlxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgcHVibGljIHNldFBhdGgocGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgICAgIHRoaXMuZ2V0U3RhdGlzdGljcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIGZpbGUgb2JqZWN0IHRvIHRoZSBqb2IuXG4gICAgICogQHBhcmFtIGZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkRmlsZShmaWxlOiBGaWxlKSB7XG4gICAgICAgIHRoaXMuZmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgdGhpcy5lLmxvZygwLCBgQWRkaW5nIGZpbGUgXCIke2ZpbGUuZ2V0TmFtZSgpfVwiIHRvIGpvYi5gLCB0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBmaWxlIG9iamVjdCBmcm9tIHRoZSBqb2IuXG4gICAgICogQHBhcmFtIGluZGV4XG4gICAgICogQHJldHVybnMge0ZpbGV9XG4gICAgICovXG4gICAgcHVibGljIGdldEZpbGUoaW5kZXg6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlc1tpbmRleF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBmaWxlcyBhc3NvY2lhdGVkIHdpdGggdGhlIGpvYi5cbiAgICAgKiBAcmV0dXJucyB7RmlsZVtdfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRGaWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBudW1iZXIgb2YgZmlsZXMgaW4gdGhpcyBmb2xkZXIuXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBwdWJsaWMgY291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGVzLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGV4dGVuc2lvbi5cbiAgICAgKiBAcmV0dXJucyB7bnVsbH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RXh0ZW5zaW9uKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgYSBmb2xkZXIuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzRm9sZGVyKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgYSBmaWxlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHB1YmxpYyBpc0ZpbGUoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNb3ZlcyBhIGZvbGRlciB0byBhIG5lc3QuIFRoaXMgaXMgYW4gYXN5bmNocm9ub3VzIG1ldGhvZCB3aGljaCBwcm92aWRlcyBhIGNhbGxiYWNrIG9uIGNvbXBsZXRpb24uXG4gICAgICogQHBhcmFtIGRlc3RpbmF0aW9uTmVzdFxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBtb3ZlKGRlc3RpbmF0aW9uTmVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGZqID0gdGhpcztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uTmVzdC50YWtlKGZqLCBmdW5jdGlvbihuZXdfcGF0aCl7XG4gICAgICAgICAgICAgICAgZmouc2V0UGF0aChuZXdfcGF0aCk7XG4gICAgICAgICAgICAgICAgZmouZS5sb2coMSwgYEpvYiBcIiR7ZmouZ2V0TmFtZSgpfVwiIHdhcyBtb3ZlZCB0byBOZXN0IFwiJHtkZXN0aW5hdGlvbk5lc3QubmFtZX1cIi5gLCBmaik7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGZqLmUubG9nKDMsIGBKb2IgXCIke2ZqLmdldE5hbWUoKX1cIiB3YXMgbm90IG1vdmVkIHRvIE5lc3QgXCIke2Rlc3RpbmF0aW9uTmVzdC5uYW1lfVwiLiAke2V9YCwgZmopO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmFtZXMgdGhlIGpvYiBmb2xkZXIsIGxlYXZpbmcgaXRzIGNvbnRlbnQncyBuYW1lcyBhbG9uZS5cbiAgICAgKiBAcGFyYW0gbmV3TmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyByZW5hbWUobmV3TmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBmaiA9IHRoaXM7XG4gICAgICAgIGxldCBuZXdfcGF0aCA9IGZqLmdldERpcm5hbWUoKSArIG5vZGVfcGF0aC5zZXAgKyBuZXdOYW1lO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmai5lLmxvZygwLCBgUmVuYW1pbmcgZm9sZGVyIHRvIFwiJHtuZXdfcGF0aH1cIi5gLCBmaik7XG4gICAgICAgICAgICBmcy5yZW5hbWVTeW5jKGZqLmdldFBhdGgoKSwgbmV3X3BhdGgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGZqLmUubG9nKDMsIGBSZW5hbWUgZm9sZGVyIGVycm9yOiAke2Vycn0uYCwgZmopO1xuICAgICAgICB9XG5cbiAgICAgICAgZmouc2V0UGF0aChuZXdfcGF0aCk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZSgpIHtcbiAgICAgICAgbGV0IGZqID0gdGhpcztcbiAgICAgICAgZmouZ2V0RmlsZXMoKS5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgICBmaWxlLnJlbW92ZUxvY2FsKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbn0iXX0=
