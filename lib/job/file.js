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
    Object.defineProperty(File.prototype, "name", {
        /**
         * Get the basename.
         * @returns {string}
         */
        get: function () {
            return this.basename;
        },
        /**
         * Set a new file _name.
         * @param filename
         */
        set: function (filename) {
            this.basename = filename;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the file _name of the job without the file extension.
     * @returns {string}
     */
    File.prototype.getNameProper = function () {
        return node_path.basename(this.getBasename(), node_path.extname(this.getBasename()));
    };
    /**
     * Get the top level directory _name.
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
     * Renames the local job file to the current _name.
     */
    File.prototype.renameLocal = function () {
        var f = this;
        var new_path = f.getDirname() + node_path.sep + f.name;
        fs.renameSync(f.getPath(), new_path);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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USxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7O09BR0c7SUFDSSwwQkFBVyxHQUFsQjtRQUNJLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNiLElBQUksQ0FBQztZQUNELEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFFO1FBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxZQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsaUNBQTJCLENBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRSxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7SUFDTCxDQUFDO0lBRUwsV0FBQztBQUFELENBcklBLEFBcUlDLElBQUE7QUFySVksWUFBSSxPQXFJaEIsQ0FBQSIsImZpbGUiOiJsaWIvam9iL2ZpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcblxuY29uc3QgICBtaW1lID0gcmVxdWlyZShcIm1pbWUtdHlwZXNcIiksXG4gICAgICAgIGZpbGVFeHRlbnNpb24gPSByZXF1aXJlKFwiZmlsZS1leHRlbnNpb25cIiksXG4gICAgICAgIG5vZGVfcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxuICAgICAgICBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcblxuZXhwb3J0IGNsYXNzIEZpbGUge1xuXG4gICAgcHJvdGVjdGVkIHBhdGg6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgZGlybmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBiYXNlbmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBjb250ZW50VHlwZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBleHRlbnNpb246IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBGaWxlIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIGVcbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5lID0gZTtcbiAgICAgICAgdGhpcy5wYXRoID0gcGF0aDtcblxuICAgICAgICAvLyB2ZXJpZnkgcGF0aCBsZWFkcyB0byBhIHZhbGlkLCByZWFkYWJsZSBmaWxlLCBoYW5kbGUgZXJyb3IgaWYgbm90XG5cbiAgICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmcmVzaCB0aGUgZmlsZSBzdGF0aXN0aWNzIGFmdGVyIGEgcmVuYW1lIG9yIG1vZGlmaWNhdGlvbi5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0U3RhdGlzdGljcygpIHtcbiAgICAgICAgbGV0IGYgPSB0aGlzO1xuICAgICAgICBmLmNvbnRlbnRUeXBlID0gbWltZS5sb29rdXAoZi5nZXRQYXRoKCkpO1xuICAgICAgICBmLmV4dGVuc2lvbiA9IGZpbGVFeHRlbnNpb24oZi5nZXRQYXRoKCkpO1xuICAgICAgICBmLmJhc2VuYW1lID0gbm9kZV9wYXRoLmJhc2VuYW1lKGYuZ2V0UGF0aCgpKTtcbiAgICAgICAgZi5kaXJuYW1lID0gbm9kZV9wYXRoLmRpcm5hbWUoZi5nZXRQYXRoKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYmFzZW5hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhc2VuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBmaWxlIF9uYW1lLlxuICAgICAqIEBwYXJhbSBmaWxlbmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYmFzZW5hbWUgPSBmaWxlbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgX25hbWUgb2YgdGhlIGpvYiB3aXRob3V0IHRoZSBmaWxlIGV4dGVuc2lvbi5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROYW1lUHJvcGVyKCkge1xuICAgICAgICByZXR1cm4gbm9kZV9wYXRoLmJhc2VuYW1lKHRoaXMuZ2V0QmFzZW5hbWUoKSwgbm9kZV9wYXRoLmV4dG5hbWUodGhpcy5nZXRCYXNlbmFtZSgpKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB0b3AgbGV2ZWwgZGlyZWN0b3J5IF9uYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldERpcm5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpcm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjb21wbGV0ZSBkaXJlY3RvcnkgcGF0aC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgY29tcGxldGUgZGlyZWN0b3J5IHBhdGguXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjb250ZW50LXR5cGUgb2YgdGhlIGZpbGUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q29udGVudFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnRUeXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBleHRlbnNpb24uXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RXh0ZW5zaW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlbnNpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBiYXNlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRCYXNlbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVuYW1lcyB0aGUgbG9jYWwgam9iIGZpbGUgdG8gdGhlIGN1cnJlbnQgX25hbWUuXG4gICAgICovXG4gICAgcHVibGljIHJlbmFtZUxvY2FsKCkge1xuICAgICAgICBsZXQgZiA9IHRoaXM7XG4gICAgICAgIGxldCBuZXdfcGF0aCA9IGYuZ2V0RGlybmFtZSgpICsgbm9kZV9wYXRoLnNlcCArIGYubmFtZTtcbiAgICAgICAgZnMucmVuYW1lU3luYyhmLmdldFBhdGgoKSwgbmV3X3BhdGgpO1xuICAgICAgICBmLnNldFBhdGgobmV3X3BhdGgpO1xuICAgICAgICBmLmdldFN0YXRpc3RpY3MoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIHRoZSBsb2NhbCBmaWxlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHB1YmxpYyByZW1vdmVMb2NhbCgpIHtcbiAgICAgICAgbGV0IGYgPSB0aGlzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMudW5saW5rU3luYyhmLmdldFBhdGgoKSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZi5lLmxvZygzLCBgRmlsZSBcIiR7Zi5nZXRQYXRoKCl9XCIgY291bGQgbm90IGJlIGRlbGV0ZWQuICR7ZX1gLCBmKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxufSJdfQ==
