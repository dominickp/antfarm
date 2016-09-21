import { FolderNest } from "../nest/folderNest"
import { Nest } from "../nest/nest"
import { Job } from "../job/job"
import { Environment } from "../environment/environment"

export class Tunnel {

    protected name: string;

    protected nests: Nest[];

    protected run_list: any[];

    protected run_fail: any;

    protected e: Environment;

    constructor(e: Environment, theName: string) {
        this.e = e;
        this.nests = [];
        this.name = theName;
        this.run_list = [];
    }

    getName(){
        return this.name;
    }

    getNests(){
        return this.nests;
    }

    getRunList(){
        return this.run_list;
    }

    watch(nest: FolderNest) {
        nest.register(this);
        nest.load();
        nest.watch();
        this.nests.push(nest);
    }

    arrive(job: Job, nest: Nest) {
        this.e.log(1, `Job "${job.getName()}" arrival in Nest "${nest.name}" triggered Tunnel "${this.name}" run.`, this);
        this.executeRun(job, nest);
    }


    run(callback) {
        this.run_list.push(callback);
    }

    fail(callback) {
        this.run_fail = callback;
    }

    executeRun(job: Job, nest: Nest){
        let tn = this;
        this.run_list.forEach(function(callback){
            try {
                callback(job, nest);
            } catch (e) {
                // Fail if an error is thrown
                tn.executeFail(job, nest, e);
            }

        })
    }

    executeFail(job: Job, nest: Nest, reason: string){
        this.e.log(3, `Job "${job.name}" failed for reason "${reason}".`, this);
        this.run_fail(job, nest, reason);
    }

}