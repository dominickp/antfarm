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
            var fj = this;
            fj.e.log(0, "New path set: \"" + path + "\".", fj);
            fj.file.path = path;
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
     *
     * @param destinationNest       The nest object the job will be sent to.
     *
     * @param callback              The callback provides the updated instance of the job. Depending on the nest it was sent to, it may have been cast to a new job type. This is helpful in case you need the remote path to the job once it has been uploaded to S3, for example.
     *
     * #### Example
     * ```js
     * tunnel.run((job, nest) => {
     *      console.log("Found job " + job.name);
     *      job.move(my_s3_bucket, (s3_job) => {
     *          // Uploaded
     *          console.log("Uploaded to " + s3_job.path); // https://mybucket.s3.amazonaws.com/myfile.pdf
     *      });
     * });
     * ```
     */
    FileJob.prototype.move = function (destinationNest, callback) {
        var fj = this;
        var theNewJob = null;
        try {
            destinationNest.take(fj, function (newJob) {
                fj.e.log(1, "Job \"" + fj.basename + "\" was moved to Nest \"" + destinationNest.name + "\".", fj, [fj.tunnel]);
                theNewJob = newJob;
            });
        }
        catch (e) {
            fj.e.log(3, "Job \"" + fj.basename + "\" was not moved to Nest \"" + destinationNest.name + "\". " + e, fj);
        }
        if (callback) {
            callback(theNewJob);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUQsQ0EvS0EsQUErS0MsQ0EvSzRCLFNBQUcsR0ErSy9CO0FBL0tZLGVBQU8sVUErS25CLENBQUEiLCJmaWxlIjoibGliL2pvYi9maWxlSm9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0pvYn0gZnJvbSBcIi4vam9iXCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcbmltcG9ydCB7TmVzdH0gZnJvbSBcIi4uL25lc3QvbmVzdFwiO1xuXG5leHBvcnQgY2xhc3MgRmlsZUpvYiBleHRlbmRzIEpvYiB7XG5cbiAgICBwcm90ZWN0ZWQgX2ZpbGU6IEZpbGU7XG5cbiAgICAvKipcbiAgICAgKiBGaWxlSm9iIGNvbnN0cnVjdG9yLlxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKGUsIHBhdGgpO1xuICAgICAgICB0aGlzLl90eXBlID0gXCJmaWxlXCI7XG4gICAgICAgIHRoaXMuX2ZpbGUgPSBuZXcgRmlsZShlLCBwYXRoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHtGaWxlfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIF9uYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLm5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIF9uYW1lIHByb3Blci5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbmFtZVByb3BlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5uYW1lUHJvcGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBkaXJlY3RvcnkgX25hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGRpcm5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuZGlybmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgX3BhdGguXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHBhdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUucGF0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBuZXcgZmlsZSBfcGF0aC5cbiAgICAgKiBAcGFyYW0gcGF0aFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgcGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGZqID0gdGhpcztcbiAgICAgICAgZmouZS5sb2coMCwgYE5ldyBwYXRoIHNldDogXCIke3BhdGh9XCIuYCwgZmopO1xuICAgICAgICBmai5maWxlLnBhdGggPSBwYXRoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBmaWxlIF9uYW1lLlxuICAgICAqIEBwYXJhbSBmaWxlbmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgbmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlTGlmZUV2ZW50KFwic2V0IG5hbWVcIiwgdGhpcy5uYW1lLCBmaWxlbmFtZSk7XG4gICAgICAgIHRoaXMuZmlsZS5uYW1lID0gZmlsZW5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIGNvbnRlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgY29udGVudFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuY29udGVudFR5cGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIGV4dGVuc2lvbi5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZXh0ZW5zaW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmV4dGVuc2lvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgX2Jhc2VuYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldCBiYXNlbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5iYXNlbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgYSBmb2xkZXIuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzRm9sZGVyKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGEgZmlsZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNGaWxlKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNb3ZlcyBhIGZpbGUgdG8gYSBuZXN0LiBUaGlzIGlzIGFuIGFzeW5jaHJvbm91cyBtZXRob2Qgd2hpY2ggcHJvdmlkZXMgYSBjYWxsYmFjayBvbiBjb21wbGV0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGRlc3RpbmF0aW9uTmVzdCAgICAgICBUaGUgbmVzdCBvYmplY3QgdGhlIGpvYiB3aWxsIGJlIHNlbnQgdG8uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgICAgICAgICAgICAgIFRoZSBjYWxsYmFjayBwcm92aWRlcyB0aGUgdXBkYXRlZCBpbnN0YW5jZSBvZiB0aGUgam9iLiBEZXBlbmRpbmcgb24gdGhlIG5lc3QgaXQgd2FzIHNlbnQgdG8sIGl0IG1heSBoYXZlIGJlZW4gY2FzdCB0byBhIG5ldyBqb2IgdHlwZS4gVGhpcyBpcyBoZWxwZnVsIGluIGNhc2UgeW91IG5lZWQgdGhlIHJlbW90ZSBwYXRoIHRvIHRoZSBqb2Igb25jZSBpdCBoYXMgYmVlbiB1cGxvYWRlZCB0byBTMywgZm9yIGV4YW1wbGUuXG4gICAgICpcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIHR1bm5lbC5ydW4oKGpvYiwgbmVzdCkgPT4ge1xuICAgICAqICAgICAgY29uc29sZS5sb2coXCJGb3VuZCBqb2IgXCIgKyBqb2IubmFtZSk7XG4gICAgICogICAgICBqb2IubW92ZShteV9zM19idWNrZXQsIChzM19qb2IpID0+IHtcbiAgICAgKiAgICAgICAgICAvLyBVcGxvYWRlZFxuICAgICAqICAgICAgICAgIGNvbnNvbGUubG9nKFwiVXBsb2FkZWQgdG8gXCIgKyBzM19qb2IucGF0aCk7IC8vIGh0dHBzOi8vbXlidWNrZXQuczMuYW1hem9uYXdzLmNvbS9teWZpbGUucGRmXG4gICAgICogICAgICB9KTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZShkZXN0aW5hdGlvbk5lc3Q6IE5lc3QsIGNhbGxiYWNrOiAoam9iOiBKb2IpID0+IHZvaWQpOiB2b2lkIHtcbiAgICAgICAgbGV0IGZqID0gdGhpcztcbiAgICAgICAgbGV0IHRoZU5ld0pvYiA9IG51bGw7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uTmVzdC50YWtlKGZqLCAobmV3Sm9iKSA9PiB7XG4gICAgICAgICAgICAgICAgZmouZS5sb2coMSwgYEpvYiBcIiR7ZmouYmFzZW5hbWV9XCIgd2FzIG1vdmVkIHRvIE5lc3QgXCIke2Rlc3RpbmF0aW9uTmVzdC5uYW1lfVwiLmAsIGZqLCBbZmoudHVubmVsXSk7XG4gICAgICAgICAgICAgICAgdGhlTmV3Sm9iID0gbmV3Sm9iO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGZqLmUubG9nKDMsIGBKb2IgXCIke2ZqLmJhc2VuYW1lfVwiIHdhcyBub3QgbW92ZWQgdG8gTmVzdCBcIiR7ZGVzdGluYXRpb25OZXN0Lm5hbWV9XCIuICR7ZX1gLCBmaik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayh0aGVOZXdKb2IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVuYW1lIHRoZSBqb2IgZmlsZSB0byBhIG5ldyBfbmFtZS5cbiAgICAgKiBAcGFyYW0gbmV3TmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyByZW5hbWUobmV3TmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBmaiA9IHRoaXM7XG4gICAgICAgIGxldCBmaWxlID0gdGhpcy5maWxlO1xuICAgICAgICBmaWxlLm5hbWUgPSBuZXdOYW1lO1xuICAgICAgICBmaWxlLnJlbmFtZUxvY2FsKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgbG9jYWwgZmlsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3ZlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLnJlbW92ZUxvY2FsKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLnNpemU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzaXplQnl0ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuc2l6ZUJ5dGVzO1xuICAgIH1cblxufSJdfQ==
