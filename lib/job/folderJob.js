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
        var folder_path = this.path;
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
            this._path = path;
            this.getStatistics();
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
            destinationNest.take(fj, function (new_path) {
                fj.path = new_path;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQztJQUVNLDBCQUFNLEdBQWI7UUFDSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUk7WUFDbEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7SUFFTCxnQkFBQztBQUFELENBdk1BLEFBdU1DLENBdk04QixTQUFHLEdBdU1qQztBQXZNWSxpQkFBUyxZQXVNckIsQ0FBQSIsImZpbGUiOiJsaWIvam9iL2ZvbGRlckpvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtKb2J9IGZyb20gXCIuL2pvYlwiO1xuaW1wb3J0IHtGaWxlfSBmcm9tIFwiLi9maWxlXCI7XG5pbXBvcnQge05lc3R9IGZyb20gXCIuLi9uZXN0L25lc3RcIjtcblxuY29uc3QgICBub2RlX3BhdGggPSByZXF1aXJlKFwicGF0aFwiKSxcbiAgICAgICAgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5cbmV4cG9ydCBjbGFzcyBGb2xkZXJKb2IgZXh0ZW5kcyBKb2Ige1xuICAgIHByb3RlY3RlZCBfcGF0aDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfZGlybmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfYmFzZW5hbWU6IHN0cmluZztcblxuICAgIHByb3RlY3RlZCBfZmlsZXM6IEZpbGVbXTtcblxuICAgIC8qKlxuICAgICAqIEZvbGRlckpvYiBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKGUsIHBhdGgpO1xuICAgICAgICB0aGlzLl90eXBlID0gXCJmb2xkZXJcIjtcbiAgICAgICAgdGhpcy5fcGF0aCA9IHBhdGg7XG4gICAgICAgIHRoaXMuX2ZpbGVzID0gW107XG4gICAgICAgIHRoaXMuZ2V0U3RhdGlzdGljcygpO1xuXG4gICAgICAgIC8vIHZlcmlmeSBfcGF0aCBsZWFkcyB0byBhIHZhbGlkLCByZWFkYWJsZSBmaWxlLCBoYW5kbGUgZXJyb3IgaWYgbm90XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFN0YXRpc3RpY3MoKSB7XG4gICAgICAgIHRoaXMuX2Jhc2VuYW1lID0gbm9kZV9wYXRoLmJhc2VuYW1lKHRoaXMucGF0aCk7XG4gICAgICAgIHRoaXMuX2Rpcm5hbWUgPSBub2RlX3BhdGguZGlybmFtZSh0aGlzLnBhdGgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgZmlsZSBvYmplY3RzIGZvciBmb2xkZXIgY29udGVudHMuIEFzeW5jIG9wZXJhdGlvbiByZXR1cm5zIGEgY2FsbGJhY2sgb24gY29tcGxldGlvbi5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlRmlsZXMoY2FsbGJhY2s6IGFueSkge1xuICAgICAgICBsZXQgZmwgPSB0aGlzO1xuICAgICAgICBsZXQgZm9sZGVyX3BhdGggPSB0aGlzLnBhdGg7XG4gICAgICAgIGZzLnJlYWRkaXIoZm9sZGVyX3BhdGgsIGZ1bmN0aW9uKGVyciwgaXRlbXMpIHtcbiAgICAgICAgICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gISgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KGl0ZW0pKTtcblxuICAgICAgICAgICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbihmaWxlbmFtZSl7XG4gICAgICAgICAgICAgICAgbGV0IGZpbGVwYXRoID0gZm9sZGVyX3BhdGggKyBub2RlX3BhdGguc2VwICsgZmlsZW5hbWU7XG4gICAgICAgICAgICAgICAgbGV0IGZpbGUgPSBuZXcgRmlsZShmbC5lLCBmaWxlcGF0aCk7XG4gICAgICAgICAgICAgICAgZmwuYWRkRmlsZShmaWxlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBqb2IgX25hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2VuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgX2Jhc2VuYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBiYXNlbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Jhc2VuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZGlyZWN0b3J5IF9uYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBkaXJuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGlybmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIF9wYXRoLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBwYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGF0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBuZXcgX3BhdGguXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHBhdGgocGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3BhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLmdldFN0YXRpc3RpY3MoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBmaWxlIG9iamVjdCB0byB0aGUgam9iLlxuICAgICAqIEBwYXJhbSBmaWxlXG4gICAgICovXG4gICAgcHVibGljIGFkZEZpbGUoZmlsZTogRmlsZSkge1xuICAgICAgICB0aGlzLl9maWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICB0aGlzLmUubG9nKDAsIGBBZGRpbmcgZmlsZSBcIiR7ZmlsZS5uYW1lfVwiIHRvIGpvYi5gLCB0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBmaWxlIG9iamVjdCBmcm9tIHRoZSBqb2IuXG4gICAgICogQHBhcmFtIGluZGV4XG4gICAgICogQHJldHVybnMge0ZpbGV9XG4gICAgICovXG4gICAgcHVibGljIGdldEZpbGUoaW5kZXg6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsZXNbaW5kZXhdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgX2ZpbGVzIGFzc29jaWF0ZWQgd2l0aCB0aGUgam9iLlxuICAgICAqIEByZXR1cm5zIHtGaWxlW119XG4gICAgICovXG4gICAgcHVibGljIGdldCBmaWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbnVtYmVyIG9mIF9maWxlcyBpbiB0aGlzIGZvbGRlci5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHB1YmxpYyBjb3VudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGVzLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGV4dGVuc2lvbi5cbiAgICAgKiBAcmV0dXJucyB7bnVsbH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGV4dGVuc2lvbigpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGEgZm9sZGVyLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHB1YmxpYyBpc0ZvbGRlcigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGEgZmlsZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNGaWxlKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTW92ZXMgYSBmb2xkZXIgdG8gYSBuZXN0LiBUaGlzIGlzIGFuIGFzeW5jaHJvbm91cyBtZXRob2Qgd2hpY2ggcHJvdmlkZXMgYSBjYWxsYmFjayBvbiBjb21wbGV0aW9uLlxuICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbk5lc3RcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZShkZXN0aW5hdGlvbk5lc3Q6IE5lc3QsIGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgbGV0IGZqID0gdGhpcztcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uTmVzdCkge1xuICAgICAgICAgICAgZnMuZS5sb2coMywgYERlc3RpbmF0aW9uIG5lc3QgZG9lcyBub3QgZXhpc3QhYCwgZmopO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uTmVzdC50YWtlKGZqLCAobmV3X3BhdGgpID0+IHtcbiAgICAgICAgICAgICAgICBmai5wYXRoID0gbmV3X3BhdGg7XG4gICAgICAgICAgICAgICAgZmouZS5sb2coMSwgYEpvYiBcIiR7ZmoubmFtZX1cIiB3YXMgbW92ZWQgdG8gTmVzdCBcIiR7ZGVzdGluYXRpb25OZXN0Lm5hbWV9XCIuYCwgZmopO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBmai5lLmxvZygzLCBgSm9iIFwiJHtmai5uYW1lfVwiIHdhcyBub3QgbW92ZWQgdG8gTmVzdCBcIiR7ZGVzdGluYXRpb25OZXN0Lm5hbWV9XCIuICR7ZX1gLCBmaik7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVuYW1lcyB0aGUgam9iIGZvbGRlciwgbGVhdmluZyBpdHMgY29udGVudCdzIG5hbWVzIGFsb25lLlxuICAgICAqIEBwYXJhbSBuZXdOYW1lXG4gICAgICovXG4gICAgcHVibGljIHJlbmFtZShuZXdOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGZqID0gdGhpcztcbiAgICAgICAgbGV0IG5ld19wYXRoID0gZmouZGlybmFtZSArIG5vZGVfcGF0aC5zZXAgKyBuZXdOYW1lO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmai5lLmxvZygwLCBgUmVuYW1pbmcgZm9sZGVyIHRvIFwiJHtuZXdfcGF0aH1cIi5gLCBmaik7XG4gICAgICAgICAgICBmcy5yZW5hbWVTeW5jKGZqLnBhdGgsIG5ld19wYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBmai5lLmxvZygzLCBgUmVuYW1lIGZvbGRlciBlcnJvcjogJHtlcnJ9LmAsIGZqKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZqLnBhdGggPSBuZXdfcGF0aDtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlKCkge1xuICAgICAgICBsZXQgZmogPSB0aGlzO1xuICAgICAgICBmai5maWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgICBmaWxlLnJlbW92ZUxvY2FsKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbn0iXX0=
