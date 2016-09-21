import { Nest } from './nest';
import { FileJob } from './../job/fileJob';

var   EasyFtp = require('easy-ftp'),
        tmp = require('tmp');

import {Environment} from "../environment/environment";

export class FtpNest extends Nest {

    client: any;

    config: {};

    checkEvery: number;

    checkEveryMs: number;

    constructor(e: Environment, host: string, port = 21, username = '', password = '', checkEvery = 0) {
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

        this.load();

        if(checkEvery) {
            this.watch();
        }
    }

    load(){

        let ftp = this;

        try {
            ftp.client.connect(ftp.config);

            ftp.client.ls("/", function(err, list){

                ftp.e.log(1, `FTP ls found ${list.length} files.`);

                // Download and insert new Job
                list.forEach(function(file, index){
                    // Create temp file
                    tmp.file(function _tempFileCreated(err, temp_path, fd, cleanupCallback) {
                        if (err) throw err;

                        ftp.e.log(1, `FTP is downloading file "${file.name}".`);

                        ftp.client.download(file.name, temp_path, function(err){
                            if(err){
                                ftp.e.log(3, `FTP error: "${err}".`);
                            }
                        });

                        let job = new FileJob(ftp.e, temp_path);
                        //job.setPath(temp_path);
                        ftp.arrive(job);

                        cleanupCallback();
                    });
                });
            });

        } catch(e) {
            ftp.e.log(3, e);
        }


    }

    watch() {
        let ftp = this;

        ftp.e.log(1, "Watching FTP directory.");

        let count = 0;

        setInterval(function() {
            count++;
            ftp.e.log(1, `Re-checking FTP, attempt ${count}.`);
            ftp.load();
        }, ftp.checkEveryMs, count);
    }

    arrive(job: FileJob) {
        super.arrive(job);
    }


}