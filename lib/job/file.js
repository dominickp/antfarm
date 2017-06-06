"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mime = require("mime-types"), fileExtension = require("file-extension"), node_path = require("path"), fs = require("fs"), filesize = require("filesize");
var File = (function () {
    /**
     * File constructor
     * @param e
     * @param path
     */
    function File(e, path) {
        this.e = e;
        this._path = path;
        // verify _path leads to a valid, readable file, handle error if not
        this.getStatistics();
    }
    /**
     * Refresh the file statistics after a rename or modification.
     */
    File.prototype.getStatistics = function () {
        var f = this;
        f._contentType = mime.lookup(f.path);
        f._extension = fileExtension(f.path);
        f._basename = node_path.basename(f.path);
        f._dirname = node_path.dirname(f.path);
        try {
            f._sizeBytes = fs.statSync(f.path).size;
        }
        catch (err) {
            f.e.log(2, "Couldn't determine sizeBytes with statSync. " + err, f);
            f._sizeBytes = 0;
        }
    };
    Object.defineProperty(File.prototype, "name", {
        /**
         * Get the _basename.
         * @returns {string}
         */
        get: function () {
            return this._basename;
        },
        /**
         * Set a new file _name.
         * @param filename
         */
        set: function (filename) {
            this._basename = filename;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "nameProper", {
        /**
         * Get the file _name of the job without the file extension.
         * @returns {string}
         */
        get: function () {
            return node_path.basename(this.basename, node_path.extname(this.basename));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "dirname", {
        /**
         * Get the top level directory _name.
         * @returns {string}
         */
        get: function () {
            return this._dirname;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "path", {
        /**
         * Get the complete directory _path.
         * @returns {string}
         */
        get: function () {
            return this._path;
        },
        /**
         * Set the complete directory _path.
         * @param path
         */
        set: function (path) {
            this._path = path;
            this.getStatistics();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "contentType", {
        /**
         * Get the content-type of the file.
         * @returns {string}
         */
        get: function () {
            return this._contentType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "extension", {
        /**
         * Get the file extension.
         * @returns {string}
         */
        get: function () {
            return this._extension;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "basename", {
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
    Object.defineProperty(File.prototype, "sizeBytes", {
        get: function () {
            return this._sizeBytes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "size", {
        get: function () {
            return filesize(this.sizeBytes);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Renames the local job file to the current _name.
     */
    File.prototype.renameLocal = function () {
        var f = this;
        var new_path = f.dirname + node_path.sep + f.name;
        fs.renameSync(f.path, new_path);
        f.path = new_path;
        f.getStatistics();
    };
    /**
     * Deletes the local file.
     * @returns {boolean}
     */
    File.prototype.removeLocal = function () {
        var f = this;
        try {
            fs.unlinkSync(f.path);
            return true;
        }
        catch (e) {
            f.e.log(3, "File \"" + f.path + "\" could not be deleted. " + e, f);
            return false;
        }
    };
    return File;
}());
exports.File = File;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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V0FBQztBQUFELENBcEpBLEFBb0pDLElBQUE7QUFwSlksb0JBQUkiLCJmaWxlIjoibGliL2pvYi9maWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XHJcblxyXG5jb25zdCAgIG1pbWUgPSByZXF1aXJlKFwibWltZS10eXBlc1wiKSxcclxuICAgICAgICBmaWxlRXh0ZW5zaW9uID0gcmVxdWlyZShcImZpbGUtZXh0ZW5zaW9uXCIpLFxyXG4gICAgICAgIG5vZGVfcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxyXG4gICAgICAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxyXG4gICAgICAgIGZpbGVzaXplID0gcmVxdWlyZShcImZpbGVzaXplXCIpO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGUge1xyXG5cclxuICAgIHByb3RlY3RlZCBfcGF0aDogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIF9kaXJuYW1lOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgX2Jhc2VuYW1lOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgX2NvbnRlbnRUeXBlOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgX2V4dGVuc2lvbjogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIF9zaXplQnl0ZXM6IG51bWJlcjtcclxuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbGUgY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSBlXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5lID0gZTtcclxuICAgICAgICB0aGlzLl9wYXRoID0gcGF0aDtcclxuXHJcbiAgICAgICAgLy8gdmVyaWZ5IF9wYXRoIGxlYWRzIHRvIGEgdmFsaWQsIHJlYWRhYmxlIGZpbGUsIGhhbmRsZSBlcnJvciBpZiBub3RcclxuXHJcbiAgICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWZyZXNoIHRoZSBmaWxlIHN0YXRpc3RpY3MgYWZ0ZXIgYSByZW5hbWUgb3IgbW9kaWZpY2F0aW9uLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0U3RhdGlzdGljcygpIHtcclxuICAgICAgICBsZXQgZiA9IHRoaXM7XHJcbiAgICAgICAgZi5fY29udGVudFR5cGUgPSBtaW1lLmxvb2t1cChmLnBhdGgpO1xyXG4gICAgICAgIGYuX2V4dGVuc2lvbiA9IGZpbGVFeHRlbnNpb24oZi5wYXRoKTtcclxuICAgICAgICBmLl9iYXNlbmFtZSA9IG5vZGVfcGF0aC5iYXNlbmFtZShmLnBhdGgpO1xyXG4gICAgICAgIGYuX2Rpcm5hbWUgPSBub2RlX3BhdGguZGlybmFtZShmLnBhdGgpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGYuX3NpemVCeXRlcyA9IGZzLnN0YXRTeW5jKGYucGF0aCkuc2l6ZTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgZi5lLmxvZygyLCBgQ291bGRuJ3QgZGV0ZXJtaW5lIHNpemVCeXRlcyB3aXRoIHN0YXRTeW5jLiAke2Vycn1gLCBmKTtcclxuICAgICAgICAgICAgZi5fc2l6ZUJ5dGVzID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIF9iYXNlbmFtZS5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgbmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYmFzZW5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgYSBuZXcgZmlsZSBfbmFtZS5cclxuICAgICAqIEBwYXJhbSBmaWxlbmFtZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0IG5hbWUoZmlsZW5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX2Jhc2VuYW1lID0gZmlsZW5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIGZpbGUgX25hbWUgb2YgdGhlIGpvYiB3aXRob3V0IHRoZSBmaWxlIGV4dGVuc2lvbi5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgbmFtZVByb3BlcigpIHtcclxuICAgICAgICByZXR1cm4gbm9kZV9wYXRoLmJhc2VuYW1lKHRoaXMuYmFzZW5hbWUsIG5vZGVfcGF0aC5leHRuYW1lKHRoaXMuYmFzZW5hbWUpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgdG9wIGxldmVsIGRpcmVjdG9yeSBfbmFtZS5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZGlybmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGlybmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgY29tcGxldGUgZGlyZWN0b3J5IF9wYXRoLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBwYXRoKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBjb21wbGV0ZSBkaXJlY3RvcnkgX3BhdGguXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0IHBhdGgocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fcGF0aCA9IHBhdGg7XHJcbiAgICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIGNvbnRlbnQtdHlwZSBvZiB0aGUgZmlsZS5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgY29udGVudFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnRlbnRUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBmaWxlIGV4dGVuc2lvbi5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZXh0ZW5zaW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9leHRlbnNpb247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIF9iYXNlbmFtZS5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgYmFzZW5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Jhc2VuYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgc2l6ZUJ5dGVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaXplQnl0ZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBzaXplKCkge1xyXG4gICAgICAgIHJldHVybiBmaWxlc2l6ZSh0aGlzLnNpemVCeXRlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW5hbWVzIHRoZSBsb2NhbCBqb2IgZmlsZSB0byB0aGUgY3VycmVudCBfbmFtZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbmFtZUxvY2FsKCkge1xyXG4gICAgICAgIGxldCBmID0gdGhpcztcclxuICAgICAgICBsZXQgbmV3X3BhdGggPSBmLmRpcm5hbWUgKyBub2RlX3BhdGguc2VwICsgZi5uYW1lO1xyXG4gICAgICAgIGZzLnJlbmFtZVN5bmMoZi5wYXRoLCBuZXdfcGF0aCk7XHJcbiAgICAgICAgZi5wYXRoID0gbmV3X3BhdGg7XHJcbiAgICAgICAgZi5nZXRTdGF0aXN0aWNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWxldGVzIHRoZSBsb2NhbCBmaWxlLlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZW1vdmVMb2NhbCgpIHtcclxuICAgICAgICBsZXQgZiA9IHRoaXM7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZnMudW5saW5rU3luYyhmLnBhdGgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGYuZS5sb2coMywgYEZpbGUgXCIke2YucGF0aH1cIiBjb3VsZCBub3QgYmUgZGVsZXRlZC4gJHtlfWAsIGYpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSJdfQ==
