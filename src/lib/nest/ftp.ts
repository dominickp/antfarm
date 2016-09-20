import { Nest } from './nest';
import { Job } from './../job/job';
//var fs = require('fs');
const path_mod = require('path');

var EasyFtp = require('easy-ftp');
var tmp = require('tmp');


export class Ftp extends Nest {

    client: any;

    config: {};

    checkEvery: number;

    checkEveryMs: number;

    constructor(host: string, port = 21, username = '', password = '', checkEvery = 0) {
        super(host);

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

        ftp.client.connect(ftp.config);
        ftp.client.ls("/", function(err, list){

            ftp.log(1, `FTP ls found ${list.length} files.`);

            // Download and insert new Job
            list.forEach(function(file, index){
                // Create temp file
                tmp.file(function _tempFileCreated(err, temp_path, fd, cleanupCallback) {
                    if (err) throw err;

                    ftp.log(1, `FTP is downloading file "${file.name}".`);

                    ftp.client.download(file.name, temp_path, function(err){
                        if(err){
                            ftp.log(3, `FTP error: "${err}".`);
                        }
                    });

                    let job = new Job(temp_path);
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

    watch() {
        let ftp = this;

        ftp.log(1, "Watching FTP directory.");

        let count = 0;

        setInterval(function() {
            count++;
            ftp.log(1, `Re-checking FTP, attempt ${count}.`);
            ftp.load();
        }, ftp.checkEveryMs, count);
    }

    arrive(job: Job) {
        super.arrive(job);
    }


}