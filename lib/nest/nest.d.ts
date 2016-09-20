import { Tunnel } from '../tunnel/tunnel';
import { Job } from '../job/job';
import { Environment } from "../environment/environment";
export declare class Nest extends Environment {
    name: string;
    tunnel: Tunnel;
    constructor(name: string);
    register(tunnel: Tunnel): void;
    arrive(job: Job): void;
}
