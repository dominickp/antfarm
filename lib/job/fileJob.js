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
        this._type = "file";
        this._file = new file_1.File(e, path);
    }
    Object.defineProperty(FileJob.prototype, "file", {
        /**
         * Get the file object.
         * @returns {File}
         */
        get: function () {
            return this._file;
        },
        enumerable: true,
        configurable: true
    });
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
            this.createLifeEvent("set name", this.name, filename);
            this.file.name = filename;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FileJob.prototype, "nameProper", {
        /**
         * Get the file _name proper.
         * @returns {string}
         */
        get: function () {
            return this.file.nameProper;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FileJob.prototype, "dirname", {
        /**
         * Get the file directory _name.
         * @returns {string}
         */
        get: function () {
            return this.file.dirname;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FileJob.prototype, "path", {
        /**
         * Get the file _path.
         * @returns {string}
         */
        get: function () {
            return this.file.path;
        },
        /**
         * Set a new file _path.
         * @param path
         */
        set: function (path) {
            this.e.log(0, "New path set: \"" + path + "\".", this);
            this.file.path = path;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FileJob.prototype, "contentType", {
        /**
         * Get the file content type.
         * @returns {string}
         */
        get: function () {
            return this.file.contentType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FileJob.prototype, "extension", {
        /**
         * Get the file extension.
         * @returns {string}
         */
        get: function () {
            return this.file.extension;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FileJob.prototype, "basename", {
        /**
         * Get the file _basename.
         * @returns {string}
         */
        get: function () {
            return this.file.basename;
        },
        enumerable: true,
        configurable: true
    });
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
     * @param callback              The callback provides the updated instance of the job. Depending on the nest it was sent to, it may have been cast to a new job type. This is helpful in case you need the remote _path to the job once it has been uploaded to S3, for example.
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
                fj.e.log(1, "Job \"" + fj.basename + "\" was moved to Nest \"" + destinationNest.name + "\".", fj, [fj.tunnel]);
                if (callback) {
                    callback(newJob);
                }
            });
        }
        catch (e) {
            fj.e.log(3, "Job \"" + fj.basename + "\" was not moved to Nest \"" + destinationNest.name + "\". " + e, fj);
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
        var file = this.file;
        file.name = newName;
        file.renameLocal();
    };
    /**
     * Deletes the local file.
     */
    FileJob.prototype.remove = function () {
        return this.file.removeLocal();
    };
    Object.defineProperty(FileJob.prototype, "size", {
        get: function () {
            return this.file.size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FileJob.prototype, "sizeBytes", {
        get: function () {
            return this.file.sizeBytes;
        },
        enumerable: true,
        configurable: true
    });
    return FileJob;
}(job_1.Job));
exports.FileJob = FileJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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S0EsQUE4S0MsQ0E5SzRCLFNBQUcsR0E4Sy9CO0FBOUtZLGVBQU8sVUE4S25CLENBQUEiLCJmaWxlIjoibGliL2pvYi9maWxlSm9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0pvYn0gZnJvbSBcIi4vam9iXCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcblxuZXhwb3J0IGNsYXNzIEZpbGVKb2IgZXh0ZW5kcyBKb2Ige1xuXG4gICAgcHJvdGVjdGVkIF9maWxlOiBGaWxlO1xuXG4gICAgLyoqXG4gICAgICogRmlsZUpvYiBjb25zdHJ1Y3Rvci5cbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHBhdGg6IHN0cmluZykge1xuICAgICAgICBzdXBlcihlLCBwYXRoKTtcbiAgICAgICAgdGhpcy5fdHlwZSA9IFwiZmlsZVwiO1xuICAgICAgICB0aGlzLl9maWxlID0gbmV3IEZpbGUoZSwgcGF0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIG9iamVjdC5cbiAgICAgKiBAcmV0dXJucyB7RmlsZX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGZpbGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maWxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBfbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBfbmFtZSBwcm9wZXIuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG5hbWVQcm9wZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUubmFtZVByb3BlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgZGlyZWN0b3J5IF9uYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBkaXJuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmRpcm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIF9wYXRoLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBwYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLnBhdGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgbmV3IGZpbGUgX3BhdGguXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHBhdGgocGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZS5sb2coMCwgYE5ldyBwYXRoIHNldDogXCIke3BhdGh9XCIuYCwgdGhpcyk7XG4gICAgICAgIHRoaXMuZmlsZS5wYXRoID0gcGF0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBuZXcgZmlsZSBfbmFtZS5cbiAgICAgKiBAcGFyYW0gZmlsZW5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IG5hbWUoZmlsZW5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNyZWF0ZUxpZmVFdmVudChcInNldCBuYW1lXCIsIHRoaXMubmFtZSwgZmlsZW5hbWUpO1xuICAgICAgICB0aGlzLmZpbGUubmFtZSA9IGZpbGVuYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBjb250ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGNvbnRlbnRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmNvbnRlbnRUeXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBleHRlbnNpb24uXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGV4dGVuc2lvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5leHRlbnNpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIF9iYXNlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgYmFzZW5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuYmFzZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGEgZm9sZGVyLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHB1YmxpYyBpc0ZvbGRlcigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGpvYiBpcyBhIGZpbGUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTW92ZXMgYSBmaWxlIHRvIGEgbmVzdC4gVGhpcyBpcyBhbiBhc3luY2hyb25vdXMgbWV0aG9kIHdoaWNoIHByb3ZpZGVzIGEgY2FsbGJhY2sgb24gY29tcGxldGlvbi5cbiAgICAgKiBAcGFyYW0gZGVzdGluYXRpb25OZXN0ICAgICAgIFRoZSBuZXN0IG9iamVjdCB0aGUgam9iIHdpbGwgYmUgc2VudCB0by5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgICAgICAgICAgICAgIFRoZSBjYWxsYmFjayBwcm92aWRlcyB0aGUgdXBkYXRlZCBpbnN0YW5jZSBvZiB0aGUgam9iLiBEZXBlbmRpbmcgb24gdGhlIG5lc3QgaXQgd2FzIHNlbnQgdG8sIGl0IG1heSBoYXZlIGJlZW4gY2FzdCB0byBhIG5ldyBqb2IgdHlwZS4gVGhpcyBpcyBoZWxwZnVsIGluIGNhc2UgeW91IG5lZWQgdGhlIHJlbW90ZSBfcGF0aCB0byB0aGUgam9iIG9uY2UgaXQgaGFzIGJlZW4gdXBsb2FkZWQgdG8gUzMsIGZvciBleGFtcGxlLlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogdHVubmVsLnJ1bigoam9iLCBuZXN0KSA9PiB7XG4gICAgICogICAgICBjb25zb2xlLmxvZyhcIkZvdW5kIGpvYiBcIiArIGpvYi5nZXROYW1lKCkpO1xuICAgICAqICAgICAgam9iLm1vdmUobXlfczNfYnVja2V0LCAoczNfam9iKSA9PiB7XG4gICAgICogICAgICAgICAgLy8gVXBsb2FkZWRcbiAgICAgKiAgICAgICAgICBjb25zb2xlLmxvZyhcIlVwbG9hZGVkIHRvIFwiICsgczNfam9iLmdldFBhdGgoKSk7XG4gICAgICogICAgICB9KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZShkZXN0aW5hdGlvbk5lc3QsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgbGV0IGZqID0gdGhpcztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGVzdGluYXRpb25OZXN0LnRha2UoZmosIGZ1bmN0aW9uKG5ld0pvYil7XG4gICAgICAgICAgICAgICAgLy8gZmouc2V0UGF0aChuZXdfcGF0aCk7XG4gICAgICAgICAgICAgICAgZmouZS5sb2coMSwgYEpvYiBcIiR7ZmouYmFzZW5hbWV9XCIgd2FzIG1vdmVkIHRvIE5lc3QgXCIke2Rlc3RpbmF0aW9uTmVzdC5uYW1lfVwiLmAsIGZqLCBbZmoudHVubmVsXSk7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ld0pvYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGZqLmUubG9nKDMsIGBKb2IgXCIke2ZqLmJhc2VuYW1lfVwiIHdhcyBub3QgbW92ZWQgdG8gTmVzdCBcIiR7ZGVzdGluYXRpb25OZXN0Lm5hbWV9XCIuICR7ZX1gLCBmaik7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVuYW1lIHRoZSBqb2IgZmlsZSB0byBhIG5ldyBfbmFtZS5cbiAgICAgKiBAcGFyYW0gbmV3TmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyByZW5hbWUobmV3TmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBmaiA9IHRoaXM7XG4gICAgICAgIGxldCBmaWxlID0gdGhpcy5maWxlO1xuICAgICAgICBmaWxlLm5hbWUgPSBuZXdOYW1lO1xuICAgICAgICBmaWxlLnJlbmFtZUxvY2FsKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgbG9jYWwgZmlsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3ZlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLnJlbW92ZUxvY2FsKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLnNpemU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzaXplQnl0ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuc2l6ZUJ5dGVzO1xuICAgIH1cblxufSJdfQ==
