"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
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
        var _this = _super.call(this, e, path) || this;
        _this._type = "folder";
        _this._path = path;
        _this._files = [];
        _this.getStatistics();
        return _this;
        // verify _path leads to a valid, readable file, handle error if not
    }
    FolderJob.prototype.getStatistics = function () {
        this._basename = node_path.basename(this.path);
        this._dirname = node_path.dirname(this.path);
    };
    /**
     * Creates file objects for folder contents. Async operation returns a callback on completion.
     * @param callback
     */
    FolderJob.prototype.createFiles = function (callback) {
        var fl = this;
        var folder_path = fl.path;
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
            return this.basename;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FolderJob.prototype, "basename", {
        /**
         * Get the _basename.
         * @returns {string}
         */
        get: function () {
            return this._basename;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FolderJob.prototype, "dirname", {
        /**
         * Get the directory _name.
         * @returns {string}
         */
        get: function () {
            return this._dirname;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FolderJob.prototype, "path", {
        /**
         * Get the _path.
         * @returns {string}
         */
        get: function () {
            return this._path;
        },
        /**
         * Set a new _path.
         * @param path
         */
        set: function (path) {
            var fj = this;
            fj._path = path;
            fj.getStatistics();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Add a file object to the job.
     * @param file
     */
    FolderJob.prototype.addFile = function (file) {
        this._files.push(file);
        this.e.log(0, "Adding file \"" + file.name + "\" to job.", this);
    };
    /**
     * Get a file object from the job.
     * @param index
     * @returns {File}
     */
    FolderJob.prototype.getFile = function (index) {
        return this._files[index];
    };
    Object.defineProperty(FolderJob.prototype, "files", {
        /**
         * Get all _files associated with the job.
         * @returns {File[]}
         */
        get: function () {
            return this._files;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the number of _files in this folder.
     * @returns {number}
     */
    FolderJob.prototype.count = function () {
        return this._files.length;
    };
    Object.defineProperty(FolderJob.prototype, "extension", {
        /**
         * Get the extension.
         * @returns {null}
         */
        get: function () {
            return null;
        },
        enumerable: true,
        configurable: true
    });
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
        if (!destinationNest) {
            fs.e.log(3, "Destination nest does not exist!", fj);
        }
        try {
            destinationNest.take(fj, function (job) {
                // fj.path = new_path;
                fj.e.log(1, "Job \"" + fj.name + "\" was moved to Nest \"" + destinationNest.name + "\".", fj);
                if (callback) {
                    callback(job);
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
        var new_path = fj.dirname + node_path.sep + newName;
        try {
            fj.e.log(0, "Renaming folder to \"" + new_path + "\".", fj);
            fs.renameSync(fj.path, new_path);
        }
        catch (err) {
            fj.e.log(3, "Rename folder error: " + err + ".", fj);
        }
        fj.path = new_path;
    };
    FolderJob.prototype.remove = function () {
        var fj = this;
        fj.files.forEach(function (file) {
            file.removeLocal();
        });
    };
    ;
    return FolderJob;
}(job_1.Job));
exports.FolderJob = FolderJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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dkIsQ0FBQztJQUVNLDBCQUFNLEdBQWI7UUFDSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUk7WUFDbEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUFBLENBQUM7SUFFTixnQkFBQztBQUFELENBeE1BLEFBd01DLENBeE04QixTQUFHLEdBd01qQztBQXhNWSw4QkFBUyIsImZpbGUiOiJsaWIvam9iL2ZvbGRlckpvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xyXG5pbXBvcnQge0pvYn0gZnJvbSBcIi4vam9iXCI7XHJcbmltcG9ydCB7RmlsZX0gZnJvbSBcIi4vZmlsZVwiO1xyXG5pbXBvcnQge05lc3R9IGZyb20gXCIuLi9uZXN0L25lc3RcIjtcclxuXHJcbmNvbnN0ICAgbm9kZV9wYXRoID0gcmVxdWlyZShcInBhdGhcIiksXHJcbiAgICAgICAgZnMgPSByZXF1aXJlKFwiZnNcIik7XHJcblxyXG5leHBvcnQgY2xhc3MgRm9sZGVySm9iIGV4dGVuZHMgSm9iIHtcclxuICAgIHByb3RlY3RlZCBfcGF0aDogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIF9kaXJuYW1lOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgX2Jhc2VuYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9maWxlczogRmlsZVtdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRm9sZGVySm9iIGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0gZVxyXG4gICAgICogQHBhcmFtIHBhdGhcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyKGUsIHBhdGgpO1xyXG4gICAgICAgIHRoaXMuX3R5cGUgPSBcImZvbGRlclwiO1xyXG4gICAgICAgIHRoaXMuX3BhdGggPSBwYXRoO1xyXG4gICAgICAgIHRoaXMuX2ZpbGVzID0gW107XHJcbiAgICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XHJcblxyXG4gICAgICAgIC8vIHZlcmlmeSBfcGF0aCBsZWFkcyB0byBhIHZhbGlkLCByZWFkYWJsZSBmaWxlLCBoYW5kbGUgZXJyb3IgaWYgbm90XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldFN0YXRpc3RpY3MoKSB7XHJcbiAgICAgICAgdGhpcy5fYmFzZW5hbWUgPSBub2RlX3BhdGguYmFzZW5hbWUodGhpcy5wYXRoKTtcclxuICAgICAgICB0aGlzLl9kaXJuYW1lID0gbm9kZV9wYXRoLmRpcm5hbWUodGhpcy5wYXRoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgZmlsZSBvYmplY3RzIGZvciBmb2xkZXIgY29udGVudHMuIEFzeW5jIG9wZXJhdGlvbiByZXR1cm5zIGEgY2FsbGJhY2sgb24gY29tcGxldGlvbi5cclxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY3JlYXRlRmlsZXMoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgICAgICBsZXQgZmwgPSB0aGlzO1xyXG4gICAgICAgIGxldCBmb2xkZXJfcGF0aCA9IGZsLnBhdGg7XHJcbiAgICAgICAgZnMucmVhZGRpcihmb2xkZXJfcGF0aCwgKGVyciwgaXRlbXMpID0+IHtcclxuICAgICAgICAgICAgaXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiAhKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QoaXRlbSkpO1xyXG5cclxuICAgICAgICAgICAgaXRlbXMuZm9yRWFjaCgoZmlsZW5hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZvbGRlcl9wYXRoICsgbm9kZV9wYXRoLnNlcCArIGZpbGVuYW1lO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZpbGUgPSBuZXcgRmlsZShmbC5lLCBmaWxlcGF0aCk7XHJcbiAgICAgICAgICAgICAgICBmbC5hZGRGaWxlKGZpbGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBqb2IgX25hbWUuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IG5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzZW5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIF9iYXNlbmFtZS5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgYmFzZW5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Jhc2VuYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBkaXJlY3RvcnkgX25hbWUuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGRpcm5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpcm5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIF9wYXRoLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBwYXRoKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGEgbmV3IF9wYXRoLlxyXG4gICAgICogQHBhcmFtIHBhdGhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBwYXRoKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBmaiA9IHRoaXM7XHJcbiAgICAgICAgZmouX3BhdGggPSBwYXRoO1xyXG4gICAgICAgIGZqLmdldFN0YXRpc3RpY3MoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIGZpbGUgb2JqZWN0IHRvIHRoZSBqb2IuXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYWRkRmlsZShmaWxlOiBGaWxlKSB7XHJcbiAgICAgICAgdGhpcy5fZmlsZXMucHVzaChmaWxlKTtcclxuICAgICAgICB0aGlzLmUubG9nKDAsIGBBZGRpbmcgZmlsZSBcIiR7ZmlsZS5uYW1lfVwiIHRvIGpvYi5gLCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBhIGZpbGUgb2JqZWN0IGZyb20gdGhlIGpvYi5cclxuICAgICAqIEBwYXJhbSBpbmRleFxyXG4gICAgICogQHJldHVybnMge0ZpbGV9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRGaWxlKGluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZmlsZXNbaW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGFsbCBfZmlsZXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBqb2IuXHJcbiAgICAgKiBAcmV0dXJucyB7RmlsZVtdfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGZpbGVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9maWxlcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgbnVtYmVyIG9mIF9maWxlcyBpbiB0aGlzIGZvbGRlci5cclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjb3VudCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZmlsZXMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBleHRlbnNpb24uXHJcbiAgICAgKiBAcmV0dXJucyB7bnVsbH1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBleHRlbnNpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgYSBmb2xkZXIuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGlzRm9sZGVyKCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGEgZmlsZS5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaXNGaWxlKCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1vdmVzIGEgZm9sZGVyIHRvIGEgbmVzdC4gVGhpcyBpcyBhbiBhc3luY2hyb25vdXMgbWV0aG9kIHdoaWNoIHByb3ZpZGVzIGEgY2FsbGJhY2sgb24gY29tcGxldGlvbi5cclxuICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbk5lc3RcclxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbW92ZShkZXN0aW5hdGlvbk5lc3Q6IE5lc3QsIGNhbGxiYWNrOiAoam9iPzogSm9iKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGZqID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvbk5lc3QpIHtcclxuICAgICAgICAgICAgZnMuZS5sb2coMywgYERlc3RpbmF0aW9uIG5lc3QgZG9lcyBub3QgZXhpc3QhYCwgZmopO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZGVzdGluYXRpb25OZXN0LnRha2UoZmosIChqb2IpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIGZqLnBhdGggPSBuZXdfcGF0aDtcclxuICAgICAgICAgICAgICAgIGZqLmUubG9nKDEsIGBKb2IgXCIke2ZqLm5hbWV9XCIgd2FzIG1vdmVkIHRvIE5lc3QgXCIke2Rlc3RpbmF0aW9uTmVzdC5uYW1lfVwiLmAsIGZqKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGpvYik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgZmouZS5sb2coMywgYEpvYiBcIiR7ZmoubmFtZX1cIiB3YXMgbm90IG1vdmVkIHRvIE5lc3QgXCIke2Rlc3RpbmF0aW9uTmVzdC5uYW1lfVwiLiAke2V9YCwgZmopO1xyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW5hbWVzIHRoZSBqb2IgZm9sZGVyLCBsZWF2aW5nIGl0cyBjb250ZW50J3MgbmFtZXMgYWxvbmUuXHJcbiAgICAgKiBAcGFyYW0gbmV3TmFtZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVuYW1lKG5ld05hbWU6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBmaiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IG5ld19wYXRoID0gZmouZGlybmFtZSArIG5vZGVfcGF0aC5zZXAgKyBuZXdOYW1lO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBmai5lLmxvZygwLCBgUmVuYW1pbmcgZm9sZGVyIHRvIFwiJHtuZXdfcGF0aH1cIi5gLCBmaik7XHJcbiAgICAgICAgICAgIGZzLnJlbmFtZVN5bmMoZmoucGF0aCwgbmV3X3BhdGgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBmai5lLmxvZygzLCBgUmVuYW1lIGZvbGRlciBlcnJvcjogJHtlcnJ9LmAsIGZqKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZqLnBhdGggPSBuZXdfcGF0aDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlKCkge1xyXG4gICAgICAgIGxldCBmaiA9IHRoaXM7XHJcbiAgICAgICAgZmouZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xyXG4gICAgICAgICAgICBmaWxlLnJlbW92ZUxvY2FsKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxufVxyXG4iXX0=
