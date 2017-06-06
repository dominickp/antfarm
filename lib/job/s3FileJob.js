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
var S3FileJob = (function (_super) {
    __extends(S3FileJob, _super);
    function S3FileJob(e, basename) {
        var _this = this;
        // Create temp file
        var tmpobj = tmp.fileSync();
        _this = _super.call(this, e, tmpobj.name) || this;
        _this.rename(basename);
        _this.locallyAvailable = false;
        return _this;
    }
    Object.defineProperty(S3FileJob.prototype, "bucket", {
        /**
         * Get remote bucket location.
         * @returns {string}
         */
        get: function () {
            return this._bucket;
        },
        /**
         * Set remote bucket location.
         * @param bucket
         */
        set: function (bucket) {
            this._bucket = bucket;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(S3FileJob.prototype, "key", {
        /**
         * Get remote key
         * @returns {string}
         */
        get: function () {
            return this._key;
        },
        /**
         * Set remote key.
         * @param key
         */
        set: function (key) {
            this._key = key;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(S3FileJob.prototype, "eTag", {
        /**
         * Get remote ETag
         * @returns {string}
         */
        get: function () {
            return this._eTag;
        },
        /**
         * Set remote ETag
         * @param eTag
         */
        set: function (eTag) {
            this._eTag = eTag;
        },
        enumerable: true,
        configurable: true
    });
    return S3FileJob;
}(fileJob_1.FileJob));
exports.S3FileJob = S3FileJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2IvczNGaWxlSm9iLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFrQztBQUlsQyxJQUFRLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFN0I7SUFBK0IsNkJBQU87SUFPbEMsbUJBQVksQ0FBYyxFQUFFLFFBQVE7UUFBcEMsaUJBTUM7UUFMRyxtQkFBbUI7UUFDbkIsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzVCLFFBQUEsa0JBQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBQztRQUN0QixLQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7O0lBQ2xDLENBQUM7SUFNRCxzQkFBVyw2QkFBTTtRQUlqQjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3hCLENBQUM7UUFkRDs7O1dBR0c7YUFDSCxVQUFrQixNQUFjO1lBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQzFCLENBQUM7OztPQUFBO0lBY0Qsc0JBQVcsMEJBQUc7UUFJZDs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLENBQUM7UUFkRDs7O1dBR0c7YUFDSCxVQUFlLEdBQVc7WUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDcEIsQ0FBQzs7O09BQUE7SUFjRCxzQkFBVywyQkFBSTtRQUlmOzs7V0FHRzthQUNIO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQztRQWREOzs7V0FHRzthQUNILFVBQWdCLElBQVk7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQzs7O09BQUE7SUFVTCxnQkFBQztBQUFELENBL0RBLEFBK0RDLENBL0Q4QixpQkFBTyxHQStEckM7QUEvRFksOEJBQVMiLCJmaWxlIjoibGliL2pvYi9zM0ZpbGVKb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0ZpbGVKb2J9IGZyb20gXCIuL2ZpbGVKb2JcIjtcclxuaW1wb3J0IHtGaWxlfSBmcm9tIFwiLi9maWxlXCI7XHJcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLy4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XHJcblxyXG5jb25zdCAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIik7XHJcblxyXG5leHBvcnQgY2xhc3MgUzNGaWxlSm9iIGV4dGVuZHMgRmlsZUpvYiB7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9maWxlOiBGaWxlO1xyXG4gICAgcHJpdmF0ZSBfYnVja2V0OiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9rZXk6IHN0cmluZztcclxuICAgIHByaXZhdGUgX2VUYWc6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgYmFzZW5hbWUpIHtcclxuICAgICAgICAvLyBDcmVhdGUgdGVtcCBmaWxlXHJcbiAgICAgICAgbGV0IHRtcG9iaiA9IHRtcC5maWxlU3luYygpO1xyXG4gICAgICAgIHN1cGVyKGUsIHRtcG9iai5uYW1lKTtcclxuICAgICAgICB0aGlzLnJlbmFtZShiYXNlbmFtZSk7XHJcbiAgICAgICAgdGhpcy5sb2NhbGx5QXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgcmVtb3RlIGJ1Y2tldCBsb2NhdGlvbi5cclxuICAgICAqIEBwYXJhbSBidWNrZXRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBidWNrZXQoYnVja2V0OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9idWNrZXQgPSBidWNrZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgcmVtb3RlIGJ1Y2tldCBsb2NhdGlvbi5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgYnVja2V0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9idWNrZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgcmVtb3RlIGtleS5cclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBrZXkoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9rZXkgPSBrZXk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgcmVtb3RlIGtleVxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBrZXkoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2tleTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCByZW1vdGUgRVRhZ1xyXG4gICAgICogQHBhcmFtIGVUYWdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBlVGFnKGVUYWc6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX2VUYWcgPSBlVGFnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHJlbW90ZSBFVGFnXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGVUYWcoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VUYWc7XHJcbiAgICB9XHJcblxyXG59Il19
