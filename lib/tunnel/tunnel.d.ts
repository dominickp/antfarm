import { Nest } from '../nest/nest';
import { Job } from '../job/job';
import { Environment } from '../environment/environment';
export declare class Tunnel extends Environment {
    name: string;
    nests: Nest[];
    run_list: any[];
    run_fail: any;
    constructor(theName: string);
    watch(nest: Nest): void;
    arrive(job: Job, nest: Nest): void;
    run(callback: any): void;
    fail(callback: any): void;
    executeRun(job: Job, nest: Nest): void;
    executeFail(job: Job, nest: Nest, reason: string): void;
}
