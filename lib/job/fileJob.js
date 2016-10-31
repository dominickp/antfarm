"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var job_1 = require("./job");
var file_1 = require("./file");
var FileJob = (function (_super) {
    __extends(FileJob, _super);
    /**
     * FileJob constructor.
     * @param e
     * @param path
     */
    function FileJob(e, path) {
        _super.call(this, e, path);
        this.type = "file";
        this.file = new file_1.File(e, path);
    }
    /**
     * Get the file object.
     * @returns {File}
     */
    FileJob.prototype.getFile = function () {
        return this.file;
    };
    Object.defineProperty(FileJob.prototype, "name", {
        /**
         * Get the file _name.
         * @returns {string}
         */
        get: function () {
            return this.file.name;
        },
        /**
         * Set a new file _name.
         * @param filename
         */
        set: function (filename) {
            this.createLifeEvent("set _name", this.name, filename);
            this.file.name = filename;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the file _name proper.
     * @returns {string}
     */
    FileJob.prototype.getNameProper = function () {
        return this.file.getNameProper();
    };
    /**
     * Get the file directory _name.
     * @returns {string}
     */
    FileJob.prototype.getDirname = function () {
        return this.file.getDirname();
    };
    /**
     * Get the file path.
     * @returns {string}
     */
    FileJob.prototype.getPath = function () {
        return this.file.getPath();
    };
    /**
     * Set a new file path.
     * @param path
     */
    FileJob.prototype.setPath = function (path) {
        this.e.log(0, "New path set: \"" + path + "\".", this);
        this.file.setPath(path);
    };
    /**
     * Get the file content type.
     * @returns {string}
     */
    FileJob.prototype.getContentType = function () {
        return this.file.getContentType();
    };
    /**
     * Get the file extension.
     * @returns {string}
     */
    FileJob.prototype.getExtension = function () {
        return this.file.getExtension();
    };
    /**
     * Get the file basename.
     * @returns {string}
     */
    FileJob.prototype.getBasename = function () {
        return this.file.getBasename();
    };
    /**
     * Check if job is a folder.
     * @returns {boolean}
     */
    FileJob.prototype.isFolder = function () {
        return false;
    };
    /**
     * Check if job is a file.
     * @returns {boolean}
     */
    FileJob.prototype.isFile = function () {
        return true;
    };
    /**
     * Moves a file to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest       The nest object the job will be sent to.
     * @param callback              The callback provides the updated instance of the job. Depending on the nest it was sent to, it may have been cast to a new job type. This is helpful in case you need the remote path to the job once it has been uploaded to S3, for example.
     * #### Example
     * ```js
     * tunnel.run((job, nest) => {
     *      console.log("Found job " + job.getName());
     *      job.move(my_s3_bucket, (s3_job) => {
     *          // Uploaded
     *          console.log("Uploaded to " + s3_job.getPath());
     *      });
     * });
     * ```
     */
    FileJob.prototype.move = function (destinationNest, callback) {
        var fj = this;
        try {
            destinationNest.take(fj, function (newJob) {
                // fj.setPath(new_path);
                fj.e.log(1, "Job \"" + fj.getBasename() + "\" was moved to Nest \"" + destinationNest.name + "\".", fj, [fj.tunnel]);
                if (callback) {
                    callback(newJob);
                }
            });
        }
        catch (e) {
            fj.e.log(3, "Job \"" + fj.getBasename() + "\" was not moved to Nest \"" + destinationNest.name + "\". " + e, fj);
            if (callback) {
                callback();
            }
        }
    };
    /**
     * Rename the job file to a new _name.
     * @param newName
     */
    FileJob.prototype.rename = function (newName) {
        var fj = this;
        var file = this.getFile();
        file.name = newName;
        file.renameLocal();
    };
    /**
     * Deletes the local file.
     */
    FileJob.prototype.remove = function () {
        return this.file.removeLocal();
    };
    return FileJob;
}(job_1.Job));
exports.FileJob = FileJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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RUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZHLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ1gsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNyQixDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFFO1FBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNULEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFRLEVBQUUsQ0FBQyxXQUFXLEVBQUUsbUNBQTRCLGVBQWUsQ0FBQyxJQUFJLFlBQU0sQ0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25HLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7WUFDZixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSSx3QkFBTSxHQUFiLFVBQWMsT0FBZTtRQUN6QixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7UUFDcEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7T0FFRztJQUNJLHdCQUFNLEdBQWI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRUwsY0FBQztBQUFELENBdEtBLEFBc0tDLENBdEs0QixTQUFHLEdBc0svQjtBQXRLWSxlQUFPLFVBc0tuQixDQUFBIiwiZmlsZSI6ImxpYi9qb2IvZmlsZUpvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtKb2J9IGZyb20gXCIuL2pvYlwiO1xuaW1wb3J0IHtGaWxlfSBmcm9tIFwiLi9maWxlXCI7XG5cbmV4cG9ydCBjbGFzcyBGaWxlSm9iIGV4dGVuZHMgSm9iIHtcblxuICAgIHByb3RlY3RlZCBmaWxlOiBGaWxlO1xuXG4gICAgLyoqXG4gICAgICogRmlsZUpvYiBjb25zdHJ1Y3Rvci5cbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHBhdGg6IHN0cmluZykge1xuICAgICAgICBzdXBlcihlLCBwYXRoKTtcbiAgICAgICAgdGhpcy50eXBlID0gXCJmaWxlXCI7XG4gICAgICAgIHRoaXMuZmlsZSA9IG5ldyBGaWxlKGUsIHBhdGgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBvYmplY3QuXG4gICAgICogQHJldHVybnMge0ZpbGV9XG4gICAgICovXG4gICAgcHVibGljIGdldEZpbGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIF9uYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIF9uYW1lIHByb3Blci5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROYW1lUHJvcGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmdldE5hbWVQcm9wZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgZGlyZWN0b3J5IF9uYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldERpcm5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0RGlybmFtZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBwYXRoLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldFBhdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0UGF0aCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBmaWxlIHBhdGguXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5lLmxvZygwLCBgTmV3IHBhdGggc2V0OiBcIiR7cGF0aH1cIi5gLCB0aGlzKTtcbiAgICAgICAgdGhpcy5maWxlLnNldFBhdGgocGF0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgbmV3IGZpbGUgX25hbWUuXG4gICAgICogQHBhcmFtIGZpbGVuYW1lXG4gICAgICovXG4gICAgcHVibGljIHNldCBuYW1lKGZpbGVuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5jcmVhdGVMaWZlRXZlbnQoXCJzZXQgX25hbWVcIiwgdGhpcy5uYW1lLCBmaWxlbmFtZSk7XG4gICAgICAgIHRoaXMuZmlsZS5uYW1lID0gZmlsZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIGNvbnRlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRDb250ZW50VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5nZXRDb250ZW50VHlwZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBleHRlbnNpb24uXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RXh0ZW5zaW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmdldEV4dGVuc2lvbigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBiYXNlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRCYXNlbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5nZXRCYXNlbmFtZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGpvYiBpcyBhIGZvbGRlci5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNGb2xkZXIoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgYSBmaWxlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHB1YmxpYyBpc0ZpbGUoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1vdmVzIGEgZmlsZSB0byBhIG5lc3QuIFRoaXMgaXMgYW4gYXN5bmNocm9ub3VzIG1ldGhvZCB3aGljaCBwcm92aWRlcyBhIGNhbGxiYWNrIG9uIGNvbXBsZXRpb24uXG4gICAgICogQHBhcmFtIGRlc3RpbmF0aW9uTmVzdCAgICAgICBUaGUgbmVzdCBvYmplY3QgdGhlIGpvYiB3aWxsIGJlIHNlbnQgdG8uXG4gICAgICogQHBhcmFtIGNhbGxiYWNrICAgICAgICAgICAgICBUaGUgY2FsbGJhY2sgcHJvdmlkZXMgdGhlIHVwZGF0ZWQgaW5zdGFuY2Ugb2YgdGhlIGpvYi4gRGVwZW5kaW5nIG9uIHRoZSBuZXN0IGl0IHdhcyBzZW50IHRvLCBpdCBtYXkgaGF2ZSBiZWVuIGNhc3QgdG8gYSBuZXcgam9iIHR5cGUuIFRoaXMgaXMgaGVscGZ1bCBpbiBjYXNlIHlvdSBuZWVkIHRoZSByZW1vdGUgcGF0aCB0byB0aGUgam9iIG9uY2UgaXQgaGFzIGJlZW4gdXBsb2FkZWQgdG8gUzMsIGZvciBleGFtcGxlLlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogdHVubmVsLnJ1bigoam9iLCBuZXN0KSA9PiB7XG4gICAgICogICAgICBjb25zb2xlLmxvZyhcIkZvdW5kIGpvYiBcIiArIGpvYi5nZXROYW1lKCkpO1xuICAgICAqICAgICAgam9iLm1vdmUobXlfczNfYnVja2V0LCAoczNfam9iKSA9PiB7XG4gICAgICogICAgICAgICAgLy8gVXBsb2FkZWRcbiAgICAgKiAgICAgICAgICBjb25zb2xlLmxvZyhcIlVwbG9hZGVkIHRvIFwiICsgczNfam9iLmdldFBhdGgoKSk7XG4gICAgICogICAgICB9KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZShkZXN0aW5hdGlvbk5lc3QsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgbGV0IGZqID0gdGhpcztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGVzdGluYXRpb25OZXN0LnRha2UoZmosIGZ1bmN0aW9uKG5ld0pvYil7XG4gICAgICAgICAgICAgICAgLy8gZmouc2V0UGF0aChuZXdfcGF0aCk7XG4gICAgICAgICAgICAgICAgZmouZS5sb2coMSwgYEpvYiBcIiR7ZmouZ2V0QmFzZW5hbWUoKX1cIiB3YXMgbW92ZWQgdG8gTmVzdCBcIiR7ZGVzdGluYXRpb25OZXN0Lm5hbWV9XCIuYCwgZmosIFtmai50dW5uZWxdKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobmV3Sm9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZmouZS5sb2coMywgYEpvYiBcIiR7ZmouZ2V0QmFzZW5hbWUoKX1cIiB3YXMgbm90IG1vdmVkIHRvIE5lc3QgXCIke2Rlc3RpbmF0aW9uTmVzdC5uYW1lfVwiLiAke2V9YCwgZmopO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmFtZSB0aGUgam9iIGZpbGUgdG8gYSBuZXcgX25hbWUuXG4gICAgICogQHBhcmFtIG5ld05hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVuYW1lKG5ld05hbWU6IHN0cmluZykge1xuICAgICAgICBsZXQgZmogPSB0aGlzO1xuICAgICAgICBsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZSgpO1xuICAgICAgICBmaWxlLm5hbWUgPSBuZXdOYW1lO1xuICAgICAgICBmaWxlLnJlbmFtZUxvY2FsKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgbG9jYWwgZmlsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3ZlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLnJlbW92ZUxvY2FsKCk7XG4gICAgfVxuXG59Il19
