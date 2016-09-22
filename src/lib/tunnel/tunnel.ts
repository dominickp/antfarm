import { FolderNest } from "../nest/folderNest";
import { Nest } from "../nest/nest";
import { Job } from "../job/job";
import { Environment } from "../environment/environment";

const   async = require("async"),
        minimatch = require("minimatch");

export class Tunnel {

    protected name: string;

    protected nests: Nest[];

    protected run_list: any[];

    protected run_sync_list: any[];

    protected run_fail: any;

    protected e: Environment;

    protected job_counter: number;

    protected match_obj = {
        queue: [],
        run: null,
        pattern: null,
        orphan_minutes: null
    };

    constructor(e: Environment, theName: string) {
        this.e = e;
        this.nests = [];
        this.name = theName;
        this.run_list = [];
        this.run_sync_list = [];
        this.job_counter = 0;
    }

    getName() {
        return this.name;
    }

    getNests() {
        return this.nests;
    }

    getRunList() {
        return this.run_list;
    }

    getRunSyncList() {
        return this.run_sync_list;
    }

    watch(nest: FolderNest) {
        nest.register(this);
        nest.load();
        nest.watch();
        this.nests.push(nest);
    }

    arrive(job: Job, nest: Nest) {
        this.job_counter++;
        this.e.log(1, `Job ${this.job_counter} Nest "${nest.name}" triggered Tunnel "${this.name}" run.`, this);
        this.executeRun(job, nest);
        this.executeRunSync(job, nest);
        this.executeMatch(job, nest);
    }

    /**
     * Run program logic asynchronously.
     * @param callback
     */
    run(callback) {
        this.run_list.push(callback);
    }

    /**
     * Run program logic synchronously.
     * @param callback
     */
    runSync(callback) {
        this.run_sync_list.push(callback);
    }

    fail(callback) {
        this.run_fail = callback;
    }

    executeRun(job: Job, nest: Nest) {
        let tn = this;
        this.run_list.forEach(function(callback){
            try {
                callback(job, nest);
            } catch (e) {
                // Fail if an error is thrown
                tn.executeFail(job, nest, e);
            }

        });
    }

    executeRunSync(job: Job, nest: Nest) {
        let tn = this;

        async.eachSeries(tn.run_sync_list, function (run, callback) {
            run(job, nest, function(){
                callback();
            });
        }, function (err) {
            if (err) {
                tn.executeFail(job, nest, err);
            }
            tn.e.log(0, `Completed ${tn.getRunSyncList().length} synchronous run list(s).`, tn);
        });
    }

    executeFail(job: Job, nest: Nest, reason: string) {
        this.e.log(3, `Job "${job.getName()}" failed for reason "${reason}".`, this);
        this.run_fail(job, nest, reason);
    }

    /**
     * Interface for matching two or more files together based on an array of glob filename patterns.
     * @param pattern
     * @param orphanMinutes
     * @param callback
     */
    match(pattern: string[]|string, orphanMinutes: number, callback: any) {
        this.match_obj.pattern = pattern;
        this.match_obj.orphan_minutes = orphanMinutes;
        this.match_obj.run = callback;
    }

    /**
     * Match execution
     * @param job
     * @param nest
     */
    protected executeMatch(job: Job, nest: Nest) {

        // Try to find match in queue

        let tn = this;

        let match_result;
        let matched_jobs = [];

        tn.e.log(0, "Executing matching process.", tn);

        tn.match_obj.pattern.forEach(function(pattern, i){

            tn.match_obj.queue.forEach(function(qJob){
                match_result = minimatch(qJob.getName(), pattern);
                if (match_result === true) {
                    matched_jobs.push(job);
                }
                console.log(match_result);
            });

        });

        // if found
        if (matched_jobs.length > 0) {
            tn.match_obj.run(matched_jobs);
        }

        // If not found, add this job to the queue
        tn.match_obj.queue.push(job);

        // Need to set a timeout for the job to fail

    }


}