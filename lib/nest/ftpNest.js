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
var nest_1 = require("./nest");
var ftpFileJob_1 = require("./../job/ftpFileJob");
var EasyFtp = require("easy-ftp"), tmp = require("tmp"), fs = require("fs"), async = require("async");
var FtpNest = (function (_super) {
    __extends(FtpNest, _super);
    function FtpNest(e, host, port, username, password, checkEvery) {
        var _this = _super.call(this, e, host) || this;
        _this.config = {
            host: host,
            port: port,
            username: username,
            password: password
        };
        _this.checkEvery = checkEvery;
        _this.checkEveryMs = _this.checkEvery * 60000;
        return _this;
    }
    FtpNest.prototype.getClient = function () {
        return new EasyFtp();
    };
    FtpNest.prototype.load = function () {
        var ftp = this;
        try {
            var ftp_client_1 = ftp.getClient();
            ftp_client_1.connect(ftp.config);
            ftp_client_1.ls("/", function (err, list) {
                if (err) {
                    ftp_client_1.close();
                }
                ftp.e.log(1, "FTP ls found " + list.length + " files.", ftp);
                async.eachSeries(list, function (file, done) {
                    // Create temp file
                    ftp.e.log(1, "FTP found file \"" + file.name + "\".", ftp);
                    var job = new ftpFileJob_1.FtpFileJob(ftp.e, file.name);
                    // Download to the temp job location
                    ftp_client_1.download(file.name, job.path, function (err) {
                        if (err) {
                            ftp.e.log(3, "Download error: \"" + err + "\".", ftp);
                            done();
                        }
                        else {
                            job.locallyAvailable = true;
                            // Delete on success
                            ftp_client_1.rm(file.name, function (err) {
                                if (err) {
                                    ftp.e.log(3, "Remove error: \"" + err + "\".", ftp);
                                }
                                ftp.arrive(job);
                                done();
                            });
                        }
                    });
                }, function (err) {
                    if (err) {
                        ftp.e.log(3, "Async series download error: \"" + err + "\".", ftp);
                    }
                    ftp.e.log(0, "Completed " + list.length + " synchronous download(s).", ftp);
                    ftp_client_1.close();
                });
                //
                // list.forEach(function (file, index) {
                //
                // });
            });
        }
        catch (e) {
            ftp.e.log(3, e, ftp);
        }
    };
    FtpNest.prototype.watch = function () {
        var ftp = this;
        ftp.e.log(1, "Watching FTP directory.", ftp);
        var count = 0;
        setInterval(function () {
            count++;
            ftp.e.log(1, "Re-checking FTP, attempt " + count + ".", ftp);
            ftp.load();
        }, ftp.checkEveryMs, count);
    };
    FtpNest.prototype.arrive = function (job) {
        _super.prototype.arrive.call(this, job);
    };
    FtpNest.prototype.take = function (job, callback) {
        var ftp = this;
        try {
            var ftp_path = "/" + job.name;
            var ftp_client_2 = ftp.getClient();
            ftp_client_2.connect(ftp.config);
            ftp_client_2.upload(job.path, ftp_path, function (err) {
                if (err) {
                    ftp.e.log(3, "Error uploading " + job.name + " to FTP.", ftp);
                }
                fs.unlinkSync(job.path);
                ftp_client_2.close();
                var ftpJob = job;
                ftpJob.locallyAvailable = false;
                callback(ftpJob);
            });
        }
        catch (e) {
            ftp.e.log(3, "Take upload error, " + e, ftp);
        }
    };
    return FtpNest;
}(nest_1.Nest));
exports.FtpNest = FtpNest;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxxQkFBcUIsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakQsQ0FBQztJQUNMLENBQUM7SUFFTCxjQUFDO0FBQUQsQ0FqSUEsQUFpSUMsQ0FqSTRCLFdBQUksR0FpSWhDO0FBaklZLDBCQUFPIiwiZmlsZSI6ImxpYi9uZXN0L2Z0cE5lc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXN0IH0gZnJvbSBcIi4vbmVzdFwiO1xyXG5pbXBvcnQgeyBGaWxlSm9iIH0gZnJvbSBcIi4vLi4vam9iL2ZpbGVKb2JcIjtcclxuaW1wb3J0IHsgRnRwRmlsZUpvYiB9IGZyb20gXCIuLy4uL2pvYi9mdHBGaWxlSm9iXCI7XHJcblxyXG5jb25zdCAgIEVhc3lGdHAgPSByZXF1aXJlKFwiZWFzeS1mdHBcIiksXHJcbiAgICAgICAgdG1wID0gcmVxdWlyZShcInRtcFwiKSxcclxuICAgICAgICBmcyA9IHJlcXVpcmUoXCJmc1wiKSxcclxuICAgICAgICBhc3luYyA9IHJlcXVpcmUoXCJhc3luY1wiKTtcclxuXHJcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZ0cE5lc3QgZXh0ZW5kcyBOZXN0IHtcclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xpZW50OiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgY29uZmlnOiB7fTtcclxuICAgIHByb3RlY3RlZCBjaGVja0V2ZXJ5OiBudW1iZXI7XHJcbiAgICBwcm90ZWN0ZWQgY2hlY2tFdmVyeU1zOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIGhvc3Q6IHN0cmluZywgcG9ydDogbnVtYmVyLCB1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBjaGVja0V2ZXJ5OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcihlLCBob3N0KTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB7XHJcbiAgICAgICAgICAgIGhvc3Q6IGhvc3QsXHJcbiAgICAgICAgICAgIHBvcnQ6IHBvcnQsXHJcbiAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcclxuICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jaGVja0V2ZXJ5ID0gY2hlY2tFdmVyeTtcclxuXHJcbiAgICAgICAgdGhpcy5jaGVja0V2ZXJ5TXMgPSB0aGlzLmNoZWNrRXZlcnkgKiA2MDAwMDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldENsaWVudCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEVhc3lGdHAoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZCgpIHtcclxuXHJcbiAgICAgICAgbGV0IGZ0cCA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBmdHBfY2xpZW50ID0gZnRwLmdldENsaWVudCgpO1xyXG4gICAgICAgICAgICBmdHBfY2xpZW50LmNvbm5lY3QoZnRwLmNvbmZpZyk7XHJcblxyXG4gICAgICAgICAgICBmdHBfY2xpZW50LmxzKFwiL1wiLCBmdW5jdGlvbihlcnIsIGxpc3QpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnRwX2NsaWVudC5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZ0cC5lLmxvZygxLCBgRlRQIGxzIGZvdW5kICR7bGlzdC5sZW5ndGh9IGZpbGVzLmAsIGZ0cCk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIGFzeW5jLmVhY2hTZXJpZXMobGlzdCwgZnVuY3Rpb24gKGZpbGUsIGRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGVtcCBmaWxlXHJcbiAgICAgICAgICAgICAgICAgICAgZnRwLmUubG9nKDEsIGBGVFAgZm91bmQgZmlsZSBcIiR7ZmlsZS5uYW1lfVwiLmAsIGZ0cCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGpvYiA9IG5ldyBGdHBGaWxlSm9iKGZ0cC5lLCBmaWxlLm5hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBEb3dubG9hZCB0byB0aGUgdGVtcCBqb2IgbG9jYXRpb25cclxuICAgICAgICAgICAgICAgICAgICBmdHBfY2xpZW50LmRvd25sb2FkKGZpbGUubmFtZSwgam9iLnBhdGgsIGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnRwLmUubG9nKDMsIGBEb3dubG9hZCBlcnJvcjogXCIke2Vycn1cIi5gLCBmdHApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgam9iLmxvY2FsbHlBdmFpbGFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGVsZXRlIG9uIHN1Y2Nlc3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ0cF9jbGllbnQucm0oZmlsZS5uYW1lLCBmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdHAuZS5sb2coMywgYFJlbW92ZSBlcnJvcjogXCIke2Vycn1cIi5gLCBmdHApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdHAuYXJyaXZlKGpvYik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ0cC5lLmxvZygzLCBgQXN5bmMgc2VyaWVzIGRvd25sb2FkIGVycm9yOiBcIiR7ZXJyfVwiLmAsIGZ0cCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZ0cC5lLmxvZygwLCBgQ29tcGxldGVkICR7bGlzdC5sZW5ndGh9IHN5bmNocm9ub3VzIGRvd25sb2FkKHMpLmAsIGZ0cCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZnRwX2NsaWVudC5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgLy8gbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIC8vIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGZ0cC5lLmxvZygzLCBlLCBmdHApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgd2F0Y2goKSB7XHJcbiAgICAgICAgbGV0IGZ0cCA9IHRoaXM7XHJcblxyXG4gICAgICAgIGZ0cC5lLmxvZygxLCBcIldhdGNoaW5nIEZUUCBkaXJlY3RvcnkuXCIsIGZ0cCk7XHJcblxyXG4gICAgICAgIGxldCBjb3VudCA9IDA7XHJcblxyXG4gICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICBmdHAuZS5sb2coMSwgYFJlLWNoZWNraW5nIEZUUCwgYXR0ZW1wdCAke2NvdW50fS5gLCBmdHApO1xyXG4gICAgICAgICAgICBmdHAubG9hZCgpO1xyXG4gICAgICAgIH0sIGZ0cC5jaGVja0V2ZXJ5TXMsIGNvdW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXJyaXZlKGpvYjogRmlsZUpvYikge1xyXG4gICAgICAgIHN1cGVyLmFycml2ZShqb2IpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0YWtlKGpvYjogRmlsZUpvYiwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgIGxldCBmdHAgPSB0aGlzO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgZnRwX3BhdGggPSBgLyR7am9iLm5hbWV9YDtcclxuXHJcbiAgICAgICAgICAgIGxldCBmdHBfY2xpZW50ID0gZnRwLmdldENsaWVudCgpO1xyXG5cclxuICAgICAgICAgICAgZnRwX2NsaWVudC5jb25uZWN0KGZ0cC5jb25maWcpO1xyXG5cclxuICAgICAgICAgICAgZnRwX2NsaWVudC51cGxvYWQoam9iLnBhdGgsIGZ0cF9wYXRoLCBmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnRwLmUubG9nKDMsIGBFcnJvciB1cGxvYWRpbmcgJHtqb2IubmFtZX0gdG8gRlRQLmAsIGZ0cCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZnMudW5saW5rU3luYyhqb2IucGF0aCk7XHJcbiAgICAgICAgICAgICAgICBmdHBfY2xpZW50LmNsb3NlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGZ0cEpvYiA9IGpvYiBhcyBGdHBGaWxlSm9iO1xyXG4gICAgICAgICAgICAgICAgZnRwSm9iLmxvY2FsbHlBdmFpbGFibGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhmdHBKb2IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGZ0cC5lLmxvZygzLCBcIlRha2UgdXBsb2FkIGVycm9yLCBcIiArIGUsIGZ0cCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSJdfQ==
