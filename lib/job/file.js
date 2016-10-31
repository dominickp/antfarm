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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUNoQyxDQUFDLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztRQUNsQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLDBCQUFXLEdBQWxCO1FBQ0ksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2IsSUFBSSxDQUFDO1lBQ0QsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFFO1FBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxZQUFTLENBQUMsQ0FBQyxJQUFJLGlDQUEyQixDQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO0lBQ0wsQ0FBQztJQUVMLFdBQUM7QUFBRCxDQXJJQSxBQXFJQyxJQUFBO0FBcklZLFlBQUksT0FxSWhCLENBQUEiLCJmaWxlIjoibGliL2pvYi9maWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5cbmNvbnN0ICAgbWltZSA9IHJlcXVpcmUoXCJtaW1lLXR5cGVzXCIpLFxuICAgICAgICBmaWxlRXh0ZW5zaW9uID0gcmVxdWlyZShcImZpbGUtZXh0ZW5zaW9uXCIpLFxuICAgICAgICBub2RlX3BhdGggPSByZXF1aXJlKFwicGF0aFwiKSxcbiAgICAgICAgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5cbmV4cG9ydCBjbGFzcyBGaWxlIHtcblxuICAgIHByb3RlY3RlZCBfcGF0aDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfZGlybmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfYmFzZW5hbWU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX2NvbnRlbnRUeXBlOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF9leHRlbnNpb246IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBGaWxlIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIGVcbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5lID0gZTtcbiAgICAgICAgdGhpcy5fcGF0aCA9IHBhdGg7XG5cbiAgICAgICAgLy8gdmVyaWZ5IF9wYXRoIGxlYWRzIHRvIGEgdmFsaWQsIHJlYWRhYmxlIGZpbGUsIGhhbmRsZSBlcnJvciBpZiBub3RcblxuICAgICAgICB0aGlzLmdldFN0YXRpc3RpY3MoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWZyZXNoIHRoZSBmaWxlIHN0YXRpc3RpY3MgYWZ0ZXIgYSByZW5hbWUgb3IgbW9kaWZpY2F0aW9uLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRTdGF0aXN0aWNzKCkge1xuICAgICAgICBsZXQgZiA9IHRoaXM7XG4gICAgICAgIGYuX2NvbnRlbnRUeXBlID0gbWltZS5sb29rdXAoZi5wYXRoKTtcbiAgICAgICAgZi5fZXh0ZW5zaW9uID0gZmlsZUV4dGVuc2lvbihmLnBhdGgpO1xuICAgICAgICBmLl9iYXNlbmFtZSA9IG5vZGVfcGF0aC5iYXNlbmFtZShmLnBhdGgpO1xuICAgICAgICBmLl9kaXJuYW1lID0gbm9kZV9wYXRoLmRpcm5hbWUoZi5wYXRoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIF9iYXNlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Jhc2VuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBmaWxlIF9uYW1lLlxuICAgICAqIEBwYXJhbSBmaWxlbmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2Jhc2VuYW1lID0gZmlsZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIF9uYW1lIG9mIHRoZSBqb2Igd2l0aG91dCB0aGUgZmlsZSBleHRlbnNpb24uXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5hbWVQcm9wZXIoKSB7XG4gICAgICAgIHJldHVybiBub2RlX3BhdGguYmFzZW5hbWUodGhpcy5iYXNlbmFtZSwgbm9kZV9wYXRoLmV4dG5hbWUodGhpcy5iYXNlbmFtZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdG9wIGxldmVsIGRpcmVjdG9yeSBfbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZGlybmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpcm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjb21wbGV0ZSBkaXJlY3RvcnkgX3BhdGguXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHBhdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXRoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgY29tcGxldGUgZGlyZWN0b3J5IF9wYXRoLlxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgcHVibGljIHNldCBwYXRoKHBhdGg6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9wYXRoID0gcGF0aDtcbiAgICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjb250ZW50LXR5cGUgb2YgdGhlIGZpbGUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGNvbnRlbnRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29udGVudFR5cGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIGV4dGVuc2lvbi5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZXh0ZW5zaW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXh0ZW5zaW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgX2Jhc2VuYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBiYXNlbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Jhc2VuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmFtZXMgdGhlIGxvY2FsIGpvYiBmaWxlIHRvIHRoZSBjdXJyZW50IF9uYW1lLlxuICAgICAqL1xuICAgIHB1YmxpYyByZW5hbWVMb2NhbCgpIHtcbiAgICAgICAgbGV0IGYgPSB0aGlzO1xuICAgICAgICBsZXQgbmV3X3BhdGggPSBmLmRpcm5hbWUgKyBub2RlX3BhdGguc2VwICsgZi5uYW1lO1xuICAgICAgICBmcy5yZW5hbWVTeW5jKGYucGF0aCwgbmV3X3BhdGgpO1xuICAgICAgICBmLnBhdGggPSBuZXdfcGF0aDtcbiAgICAgICAgZi5nZXRTdGF0aXN0aWNzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgbG9jYWwgZmlsZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3ZlTG9jYWwoKSB7XG4gICAgICAgIGxldCBmID0gdGhpcztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnVubGlua1N5bmMoZi5wYXRoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBmLmUubG9nKDMsIGBGaWxlIFwiJHtmLnBhdGh9XCIgY291bGQgbm90IGJlIGRlbGV0ZWQuICR7ZX1gLCBmKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxufSJdfQ==
