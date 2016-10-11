import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
import {FtpFileJob, FtpFileJob} from "./../job/ftpFileJob";

const   EasyFtp = require("easy-ftp"),
        tmp = require("tmp"),
        fs = require("fs"),
        async = require("async");

import {Environment} from "../environment/environment";

export class FtpNest extends Nest {

    protected client: any;
    protected config: {};
    protected checkEvery: number;
    protected checkEveryMs: number;

    constructor(e: Environment, host: string, port: number, username: string, password: string, checkEvery: number) {
        super(e, host);

        this.config = {
            host: host,
            port: port,
            username: username,
            password: password
        };

        this.checkEvery = checkEvery;

        this.checkEveryMs = this.checkEvery * 60000;

    }

    protected getClient() {
        return new EasyFtp();
    }

    public load() {

        let ftp = this;

        try {
            let ftp_client = ftp.getClient();
            ftp_client.connect(ftp.config);

            ftp_client.ls("/", function(err, list) {

                if (err) {
                    ftp_client.close();
                }

                ftp.e.log(1, `FTP ls found ${list.length} files.`, ftp);


                async.eachSeries(list, function (file, done) {
                    // Create temp file
                    ftp.e.log(1, `FTP found file "${file.name}".`, ftp);
                    let job = new FtpFileJob(ftp.e, file.name);

                    // Download to the temp job location
                    ftp_client.download(file.name, job.getPath(), function (err) {
                        if (err) {
                            ftp.e.log(3, `Download error: "${err}".`, ftp);
                            done();
                        } else {
                            job.setLocallyAvailable(true);
                            // Delete on success
                            ftp_client.rm(file.name, function (err) {
                                if (err) {
                                    ftp.e.log(3, `Remove error: "${err}".`, ftp);
                                }
                                ftp.arrive(job);
                                done();
                            });
                        }
                    });
                }, function (err) {
                    if (err) {
                        ftp.e.log(3, `Async series download error: "${err}".`, ftp);
                    }
                    ftp.e.log(0, `Completed ${list.length} synchronous download(s).`, ftp);
                    ftp_client.close();
                });
                //
                // list.forEach(function (file, index) {
                //
                // });
            });
        } catch (e) {
            ftp.e.log(3, e, ftp);
        }
    }

    public watch() {
        let ftp = this;

        ftp.e.log(1, "Watching FTP directory.", ftp);

        let count = 0;

        setInterval(function() {
            count++;
            ftp.e.log(1, `Re-checking FTP, attempt ${count}.`, ftp);
            ftp.load();
        }, ftp.checkEveryMs, count);
    }

    public arrive(job: FileJob) {
        super.arrive(job);
    }

    public take(job: FileJob, callback: any) {
        let ftp = this;

        try {
            let ftp_path = `/${job.getName()}`;

            let ftp_client = ftp.getClient();

            ftp_client.connect(ftp.config);

            ftp_client.upload(job.getPath(), ftp_path, function (err) {
                if (err) {
                    ftp.e.log(3, `Error uploading ${job.getName()} to FTP.`, ftp);
                }

                fs.unlinkSync(job.getPath());
                ftp_client.close();

                let ftpJob = job as FtpFileJob;
                ftpJob.setLocallyAvailable(false);

                callback(ftpJob);
            });
        } catch (e) {
            ftp.e.log(3, "Take upload error, " + e, ftp);
        }
    }

}