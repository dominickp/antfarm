"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nest_1 = require("./nest");
var AWS = require("aws-sdk"), _ = require("lodash");
var S3Nest = (function (_super) {
    __extends(S3Nest, _super);
    /**
     * Constructor
     * @param e
     * @param bucket            AWS S3 bucket to watch.
     * @param keyPrefix         Optional key prefix (sub-directory) to watch.
     * @param checkEvery        Frequency of bucket checking, in minutes.
     * @param allowCreation     Create the bucket:prefix if it does not exist.
     */
    function S3Nest(e, bucket, keyPrefix, checkEvery, allowCreation) {
        if (checkEvery === void 0) { checkEvery = 5; }
        if (allowCreation === void 0) { allowCreation = false; }
        _super.call(this, e, "An S3 bucket");
        var sn = this;
        sn.s3 = new AWS.S3();
        sn.bucket = bucket;
        sn.keyPrefix = keyPrefix;
        sn.checkEvery = checkEvery;
        sn.allowCreation = allowCreation;
    }
    /**
     * Set hard-coded AWS credentials.
     * @param accessKeyId
     * @param secretAccessKey
     */
    S3Nest.prototype.setCredentials = function (accessKeyId, secretAccessKey) {
        AWS.config.update({ accessKeyId: accessKeyId, secretAccessKey: secretAccessKey });
    };
    /**
     * Verify bucket and handle creation of bucket if need be.
     */
    S3Nest.prototype.verifyBucket = function () {
        var sn = this;
        sn.headBucket(function (headSuccess) {
            if (!headSuccess) {
                if (sn.allowCreation) {
                    sn.createBucket(function (createSuccess) {
                        if (!createSuccess) {
                            sn.e.log(3, "Bucket \"" + sn.bucket + "\" could not be created.", sn);
                        }
                    });
                }
                else {
                    sn.e.log(3, "Bucket \"" + sn.bucket + "\" does not exist and allowCreation is set to false.", sn);
                }
            }
        });
    };
    /**
     * Verify that the bucket is available and exists
     * @param callback
     */
    S3Nest.prototype.headBucket = function (callback) {
        var sn = this;
        var params = { Bucket: sn.bucket };
        sn.s3.headBucket(params, function (err, data) {
            if (err) {
                sn.e.log(3, "headBucket error: " + err, sn);
                callback(false);
            }
            else {
                if (_.isEmpty(data)) {
                    sn.e.log(2, "headBucket empty response", sn);
                    callback(true);
                }
                else {
                    sn.e.log(0, "headBucket success: " + data, sn);
                    console.log(data);
                    callback(true);
                }
            }
        });
    };
    S3Nest.prototype.createBucket = function (callback) {
        var sn = this;
        var params = {
            Bucket: sn.bucket,
        };
        sn.s3.createBucket(params, function (err, data) {
            if (err) {
                sn.e.log(3, "createBucket error: " + err, sn);
                callback(false);
            }
            else {
                if (_.isEmpty(data)) {
                    sn.e.log(2, "createBucket empty response", sn);
                    callback(false);
                }
                else {
                    sn.e.log(0, "createBucket success: " + data, sn);
                    console.log(data);
                    callback(true);
                }
            }
        });
    };
    S3Nest.prototype.load = function () {
        var sn = this;
        sn.verifyBucket();
    };
    S3Nest.prototype.watch = function () {
    };
    /**
     * Nest arrival
     * @param job
     */
    S3Nest.prototype.arrive = function (job) {
        _super.prototype.arrive.call(this, job);
    };
    S3Nest.prototype.take = function () {
    };
    return S3Nest;
}(nest_1.Nest));
exports.S3Nest = S3Nest;
