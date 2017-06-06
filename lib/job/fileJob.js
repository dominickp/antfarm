"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
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
        var _this = _super.call(this, e, path) || this;
        _this._type = "file";
        _this._file = new file_1.File(e, path);
        return _this;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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L0s0QixTQUFHLEdBK0svQjtBQS9LWSwwQkFBTyIsImZpbGUiOiJsaWIvam9iL2ZpbGVKb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcclxuaW1wb3J0IHtKb2J9IGZyb20gXCIuL2pvYlwiO1xyXG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcclxuaW1wb3J0IHtOZXN0fSBmcm9tIFwiLi4vbmVzdC9uZXN0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRmlsZUpvYiBleHRlbmRzIEpvYiB7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9maWxlOiBGaWxlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlsZUpvYiBjb25zdHJ1Y3Rvci5cclxuICAgICAqIEBwYXJhbSBlXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgcGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgc3VwZXIoZSwgcGF0aCk7XHJcbiAgICAgICAgdGhpcy5fdHlwZSA9IFwiZmlsZVwiO1xyXG4gICAgICAgIHRoaXMuX2ZpbGUgPSBuZXcgRmlsZShlLCBwYXRoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgZmlsZSBvYmplY3QuXHJcbiAgICAgKiBAcmV0dXJucyB7RmlsZX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBmaWxlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9maWxlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBmaWxlIF9uYW1lLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBuYW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUubmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgZmlsZSBfbmFtZSBwcm9wZXIuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IG5hbWVQcm9wZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5uYW1lUHJvcGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBmaWxlIGRpcmVjdG9yeSBfbmFtZS5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZGlybmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmRpcm5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIGZpbGUgX3BhdGguXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHBhdGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5wYXRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGEgbmV3IGZpbGUgX3BhdGguXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0IHBhdGgocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGZqID0gdGhpcztcclxuICAgICAgICBmai5lLmxvZygwLCBgTmV3IHBhdGggc2V0OiBcIiR7cGF0aH1cIi5gLCBmaik7XHJcbiAgICAgICAgZmouZmlsZS5wYXRoID0gcGF0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBhIG5ldyBmaWxlIF9uYW1lLlxyXG4gICAgICogQHBhcmFtIGZpbGVuYW1lXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgbmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVMaWZlRXZlbnQoXCJzZXQgbmFtZVwiLCB0aGlzLm5hbWUsIGZpbGVuYW1lKTtcclxuICAgICAgICB0aGlzLmZpbGUubmFtZSA9IGZpbGVuYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBmaWxlIGNvbnRlbnQgdHlwZS5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgY29udGVudFR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5jb250ZW50VHlwZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgZmlsZSBleHRlbnNpb24uXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGV4dGVuc2lvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmV4dGVuc2lvbjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgZmlsZSBfYmFzZW5hbWUuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGJhc2VuYW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuYmFzZW5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgYSBmb2xkZXIuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGlzRm9sZGVyKCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIGpvYiBpcyBhIGZpbGUuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGlzRmlsZSgpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1vdmVzIGEgZmlsZSB0byBhIG5lc3QuIFRoaXMgaXMgYW4gYXN5bmNocm9ub3VzIG1ldGhvZCB3aGljaCBwcm92aWRlcyBhIGNhbGxiYWNrIG9uIGNvbXBsZXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRlc3RpbmF0aW9uTmVzdCAgICAgICBUaGUgbmVzdCBvYmplY3QgdGhlIGpvYiB3aWxsIGJlIHNlbnQgdG8uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrICAgICAgICAgICAgICBUaGUgY2FsbGJhY2sgcHJvdmlkZXMgdGhlIHVwZGF0ZWQgaW5zdGFuY2Ugb2YgdGhlIGpvYi4gRGVwZW5kaW5nIG9uIHRoZSBuZXN0IGl0IHdhcyBzZW50IHRvLCBpdCBtYXkgaGF2ZSBiZWVuIGNhc3QgdG8gYSBuZXcgam9iIHR5cGUuIFRoaXMgaXMgaGVscGZ1bCBpbiBjYXNlIHlvdSBuZWVkIHRoZSByZW1vdGUgcGF0aCB0byB0aGUgam9iIG9uY2UgaXQgaGFzIGJlZW4gdXBsb2FkZWQgdG8gUzMsIGZvciBleGFtcGxlLlxyXG4gICAgICpcclxuICAgICAqICMjIyMgRXhhbXBsZVxyXG4gICAgICogYGBganNcclxuICAgICAqIHR1bm5lbC5ydW4oKGpvYiwgbmVzdCkgPT4ge1xyXG4gICAgICogICAgICBjb25zb2xlLmxvZyhcIkZvdW5kIGpvYiBcIiArIGpvYi5uYW1lKTtcclxuICAgICAqICAgICAgam9iLm1vdmUobXlfczNfYnVja2V0LCAoczNfam9iKSA9PiB7XHJcbiAgICAgKiAgICAgICAgICAvLyBVcGxvYWRlZFxyXG4gICAgICogICAgICAgICAgY29uc29sZS5sb2coXCJVcGxvYWRlZCB0byBcIiArIHMzX2pvYi5wYXRoKTsgLy8gaHR0cHM6Ly9teWJ1Y2tldC5zMy5hbWF6b25hd3MuY29tL215ZmlsZS5wZGZcclxuICAgICAqICAgICAgfSk7XHJcbiAgICAgKiB9KTtcclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbW92ZShkZXN0aW5hdGlvbk5lc3Q6IE5lc3QsIGNhbGxiYWNrOiAoam9iOiBKb2IpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgICAgICBsZXQgZmogPSB0aGlzO1xyXG4gICAgICAgIGxldCB0aGVOZXdKb2IgPSBudWxsO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBkZXN0aW5hdGlvbk5lc3QudGFrZShmaiwgKG5ld0pvYikgPT4ge1xyXG4gICAgICAgICAgICAgICAgZmouZS5sb2coMSwgYEpvYiBcIiR7ZmouYmFzZW5hbWV9XCIgd2FzIG1vdmVkIHRvIE5lc3QgXCIke2Rlc3RpbmF0aW9uTmVzdC5uYW1lfVwiLmAsIGZqLCBbZmoudHVubmVsXSk7XHJcbiAgICAgICAgICAgICAgICB0aGVOZXdKb2IgPSBuZXdKb2I7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgZmouZS5sb2coMywgYEpvYiBcIiR7ZmouYmFzZW5hbWV9XCIgd2FzIG5vdCBtb3ZlZCB0byBOZXN0IFwiJHtkZXN0aW5hdGlvbk5lc3QubmFtZX1cIi4gJHtlfWAsIGZqKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKHRoZU5ld0pvYik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVuYW1lIHRoZSBqb2IgZmlsZSB0byBhIG5ldyBfbmFtZS5cclxuICAgICAqIEBwYXJhbSBuZXdOYW1lXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZW5hbWUobmV3TmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGZqID0gdGhpcztcclxuICAgICAgICBsZXQgZmlsZSA9IHRoaXMuZmlsZTtcclxuICAgICAgICBmaWxlLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgIGZpbGUucmVuYW1lTG9jYWwoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlbGV0ZXMgdGhlIGxvY2FsIGZpbGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZW1vdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5yZW1vdmVMb2NhbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgc2l6ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWxlLnNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBzaXplQnl0ZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5zaXplQnl0ZXM7XHJcbiAgICB9XHJcblxyXG59Il19
