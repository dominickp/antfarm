import { Tunnel } from "../tunnel/tunnel";
import { Job } from "../job/job";
import { Environment } from "../environment/environment";
export declare abstract class Nest {
    protected name: string;
    protected tunnel: Tunnel;
    protected e: Environment;
    constructor(e: Environment, name: string);
    toString(): string;
    getName(): string;
    getTunnel(): Tunnel;
    register(tunnel: Tunnel): void;
    arrive(job: Job): void;
}
