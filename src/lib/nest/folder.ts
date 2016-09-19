var node_watch = require('node-watch');
import { Nest } from './nest';
import { Job } from './../job/job';

export class Folder extends Nest {
    path: string;


    constructor(path: string) {

        super("folder");
        this.path = path;

        this.watch();
    }


    watch() {

        node_watch(this.path, function (filename) {
            console.log(filename, ' changed.');


            // Make a new Job and trigger arrived

            let job = new Job(filename);
            job.setPath(this.path + filename);

            this.arrive(job);
        });
    }

    arrive(job: Job) {
        super.arrive(job);
    }


}