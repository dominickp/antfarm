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
