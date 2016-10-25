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
        this.setLocallyAvailable(false);
    }
    return FtpFileJob;
}(fileJob_1.FileJob));
exports.FtpFileJob = FtpFileJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2IvZnRwRmlsZUpvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx3QkFBc0IsV0FBVyxDQUFDLENBQUE7QUFJbEMsSUFBUSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRTdCO0lBQWdDLDhCQUFPO0lBSW5DLG9CQUFZLENBQWMsRUFBRSxRQUFRO1FBQ2hDLG1CQUFtQjtRQUNuQixJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUIsa0JBQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV0QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUwsaUJBQUM7QUFBRCxDQWJBLEFBYUMsQ0FiK0IsaUJBQU8sR0FhdEM7QUFiWSxrQkFBVSxhQWF0QixDQUFBIiwiZmlsZSI6ImxpYi9qb2IvZnRwRmlsZUpvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RmlsZUpvYn0gZnJvbSBcIi4vZmlsZUpvYlwiO1xuaW1wb3J0IHtGaWxlfSBmcm9tIFwiLi9maWxlXCI7XG5pbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi8uLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuXG5jb25zdCAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIik7XG5cbmV4cG9ydCBjbGFzcyBGdHBGaWxlSm9iIGV4dGVuZHMgRmlsZUpvYiB7XG5cbiAgICBwcm90ZWN0ZWQgZmlsZTogRmlsZTtcblxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBiYXNlbmFtZSkge1xuICAgICAgICAvLyBDcmVhdGUgdGVtcCBmaWxlXG4gICAgICAgIGxldCB0bXBvYmogPSB0bXAuZmlsZVN5bmMoKTtcbiAgICAgICAgc3VwZXIoZSwgdG1wb2JqLm5hbWUpO1xuXG4gICAgICAgIHRoaXMucmVuYW1lKGJhc2VuYW1lKTtcbiAgICAgICAgdGhpcy5zZXRMb2NhbGx5QXZhaWxhYmxlKGZhbHNlKTtcbiAgICB9XG5cbn0iXX0=
