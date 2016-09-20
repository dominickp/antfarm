import { Environment } from "../environment/environment";
import { Nest } from './nest';
import { Job } from './../job/job';
export declare class Folder extends Nest {
    path: string;
    constructor(e: Environment, path: string);
    load(): void;
    watch(): void;
    arrive(job: Job): void;
}
