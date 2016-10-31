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
    Object.defineProperty(FolderJob.prototype, "name", {
        /**
         * Gets the job _name.
         * @returns {string}
         */
        get: function () {
            return this.getBasename();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the basename.
     * @returns {string}
     */
    FolderJob.prototype.getBasename = function () {
        return this.basename;
    };
    /**
     * Get the directory _name.
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
        this.e.log(0, "Adding file \"" + file.name + "\" to job.", this);
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
                fj.e.log(1, "Job \"" + fj.name + "\" was moved to Nest \"" + destinationNest.name + "\".", fj);
                if (callback) {
                    callback();
                }
            });
        }
        catch (e) {
            fj.e.log(3, "Job \"" + fj.name + "\" was not moved to Nest \"" + destinationNest.name + "\". " + e, fj);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QyxDQUFDO0lBQ1AsQ0FBQzs7SUFFTCxnQkFBQztBQUFELENBbE1BLEFBa01DLENBbE04QixTQUFHLEdBa01qQztBQWxNWSxpQkFBUyxZQWtNckIsQ0FBQSIsImZpbGUiOiJsaWIvam9iL2ZvbGRlckpvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtKb2J9IGZyb20gXCIuL2pvYlwiO1xuaW1wb3J0IHtGaWxlfSBmcm9tIFwiLi9maWxlXCI7XG5cbmNvbnN0ICAgbm9kZV9wYXRoID0gcmVxdWlyZShcInBhdGhcIiksXG4gICAgICAgIGZzID0gcmVxdWlyZShcImZzXCIpO1xuXG5leHBvcnQgY2xhc3MgRm9sZGVySm9iIGV4dGVuZHMgSm9iIHtcbiAgICBwcm90ZWN0ZWQgcGF0aDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBkaXJuYW1lOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGJhc2VuYW1lOiBzdHJpbmc7XG5cbiAgICBwcm90ZWN0ZWQgZmlsZXM6IEZpbGVbXTtcblxuICAgIC8qKlxuICAgICAqIEZvbGRlckpvYiBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKGUsIHBhdGgpO1xuICAgICAgICB0aGlzLnR5cGUgPSBcImZvbGRlclwiO1xuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLmZpbGVzID0gW107XG4gICAgICAgIHRoaXMuZ2V0U3RhdGlzdGljcygpO1xuXG4gICAgICAgIC8vIHZlcmlmeSBwYXRoIGxlYWRzIHRvIGEgdmFsaWQsIHJlYWRhYmxlIGZpbGUsIGhhbmRsZSBlcnJvciBpZiBub3RcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0U3RhdGlzdGljcygpIHtcbiAgICAgICAgdGhpcy5iYXNlbmFtZSA9IG5vZGVfcGF0aC5iYXNlbmFtZSh0aGlzLmdldFBhdGgoKSk7XG4gICAgICAgIHRoaXMuZGlybmFtZSA9IG5vZGVfcGF0aC5kaXJuYW1lKHRoaXMuZ2V0UGF0aCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGZpbGUgb2JqZWN0cyBmb3IgZm9sZGVyIGNvbnRlbnRzLiBBc3luYyBvcGVyYXRpb24gcmV0dXJucyBhIGNhbGxiYWNrIG9uIGNvbXBsZXRpb24uXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZUZpbGVzKGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgbGV0IGZsID0gdGhpcztcbiAgICAgICAgbGV0IGZvbGRlcl9wYXRoID0gdGhpcy5nZXRQYXRoKCk7XG4gICAgICAgIGZzLnJlYWRkaXIoZm9sZGVyX3BhdGgsIGZ1bmN0aW9uKGVyciwgaXRlbXMpIHtcbiAgICAgICAgICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gISgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KGl0ZW0pKTtcblxuICAgICAgICAgICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbihmaWxlbmFtZSl7XG4gICAgICAgICAgICAgICAgbGV0IGZpbGVwYXRoID0gZm9sZGVyX3BhdGggKyBub2RlX3BhdGguc2VwICsgZmlsZW5hbWU7XG4gICAgICAgICAgICAgICAgbGV0IGZpbGUgPSBuZXcgRmlsZShmbC5lLCBmaWxlcGF0aCk7XG4gICAgICAgICAgICAgICAgZmwuYWRkRmlsZShmaWxlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBqb2IgX25hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEJhc2VuYW1lKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBiYXNlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRCYXNlbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBkaXJlY3RvcnkgX25hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RGlybmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlybmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHBhdGguXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBuZXcgcGF0aC5cbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRQYXRoKHBhdGg6IHN0cmluZykge1xuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLmdldFN0YXRpc3RpY3MoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBmaWxlIG9iamVjdCB0byB0aGUgam9iLlxuICAgICAqIEBwYXJhbSBmaWxlXG4gICAgICovXG4gICAgcHVibGljIGFkZEZpbGUoZmlsZTogRmlsZSkge1xuICAgICAgICB0aGlzLmZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgIHRoaXMuZS5sb2coMCwgYEFkZGluZyBmaWxlIFwiJHtmaWxlLm5hbWV9XCIgdG8gam9iLmAsIHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIGZpbGUgb2JqZWN0IGZyb20gdGhlIGpvYi5cbiAgICAgKiBAcGFyYW0gaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7RmlsZX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RmlsZShpbmRleDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGVzW2luZGV4XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIGZpbGVzIGFzc29jaWF0ZWQgd2l0aCB0aGUgam9iLlxuICAgICAqIEByZXR1cm5zIHtGaWxlW119XG4gICAgICovXG4gICAgcHVibGljIGdldEZpbGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG51bWJlciBvZiBmaWxlcyBpbiB0aGlzIGZvbGRlci5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHB1YmxpYyBjb3VudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZXMubGVuZ3RoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZXh0ZW5zaW9uLlxuICAgICAqIEByZXR1cm5zIHtudWxsfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRFeHRlbnNpb24oKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGpvYiBpcyBhIGZvbGRlci5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNGb2xkZXIoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGpvYiBpcyBhIGZpbGUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1vdmVzIGEgZm9sZGVyIHRvIGEgbmVzdC4gVGhpcyBpcyBhbiBhc3luY2hyb25vdXMgbWV0aG9kIHdoaWNoIHByb3ZpZGVzIGEgY2FsbGJhY2sgb24gY29tcGxldGlvbi5cbiAgICAgKiBAcGFyYW0gZGVzdGluYXRpb25OZXN0XG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG1vdmUoZGVzdGluYXRpb25OZXN0LCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgZmogPSB0aGlzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGVzdGluYXRpb25OZXN0LnRha2UoZmosIGZ1bmN0aW9uKG5ld19wYXRoKXtcbiAgICAgICAgICAgICAgICBmai5zZXRQYXRoKG5ld19wYXRoKTtcbiAgICAgICAgICAgICAgICBmai5lLmxvZygxLCBgSm9iIFwiJHtmai5uYW1lfVwiIHdhcyBtb3ZlZCB0byBOZXN0IFwiJHtkZXN0aW5hdGlvbk5lc3QubmFtZX1cIi5gLCBmaik7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGZqLmUubG9nKDMsIGBKb2IgXCIke2ZqLm5hbWV9XCIgd2FzIG5vdCBtb3ZlZCB0byBOZXN0IFwiJHtkZXN0aW5hdGlvbk5lc3QubmFtZX1cIi4gJHtlfWAsIGZqKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5hbWVzIHRoZSBqb2IgZm9sZGVyLCBsZWF2aW5nIGl0cyBjb250ZW50J3MgbmFtZXMgYWxvbmUuXG4gICAgICogQHBhcmFtIG5ld05hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVuYW1lKG5ld05hbWU6IHN0cmluZykge1xuICAgICAgICBsZXQgZmogPSB0aGlzO1xuICAgICAgICBsZXQgbmV3X3BhdGggPSBmai5nZXREaXJuYW1lKCkgKyBub2RlX3BhdGguc2VwICsgbmV3TmFtZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZmouZS5sb2coMCwgYFJlbmFtaW5nIGZvbGRlciB0byBcIiR7bmV3X3BhdGh9XCIuYCwgZmopO1xuICAgICAgICAgICAgZnMucmVuYW1lU3luYyhmai5nZXRQYXRoKCksIG5ld19wYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBmai5lLmxvZygzLCBgUmVuYW1lIGZvbGRlciBlcnJvcjogJHtlcnJ9LmAsIGZqKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZqLnNldFBhdGgobmV3X3BhdGgpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmUoKSB7XG4gICAgICAgIGxldCBmaiA9IHRoaXM7XG4gICAgICAgIGZqLmdldEZpbGVzKCkuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgICAgZmlsZS5yZW1vdmVMb2NhbCgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG59Il19
