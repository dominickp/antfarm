import { FolderNest } from "../nest/folderNest";
import { Nest } from "../nest/nest";
import { Job } from "../job/job";
import { Environment } from "../environment/environment";
export declare class Tunnel {
    protected name: string;
    protected nests: Nest[];
    protected run_list: any[];
    protected run_sync_list: any[];
    protected run_fail: any;
    protected e: Environment;
    constructor(e: Environment, theName: string);
    getName(): string;
    getNests(): Nest[];
    getRunList(): any[];
    getRunSyncList(): any[];
    watch(nest: FolderNest): void;
    arrive(job: Job, nest: Nest): void;
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
    fail(callback: any): void;
    executeRun(job: Job, nest: Nest): void;
    executeRunSync(job: Job, nest: Nest): void;
    executeFail(job: Job, nest: Nest, reason: string): void;
}
