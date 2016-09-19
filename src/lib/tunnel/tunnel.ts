import { Nest } from '../nest/nest'
import { Job } from '../job/job'

export class Tunnel {
    name: string;

    watching: Nest[];

    run_list: any[];

    constructor(theName: string) {
        this.name = theName;
        this.run_list = [];
    }

    move(distanceInMeters: number = 0) {
        console.log(`${this.name} moved ${distanceInMeters}m.`);
    }

    watch(nest: Nest) {
        nest.register(this);
    }

    arrive(job: Job, nest: Nest) {
        console.log("New job arrived. " + job.name + " in nest " + nest.name);
        this.executeRun(job, nest);
    }


    run(callback) {
        this.run_list.push(callback);
    }

    executeRun(job: Job, nest: Nest){
        this.run_list.forEach(function(callback){
            callback(job, nest);
        })
    }


}