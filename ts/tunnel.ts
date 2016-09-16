import { Nest } from './nest/nest'
import { Job } from './job/job'

export class Tunnel {
    name: string;

    watching: Nest[];

    constructor(theName: string) {
        this.name = theName;
    }

    move(distanceInMeters: number = 0) {
        console.log(`${this.name} moved ${distanceInMeters}m.`);
    }

    watch(nest: Nest) {
        nest.register(this);
    }

    arrive(job: Job, nest: Nest) {

    }

    run() {

    }

}