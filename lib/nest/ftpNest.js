"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nest_1 = require('./nest');
var fileJob_1 = require('./../job/fileJob');
var EasyFtp = require('easy-ftp'), tmp = require('tmp');
var FtpNest = (function (_super) {
    __extends(FtpNest, _super);
    function FtpNest(e, host, port, username, password, checkEvery) {
        if (port === void 0) { port = 21; }
        if (username === void 0) { username = ''; }
        if (password === void 0) { password = ''; }
        if (checkEvery === void 0) { checkEvery = 10; }
        _super.call(this, e, host);
        this.client = new EasyFtp();
        this.config = {
            host: host,
            port: port,
            username: username,
            password: password
        };
        this.checkEvery = checkEvery;
        this.checkEveryMs = this.checkEvery * 60000;
    }
    FtpNest.prototype.load = function () {
        var ftp = this;
        try {
            ftp.client.connect(ftp.config);
            ftp.client.ls("/", function (err, list) {
                ftp.e.log(1, "FTP ls found " + list.length + " files.", ftp);
                // Download and insert new Job
                list.forEach(function (file, index) {
                    // Create temp file
                    tmp.file(function _tempFileCreated(err, temp_path, fd, cleanupCallback) {
                        if (err)
                            throw err;
                        ftp.e.log(1, "FTP is downloading file \"" + file.name + "\".", ftp);
                        ftp.client.download(file.name, temp_path, function (err) {
                            if (err) {
                                ftp.e.log(3, "Download error: \"" + err + "\".", ftp);
                            }
                            else {
                                var job = new fileJob_1.FileJob(ftp.e, temp_path);
                                job.setName(file.name);
                                ftp.arrive(job);
                                // Delete on success
                                ftp.client.rm(file.name, function (err) {
                                    if (err) {
                                        ftp.e.log(3, "Remove error: \"" + err + "\".", ftp);
                                    }
                                });
                            }
                            ftp.client.close();
                        });
                        cleanupCallback();
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
    return FtpNest;
}(nest_1.Nest));
exports.FtpNest = FtpNest;
