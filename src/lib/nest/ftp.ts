import { Nest } from './nest';
import { Job } from './../job/job';
//var fs = require('fs');
const path_mod = require('path');

var EasyFtp = require('easy-ftp');


export class Ftp extends Nest {

    client: any;

    config: {};

    checkEvery: number;

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


        this.load();

        if(checkEvery){
            this.watch();
        }
    }

    load(){

        let ftp = this;

        ftp.client.connect(ftp.config);
        ftp.client.ls("/", function(err, list){
            console.log("found "+ list.length + " files.");

            // Download and insert new Job
        });
    }

    watch() {

        let ftp = this;


    }

    arrive(job: Job) {
        super.arrive(job);
    }


}