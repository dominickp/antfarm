import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
import { FtpFileJob } from "./../job/ftpFileJob";

const   EasyFtp = require("easy-ftp"),
        tmp = require("tmp"),
        fs = require("fs");

import {Environment} from "../environment/environment";

export class FtpNest extends Nest {

    client: any;

    config: {};

    checkEvery: number;

    checkEveryMs: number;

    constructor(e: Environment, host: string, port = 21, username = "", password = "", checkEvery = 10) {
        super(e, host);

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

    load() {

        let ftp = this;

        try {
            ftp.client.connect(ftp.config);

            console.log("about to ls");

            ftp.client.ls("/", function(err, list) {

                if (err) {
                    ftp.client.close();
                }

                ftp.e.log(1, `FTP ls found ${list.length} files.`, ftp);

                list.forEach(function (file, index) {
                    // Create temp file
                    ftp.e.log(1, `FTP found file "${file.name}".`, ftp);
                    let job = new FtpFileJob(ftp.e, file.name);

                    // Download to the temp job location
                    ftp.client.download(file.name, job.getPath(), function (err) {
                        if (err) {
                            ftp.e.log(3, `Download error: "${err}".`, ftp);
                            ftp.client.close();
                        } else {
                            job.setDownloaded(true);
                            // Delete on success
                            ftp.client.rm(file.name, function (err) {
                                if (err) {
                                    ftp.e.log(3, `Remove error: "${err}".`, ftp);
                                }
                                ftp.arrive(job);
                                ftp.client.close();
                            });
                        }
                    });
                });
            });
        } catch (e) {
            ftp.e.log(3, e, ftp);
        }
    }

    watch() {
        let ftp = this;

        ftp.e.log(1, "Watching FTP directory.", ftp);

        let count = 0;

        setInterval(function() {
            count++;
            ftp.e.log(1, `Re-checking FTP, attempt ${count}.`, ftp);
            ftp.load();
        }, ftp.checkEveryMs, count);
    }

    arrive(job: FileJob) {
        super.arrive(job);
    }

    take(job: FileJob, callback: any) {

        try {
            let ftp = this;
            let ftp_path = `/${job.getName()}`;
            // ???
            console.log(job.getPath(), ftp_path);
            ftp.client.connect(ftp.config);
            ftp.client.upload(job.getPath(), ftp_path, function (err) {
                if (err) {
                    ftp.e.log(3, `Error uploading ${job.getName()} to FTP.`, ftp);
                }

                fs.unlinkSync(job.getPath());
                ftp.client.close();
                callback();
            });
        } catch (e) {
            console.log("Take upload error, " + e);
        }
    }

}