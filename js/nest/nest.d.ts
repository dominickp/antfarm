import { Tunnel } from '../tunnel/tunnel';
import { Job } from '../job/job';
export declare class Nest {
    name: string;
    tunnel: Tunnel;
    constructor(name: string);
    register(tunnel: Tunnel): void;
    arrive(job: Job): void;
}
