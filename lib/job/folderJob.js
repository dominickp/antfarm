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
var node_path = require("path"), fs = require("fs");
var FolderJob = (function (_super) {
    __extends(FolderJob, _super);
    /**
     * FolderJob constructor
     * @param e
     * @param path
     */
    function FolderJob(e, path) {
        var _this = _super.call(this, e, path) || this;
        _this._type = "folder";
        _this._path = path;
        _this._files = [];
        _this.getStatistics();
        return _this;
        // verify _path leads to a valid, readable file, handle error if not
    }
    FolderJob.prototype.getStatistics = function () {
        this._basename = node_path.basename(this.path);
        this._dirname = node_path.dirname(this.path);
    };
    /**
     * Creates file objects for folder contents. Async operation returns a callback on completion.
     * @param callback
     */
    FolderJob.prototype.createFiles = function (callback) {
        var fl = this;
        var folder_path = fl.path;
        fs.readdir(folder_path, function (err, items) {
            items = items.filter(function (item) { return !(/(^|\/)\.[^\/\.]/g).test(item); });
            items.forEach(function (filename) {
                var filepath = folder_path + node_path.sep + filename;
                var file = new file_1.File(fl.e, filepath);
                fl.addFile(file);
            });
            callback();
        });
    };
    Object.defineProperty(FolderJob.prototype, "name", {
        /**
         * Gets the job _name.
         * @returns {string}
         */
        get: function () {
            return this.basename;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FolderJob.prototype, "basename", {
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
    Object.defineProperty(FolderJob.prototype, "dirname", {
        /**
         * Get the directory _name.
         * @returns {string}
         */
        get: function () {
            return this._dirname;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FolderJob.prototype, "path", {
        /**
         * Get the _path.
         * @returns {string}
         */
        get: function () {
            return this._path;
        },
        /**
         * Set a new _path.
         * @param path
         */
        set: function (path) {
            var fj = this;
            fj._path = path;
            fj.getStatistics();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Add a file object to the job.
     * @param file
     */
    FolderJob.prototype.addFile = function (file) {
        this._files.push(file);
        this.e.log(0, "Adding file \"" + file.name + "\" to job.", this);
    };
    /**
     * Get a file object from the job.
     * @param index
     * @returns {File}
     */
    FolderJob.prototype.getFile = function (index) {
        return this._files[index];
    };
    Object.defineProperty(FolderJob.prototype, "files", {
        /**
         * Get all _files associated with the job.
         * @returns {File[]}
         */
        get: function () {
            return this._files;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the number of _files in this folder.
     * @returns {number}
     */
    FolderJob.prototype.count = function () {
        return this._files.length;
    };
    Object.defineProperty(FolderJob.prototype, "extension", {
        /**
         * Get the extension.
         * @returns {null}
         */
        get: function () {
            return null;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Check if job is a folder.
     * @returns {boolean}
     */
    FolderJob.prototype.isFolder = function () {
        return true;
    };
    /**
     * Check if job is a file.
     * @returns {boolean}
     */
    FolderJob.prototype.isFile = function () {
        return false;
    };
    /**
     * Moves a folder to a nest. This is an asynchronous method which provides a callback on completion.
     * @param destinationNest
     * @param callback
     */
    FolderJob.prototype.move = function (destinationNest, callback) {
        var fj = this;
        if (!destinationNest) {
            fs.e.log(3, "Destination nest does not exist!", fj);
        }
        try {
            destinationNest.take(fj, function (job) {
                // fj.path = new_path;
                fj.e.log(1, "Job \"" + fj.name + "\" was moved to Nest \"" + destinationNest.name + "\".", fj);
                if (callback) {
                    callback(job);
                }
            });
        }
        catch (e) {
            fj.e.log(3, "Job \"" + fj.name + "\" was not moved to Nest \"" + destinationNest.name + "\". " + e, fj);
            if (callback) {
                callback();
            }
        }
    };
    /**
     * Renames the job folder, leaving its content's names alone.
     * @param newName
     */
    FolderJob.prototype.rename = function (newName) {
        var fj = this;
        var new_path = fj.dirname + node_path.sep + newName;
        try {
            fj.e.log(0, "Renaming folder to \"" + new_path + "\".", fj);
            fs.renameSync(fj.path, new_path);
        }
        catch (err) {
            fj.e.log(3, "Rename folder error: " + err + ".", fj);
        }
        fj.path = new_path;
    };
    /**
     * Removes the folder.
     */
    FolderJob.prototype.remove = function () {
        var fj = this;
        if (fj.files.length > 0) {
            fj.files.forEach(function (file) {
                file.removeLocal();
            });
        }
        // Remove the empty folder
        fs.rmdirSync(fj.path);
    };
    ;
    return FolderJob;
}(job_1.Job));
exports.FolderJob = FolderJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2IvZm9sZGVySm9iLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLDZCQUEwQjtBQUMxQiwrQkFBNEI7QUFHNUIsSUFBUSxTQUFTLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUMzQixFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRTNCO0lBQStCLDZCQUFHO0lBTzlCOzs7O09BSUc7SUFDSCxtQkFBWSxDQUFjLEVBQUUsSUFBWTtRQUF4QyxZQUNJLGtCQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsU0FPakI7UUFORyxLQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztRQUN0QixLQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixLQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixLQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O1FBRXJCLG9FQUFvRTtJQUN4RSxDQUFDO0lBRVMsaUNBQWEsR0FBdkI7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVEOzs7T0FHRztJQUNJLCtCQUFXLEdBQWxCLFVBQW1CLFFBQW9CO1FBQ25DLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFDMUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsVUFBQyxHQUFHLEVBQUUsS0FBSztZQUMvQixLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQyxDQUFDO1lBRS9ELEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRO2dCQUNuQixJQUFJLFFBQVEsR0FBRyxXQUFXLEdBQUcsU0FBUyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUM7Z0JBQ3RELElBQUksSUFBSSxHQUFHLElBQUksV0FBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ3BDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7WUFFSCxRQUFRLEVBQUUsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQU1ELHNCQUFXLDJCQUFJO1FBSmY7OztXQUdHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDOzs7T0FBQTtJQU1ELHNCQUFXLCtCQUFRO1FBSm5COzs7V0FHRzthQUNIO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQzs7O09BQUE7SUFNRCxzQkFBVyw4QkFBTztRQUpsQjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7OztPQUFBO0lBTUQsc0JBQVcsMkJBQUk7UUFKZjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7UUFFRDs7O1dBR0c7YUFDSCxVQUFnQixJQUFZO1lBQ3hCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztZQUNkLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN2QixDQUFDOzs7T0FWQTtJQVlEOzs7T0FHRztJQUNJLDJCQUFPLEdBQWQsVUFBZSxJQUFVO1FBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxtQkFBZ0IsSUFBSSxDQUFDLElBQUksZUFBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksMkJBQU8sR0FBZCxVQUFlLEtBQWE7UUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQU1ELHNCQUFXLDRCQUFLO1FBSmhCOzs7V0FHRzthQUNIO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzs7O09BQUE7SUFFRDs7O09BR0c7SUFDSSx5QkFBSyxHQUFaO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzlCLENBQUM7SUFNRCxzQkFBVyxnQ0FBUztRQUpwQjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQzs7O09BQUE7SUFFRDs7O09BR0c7SUFDSSw0QkFBUSxHQUFmO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksMEJBQU0sR0FBYjtRQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSx3QkFBSSxHQUFYLFVBQVksZUFBcUIsRUFBRSxRQUE2QjtRQUM1RCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFZCxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDbkIsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGtDQUFrQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxJQUFJLENBQUM7WUFDRCxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxVQUFDLEdBQUc7Z0JBQ3pCLHNCQUFzQjtnQkFDdEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVEsRUFBRSxDQUFDLElBQUksK0JBQXdCLGVBQWUsQ0FBQyxJQUFJLFFBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDakYsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDWCxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xCLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVEsRUFBRSxDQUFDLElBQUksbUNBQTRCLGVBQWUsQ0FBQyxJQUFJLFlBQU0sQ0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFGLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7WUFDZixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSSwwQkFBTSxHQUFiLFVBQWMsT0FBZTtRQUN6QixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDO1FBRXBELElBQUksQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSwwQkFBdUIsUUFBUSxRQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDckQsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ1gsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLDBCQUF3QixHQUFHLE1BQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQsRUFBRSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUVMOztPQUVHO0lBQ1EsMEJBQU0sR0FBYjtRQUNJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO2dCQUNsQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQ0QsMEJBQTBCO1FBQzFCLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFBQSxDQUFDO0lBRU4sZ0JBQUM7QUFBRCxDQS9NQSxBQStNQyxDQS9NOEIsU0FBRyxHQStNakM7QUEvTVksOEJBQVMiLCJmaWxlIjoibGliL2pvYi9mb2xkZXJKb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcclxuaW1wb3J0IHtKb2J9IGZyb20gXCIuL2pvYlwiO1xyXG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcclxuaW1wb3J0IHtOZXN0fSBmcm9tIFwiLi4vbmVzdC9uZXN0XCI7XHJcblxyXG5jb25zdCAgIG5vZGVfcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxyXG4gICAgICAgIGZzID0gcmVxdWlyZShcImZzXCIpO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZvbGRlckpvYiBleHRlbmRzIEpvYiB7XHJcbiAgICBwcm90ZWN0ZWQgX3BhdGg6IHN0cmluZztcclxuICAgIHByb3RlY3RlZCBfZGlybmFtZTogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIF9iYXNlbmFtZTogc3RyaW5nO1xyXG5cclxuICAgIHByb3RlY3RlZCBfZmlsZXM6IEZpbGVbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZvbGRlckpvYiBjb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIGVcclxuICAgICAqIEBwYXJhbSBwYXRoXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICBzdXBlcihlLCBwYXRoKTtcclxuICAgICAgICB0aGlzLl90eXBlID0gXCJmb2xkZXJcIjtcclxuICAgICAgICB0aGlzLl9wYXRoID0gcGF0aDtcclxuICAgICAgICB0aGlzLl9maWxlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZ2V0U3RhdGlzdGljcygpO1xyXG5cclxuICAgICAgICAvLyB2ZXJpZnkgX3BhdGggbGVhZHMgdG8gYSB2YWxpZCwgcmVhZGFibGUgZmlsZSwgaGFuZGxlIGVycm9yIGlmIG5vdFxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRTdGF0aXN0aWNzKCkge1xyXG4gICAgICAgIHRoaXMuX2Jhc2VuYW1lID0gbm9kZV9wYXRoLmJhc2VuYW1lKHRoaXMucGF0aCk7XHJcbiAgICAgICAgdGhpcy5fZGlybmFtZSA9IG5vZGVfcGF0aC5kaXJuYW1lKHRoaXMucGF0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGZpbGUgb2JqZWN0cyBmb3IgZm9sZGVyIGNvbnRlbnRzLiBBc3luYyBvcGVyYXRpb24gcmV0dXJucyBhIGNhbGxiYWNrIG9uIGNvbXBsZXRpb24uXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNyZWF0ZUZpbGVzKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGZsID0gdGhpcztcclxuICAgICAgICBsZXQgZm9sZGVyX3BhdGggPSBmbC5wYXRoO1xyXG4gICAgICAgIGZzLnJlYWRkaXIoZm9sZGVyX3BhdGgsIChlcnIsIGl0ZW1zKSA9PiB7XHJcbiAgICAgICAgICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gISgvKF58XFwvKVxcLlteXFwvXFwuXS9nKS50ZXN0KGl0ZW0pKTtcclxuXHJcbiAgICAgICAgICAgIGl0ZW1zLmZvckVhY2goKGZpbGVuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmlsZXBhdGggPSBmb2xkZXJfcGF0aCArIG5vZGVfcGF0aC5zZXAgKyBmaWxlbmFtZTtcclxuICAgICAgICAgICAgICAgIGxldCBmaWxlID0gbmV3IEZpbGUoZmwuZSwgZmlsZXBhdGgpO1xyXG4gICAgICAgICAgICAgICAgZmwuYWRkRmlsZShmaWxlKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgam9iIF9uYW1lLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBuYW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmJhc2VuYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBfYmFzZW5hbWUuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGJhc2VuYW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9iYXNlbmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgZGlyZWN0b3J5IF9uYW1lLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBkaXJuYW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXJuYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBfcGF0aC5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgcGF0aCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGF0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBhIG5ldyBfcGF0aC5cclxuICAgICAqIEBwYXJhbSBwYXRoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgcGF0aChwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgZmogPSB0aGlzO1xyXG4gICAgICAgIGZqLl9wYXRoID0gcGF0aDtcclxuICAgICAgICBmai5nZXRTdGF0aXN0aWNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBmaWxlIG9iamVjdCB0byB0aGUgam9iLlxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZEZpbGUoZmlsZTogRmlsZSkge1xyXG4gICAgICAgIHRoaXMuX2ZpbGVzLnB1c2goZmlsZSk7XHJcbiAgICAgICAgdGhpcy5lLmxvZygwLCBgQWRkaW5nIGZpbGUgXCIke2ZpbGUubmFtZX1cIiB0byBqb2IuYCwgdGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgYSBmaWxlIG9iamVjdCBmcm9tIHRoZSBqb2IuXHJcbiAgICAgKiBAcGFyYW0gaW5kZXhcclxuICAgICAqIEByZXR1cm5zIHtGaWxlfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0RmlsZShpbmRleDogbnVtYmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGVzW2luZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBhbGwgX2ZpbGVzIGFzc29jaWF0ZWQgd2l0aCB0aGUgam9iLlxyXG4gICAgICogQHJldHVybnMge0ZpbGVbXX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBmaWxlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZmlsZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIG51bWJlciBvZiBfZmlsZXMgaW4gdGhpcyBmb2xkZXIuXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY291bnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGVzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgZXh0ZW5zaW9uLlxyXG4gICAgICogQHJldHVybnMge251bGx9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZXh0ZW5zaW9uKCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2sgaWYgam9iIGlzIGEgZm9sZGVyLlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpc0ZvbGRlcigpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIGpvYiBpcyBhIGZpbGUuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGlzRmlsZSgpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNb3ZlcyBhIGZvbGRlciB0byBhIG5lc3QuIFRoaXMgaXMgYW4gYXN5bmNocm9ub3VzIG1ldGhvZCB3aGljaCBwcm92aWRlcyBhIGNhbGxiYWNrIG9uIGNvbXBsZXRpb24uXHJcbiAgICAgKiBAcGFyYW0gZGVzdGluYXRpb25OZXN0XHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgcHVibGljIG1vdmUoZGVzdGluYXRpb25OZXN0OiBOZXN0LCBjYWxsYmFjazogKGpvYj86IEpvYikgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBmaiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICghZGVzdGluYXRpb25OZXN0KSB7XHJcbiAgICAgICAgICAgIGZzLmUubG9nKDMsIGBEZXN0aW5hdGlvbiBuZXN0IGRvZXMgbm90IGV4aXN0IWAsIGZqKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uTmVzdC50YWtlKGZqLCAoam9iKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBmai5wYXRoID0gbmV3X3BhdGg7XHJcbiAgICAgICAgICAgICAgICBmai5lLmxvZygxLCBgSm9iIFwiJHtmai5uYW1lfVwiIHdhcyBtb3ZlZCB0byBOZXN0IFwiJHtkZXN0aW5hdGlvbk5lc3QubmFtZX1cIi5gLCBmaik7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhqb2IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGZqLmUubG9nKDMsIGBKb2IgXCIke2ZqLm5hbWV9XCIgd2FzIG5vdCBtb3ZlZCB0byBOZXN0IFwiJHtkZXN0aW5hdGlvbk5lc3QubmFtZX1cIi4gJHtlfWAsIGZqKTtcclxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVuYW1lcyB0aGUgam9iIGZvbGRlciwgbGVhdmluZyBpdHMgY29udGVudCdzIG5hbWVzIGFsb25lLlxyXG4gICAgICogQHBhcmFtIG5ld05hbWVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbmFtZShuZXdOYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgZmogPSB0aGlzO1xyXG4gICAgICAgIGxldCBuZXdfcGF0aCA9IGZqLmRpcm5hbWUgKyBub2RlX3BhdGguc2VwICsgbmV3TmFtZTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZmouZS5sb2coMCwgYFJlbmFtaW5nIGZvbGRlciB0byBcIiR7bmV3X3BhdGh9XCIuYCwgZmopO1xyXG4gICAgICAgICAgICBmcy5yZW5hbWVTeW5jKGZqLnBhdGgsIG5ld19wYXRoKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgZmouZS5sb2coMywgYFJlbmFtZSBmb2xkZXIgZXJyb3I6ICR7ZXJyfS5gLCBmaik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmai5wYXRoID0gbmV3X3BhdGg7XHJcbiAgICB9XHJcblxyXG4vKiogXHJcbiAqIFJlbW92ZXMgdGhlIGZvbGRlci5cclxuICovXHJcbiAgICBwdWJsaWMgcmVtb3ZlKCkge1xyXG4gICAgICAgIGxldCBmaiA9IHRoaXM7XHJcbiAgICAgICAgaWYgKGZqLmZpbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZmouZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZmlsZS5yZW1vdmVMb2NhbCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBlbXB0eSBmb2xkZXJcclxuICAgICAgICBmcy5ybWRpclN5bmMoZmoucGF0aCk7XHJcbiAgICB9O1xyXG5cclxufVxyXG4iXX0=
