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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Z0JBQ3JCLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxtQ0FBNEIsZUFBZSxDQUFDLElBQUksWUFBTSxDQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkcsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDWCxRQUFRLEVBQUUsQ0FBQztZQUNmLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNJLHdCQUFNLEdBQWIsVUFBYyxPQUFlO1FBQ3pCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUwsY0FBQztBQUFELENBN0pBLEFBNkpDLENBN0o0QixTQUFHLEdBNkovQjtBQTdKWSxlQUFPLFVBNkpuQixDQUFBIiwiZmlsZSI6ImxpYi9qb2IvZmlsZUpvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtKb2J9IGZyb20gXCIuL2pvYlwiO1xuaW1wb3J0IHtGaWxlfSBmcm9tIFwiLi9maWxlXCI7XG5cbmV4cG9ydCBjbGFzcyBGaWxlSm9iIGV4dGVuZHMgSm9iIHtcblxuICAgIHByb3RlY3RlZCBmaWxlOiBGaWxlO1xuXG4gICAgLyoqXG4gICAgICogRmlsZUpvYiBjb25zdHJ1Y3Rvci5cbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIHBhdGg6IHN0cmluZykge1xuICAgICAgICBzdXBlcihlLCBwYXRoKTtcbiAgICAgICAgdGhpcy50eXBlID0gXCJmaWxlXCI7XG4gICAgICAgIHRoaXMuZmlsZSA9IG5ldyBGaWxlKGUsIHBhdGgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBvYmplY3QuXG4gICAgICogQHJldHVybnMge0ZpbGV9XG4gICAgICovXG4gICAgcHVibGljIGdldEZpbGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIG5hbWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5nZXROYW1lKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIG5hbWUgcHJvcGVyLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldE5hbWVQcm9wZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0TmFtZVByb3BlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZSBkaXJlY3RvcnkgbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXREaXJuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmdldERpcm5hbWUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgcGF0aC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmdldFBhdGgoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBuZXcgZmlsZSBwYXRoLlxuICAgICAqIEBwYXJhbSBwYXRoXG4gICAgICovXG4gICAgcHVibGljIHNldFBhdGgocGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZmlsZS5zZXRQYXRoKHBhdGgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIG5ldyBmaWxlIG5hbWUuXG4gICAgICogQHBhcmFtIGZpbGVuYW1lXG4gICAgICovXG4gICAgcHVibGljIHNldE5hbWUoZmlsZW5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNyZWF0ZUxpZmVFdmVudChcInNldCBuYW1lXCIsIHRoaXMuZ2V0TmFtZSgpLCBmaWxlbmFtZSk7XG4gICAgICAgIHRoaXMuZmlsZS5zZXROYW1lKGZpbGVuYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpbGUgY29udGVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldENvbnRlbnRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmdldENvbnRlbnRUeXBlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIGV4dGVuc2lvbi5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRFeHRlbnNpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0RXh0ZW5zaW9uKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaWxlIGJhc2VuYW1lLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldEJhc2VuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmdldEJhc2VuYW1lKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGEgZm9sZGVyLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHB1YmxpYyBpc0ZvbGRlcigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGpvYiBpcyBhIGZpbGUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTW92ZXMgYSBmaWxlIHRvIGEgbmVzdC4gVGhpcyBpcyBhbiBhc3luY2hyb25vdXMgbWV0aG9kIHdoaWNoIHByb3ZpZGVzIGEgY2FsbGJhY2sgb24gY29tcGxldGlvbi5cbiAgICAgKiBAcGFyYW0gZGVzdGluYXRpb25OZXN0ICAgICAgIFRoZSBuZXN0IG9iamVjdCB0aGUgam9iIHdpbGwgYmUgc2VudCB0by5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgICAgICAgICAgICAgIFRoZSBjYWxsYmFjayBwcm92aWRlcyB0aGUgdXBkYXRlZCBpbnN0YW5jZSBvZiB0aGUgam9iLiBEZXBlbmRpbmcgb24gdGhlIG5lc3QgaXQgd2FzIHNlbnQgdG8sIGl0IG1heSBoYXZlIGJlZW4gY2FzdCB0byBhIG5ldyBqb2IgdHlwZS4gVGhpcyBpcyBoZWxwZnVsIGluIGNhc2UgeW91IG5lZWQgdGhlIHJlbW90ZSBwYXRoIHRvIHRoZSBqb2Igb25jZSBpdCBoYXMgYmVlbiB1cGxvYWRlZCB0byBTMywgZm9yIGV4YW1wbGUuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiB0dW5uZWwucnVuKChqb2IsIG5lc3QpID0+IHtcbiAgICAgKiAgICAgIGNvbnNvbGUubG9nKFwiRm91bmQgam9iIFwiICsgam9iLmdldE5hbWUoKSk7XG4gICAgICogICAgICBqb2IubW92ZShteV9zM19idWNrZXQsIChzM19qb2IpID0+IHtcbiAgICAgKiAgICAgICAgICAvLyBVcGxvYWRlZFxuICAgICAqICAgICAgICAgIGNvbnNvbGUubG9nKFwiVXBsb2FkZWQgdG8gXCIgKyBzM19qb2IuZ2V0UGF0aCgpKTtcbiAgICAgKiAgICAgIH0pO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBtb3ZlKGRlc3RpbmF0aW9uTmVzdCwgY2FsbGJhY2spIHtcblxuICAgICAgICBsZXQgZmogPSB0aGlzO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbk5lc3QudGFrZShmaiwgZnVuY3Rpb24obmV3Sm9iKXtcbiAgICAgICAgICAgICAgICAvLyBmai5zZXRQYXRoKG5ld19wYXRoKTtcbiAgICAgICAgICAgICAgICBmai5lLmxvZygxLCBgSm9iIFwiJHtmai5nZXRCYXNlbmFtZSgpfVwiIHdhcyBtb3ZlZCB0byBOZXN0IFwiJHtkZXN0aW5hdGlvbk5lc3QubmFtZX1cIi5gLCBmaik7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ld0pvYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGZqLmUubG9nKDMsIGBKb2IgXCIke2ZqLmdldEJhc2VuYW1lKCl9XCIgd2FzIG5vdCBtb3ZlZCB0byBOZXN0IFwiJHtkZXN0aW5hdGlvbk5lc3QubmFtZX1cIi4gJHtlfWAsIGZqKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5hbWUgdGhlIGpvYiBmaWxlIHRvIGEgbmV3IG5hbWUuXG4gICAgICogQHBhcmFtIG5ld05hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVuYW1lKG5ld05hbWU6IHN0cmluZykge1xuICAgICAgICBsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZSgpO1xuICAgICAgICBmaWxlLnNldE5hbWUobmV3TmFtZSk7XG4gICAgICAgIGZpbGUucmVuYW1lTG9jYWwoKTtcbiAgICB9XG5cbn0iXX0=
