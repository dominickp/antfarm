import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";

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

            ftp.client.ls("/", function(err, list){

                ftp.e.log(1, `FTP ls found ${list.length} files.`, ftp);

                // Download and insert new Job
                list.forEach(function(file, index){
                    // Create temp file
                    tmp.file(function _tempFileCreated(err, temp_path, fd, cleanupCallback) {
                        if (err) throw err;

                        ftp.e.log(1, `FTP is downloading file "${file.name}".`, ftp);

                        ftp.client.download(file.name, temp_path, function(err) {
                            if (err) {
                                ftp.e.log(3, `Download error: "${err}".`, ftp);
                            } else {
                                let job = new FileJob(ftp.e, temp_path);
                                job.setName(file.name);
                                ftp.arrive(job);
                                // Delete on success
                                ftp.client.rm(file.name, function(err){
                                    if (err) {
                                        ftp.e.log(3, `Remove error: "${err}".`, ftp);
                                    }
                                });
                            }
                            ftp.client.close();
                        });

                        cleanupCallback();
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

    take(job: FileJob) {

        let ftp = this;

        ftp.client.upload(job.getPath(), `/${job.getName()}`, function(err){
            if (err) {
                ftp.e.log(3, `Error uploading ${job.getName()} to FTP.`, ftp);
            }

            fs.unlinkSync(job.path);
        });

        return job.getName();
    }

}