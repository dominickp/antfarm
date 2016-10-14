"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nest_1 = require("./nest");
var s3FileJob_1 = require("../job/s3FileJob");
var AWS = require("aws-sdk"), _ = require("lodash"), async = require("async"), fs = require("fs");
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
        sn.checkEveryMs = checkEvery * 60000;
        sn.allowCreation = allowCreation;
        sn.verifyBucket();
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
                sn.e.log(2, "headBucket error: " + err, sn);
                callback(false);
            }
            else {
                // if (_.isEmpty(data)) {
                //     sn.e.log(2, `headBucket empty response`, sn);
                //     callback(true);
                // } else {
                //     sn.e.log(0, `headBucket success: ${data}`, sn);
                //     console.log(data);
                //     callback(true);
                // }
                sn.e.log(0, "Bucket \"" + sn.bucket + "\" is available.", sn);
                callback(true);
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
                    callback(true);
                }
            }
        });
    };
    S3Nest.prototype.load = function () {
        var sn = this;
        var params = {
            Bucket: sn.bucket,
            // ContinuationToken: 'STRING_VALUE',
            // Delimiter: 'STRING_VALUE',
            // EncodingType: 'url',
            // FetchOwner: true || false,
            // MaxKeys: 0,
            Prefix: sn.keyPrefix
        };
        sn.s3.listObjectsV2(params, function (err, data) {
            if (err) {
                sn.e.log(3, "listObjectsV2: " + err, sn);
            }
            else {
                var contents_1 = data.Contents;
                // Download each file found
                if (contents_1.length > 0) {
                    sn.e.log(0, "Found " + contents_1.length + " objects in \"" + sn.bucket + "/" + sn.keyPrefix + "\".", sn);
                    async.eachSeries(contents_1, function (object, done) {
                        // Create temp file
                        sn.e.log(1, "S3 found file \"" + object.Key + "\".", sn);
                        var job = new s3FileJob_1.S3FileJob(sn.e, object.Key);
                        // Download and pipe to file
                        var params = { Bucket: sn.bucket, Key: object.Key };
                        var file = require("fs").createWriteStream(job.getPath());
                        sn.s3.getObject(params).createReadStream().pipe(file);
                        sn.e.log(1, "Downloading \"" + object.Key + "\".", sn);
                        file.on("close", function () {
                            // Delete object
                            sn.deleteObject(object.Key);
                            sn.arrive(job);
                            done();
                        });
                    }, function (err) {
                        if (err) {
                            sn.e.log(3, "Async series download error: \"" + err + "\".", sn);
                        }
                        sn.e.log(0, "Completed " + contents_1.length + " synchronous download(s).", sn);
                    });
                }
            }
        });
    };
    /**
     * Removes an object from an S3 bucket.
     * @param key
     */
    S3Nest.prototype.deleteObject = function (key) {
        var sn = this;
        var params = {
            Bucket: sn.bucket,
            Key: key /* required */
        };
        sn.s3.deleteObject(params, function (err) {
            if (err) {
                sn.e.log(3, "S3 delete object error " + err, sn);
            }
        });
    };
    /**
     * Watch an S3 bucket.
     */
    S3Nest.prototype.watch = function () {
        var sn = this;
        if (sn.checkEvery === 0) {
            sn.e.log(3, "Cannot watch this bucket. Check every (minutes) set to 0.", sn);
        }
        else {
            sn.e.log(1, "Watching S3 bucket.", sn);
            var count_1 = 0;
            setInterval(function () {
                count_1++;
                sn.e.log(1, "Re-checking S3 bucket, attempt " + count_1 + ".", sn);
                sn.load();
            }, sn.checkEveryMs, count_1);
        }
    };
    /**
     * Nest arrival
     * @param job
     */
    S3Nest.prototype.arrive = function (job) {
        _super.prototype.arrive.call(this, job);
    };
    /**
     * Upload a file to an S3 bucket.
     */
    S3Nest.prototype.take = function (job, callback) {
        var sn = this;
        try {
            sn.uploadFile(job, function (s3Job) {
                callback(s3Job);
            });
        }
        catch (e) {
            sn.e.log(3, "Take upload error, " + e, sn);
        }
    };
    /**
     * Calculate the percent remaining from the httpUploadProgress event values.
     * @param total
     * @param loaded
     * @param part
     * @returns {number}
     */
    S3Nest.prototype.calculateRemaining = function (total, loaded, part) {
        var sn = this;
        if (!isNaN(total) && !isNaN(loaded)) {
            var percentRemaining = Math.round((loaded / total) * 100);
            if (isNaN(percentRemaining) || percentRemaining > 100) {
                sn.e.log(3, "Error calculating percent remaining: " + percentRemaining + " (" + typeof percentRemaining + "), total: " + total + ", loaded: " + loaded + ".", sn);
                return 0;
            }
            else {
                return percentRemaining;
            }
        }
        else {
            return 0;
        }
    };
    /**
     * Upload file to S3
     * @param job {FileJob}     FileJob to be uploaded.
     * @param callback          Callback includes the S3FileJob parameter.
     */
    S3Nest.prototype.uploadFile = function (job, callback) {
        var sn = this;
        var body = fs.createReadStream(job.getPath());
        var params = {
            Bucket: sn.bucket,
            Key: sn.keyPrefix + job.getName(),
            Body: body,
            ACL: "public-read"
        };
        var percentUploaded = 0;
        sn.s3.upload(params).
            on("httpUploadProgress", function (evt) {
            // console.log("evt", evt);
            percentUploaded = sn.calculateRemaining(evt.total, evt.loaded, evt.part);
            sn.e.log(0, "Uploading \"" + evt.key + "\" - " + percentUploaded + "%", sn);
        }).
            send(function (err, data) {
            if (err) {
                sn.e.log(3, "S3 upload error: " + err, sn);
            }
            // Change job type to a S3FileJob
            var s3Job = job;
            s3Job.setLocallyAvailable(false);
            s3Job.setPath(data.Location);
            s3Job.bucket = data.Bucket;
            s3Job.key = data.Key;
            s3Job.eTag = data.ETag;
            callback(s3Job);
        });
    };
    return S3Nest;
}(nest_1.Nest));
exports.S3Nest = S3Nest;
//# sourceMappingURL=s3Nest.js.map