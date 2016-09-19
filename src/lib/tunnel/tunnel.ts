import { Nest } from '../nest/nest'
import { Job } from '../job/job'
import { Environment } from '../environment/environment'

export class Tunnel extends Environment{
    name: string;

    nests: Nest[];

    run_list: any[];

    run_fail: any;

    constructor(theName: string) {
        super();
        this.nests = [];
        this.name = theName;
        this.run_list = [];
    }

    move(distanceInMeters: number = 0) {
        console.log(`${this.name} moved ${distanceInMeters}m.`);
    }

    watch(nest: Nest) {
        nest.register(this);
        this.nests.push(nest);
    }

    arrive(job: Job, nest: Nest) {
        super.log(1, "New job arrived. " + job.name + " in nest " + nest.name);
        this.executeRun(job, nest);
    }


    run(callback) {
        this.run_list.push(callback);
    }

    fail(callback) {
        this.run_fail = callback;
    }

    executeRun(job: Job, nest: Nest){
        this.run_list.forEach(function(callback){
            callback(job, nest);
        })
    }

    executeFail(job: Job, nest: Nest, reason: string){
        super.log(3, "Job failed " + job.name);
        this.run_fail(job, nest, reason);
    }


}