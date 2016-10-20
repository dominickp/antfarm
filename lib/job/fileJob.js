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
        this.file = new file_1.File(e, path);
    }
    /**
     * Get the file object.
     * @returns {File}
     */
    FileJob.prototype.getFile = function () {
        return this.file;
    };
    /**
     * Get the file name.
     * @returns {string}
     */
    FileJob.prototype.getName = function () {
        return this.file.getName();
    };
    /**
     * Get the file name proper.
     * @returns {string}
     */
    FileJob.prototype.getNameProper = function () {
        return this.file.getNameProper();
    };
    /**
     * Get the file directory name.
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
        this.file.setPath(path);
    };
    /**
     * Set a new file name.
     * @param filename
     */
    FileJob.prototype.setName = function (filename) {
        this.createLifeEvent("set name", this.getName(), filename);
        this.file.setName(filename);
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
                fj.e.log(1, "Job \"" + fj.getBasename() + "\" was moved to Nest \"" + destinationNest.name + "\".", fj);
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
     * Rename the job file to a new name.
     * @param newName
     */
    FileJob.prototype.rename = function (newName) {
        var file = this.getFile();
        file.setName(newName);
        file.renameLocal();
    };
    return FileJob;
}(job_1.Job));
exports.FileJob = FileJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxtQ0FBNEIsZUFBZSxDQUFDLElBQUksWUFBTSxDQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkcsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDWCxRQUFRLEVBQUUsQ0FBQztZQUNmLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNJLHdCQUFNLEdBQWIsVUFBYyxPQUFlO1FBQ3pCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUwsY0FBQztBQUFELENBNUpBLEFBNEpDLENBNUo0QixTQUFHLEdBNEovQjtBQTVKWSxlQUFPLFVBNEpuQixDQUFBIiwiZmlsZSI6ImxpYi9qb2IvZmlsZUpvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtKb2J9IGZyb20gXCIuL2pvYlwiO1xuaW1wb3J0IHtGaWxlfSBmcm9tIFwiLi9maWxlXCI7XG5cbmV4cG9ydCBjbGFzcyBGaWxlSm9iIGV4dGVuZHMgSm9iIHtcblxuICAgIHByb3RlY3RlZCBmaWxlOiBGaWxlO1xuXG4gICAgLyoqXG4gICAgICogRmlsZUpvYiBjb25zdHJ1Y3Rvci5cbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHBhdGg6IHN0cmluZykge1xuICAgICAgICBzdXBlcihlLCBwYXRoKTtcbiAgICAgICAgdGhpcy5maWxlID0gbmV3IEZpbGUoZSwgcGF0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIG9iamVjdC5cbiAgICAgKiBAcmV0dXJucyB7RmlsZX1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmdldE5hbWUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgbmFtZSBwcm9wZXIuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TmFtZVByb3BlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5nZXROYW1lUHJvcGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIGRpcmVjdG9yeSBuYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldERpcm5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0RGlybmFtZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBwYXRoLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldFBhdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0UGF0aCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBmaWxlIHBhdGguXG4gICAgICogQHBhcmFtIHBhdGhcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5maWxlLnNldFBhdGgocGF0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgbmV3IGZpbGUgbmFtZS5cbiAgICAgKiBAcGFyYW0gZmlsZW5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0TmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlTGlmZUV2ZW50KFwic2V0IG5hbWVcIiwgdGhpcy5nZXROYW1lKCksIGZpbGVuYW1lKTtcbiAgICAgICAgdGhpcy5maWxlLnNldE5hbWUoZmlsZW5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBjb250ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q29udGVudFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0Q29udGVudFR5cGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgZXh0ZW5zaW9uLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldEV4dGVuc2lvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5nZXRFeHRlbnNpb24oKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgYmFzZW5hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QmFzZW5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0QmFzZW5hbWUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBqb2IgaXMgYSBmb2xkZXIuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzRm9sZGVyKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGEgZmlsZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNGaWxlKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNb3ZlcyBhIGZpbGUgdG8gYSBuZXN0LiBUaGlzIGlzIGFuIGFzeW5jaHJvbm91cyBtZXRob2Qgd2hpY2ggcHJvdmlkZXMgYSBjYWxsYmFjayBvbiBjb21wbGV0aW9uLlxuICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbk5lc3QgICAgICAgVGhlIG5lc3Qgb2JqZWN0IHRoZSBqb2Igd2lsbCBiZSBzZW50IHRvLlxuICAgICAqIEBwYXJhbSBjYWxsYmFjayAgICAgICAgICAgICAgVGhlIGNhbGxiYWNrIHByb3ZpZGVzIHRoZSB1cGRhdGVkIGluc3RhbmNlIG9mIHRoZSBqb2IuIERlcGVuZGluZyBvbiB0aGUgbmVzdCBpdCB3YXMgc2VudCB0bywgaXQgbWF5IGhhdmUgYmVlbiBjYXN0IHRvIGEgbmV3IGpvYiB0eXBlLiBUaGlzIGlzIGhlbHBmdWwgaW4gY2FzZSB5b3UgbmVlZCB0aGUgcmVtb3RlIHBhdGggdG8gdGhlIGpvYiBvbmNlIGl0IGhhcyBiZWVuIHVwbG9hZGVkIHRvIFMzLCBmb3IgZXhhbXBsZS5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIHR1bm5lbC5ydW4oKGpvYiwgbmVzdCkgPT4ge1xuICAgICAqICAgICAgY29uc29sZS5sb2coXCJGb3VuZCBqb2IgXCIgKyBqb2IuZ2V0TmFtZSgpKTtcbiAgICAgKiAgICAgIGpvYi5tb3ZlKG15X3MzX2J1Y2tldCwgKHMzX2pvYikgPT4ge1xuICAgICAqICAgICAgICAgIC8vIFVwbG9hZGVkXG4gICAgICogICAgICAgICAgY29uc29sZS5sb2coXCJVcGxvYWRlZCB0byBcIiArIHMzX2pvYi5nZXRQYXRoKCkpO1xuICAgICAqICAgICAgfSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIG1vdmUoZGVzdGluYXRpb25OZXN0LCBjYWxsYmFjaykge1xuXG4gICAgICAgIGxldCBmaiA9IHRoaXM7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uTmVzdC50YWtlKGZqLCBmdW5jdGlvbihuZXdKb2Ipe1xuICAgICAgICAgICAgICAgIC8vIGZqLnNldFBhdGgobmV3X3BhdGgpO1xuICAgICAgICAgICAgICAgIGZqLmUubG9nKDEsIGBKb2IgXCIke2ZqLmdldEJhc2VuYW1lKCl9XCIgd2FzIG1vdmVkIHRvIE5lc3QgXCIke2Rlc3RpbmF0aW9uTmVzdC5uYW1lfVwiLmAsIGZqKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobmV3Sm9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZmouZS5sb2coMywgYEpvYiBcIiR7ZmouZ2V0QmFzZW5hbWUoKX1cIiB3YXMgbm90IG1vdmVkIHRvIE5lc3QgXCIke2Rlc3RpbmF0aW9uTmVzdC5uYW1lfVwiLiAke2V9YCwgZmopO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmFtZSB0aGUgam9iIGZpbGUgdG8gYSBuZXcgbmFtZS5cbiAgICAgKiBAcGFyYW0gbmV3TmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyByZW5hbWUobmV3TmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBmaWxlID0gdGhpcy5nZXRGaWxlKCk7XG4gICAgICAgIGZpbGUuc2V0TmFtZShuZXdOYW1lKTtcbiAgICAgICAgZmlsZS5yZW5hbWVMb2NhbCgpO1xuICAgIH1cblxufSJdfQ==
