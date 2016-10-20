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
        this.setLocallyAvailable(false);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2IvczNGaWxlSm9iLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHdCQUFzQixXQUFXLENBQUMsQ0FBQTtBQUlsQyxJQUFRLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFN0I7SUFBK0IsNkJBQU87SUFPbEMsbUJBQVksQ0FBYyxFQUFFLFFBQVE7UUFDaEMsbUJBQW1CO1FBQ25CLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM1QixrQkFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFNRCxzQkFBVyw2QkFBTTtRQUlqQjs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3hCLENBQUM7UUFkRDs7O1dBR0c7YUFDSCxVQUFrQixNQUFjO1lBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQzFCLENBQUM7OztPQUFBO0lBY0Qsc0JBQVcsMEJBQUc7UUFJZDs7O1dBR0c7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLENBQUM7UUFkRDs7O1dBR0c7YUFDSCxVQUFlLEdBQVc7WUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDcEIsQ0FBQzs7O09BQUE7SUFjRCxzQkFBVywyQkFBSTtRQUlmOzs7V0FHRzthQUNIO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQztRQWREOzs7V0FHRzthQUNILFVBQWdCLElBQVk7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQzs7O09BQUE7SUFVTCxnQkFBQztBQUFELENBL0RBLEFBK0RDLENBL0Q4QixpQkFBTyxHQStEckM7QUEvRFksaUJBQVMsWUErRHJCLENBQUEiLCJmaWxlIjoibGliL2pvYi9zM0ZpbGVKb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0ZpbGVKb2J9IGZyb20gXCIuL2ZpbGVKb2JcIjtcbmltcG9ydCB7RmlsZX0gZnJvbSBcIi4vZmlsZVwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4vLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcblxuY29uc3QgICB0bXAgPSByZXF1aXJlKFwidG1wXCIpO1xuXG5leHBvcnQgY2xhc3MgUzNGaWxlSm9iIGV4dGVuZHMgRmlsZUpvYiB7XG5cbiAgICBwcm90ZWN0ZWQgZmlsZTogRmlsZTtcbiAgICBwcml2YXRlIF9idWNrZXQ6IHN0cmluZztcbiAgICBwcml2YXRlIF9rZXk6IHN0cmluZztcbiAgICBwcml2YXRlIF9lVGFnOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgYmFzZW5hbWUpIHtcbiAgICAgICAgLy8gQ3JlYXRlIHRlbXAgZmlsZVxuICAgICAgICBsZXQgdG1wb2JqID0gdG1wLmZpbGVTeW5jKCk7XG4gICAgICAgIHN1cGVyKGUsIHRtcG9iai5uYW1lKTtcbiAgICAgICAgdGhpcy5yZW5hbWUoYmFzZW5hbWUpO1xuICAgICAgICB0aGlzLnNldExvY2FsbHlBdmFpbGFibGUoZmFsc2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCByZW1vdGUgYnVja2V0IGxvY2F0aW9uLlxuICAgICAqIEBwYXJhbSBidWNrZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGJ1Y2tldChidWNrZXQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9idWNrZXQgPSBidWNrZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbW90ZSBidWNrZXQgbG9jYXRpb24uXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGJ1Y2tldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J1Y2tldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgcmVtb3RlIGtleS5cbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICovXG4gICAgcHVibGljIHNldCBrZXkoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fa2V5ID0ga2V5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCByZW1vdGUga2V5XG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGtleSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2tleTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgcmVtb3RlIEVUYWdcbiAgICAgKiBAcGFyYW0gZVRhZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgZVRhZyhlVGFnOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fZVRhZyA9IGVUYWc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbW90ZSBFVGFnXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGVUYWcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lVGFnO1xuICAgIH1cblxufSJdfQ==
