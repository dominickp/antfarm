import { FolderNest } from '../nest/folderNest';
import { Nest } from '../nest/nest';
import { Job } from '../job/job';
import { Environment } from '../environment/environment';
export declare class Tunnel {
    name: string;
    nests: Nest[];
    run_list: any[];
    run_fail: any;
    protected e: Environment;
    constructor(e: Environment, theName: string);
    watch(nest: FolderNest): void;
    arrive(job: Job, nest: Nest): void;
    run(callback: any): void;
    fail(callback: any): void;
    executeRun(job: Job, nest: Nest): void;
    executeFail(job: Job, nest: Nest, reason: string): void;
}
