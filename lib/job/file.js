"use strict";
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFDO0FBQUQsQ0FwSkEsQUFvSkMsSUFBQTtBQXBKWSxZQUFJLE9Bb0poQixDQUFBIiwiZmlsZSI6ImxpYi9qb2IvZmlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuXG5jb25zdCAgIG1pbWUgPSByZXF1aXJlKFwibWltZS10eXBlc1wiKSxcbiAgICAgICAgZmlsZUV4dGVuc2lvbiA9IHJlcXVpcmUoXCJmaWxlLWV4dGVuc2lvblwiKSxcbiAgICAgICAgbm9kZV9wYXRoID0gcmVxdWlyZShcInBhdGhcIiksXG4gICAgICAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxuICAgICAgICBmaWxlc2l6ZSA9IHJlcXVpcmUoXCJmaWxlc2l6ZVwiKTtcblxuZXhwb3J0IGNsYXNzIEZpbGUge1xuXG4gICAgcHJvdGVjdGVkIF9wYXRoOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF9kaXJuYW1lOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF9iYXNlbmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfY29udGVudFR5cGU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX2V4dGVuc2lvbjogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfc2l6ZUJ5dGVzOiBudW1iZXI7XG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuXG4gICAgLyoqXG4gICAgICogRmlsZSBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZSA9IGU7XG4gICAgICAgIHRoaXMuX3BhdGggPSBwYXRoO1xuXG4gICAgICAgIC8vIHZlcmlmeSBfcGF0aCBsZWFkcyB0byBhIHZhbGlkLCByZWFkYWJsZSBmaWxlLCBoYW5kbGUgZXJyb3IgaWYgbm90XG5cbiAgICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmcmVzaCB0aGUgZmlsZSBzdGF0aXN0aWNzIGFmdGVyIGEgcmVuYW1lIG9yIG1vZGlmaWNhdGlvbi5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0U3RhdGlzdGljcygpIHtcbiAgICAgICAgbGV0IGYgPSB0aGlzO1xuICAgICAgICBmLl9jb250ZW50VHlwZSA9IG1pbWUubG9va3VwKGYucGF0aCk7XG4gICAgICAgIGYuX2V4dGVuc2lvbiA9IGZpbGVFeHRlbnNpb24oZi5wYXRoKTtcbiAgICAgICAgZi5fYmFzZW5hbWUgPSBub2RlX3BhdGguYmFzZW5hbWUoZi5wYXRoKTtcbiAgICAgICAgZi5fZGlybmFtZSA9IG5vZGVfcGF0aC5kaXJuYW1lKGYucGF0aCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmLl9zaXplQnl0ZXMgPSBmcy5zdGF0U3luYyhmLnBhdGgpLnNpemU7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgZi5lLmxvZygyLCBgQ291bGRuJ3QgZGV0ZXJtaW5lIHNpemVCeXRlcyB3aXRoIHN0YXRTeW5jLiAke2Vycn1gLCBmKTtcbiAgICAgICAgICAgIGYuX3NpemVCeXRlcyA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIF9iYXNlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Jhc2VuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBmaWxlIF9uYW1lLlxuICAgICAqIEBwYXJhbSBmaWxlbmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2Jhc2VuYW1lID0gZmlsZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIF9uYW1lIG9mIHRoZSBqb2Igd2l0aG91dCB0aGUgZmlsZSBleHRlbnNpb24uXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5hbWVQcm9wZXIoKSB7XG4gICAgICAgIHJldHVybiBub2RlX3BhdGguYmFzZW5hbWUodGhpcy5iYXNlbmFtZSwgbm9kZV9wYXRoLmV4dG5hbWUodGhpcy5iYXNlbmFtZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdG9wIGxldmVsIGRpcmVjdG9yeSBfbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZGlybmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpcm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjb21wbGV0ZSBkaXJlY3RvcnkgX3BhdGguXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHBhdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXRoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgY29tcGxldGUgZGlyZWN0b3J5IF9wYXRoLlxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgcHVibGljIHNldCBwYXRoKHBhdGg6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9wYXRoID0gcGF0aDtcbiAgICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjb250ZW50LXR5cGUgb2YgdGhlIGZpbGUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGNvbnRlbnRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29udGVudFR5cGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIGV4dGVuc2lvbi5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZXh0ZW5zaW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXh0ZW5zaW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgX2Jhc2VuYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBiYXNlbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Jhc2VuYW1lO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgc2l6ZUJ5dGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2l6ZUJ5dGVzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgc2l6ZSgpIHtcbiAgICAgICAgcmV0dXJuIGZpbGVzaXplKHRoaXMuc2l6ZUJ5dGVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5hbWVzIHRoZSBsb2NhbCBqb2IgZmlsZSB0byB0aGUgY3VycmVudCBfbmFtZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVuYW1lTG9jYWwoKSB7XG4gICAgICAgIGxldCBmID0gdGhpcztcbiAgICAgICAgbGV0IG5ld19wYXRoID0gZi5kaXJuYW1lICsgbm9kZV9wYXRoLnNlcCArIGYubmFtZTtcbiAgICAgICAgZnMucmVuYW1lU3luYyhmLnBhdGgsIG5ld19wYXRoKTtcbiAgICAgICAgZi5wYXRoID0gbmV3X3BhdGg7XG4gICAgICAgIGYuZ2V0U3RhdGlzdGljcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgdGhlIGxvY2FsIGZpbGUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIHJlbW92ZUxvY2FsKCkge1xuICAgICAgICBsZXQgZiA9IHRoaXM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy51bmxpbmtTeW5jKGYucGF0aCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZi5lLmxvZygzLCBgRmlsZSBcIiR7Zi5wYXRofVwiIGNvdWxkIG5vdCBiZSBkZWxldGVkLiAke2V9YCwgZik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbn0iXX0=
