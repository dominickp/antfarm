"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var folderNest_1 = require("./folderNest");
var fs = require("fs"), tmp = require("tmp");
/**
 * An auto managed folder nest used for temporarily storing files.
 */
var AutoFolderNest = (function (_super) {
    __extends(AutoFolderNest, _super);
    function AutoFolderNest(e, hierarchy) {
        if (!e.getAutoManagedFolderDirectory()) {
            throw "Option auto_managed_folder_directory must be set to use auto managed folders.";
        }
        /**
         * Creates the hierarchy string used for the auto managed path.
         * @param hierarchy
         */
        var getHierarchyString = function (hierarchy) {
            var hierarchyString = "";
            if (typeof (hierarchy) === "string") {
                hierarchyString = encodeURIComponent(hierarchy.toString());
            }
            else if (hierarchy instanceof Array) {
                hierarchy.forEach(function (pi) {
                    hierarchyString += "/" + encodeURIComponent(pi);
                });
            }
            else {
                throw "Path should be a string or array, " + typeof (hierarchy) + " found.";
            }
            if (hierarchyString.charAt(0) !== "/") {
                hierarchyString = "/" + hierarchyString;
            }
            return hierarchyString;
        };
        var path = e.getAutoManagedFolderDirectory() + getHierarchyString(hierarchy);
        _super.call(this, e, path, true);
        this.hierarchy = hierarchy;
        this.hierarchyString = getHierarchyString(hierarchy);
    }
    return AutoFolderNest;
}(folderNest_1.FolderNest));
exports.AutoFolderNest = AutoFolderNest;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9uZXN0L2F1dG9Gb2xkZXJOZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDJCQUF5QixjQUFjLENBQUMsQ0FBQTtBQUd4QyxJQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQ2xCLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFN0I7O0dBRUc7QUFDSDtJQUFvQyxrQ0FBVTtJQUsxQyx3QkFBWSxDQUFjLEVBQUUsU0FBMEI7UUFFbEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckMsTUFBTSwrRUFBK0UsQ0FBQztRQUMxRixDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsSUFBSSxrQkFBa0IsR0FBRyxVQUFDLFNBQTBCO1lBQ2hELElBQUksZUFBZSxHQUFHLEVBQUUsQ0FBQztZQUN6QixFQUFFLENBQUMsQ0FBQyxPQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDakMsZUFBZSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFFO29CQUNqQixlQUFlLElBQUksR0FBRyxHQUFHLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixNQUFNLHVDQUFxQyxPQUFNLENBQUMsU0FBUyxDQUFDLFlBQVMsQ0FBQztZQUMxRSxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxlQUFlLEdBQUcsR0FBRyxHQUFHLGVBQWUsQ0FBQztZQUM1QyxDQUFDO1lBQ0QsTUFBTSxDQUFDLGVBQWUsQ0FBQztRQUMzQixDQUFDLENBQUM7UUFFRixJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU3RSxrQkFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXJCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFekQsQ0FBQztJQUdMLHFCQUFDO0FBQUQsQ0ExQ0EsQUEwQ0MsQ0ExQ21DLHVCQUFVLEdBMEM3QztBQTFDWSxzQkFBYyxpQkEwQzFCLENBQUEiLCJmaWxlIjoibGliL25lc3QvYXV0b0ZvbGRlck5lc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0ZvbGRlck5lc3R9IGZyb20gXCIuL2ZvbGRlck5lc3RcIjtcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxuICAgICAgICB0bXAgPSByZXF1aXJlKFwidG1wXCIpO1xuXG4vKipcbiAqIEFuIGF1dG8gbWFuYWdlZCBmb2xkZXIgbmVzdCB1c2VkIGZvciB0ZW1wb3JhcmlseSBzdG9yaW5nIGZpbGVzLlxuICovXG5leHBvcnQgY2xhc3MgQXV0b0ZvbGRlck5lc3QgZXh0ZW5kcyBGb2xkZXJOZXN0IHtcblxuICAgIHByb3RlY3RlZCBoaWVyYXJjaHk6IHN0cmluZ3xzdHJpbmdbXTtcbiAgICBwcm90ZWN0ZWQgaGllcmFyY2h5U3RyaW5nOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgaGllcmFyY2h5OiBzdHJpbmd8c3RyaW5nW10pIHtcblxuICAgICAgICBpZiAoIWUuZ2V0QXV0b01hbmFnZWRGb2xkZXJEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgdGhyb3cgXCJPcHRpb24gYXV0b19tYW5hZ2VkX2ZvbGRlcl9kaXJlY3RvcnkgbXVzdCBiZSBzZXQgdG8gdXNlIGF1dG8gbWFuYWdlZCBmb2xkZXJzLlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZXMgdGhlIGhpZXJhcmNoeSBzdHJpbmcgdXNlZCBmb3IgdGhlIGF1dG8gbWFuYWdlZCBwYXRoLlxuICAgICAgICAgKiBAcGFyYW0gaGllcmFyY2h5XG4gICAgICAgICAqL1xuICAgICAgICBsZXQgZ2V0SGllcmFyY2h5U3RyaW5nID0gKGhpZXJhcmNoeTogc3RyaW5nfHN0cmluZ1tdKSA9PiB7XG4gICAgICAgICAgICBsZXQgaGllcmFyY2h5U3RyaW5nID0gXCJcIjtcbiAgICAgICAgICAgIGlmICh0eXBlb2YoaGllcmFyY2h5KSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGhpZXJhcmNoeVN0cmluZyA9IGVuY29kZVVSSUNvbXBvbmVudChoaWVyYXJjaHkudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhpZXJhcmNoeSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgaGllcmFyY2h5LmZvckVhY2goKHBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGhpZXJhcmNoeVN0cmluZyArPSBcIi9cIiArIGVuY29kZVVSSUNvbXBvbmVudChwaSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGBQYXRoIHNob3VsZCBiZSBhIHN0cmluZyBvciBhcnJheSwgJHt0eXBlb2YoaGllcmFyY2h5KX0gZm91bmQuYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoaWVyYXJjaHlTdHJpbmcuY2hhckF0KDApICE9PSBcIi9cIikge1xuICAgICAgICAgICAgICAgIGhpZXJhcmNoeVN0cmluZyA9IFwiL1wiICsgaGllcmFyY2h5U3RyaW5nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGhpZXJhcmNoeVN0cmluZztcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgcGF0aCA9IGUuZ2V0QXV0b01hbmFnZWRGb2xkZXJEaXJlY3RvcnkoKSArIGdldEhpZXJhcmNoeVN0cmluZyhoaWVyYXJjaHkpO1xuXG4gICAgICAgIHN1cGVyKGUsIHBhdGgsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuaGllcmFyY2h5ID0gaGllcmFyY2h5O1xuICAgICAgICB0aGlzLmhpZXJhcmNoeVN0cmluZyA9IGdldEhpZXJhcmNoeVN0cmluZyhoaWVyYXJjaHkpO1xuXG4gICAgfVxuXG5cbn0iXX0=
