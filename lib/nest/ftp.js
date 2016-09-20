"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nest_1 = require('./nest');
var job_1 = require('./../job/job');
var EasyFtp = require('easy-ftp'), tmp = require('tmp');
var Ftp = (function (_super) {
    __extends(Ftp, _super);
    function Ftp(e, host, port, username, password, checkEvery) {
        if (port === void 0) { port = 21; }
        if (username === void 0) { username = ''; }
        if (password === void 0) { password = ''; }
        if (checkEvery === void 0) { checkEvery = 0; }
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
        this.load();
        if (checkEvery) {
            this.watch();
        }
    }
    Ftp.prototype.load = function () {
        var ftp = this;
        try {
            ftp.client.connect(ftp.config);
            ftp.client.ls("/", function (err, list) {
                ftp.e.log(1, "FTP ls found " + list.length + " files.");
                // Download and insert new Job
                list.forEach(function (file, index) {
                    // Create temp file
                    tmp.file(function _tempFileCreated(err, temp_path, fd, cleanupCallback) {
                        if (err)
                            throw err;
                        ftp.e.log(1, "FTP is downloading file \"" + file.name + "\".");
                        ftp.client.download(file.name, temp_path, function (err) {
                            if (err) {
                                ftp.e.log(3, "FTP error: \"" + err + "\".");
                            }
                        });
                        var job = new job_1.Job(this.e, temp_path);
                        job.setPath(temp_path);
                        ftp.arrive(job);
                        // If we don't need the file anymore we could manually call the cleanupCallback
                        // But that is not necessary if we didn't pass the keep option because the library
                        // will clean after itself.
                        cleanupCallback();
                    });
                });
            });
        }
        catch (e) {
            ftp.e.log(3, e);
        }
    };
    Ftp.prototype.watch = function () {
        var ftp = this;
        ftp.e.log(1, "Watching FTP directory.");
        var count = 0;
        setInterval(function () {
            count++;
            ftp.e.log(1, "Re-checking FTP, attempt " + count + ".");
            ftp.load();
        }, ftp.checkEveryMs, count);
    };
    Ftp.prototype.arrive = function (job) {
        _super.prototype.arrive.call(this, job);
    };
    return Ftp;
}(nest_1.Nest));
exports.Ftp = Ftp;
