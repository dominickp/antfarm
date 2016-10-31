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
        if (!e.getAutoManagedFolderDirectory()) {
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
        var path = e.getAutoManagedFolderDirectory() + getHierarchyString(hierarchy);
        _super.call(this, e, path, true);
        this.hierarchy = hierarchy;
        this.hierarchyString = getHierarchyString(hierarchy);
    }
    return AutoFolderNest;
}(folderNest_1.FolderNest));
exports.AutoFolderNest = AutoFolderNest;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9uZXN0L2F1dG9Gb2xkZXJOZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDJCQUF5QixjQUFjLENBQUMsQ0FBQTtBQUd4QyxJQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQ2xCLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFN0I7O0dBRUc7QUFDSDtJQUFvQyxrQ0FBVTtJQUsxQyx3QkFBWSxDQUFjLEVBQUUsU0FBMEI7UUFFbEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckMsTUFBTSwrRUFBK0UsQ0FBQztRQUMxRixDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsSUFBSSxrQkFBa0IsR0FBRyxVQUFDLFNBQTBCO1lBQ2hELElBQUksZUFBZSxHQUFHLEVBQUUsQ0FBQztZQUN6QixFQUFFLENBQUMsQ0FBQyxPQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDakMsZUFBZSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFFO29CQUNqQixlQUFlLElBQUksR0FBRyxHQUFHLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixNQUFNLHVDQUFxQyxPQUFNLENBQUMsU0FBUyxDQUFDLFlBQVMsQ0FBQztZQUMxRSxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxlQUFlLEdBQUcsR0FBRyxHQUFHLGVBQWUsQ0FBQztZQUM1QyxDQUFDO1lBQ0QsTUFBTSxDQUFDLGVBQWUsQ0FBQztRQUMzQixDQUFDLENBQUM7UUFFRixJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU3RSxrQkFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXJCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFekQsQ0FBQztJQUdMLHFCQUFDO0FBQUQsQ0ExQ0EsQUEwQ0MsQ0ExQ21DLHVCQUFVLEdBMEM3QztBQTFDWSxzQkFBYyxpQkEwQzFCLENBQUEiLCJmaWxlIjoibGliL25lc3QvYXV0b0ZvbGRlck5lc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0ZvbGRlck5lc3R9IGZyb20gXCIuL2ZvbGRlck5lc3RcIjtcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxuICAgICAgICB0bXAgPSByZXF1aXJlKFwidG1wXCIpO1xuXG4vKipcbiAqIEFuIGF1dG8gbWFuYWdlZCBmb2xkZXIgbmVzdCB1c2VkIGZvciB0ZW1wb3JhcmlseSBzdG9yaW5nIF9maWxlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEF1dG9Gb2xkZXJOZXN0IGV4dGVuZHMgRm9sZGVyTmVzdCB7XG5cbiAgICBwcm90ZWN0ZWQgaGllcmFyY2h5OiBzdHJpbmd8c3RyaW5nW107XG4gICAgcHJvdGVjdGVkIGhpZXJhcmNoeVN0cmluZzogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIGhpZXJhcmNoeTogc3RyaW5nfHN0cmluZ1tdKSB7XG5cbiAgICAgICAgaWYgKCFlLmdldEF1dG9NYW5hZ2VkRm9sZGVyRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiT3B0aW9uIGF1dG9fbWFuYWdlZF9mb2xkZXJfZGlyZWN0b3J5IG11c3QgYmUgc2V0IHRvIHVzZSBhdXRvIG1hbmFnZWQgZm9sZGVycy5cIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGVzIHRoZSBoaWVyYXJjaHkgc3RyaW5nIHVzZWQgZm9yIHRoZSBhdXRvIG1hbmFnZWQgX3BhdGguXG4gICAgICAgICAqIEBwYXJhbSBoaWVyYXJjaHlcbiAgICAgICAgICovXG4gICAgICAgIGxldCBnZXRIaWVyYXJjaHlTdHJpbmcgPSAoaGllcmFyY2h5OiBzdHJpbmd8c3RyaW5nW10pID0+IHtcbiAgICAgICAgICAgIGxldCBoaWVyYXJjaHlTdHJpbmcgPSBcIlwiO1xuICAgICAgICAgICAgaWYgKHR5cGVvZihoaWVyYXJjaHkpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgaGllcmFyY2h5U3RyaW5nID0gZW5jb2RlVVJJQ29tcG9uZW50KGhpZXJhcmNoeS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGllcmFyY2h5IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBoaWVyYXJjaHkuZm9yRWFjaCgocGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaGllcmFyY2h5U3RyaW5nICs9IFwiL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KHBpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgYFBhdGggc2hvdWxkIGJlIGEgc3RyaW5nIG9yIGFycmF5LCAke3R5cGVvZihoaWVyYXJjaHkpfSBmb3VuZC5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhpZXJhcmNoeVN0cmluZy5jaGFyQXQoMCkgIT09IFwiL1wiKSB7XG4gICAgICAgICAgICAgICAgaGllcmFyY2h5U3RyaW5nID0gXCIvXCIgKyBoaWVyYXJjaHlTdHJpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaGllcmFyY2h5U3RyaW5nO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBwYXRoID0gZS5nZXRBdXRvTWFuYWdlZEZvbGRlckRpcmVjdG9yeSgpICsgZ2V0SGllcmFyY2h5U3RyaW5nKGhpZXJhcmNoeSk7XG5cbiAgICAgICAgc3VwZXIoZSwgcGF0aCwgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy5oaWVyYXJjaHkgPSBoaWVyYXJjaHk7XG4gICAgICAgIHRoaXMuaGllcmFyY2h5U3RyaW5nID0gZ2V0SGllcmFyY2h5U3RyaW5nKGhpZXJhcmNoeSk7XG5cbiAgICB9XG5cblxufSJdfQ==
