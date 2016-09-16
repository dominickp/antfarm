var watch = require('node-watch');
import { Nest } from './nest';

export class Folder extends Nest {
    path: string;

    constructor(path: string) {
        this.path = path;

        this.watch();
    }

    watch(){
        watch(this.path, function(filename) {
            console.log(filename, ' changed.');

            // Make a new Job and trigger arrived
            this.arrive();
        });
    }

    arrive(){
        super.arrive();
    }


}