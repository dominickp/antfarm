import {Environment} from "../environment/environment";
var node_watch = require('node-watch');
import { Nest } from './nest';
import { FileJob } from './../job/fileJob';
var fs = require('fs');
const path_mod = require('path');

export class Folder extends Nest {
    path: string;


    constructor(e: Environment, path: string) {

        let nest_name = path_mod.basename(path);

        super(e, nest_name);

        this.path = path;

        this.load();
        this.watch();
    }

    load(){

        let fl = this;
        fs.readdir(fl.path, function(err, items) {
            items = items.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

            items.forEach(function(filename){
                // Make a new Job and trigger arrived
                let job = new FileJob(fl.e, `${fl.path}/${filename}`);
                // job.setPath(fl.path + item);
                fl.arrive(job);
            });
        });
    }

    watch() {

        let fl = this;

        node_watch(fl.path, function (filename) {
            // Make a new Job and trigger arrived
            let job = new FileJob(fl.e, `${fl.path}/${filename}`);
            // job.setPath(fl.path + filename);
            fl.arrive(job);
        });
    }

    arrive(job: FileJob) {
        super.arrive(job);
    }


}