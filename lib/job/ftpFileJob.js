"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fileJob_1 = require("./fileJob");
var tmp = require("tmp");
var FtpFileJob = (function (_super) {
    __extends(FtpFileJob, _super);
    function FtpFileJob(e, basename) {
        // Create temp file
        var tmpobj = tmp.fileSync();
        _super.call(this, e, tmpobj.name);
        this.rename(basename);
        this.locallyAvailable = false;
    }
    return FtpFileJob;
}(fileJob_1.FileJob));
exports.FtpFileJob = FtpFileJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2IvZnRwRmlsZUpvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx3QkFBc0IsV0FBVyxDQUFDLENBQUE7QUFJbEMsSUFBUSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRTdCO0lBQWdDLDhCQUFPO0lBSW5DLG9CQUFZLENBQWMsRUFBRSxRQUFRO1FBQ2hDLG1CQUFtQjtRQUNuQixJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUIsa0JBQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV0QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7SUFDbEMsQ0FBQztJQUVMLGlCQUFDO0FBQUQsQ0FiQSxBQWFDLENBYitCLGlCQUFPLEdBYXRDO0FBYlksa0JBQVUsYUFhdEIsQ0FBQSIsImZpbGUiOiJsaWIvam9iL2Z0cEZpbGVKb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0ZpbGVKb2J9IGZyb20gXCIuL2ZpbGVKb2JcIjtcbmltcG9ydCB7RmlsZX0gZnJvbSBcIi4vZmlsZVwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4vLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcblxuY29uc3QgICB0bXAgPSByZXF1aXJlKFwidG1wXCIpO1xuXG5leHBvcnQgY2xhc3MgRnRwRmlsZUpvYiBleHRlbmRzIEZpbGVKb2Ige1xuXG4gICAgcHJvdGVjdGVkIF9maWxlOiBGaWxlO1xuXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIGJhc2VuYW1lKSB7XG4gICAgICAgIC8vIENyZWF0ZSB0ZW1wIGZpbGVcbiAgICAgICAgbGV0IHRtcG9iaiA9IHRtcC5maWxlU3luYygpO1xuICAgICAgICBzdXBlcihlLCB0bXBvYmoubmFtZSk7XG5cbiAgICAgICAgdGhpcy5yZW5hbWUoYmFzZW5hbWUpO1xuICAgICAgICB0aGlzLmxvY2FsbHlBdmFpbGFibGUgPSBmYWxzZTtcbiAgICB9XG5cbn0iXX0=
