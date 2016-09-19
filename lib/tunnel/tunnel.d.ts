import { Nest } from '../nest/nest';
import { Job } from '../job/job';
import { Environment } from '../environment/environment';
export declare class Tunnel extends Environment {
    name: string;
    watching: Nest[];
    run_list: any[];
    constructor(theName: string);
    move(distanceInMeters?: number): void;
    watch(nest: Nest): void;
    arrive(job: Job, nest: Nest): void;
    run(callback: any): void;
    executeRun(job: Job, nest: Nest): void;
}
