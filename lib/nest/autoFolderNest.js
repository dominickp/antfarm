"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var folderNest_1 = require("./folderNest");
var fs = require("fs"), tmp = require("tmp");
/**
 * An auto managed folder nest used for temporarily storing _files.
 */
var AutoFolderNest = (function (_super) {
    __extends(AutoFolderNest, _super);
    function AutoFolderNest(e, hierarchy) {
        if (!e.autoManagedFolderDirectory) {
            throw "Option auto_managed_folder_directory must be set to use auto managed folders.";
        }
        /**
         * Creates the hierarchy string used for the auto managed _path.
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
        var path = e.autoManagedFolderDirectory + getHierarchyString(hierarchy);
        _super.call(this, e, path, true);
        this.hierarchy = hierarchy;
        this.hierarchyString = getHierarchyString(hierarchy);
    }
    return AutoFolderNest;
}(folderNest_1.FolderNest));
exports.AutoFolderNest = AutoFolderNest;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9uZXN0L2F1dG9Gb2xkZXJOZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDJCQUF5QixjQUFjLENBQUMsQ0FBQTtBQUd4QyxJQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQ2xCLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFN0I7O0dBRUc7QUFDSDtJQUFvQyxrQ0FBVTtJQUsxQyx3QkFBWSxDQUFjLEVBQUUsU0FBMEI7UUFFbEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sK0VBQStFLENBQUM7UUFDMUYsQ0FBQztRQUVEOzs7V0FHRztRQUNILElBQUksa0JBQWtCLEdBQUcsVUFBQyxTQUEwQjtZQUNoRCxJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsT0FBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMvRCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBRTtvQkFDakIsZUFBZSxJQUFJLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDcEQsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osTUFBTSx1Q0FBcUMsT0FBTSxDQUFDLFNBQVMsQ0FBQyxZQUFTLENBQUM7WUFDMUUsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsZUFBZSxHQUFHLEdBQUcsR0FBRyxlQUFlLENBQUM7WUFDNUMsQ0FBQztZQUNELE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFDM0IsQ0FBQyxDQUFDO1FBRUYsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLDBCQUEwQixHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXhFLGtCQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV6RCxDQUFDO0lBR0wscUJBQUM7QUFBRCxDQTFDQSxBQTBDQyxDQTFDbUMsdUJBQVUsR0EwQzdDO0FBMUNZLHNCQUFjLGlCQTBDMUIsQ0FBQSIsImZpbGUiOiJsaWIvbmVzdC9hdXRvRm9sZGVyTmVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Rm9sZGVyTmVzdH0gZnJvbSBcIi4vZm9sZGVyTmVzdFwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5cbmNvbnN0ICAgZnMgPSByZXF1aXJlKFwiZnNcIiksXG4gICAgICAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIik7XG5cbi8qKlxuICogQW4gYXV0byBtYW5hZ2VkIGZvbGRlciBuZXN0IHVzZWQgZm9yIHRlbXBvcmFyaWx5IHN0b3JpbmcgX2ZpbGVzLlxuICovXG5leHBvcnQgY2xhc3MgQXV0b0ZvbGRlck5lc3QgZXh0ZW5kcyBGb2xkZXJOZXN0IHtcblxuICAgIHByb3RlY3RlZCBoaWVyYXJjaHk6IHN0cmluZ3xzdHJpbmdbXTtcbiAgICBwcm90ZWN0ZWQgaGllcmFyY2h5U3RyaW5nOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgaGllcmFyY2h5OiBzdHJpbmd8c3RyaW5nW10pIHtcblxuICAgICAgICBpZiAoIWUuYXV0b01hbmFnZWRGb2xkZXJEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIHRocm93IFwiT3B0aW9uIGF1dG9fbWFuYWdlZF9mb2xkZXJfZGlyZWN0b3J5IG11c3QgYmUgc2V0IHRvIHVzZSBhdXRvIG1hbmFnZWQgZm9sZGVycy5cIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGVzIHRoZSBoaWVyYXJjaHkgc3RyaW5nIHVzZWQgZm9yIHRoZSBhdXRvIG1hbmFnZWQgX3BhdGguXG4gICAgICAgICAqIEBwYXJhbSBoaWVyYXJjaHlcbiAgICAgICAgICovXG4gICAgICAgIGxldCBnZXRIaWVyYXJjaHlTdHJpbmcgPSAoaGllcmFyY2h5OiBzdHJpbmd8c3RyaW5nW10pID0+IHtcbiAgICAgICAgICAgIGxldCBoaWVyYXJjaHlTdHJpbmcgPSBcIlwiO1xuICAgICAgICAgICAgaWYgKHR5cGVvZihoaWVyYXJjaHkpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgaGllcmFyY2h5U3RyaW5nID0gZW5jb2RlVVJJQ29tcG9uZW50KGhpZXJhcmNoeS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGllcmFyY2h5IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBoaWVyYXJjaHkuZm9yRWFjaCgocGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaGllcmFyY2h5U3RyaW5nICs9IFwiL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KHBpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgYFBhdGggc2hvdWxkIGJlIGEgc3RyaW5nIG9yIGFycmF5LCAke3R5cGVvZihoaWVyYXJjaHkpfSBmb3VuZC5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhpZXJhcmNoeVN0cmluZy5jaGFyQXQoMCkgIT09IFwiL1wiKSB7XG4gICAgICAgICAgICAgICAgaGllcmFyY2h5U3RyaW5nID0gXCIvXCIgKyBoaWVyYXJjaHlTdHJpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaGllcmFyY2h5U3RyaW5nO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBwYXRoID0gZS5hdXRvTWFuYWdlZEZvbGRlckRpcmVjdG9yeSArIGdldEhpZXJhcmNoeVN0cmluZyhoaWVyYXJjaHkpO1xuXG4gICAgICAgIHN1cGVyKGUsIHBhdGgsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuaGllcmFyY2h5ID0gaGllcmFyY2h5O1xuICAgICAgICB0aGlzLmhpZXJhcmNoeVN0cmluZyA9IGdldEhpZXJhcmNoeVN0cmluZyhoaWVyYXJjaHkpO1xuXG4gICAgfVxuXG5cbn0iXX0=
