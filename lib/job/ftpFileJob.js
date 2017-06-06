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
var fileJob_1 = require("./fileJob");
var tmp = require("tmp");
var FtpFileJob = (function (_super) {
    __extends(FtpFileJob, _super);
    function FtpFileJob(e, basename) {
        var _this = this;
        // Create temp file
        var tmpobj = tmp.fileSync();
        _this = _super.call(this, e, tmpobj.name) || this;
        _this.rename(basename);
        _this.locallyAvailable = false;
        return _this;
    }
    return FtpFileJob;
}(fileJob_1.FileJob));
exports.FtpFileJob = FtpFileJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2IvZnRwRmlsZUpvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBa0M7QUFJbEMsSUFBUSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRTdCO0lBQWdDLDhCQUFPO0lBSW5DLG9CQUFZLENBQWMsRUFBRSxRQUFRO1FBQXBDLGlCQU9DO1FBTkcsbUJBQW1CO1FBQ25CLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM1QixRQUFBLGtCQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQUM7UUFFdEIsS0FBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixLQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDOztJQUNsQyxDQUFDO0lBRUwsaUJBQUM7QUFBRCxDQWJBLEFBYUMsQ0FiK0IsaUJBQU8sR0FhdEM7QUFiWSxnQ0FBVSIsImZpbGUiOiJsaWIvam9iL2Z0cEZpbGVKb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0ZpbGVKb2J9IGZyb20gXCIuL2ZpbGVKb2JcIjtcclxuaW1wb3J0IHtGaWxlfSBmcm9tIFwiLi9maWxlXCI7XHJcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLy4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XHJcblxyXG5jb25zdCAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIik7XHJcblxyXG5leHBvcnQgY2xhc3MgRnRwRmlsZUpvYiBleHRlbmRzIEZpbGVKb2Ige1xyXG5cclxuICAgIHByb3RlY3RlZCBfZmlsZTogRmlsZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgYmFzZW5hbWUpIHtcclxuICAgICAgICAvLyBDcmVhdGUgdGVtcCBmaWxlXHJcbiAgICAgICAgbGV0IHRtcG9iaiA9IHRtcC5maWxlU3luYygpO1xyXG4gICAgICAgIHN1cGVyKGUsIHRtcG9iai5uYW1lKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5hbWUoYmFzZW5hbWUpO1xyXG4gICAgICAgIHRoaXMubG9jYWxseUF2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxufSJdfQ==
