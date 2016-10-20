"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fileJob_1 = require("./fileJob");
var PackedJob = (function (_super) {
    __extends(PackedJob, _super);
    function PackedJob(e, job) {
        // let job_name = job.getName();
        _super.call(this, e, job);
        this.e = e;
        console.log("PACKED JOB");
    }
    return PackedJob;
}(fileJob_1.FileJob));
exports.PackedJob = PackedJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2IvcGFja2VkSm9iLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLHdCQUFzQixXQUFXLENBQUMsQ0FBQTtBQUVsQztJQUErQiw2QkFBTztJQUtsQyxtQkFBWSxDQUFjLEVBQUUsR0FBVztRQUNuQyxnQ0FBZ0M7UUFDaEMsa0JBQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFWCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTCxnQkFBQztBQUFELENBYkEsQUFhQyxDQWI4QixpQkFBTyxHQWFyQztBQWJZLGlCQUFTLFlBYXJCLENBQUEiLCJmaWxlIjoibGliL2pvYi9wYWNrZWRKb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7RmlsZUpvYn0gZnJvbSBcIi4vZmlsZUpvYlwiO1xuXG5leHBvcnQgY2xhc3MgUGFja2VkSm9iIGV4dGVuZHMgRmlsZUpvYiB7XG5cbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG4gICAgcHJvdGVjdGVkIGpvYjogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIGpvYjogc3RyaW5nKSB7XG4gICAgICAgIC8vIGxldCBqb2JfbmFtZSA9IGpvYi5nZXROYW1lKCk7XG4gICAgICAgIHN1cGVyKGUsIGpvYik7XG4gICAgICAgIHRoaXMuZSA9IGU7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJQQUNLRUQgSk9CXCIpO1xuICAgIH1cblxufSJdfQ==
