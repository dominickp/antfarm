"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nest_1 = require("./nest");
var ftpFileJob_1 = require("./../job/ftpFileJob");
var EasyFtp = require("easy-ftp"), tmp = require("tmp"), fs = require("fs");
var FtpNest = (function (_super) {
    __extends(FtpNest, _super);
    function FtpNest(e, host, port, username, password, checkEvery) {
        if (port === void 0) { port = 21; }
        if (username === void 0) { username = ""; }
        if (password === void 0) { password = ""; }
        if (checkEvery === void 0) { checkEvery = 10; }
        _super.call(this, e, host);
        this.config = {
            host: host,
            port: port,
            username: username,
            password: password
        };
        this.checkEvery = checkEvery;
        this.checkEveryMs = this.checkEvery * 60000;
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
                list.forEach(function (file, index) {
                    // Create temp file
                    ftp.e.log(1, "FTP found file \"" + file.name + "\".", ftp);
                    var job = new ftpFileJob_1.FtpFileJob(ftp.e, file.name);
                    // Download to the temp job location
                    ftp_client_1.download(file.name, job.getPath(), function (err) {
                        if (err) {
                            ftp.e.log(3, "Download error: \"" + err + "\".", ftp);
                            ftp_client_1.close();
                        }
                        else {
                            job.setIsLocallyAvailable(true);
                            // Delete on success
                            ftp_client_1.rm(file.name, function (err) {
                                if (err) {
                                    ftp.e.log(3, "Remove error: \"" + err + "\".", ftp);
                                }
                                ftp.arrive(job);
                                ftp_client_1.close();
                            });
                        }
                    });
                });
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
            var ftp_path = "/" + job.getName();
            var ftp_client_2 = ftp.getClient();
            ftp_client_2.connect(ftp.config);
            ftp_client_2.upload(job.getPath(), ftp_path, function (err) {
                if (err) {
                    ftp.e.log(3, "Error uploading " + job.getName() + " to FTP.", ftp);
                }
                fs.unlinkSync(job.getPath());
                ftp_client_2.close();
                callback();
            });
        }
        catch (e) {
            ftp.e.log(3, "Take upload error, " + e, ftp);
        }
    };
    return FtpNest;
}(nest_1.Nest));
exports.FtpNest = FtpNest;
