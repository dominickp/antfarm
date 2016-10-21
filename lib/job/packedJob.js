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
        _super.call(this, e, job.getName());
        this.e = e;
        this.job = job;
        console.log("PACKED JOB");
        this.pack();
    }
    /**
     *
     * @returns {string}
     */
    PackedJob.prototype.getJob = function () {
        return this.job;
    };
    /**
     * Packs the related job on construction.
     */
    PackedJob.prototype.pack = function () {
        var pj = this;
        var job = pj.getJob();
        var json = job.getJSON();
        console.log(json);
    };
    return PackedJob;
}(fileJob_1.FileJob));
exports.PackedJob = PackedJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2IvcGFja2VkSm9iLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLHdCQUFzQixXQUFXLENBQUMsQ0FBQTtBQUdsQztJQUErQiw2QkFBTztJQUtsQyxtQkFBWSxDQUFjLEVBQUUsR0FBUTtRQUNoQyxnQ0FBZ0M7UUFDaEMsa0JBQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFFZixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTFCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksMEJBQU0sR0FBYjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7T0FFRztJQUNPLHdCQUFJLEdBQWQ7UUFDSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFdEIsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBSXpCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVMLGdCQUFDO0FBQUQsQ0F0Q0EsQUFzQ0MsQ0F0QzhCLGlCQUFPLEdBc0NyQztBQXRDWSxpQkFBUyxZQXNDckIsQ0FBQSIsImZpbGUiOiJsaWIvam9iL3BhY2tlZEpvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtGaWxlSm9ifSBmcm9tIFwiLi9maWxlSm9iXCI7XG5pbXBvcnQge0pvYn0gZnJvbSBcIi4vam9iXCI7XG5cbmV4cG9ydCBjbGFzcyBQYWNrZWRKb2IgZXh0ZW5kcyBGaWxlSm9iIHtcblxuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcbiAgICBwcm90ZWN0ZWQgam9iOiBKb2I7XG5cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgam9iOiBKb2IpIHtcbiAgICAgICAgLy8gbGV0IGpvYl9uYW1lID0gam9iLmdldE5hbWUoKTtcbiAgICAgICAgc3VwZXIoZSwgam9iLmdldE5hbWUoKSk7XG4gICAgICAgIHRoaXMuZSA9IGU7XG4gICAgICAgIHRoaXMuam9iID0gam9iO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiUEFDS0VEIEpPQlwiKTtcblxuICAgICAgICB0aGlzLnBhY2soKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHVibGljIGdldEpvYigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuam9iO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhY2tzIHRoZSByZWxhdGVkIGpvYiBvbiBjb25zdHJ1Y3Rpb24uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHBhY2soKSB7XG4gICAgICAgIGxldCBwaiA9IHRoaXM7XG4gICAgICAgIGxldCBqb2IgPSBwai5nZXRKb2IoKTtcblxuICAgICAgICBsZXQganNvbiA9IGpvYi5nZXRKU09OKCk7XG5cblxuXG4gICAgICAgIGNvbnNvbGUubG9nKGpzb24pO1xuICAgIH1cblxufSJdfQ==
