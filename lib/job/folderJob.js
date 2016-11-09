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
        this._type = "folder";
        this._path = path;
        this._files = [];
        this.getStatistics();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFHLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBRU0sMEJBQU0sR0FBYjtRQUNJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTtZQUNsQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDOztJQUVMLGdCQUFDO0FBQUQsQ0F4TUEsQUF3TUMsQ0F4TThCLFNBQUcsR0F3TWpDO0FBeE1ZLGlCQUFTLFlBd01yQixDQUFBIiwiZmlsZSI6ImxpYi9qb2IvZm9sZGVySm9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0pvYn0gZnJvbSBcIi4vam9iXCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcbmltcG9ydCB7TmVzdH0gZnJvbSBcIi4uL25lc3QvbmVzdFwiO1xuXG5jb25zdCAgIG5vZGVfcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxuICAgICAgICBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcblxuZXhwb3J0IGNsYXNzIEZvbGRlckpvYiBleHRlbmRzIEpvYiB7XG4gICAgcHJvdGVjdGVkIF9wYXRoOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF9kaXJuYW1lOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF9iYXNlbmFtZTogc3RyaW5nO1xuXG4gICAgcHJvdGVjdGVkIF9maWxlczogRmlsZVtdO1xuXG4gICAgLyoqXG4gICAgICogRm9sZGVySm9iIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIGVcbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoZSwgcGF0aCk7XG4gICAgICAgIHRoaXMuX3R5cGUgPSBcImZvbGRlclwiO1xuICAgICAgICB0aGlzLl9wYXRoID0gcGF0aDtcbiAgICAgICAgdGhpcy5fZmlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XG5cbiAgICAgICAgLy8gdmVyaWZ5IF9wYXRoIGxlYWRzIHRvIGEgdmFsaWQsIHJlYWRhYmxlIGZpbGUsIGhhbmRsZSBlcnJvciBpZiBub3RcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0U3RhdGlzdGljcygpIHtcbiAgICAgICAgdGhpcy5fYmFzZW5hbWUgPSBub2RlX3BhdGguYmFzZW5hbWUodGhpcy5wYXRoKTtcbiAgICAgICAgdGhpcy5fZGlybmFtZSA9IG5vZGVfcGF0aC5kaXJuYW1lKHRoaXMucGF0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBmaWxlIG9iamVjdHMgZm9yIGZvbGRlciBjb250ZW50cy4gQXN5bmMgb3BlcmF0aW9uIHJldHVybnMgYSBjYWxsYmFjayBvbiBjb21wbGV0aW9uLlxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBjcmVhdGVGaWxlcyhjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBsZXQgZm9sZGVyX3BhdGggPSBmbC5wYXRoO1xuICAgICAgICBmcy5yZWFkZGlyKGZvbGRlcl9wYXRoLCAoZXJyLCBpdGVtcykgPT4ge1xuICAgICAgICAgICAgaXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiAhKC8oXnxcXC8pXFwuW15cXC9cXC5dL2cpLnRlc3QoaXRlbSkpO1xuXG4gICAgICAgICAgICBpdGVtcy5mb3JFYWNoKChmaWxlbmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBmaWxlcGF0aCA9IGZvbGRlcl9wYXRoICsgbm9kZV9wYXRoLnNlcCArIGZpbGVuYW1lO1xuICAgICAgICAgICAgICAgIGxldCBmaWxlID0gbmV3IEZpbGUoZmwuZSwgZmlsZXBhdGgpO1xuICAgICAgICAgICAgICAgIGZsLmFkZEZpbGUoZmlsZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgam9iIF9uYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNlbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIF9iYXNlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgYmFzZW5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9iYXNlbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGRpcmVjdG9yeSBfbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZGlybmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpcm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBfcGF0aC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhdGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgbmV3IF9wYXRoLlxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgcHVibGljIHNldCBwYXRoKHBhdGg6IHN0cmluZykge1xuICAgICAgICBsZXQgZmogPSB0aGlzO1xuICAgICAgICBmai5fcGF0aCA9IHBhdGg7XG4gICAgICAgIGZqLmdldFN0YXRpc3RpY3MoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBmaWxlIG9iamVjdCB0byB0aGUgam9iLlxuICAgICAqIEBwYXJhbSBmaWxlXG4gICAgICovXG4gICAgcHVibGljIGFkZEZpbGUoZmlsZTogRmlsZSkge1xuICAgICAgICB0aGlzLl9maWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICB0aGlzLmUubG9nKDAsIGBBZGRpbmcgZmlsZSBcIiR7ZmlsZS5uYW1lfVwiIHRvIGpvYi5gLCB0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBmaWxlIG9iamVjdCBmcm9tIHRoZSBqb2IuXG4gICAgICogQHBhcmFtIGluZGV4XG4gICAgICogQHJldHVybnMge0ZpbGV9XG4gICAgICovXG4gICAgcHVibGljIGdldEZpbGUoaW5kZXg6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsZXNbaW5kZXhdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgX2ZpbGVzIGFzc29jaWF0ZWQgd2l0aCB0aGUgam9iLlxuICAgICAqIEByZXR1cm5zIHtGaWxlW119XG4gICAgICovXG4gICAgcHVibGljIGdldCBmaWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbnVtYmVyIG9mIF9maWxlcyBpbiB0aGlzIGZvbGRlci5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHB1YmxpYyBjb3VudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGVzLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGV4dGVuc2lvbi5cbiAgICAgKiBAcmV0dXJucyB7bnVsbH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGV4dGVuc2lvbigpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGEgZm9sZGVyLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHB1YmxpYyBpc0ZvbGRlcigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGEgZmlsZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNGaWxlKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTW92ZXMgYSBmb2xkZXIgdG8gYSBuZXN0LiBUaGlzIGlzIGFuIGFzeW5jaHJvbm91cyBtZXRob2Qgd2hpY2ggcHJvdmlkZXMgYSBjYWxsYmFjayBvbiBjb21wbGV0aW9uLlxuICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbk5lc3RcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZShkZXN0aW5hdGlvbk5lc3Q6IE5lc3QsIGNhbGxiYWNrOiAoam9iPzogSm9iKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgICAgIGxldCBmaiA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvbk5lc3QpIHtcbiAgICAgICAgICAgIGZzLmUubG9nKDMsIGBEZXN0aW5hdGlvbiBuZXN0IGRvZXMgbm90IGV4aXN0IWAsIGZqKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbk5lc3QudGFrZShmaiwgKGpvYikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIGZqLnBhdGggPSBuZXdfcGF0aDtcbiAgICAgICAgICAgICAgICBmai5lLmxvZygxLCBgSm9iIFwiJHtmai5uYW1lfVwiIHdhcyBtb3ZlZCB0byBOZXN0IFwiJHtkZXN0aW5hdGlvbk5lc3QubmFtZX1cIi5gLCBmaik7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGpvYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGZqLmUubG9nKDMsIGBKb2IgXCIke2ZqLm5hbWV9XCIgd2FzIG5vdCBtb3ZlZCB0byBOZXN0IFwiJHtkZXN0aW5hdGlvbk5lc3QubmFtZX1cIi4gJHtlfWAsIGZqKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5hbWVzIHRoZSBqb2IgZm9sZGVyLCBsZWF2aW5nIGl0cyBjb250ZW50J3MgbmFtZXMgYWxvbmUuXG4gICAgICogQHBhcmFtIG5ld05hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVuYW1lKG5ld05hbWU6IHN0cmluZykge1xuICAgICAgICBsZXQgZmogPSB0aGlzO1xuICAgICAgICBsZXQgbmV3X3BhdGggPSBmai5kaXJuYW1lICsgbm9kZV9wYXRoLnNlcCArIG5ld05hbWU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZqLmUubG9nKDAsIGBSZW5hbWluZyBmb2xkZXIgdG8gXCIke25ld19wYXRofVwiLmAsIGZqKTtcbiAgICAgICAgICAgIGZzLnJlbmFtZVN5bmMoZmoucGF0aCwgbmV3X3BhdGgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGZqLmUubG9nKDMsIGBSZW5hbWUgZm9sZGVyIGVycm9yOiAke2Vycn0uYCwgZmopO1xuICAgICAgICB9XG5cbiAgICAgICAgZmoucGF0aCA9IG5ld19wYXRoO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmUoKSB7XG4gICAgICAgIGxldCBmaiA9IHRoaXM7XG4gICAgICAgIGZqLmZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgICAgIGZpbGUucmVtb3ZlTG9jYWwoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxufSJdfQ==
