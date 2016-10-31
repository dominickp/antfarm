"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fileJob_1 = require("./fileJob");
var tmp = require("tmp");
var S3FileJob = (function (_super) {
    __extends(S3FileJob, _super);
    function S3FileJob(e, basename) {
        // Create temp file
        var tmpobj = tmp.fileSync();
        _super.call(this, e, tmpobj.name);
        this.rename(basename);
        this.locallyAvailable = false;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2IvczNGaWxlSm9iLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHdCQUFzQixXQUFXLENBQUMsQ0FBQTtBQUlsQyxJQUFRLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFN0I7SUFBK0IsNkJBQU87SUFPbEMsbUJBQVksQ0FBYyxFQUFFLFFBQVE7UUFDaEMsbUJBQW1CO1FBQ25CLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM1QixrQkFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztJQUNsQyxDQUFDO0lBTUQsc0JBQVcsNkJBQU07UUFJakI7OztXQUdHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDO1FBZEQ7OztXQUdHO2FBQ0gsVUFBa0IsTUFBYztZQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUMxQixDQUFDOzs7T0FBQTtJQWNELHNCQUFXLDBCQUFHO1FBSWQ7OztXQUdHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixDQUFDO1FBZEQ7OztXQUdHO2FBQ0gsVUFBZSxHQUFXO1lBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ3BCLENBQUM7OztPQUFBO0lBY0Qsc0JBQVcsMkJBQUk7UUFJZjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7UUFkRDs7O1dBR0c7YUFDSCxVQUFnQixJQUFZO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBVUwsZ0JBQUM7QUFBRCxDQS9EQSxBQStEQyxDQS9EOEIsaUJBQU8sR0ErRHJDO0FBL0RZLGlCQUFTLFlBK0RyQixDQUFBIiwiZmlsZSI6ImxpYi9qb2IvczNGaWxlSm9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtGaWxlSm9ifSBmcm9tIFwiLi9maWxlSm9iXCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLy4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5cbmNvbnN0ICAgdG1wID0gcmVxdWlyZShcInRtcFwiKTtcblxuZXhwb3J0IGNsYXNzIFMzRmlsZUpvYiBleHRlbmRzIEZpbGVKb2Ige1xuXG4gICAgcHJvdGVjdGVkIF9maWxlOiBGaWxlO1xuICAgIHByaXZhdGUgX2J1Y2tldDogc3RyaW5nO1xuICAgIHByaXZhdGUgX2tleTogc3RyaW5nO1xuICAgIHByaXZhdGUgX2VUYWc6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBiYXNlbmFtZSkge1xuICAgICAgICAvLyBDcmVhdGUgdGVtcCBmaWxlXG4gICAgICAgIGxldCB0bXBvYmogPSB0bXAuZmlsZVN5bmMoKTtcbiAgICAgICAgc3VwZXIoZSwgdG1wb2JqLm5hbWUpO1xuICAgICAgICB0aGlzLnJlbmFtZShiYXNlbmFtZSk7XG4gICAgICAgIHRoaXMubG9jYWxseUF2YWlsYWJsZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCByZW1vdGUgYnVja2V0IGxvY2F0aW9uLlxuICAgICAqIEBwYXJhbSBidWNrZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGJ1Y2tldChidWNrZXQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9idWNrZXQgPSBidWNrZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbW90ZSBidWNrZXQgbG9jYXRpb24uXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGJ1Y2tldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J1Y2tldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgcmVtb3RlIGtleS5cbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICovXG4gICAgcHVibGljIHNldCBrZXkoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fa2V5ID0ga2V5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCByZW1vdGUga2V5XG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGtleSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2tleTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgcmVtb3RlIEVUYWdcbiAgICAgKiBAcGFyYW0gZVRhZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgZVRhZyhlVGFnOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fZVRhZyA9IGVUYWc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbW90ZSBFVGFnXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGVUYWcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lVGFnO1xuICAgIH1cblxufSJdfQ==
