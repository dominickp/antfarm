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
var folderNest_1 = require("./folderNest");
var fs = require("fs"), tmp = require("tmp");
/**
 * An auto managed folder nest used for temporarily storing _files.
 */
var AutoFolderNest = (function (_super) {
    __extends(AutoFolderNest, _super);
    function AutoFolderNest(e, hierarchy) {
        var _this = this;
        if (!e.autoManagedFolderDirectory) {
            throw "Option auto_managed_folder_directory must be set to use auto managed folders.";
        }
        var cleanDirSegment = function (name) {
            name = name.replace(/\s+/gi, "-"); // Replace white space with dash
            return name.replace(/[^a-zA-Z0-9\-\_\.]/gi, ""); // Strip any special charactere
        };
        /**
         * Creates the hierarchy string used for the auto managed _path.
         * @param hierarchy
         */
        var getHierarchyString = function (hierarchy) {
            var hierarchyString = "";
            if (typeof (hierarchy) === "string") {
                hierarchyString = cleanDirSegment(hierarchy.toString());
            }
            else if (hierarchy instanceof Array) {
                hierarchy.forEach(function (pi) {
                    hierarchyString += "/" + cleanDirSegment(pi);
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
        _this = _super.call(this, e, path, true) || this;
        _this.hierarchy = hierarchy;
        _this.hierarchyString = getHierarchyString(hierarchy);
        return _this;
    }
    return AutoFolderNest;
}(folderNest_1.FolderNest));
exports.AutoFolderNest = AutoFolderNest;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9uZXN0L2F1dG9Gb2xkZXJOZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDJDQUF3QztBQUd4QyxJQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQ2xCLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFN0I7O0dBRUc7QUFDSDtJQUFvQyxrQ0FBVTtJQUsxQyx3QkFBWSxDQUFjLEVBQUUsU0FBMEI7UUFBdEQsaUJBdUNDO1FBckNHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztZQUNoQyxNQUFNLCtFQUErRSxDQUFDO1FBQzFGLENBQUM7UUFFRCxJQUFJLGVBQWUsR0FBRyxVQUFTLElBQUk7WUFDL0IsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsZ0NBQWdDO1lBQ25FLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsK0JBQStCO1FBQ3BGLENBQUMsQ0FBQztRQUVGOzs7V0FHRztRQUNILElBQUksa0JBQWtCLEdBQUcsVUFBQyxTQUEwQjtZQUNoRCxJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsT0FBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLGVBQWUsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDNUQsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQUU7b0JBQ2pCLGVBQWUsSUFBSSxHQUFHLEdBQUcsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixNQUFNLHVDQUFxQyxPQUFNLENBQUMsU0FBUyxDQUFDLFlBQVMsQ0FBQztZQUMxRSxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxlQUFlLEdBQUcsR0FBRyxHQUFHLGVBQWUsQ0FBQztZQUM1QyxDQUFDO1lBQ0QsTUFBTSxDQUFDLGVBQWUsQ0FBQztRQUMzQixDQUFDLENBQUM7UUFFRixJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsMEJBQTBCLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFeEUsUUFBQSxrQkFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFDO1FBRXJCLEtBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLEtBQUksQ0FBQyxlQUFlLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7O0lBRXpELENBQUM7SUFHTCxxQkFBQztBQUFELENBL0NBLEFBK0NDLENBL0NtQyx1QkFBVSxHQStDN0M7QUEvQ1ksd0NBQWMiLCJmaWxlIjoibGliL25lc3QvYXV0b0ZvbGRlck5lc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0ZvbGRlck5lc3R9IGZyb20gXCIuL2ZvbGRlck5lc3RcIjtcclxuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XHJcblxyXG5jb25zdCAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxyXG4gICAgICAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIik7XHJcblxyXG4vKipcclxuICogQW4gYXV0byBtYW5hZ2VkIGZvbGRlciBuZXN0IHVzZWQgZm9yIHRlbXBvcmFyaWx5IHN0b3JpbmcgX2ZpbGVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEF1dG9Gb2xkZXJOZXN0IGV4dGVuZHMgRm9sZGVyTmVzdCB7XHJcblxyXG4gICAgcHJvdGVjdGVkIGhpZXJhcmNoeTogc3RyaW5nfHN0cmluZ1tdO1xyXG4gICAgcHJvdGVjdGVkIGhpZXJhcmNoeVN0cmluZzogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBoaWVyYXJjaHk6IHN0cmluZ3xzdHJpbmdbXSkge1xyXG5cclxuICAgICAgICBpZiAoIWUuYXV0b01hbmFnZWRGb2xkZXJEaXJlY3RvcnkpIHtcclxuICAgICAgICAgICAgdGhyb3cgXCJPcHRpb24gYXV0b19tYW5hZ2VkX2ZvbGRlcl9kaXJlY3RvcnkgbXVzdCBiZSBzZXQgdG8gdXNlIGF1dG8gbWFuYWdlZCBmb2xkZXJzLlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNsZWFuRGlyU2VnbWVudCA9IGZ1bmN0aW9uKG5hbWUpIHtcclxuICAgICAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvXFxzKy9naSwgXCItXCIpOyAvLyBSZXBsYWNlIHdoaXRlIHNwYWNlIHdpdGggZGFzaFxyXG4gICAgICAgICAgICByZXR1cm4gbmFtZS5yZXBsYWNlKC9bXmEtekEtWjAtOVxcLVxcX1xcLl0vZ2ksIFwiXCIpOyAvLyBTdHJpcCBhbnkgc3BlY2lhbCBjaGFyYWN0ZXJlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyB0aGUgaGllcmFyY2h5IHN0cmluZyB1c2VkIGZvciB0aGUgYXV0byBtYW5hZ2VkIF9wYXRoLlxyXG4gICAgICAgICAqIEBwYXJhbSBoaWVyYXJjaHlcclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgZ2V0SGllcmFyY2h5U3RyaW5nID0gKGhpZXJhcmNoeTogc3RyaW5nfHN0cmluZ1tdKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBoaWVyYXJjaHlTdHJpbmcgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mKGhpZXJhcmNoeSkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIGhpZXJhcmNoeVN0cmluZyA9IGNsZWFuRGlyU2VnbWVudChoaWVyYXJjaHkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGllcmFyY2h5IGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgIGhpZXJhcmNoeS5mb3JFYWNoKChwaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZXJhcmNoeVN0cmluZyArPSBcIi9cIiArIGNsZWFuRGlyU2VnbWVudChwaSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IGBQYXRoIHNob3VsZCBiZSBhIHN0cmluZyBvciBhcnJheSwgJHt0eXBlb2YoaGllcmFyY2h5KX0gZm91bmQuYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGllcmFyY2h5U3RyaW5nLmNoYXJBdCgwKSAhPT0gXCIvXCIpIHtcclxuICAgICAgICAgICAgICAgIGhpZXJhcmNoeVN0cmluZyA9IFwiL1wiICsgaGllcmFyY2h5U3RyaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBoaWVyYXJjaHlTdHJpbmc7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHBhdGggPSBlLmF1dG9NYW5hZ2VkRm9sZGVyRGlyZWN0b3J5ICsgZ2V0SGllcmFyY2h5U3RyaW5nKGhpZXJhcmNoeSk7XHJcblxyXG4gICAgICAgIHN1cGVyKGUsIHBhdGgsIHRydWUpO1xyXG5cclxuICAgICAgICB0aGlzLmhpZXJhcmNoeSA9IGhpZXJhcmNoeTtcclxuICAgICAgICB0aGlzLmhpZXJhcmNoeVN0cmluZyA9IGdldEhpZXJhcmNoeVN0cmluZyhoaWVyYXJjaHkpO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG59Il19
