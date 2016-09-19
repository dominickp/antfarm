var node_watch = require('node-watch');
import { Nest } from './nest';
import { Job } from './../job/job';
var fs = require('fs');

export class Folder extends Nest {
    path: string;

    constructor(path: string) {

        super("folder");
        this.path = path;

        this.load();
        this.watch();
    }

    load(){

        let fl = this;
        fs.readdir(fl.path, function(err, items) {
            items = items.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

            items.forEach(function(item){
                // Make a new Job and trigger arrived
                let job = new Job(item);
                job.setPath(fl.path + item);
                fl.arrive(job);
            });
        });
    }

    watch() {

        let fl = this;

        node_watch(fl.path, function (filename) {
            // Make a new Job and trigger arrived
            let job = new Job(filename);
            job.setPath(fl.path + filename);
            fl.arrive(job);
        });
    }

    arrive(job: Job) {
        super.arrive(job);
    }


}