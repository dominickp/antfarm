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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFRLENBQUMsQ0FBQztRQUNwQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLDBCQUFXLEdBQWxCO1FBQ0ksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2IsSUFBSSxDQUFDO1lBQ0QsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFlBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxpQ0FBMkIsQ0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7SUFFTCxXQUFDO0FBQUQsQ0FySUEsQUFxSUMsSUFBQTtBQXJJWSxZQUFJLE9BcUloQixDQUFBIiwiZmlsZSI6ImxpYi9qb2IvZmlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuXG5jb25zdCAgIG1pbWUgPSByZXF1aXJlKFwibWltZS10eXBlc1wiKSxcbiAgICAgICAgZmlsZUV4dGVuc2lvbiA9IHJlcXVpcmUoXCJmaWxlLWV4dGVuc2lvblwiKSxcbiAgICAgICAgbm9kZV9wYXRoID0gcmVxdWlyZShcInBhdGhcIiksXG4gICAgICAgIGZzID0gcmVxdWlyZShcImZzXCIpO1xuXG5leHBvcnQgY2xhc3MgRmlsZSB7XG5cbiAgICBwcm90ZWN0ZWQgcGF0aDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBkaXJuYW1lOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGJhc2VuYW1lOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGNvbnRlbnRUeXBlOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGV4dGVuc2lvbjogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcblxuICAgIC8qKlxuICAgICAqIEZpbGUgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHBhdGg6IHN0cmluZykge1xuICAgICAgICB0aGlzLmUgPSBlO1xuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xuXG4gICAgICAgIC8vIHZlcmlmeSBwYXRoIGxlYWRzIHRvIGEgdmFsaWQsIHJlYWRhYmxlIGZpbGUsIGhhbmRsZSBlcnJvciBpZiBub3RcblxuICAgICAgICB0aGlzLmdldFN0YXRpc3RpY3MoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWZyZXNoIHRoZSBmaWxlIHN0YXRpc3RpY3MgYWZ0ZXIgYSByZW5hbWUgb3IgbW9kaWZpY2F0aW9uLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRTdGF0aXN0aWNzKCkge1xuICAgICAgICBsZXQgZiA9IHRoaXM7XG4gICAgICAgIGYuY29udGVudFR5cGUgPSBtaW1lLmxvb2t1cChmLmdldFBhdGgoKSk7XG4gICAgICAgIGYuZXh0ZW5zaW9uID0gZmlsZUV4dGVuc2lvbihmLmdldFBhdGgoKSk7XG4gICAgICAgIGYuYmFzZW5hbWUgPSBub2RlX3BhdGguYmFzZW5hbWUoZi5nZXRQYXRoKCkpO1xuICAgICAgICBmLmRpcm5hbWUgPSBub2RlX3BhdGguZGlybmFtZShmLmdldFBhdGgoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBiYXNlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5iYXNlbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBuZXcgZmlsZSBuYW1lLlxuICAgICAqIEBwYXJhbSBmaWxlbmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXROYW1lKGZpbGVuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5iYXNlbmFtZSA9IGZpbGVuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBuYW1lIG9mIHRoZSBqb2Igd2l0aG91dCB0aGUgZmlsZSBleHRlbnNpb24uXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TmFtZVByb3BlcigpIHtcbiAgICAgICAgcmV0dXJuIG5vZGVfcGF0aC5iYXNlbmFtZSh0aGlzLmdldEJhc2VuYW1lKCksIG5vZGVfcGF0aC5leHRuYW1lKHRoaXMuZ2V0QmFzZW5hbWUoKSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdG9wIGxldmVsIGRpcmVjdG9yeSBuYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldERpcm5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpcm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjb21wbGV0ZSBkaXJlY3RvcnkgcGF0aC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgY29tcGxldGUgZGlyZWN0b3J5IHBhdGguXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgICAgdGhpcy5nZXRTdGF0aXN0aWNzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjb250ZW50LXR5cGUgb2YgdGhlIGZpbGUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q29udGVudFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnRUeXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBleHRlbnNpb24uXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RXh0ZW5zaW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlbnNpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBiYXNlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRCYXNlbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVuYW1lcyB0aGUgbG9jYWwgam9iIGZpbGUgdG8gdGhlIGN1cnJlbnQgbmFtZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVuYW1lTG9jYWwoKSB7XG4gICAgICAgIGxldCBmID0gdGhpcztcbiAgICAgICAgbGV0IG5ld19wYXRoID0gZi5nZXREaXJuYW1lKCkgKyBub2RlX3BhdGguc2VwICsgZi5nZXROYW1lKCk7XG4gICAgICAgIGZzLnJlbmFtZVN5bmMoZi5nZXRQYXRoKCksIG5ld19wYXRoKTtcbiAgICAgICAgZi5zZXRQYXRoKG5ld19wYXRoKTtcbiAgICAgICAgZi5nZXRTdGF0aXN0aWNzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgbG9jYWwgZmlsZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3ZlTG9jYWwoKSB7XG4gICAgICAgIGxldCBmID0gdGhpcztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnVubGlua1N5bmMoZi5nZXRQYXRoKCkpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGYuZS5sb2coMywgYEZpbGUgXCIke2YuZ2V0UGF0aCgpfVwiIGNvdWxkIG5vdCBiZSBkZWxldGVkLiAke2V9YCwgZik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbn0iXX0=
