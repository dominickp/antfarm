import { FolderNest } from "../nest/folderNest";
import { Nest } from "../nest/nest";
import { Job } from "../job/job";
import { Environment } from "../environment/environment";
import { WebhookNest } from "../nest/webhookNest";
import { FtpNest } from "../nest/ftpNest";
/**
 * Tunnels are runnable work flow units that can watch nests.
 */
export declare class Tunnel {
    protected name: string;
    protected nests: Nest[];
    protected run_list: any[];
    protected run_sync_list: any[];
    protected run_fail: any;
    protected e: Environment;
    protected job_counter: number;
    protected match_obj: {
        queue: any[];
        run: any;
        pattern: any;
        orphan_minutes: any;
    };
    constructor(e: Environment, theName: string);
    toString(): string;
    getName(): string;
    getNests(): Nest[];
    getRunList(): any[];
    getRunSyncList(): any[];
    /**
     * Instructs the tunnel to watch a nest for new jobs.
     * @param nest
     */
    watch(nest: FolderNest | WebhookNest | FtpNest): void;
    arrive(job: Job, nest?: Nest): void;
    /**
     * Run program logic asynchronously.
     * @param callback
     */
    run(callback: any): void;
    /**
     * Run program logic synchronously.
     * @param callback
     */
    runSync(callback: any): void;
    /**
     * Failed jobs runner.
     * @param callback
     */
    fail(callback: any): void;
    /**
     * Asynchronous run event.
     * @param job
     * @param nest
     */
    protected executeRun(job: Job, nest: Nest): void;
    /**
     * Synchronous run event.
     * @param job
     * @param nest
     */
    protected executeRunSync(job: Job, nest: Nest): void;
    /**
     * Fail run event.
     * @param job
     * @param nest
     * @param reason
     */
    executeFail(job: Job, nest: Nest, reason: string): void;
    /**
     * Interface for matching two or more files together based on an array of glob filename patterns.
     * @param pattern
     * @param orphanMinutes
     * @param callback
     */
    match(pattern: string[] | string, orphanMinutes: number, callback: any): void;
    /**
     * Match execution
     * @param job
     * @param nest
     */
    protected executeMatch(job: Job, nest: Nest): void;
}
