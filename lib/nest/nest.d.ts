import { Tunnel } from "../tunnel/tunnel";
import { Job } from "../job/job";
import { Environment } from "../environment/environment";
/**
 * A nest is a resource that holds or produces jobs.
 */
export declare abstract class Nest {
    protected id: string;
    protected _name: string;
    protected tunnel: Tunnel;
    protected e: Environment;
    constructor(e: Environment, name: string);
    getId(): string;
    toString(): string;
    name: string;
    getTunnel(): Tunnel;
    register(tunnel: Tunnel): void;
    arrive(job: Job): void;
}
