import { Tunnel } from "../tunnel/tunnel";
import { Job } from "../job/job";
import { Environment } from "../environment/environment";
/**
 * A nest is a resource that holds or produces jobs.
 */
export declare abstract class Nest {
    protected _id: string;
    protected _name: string;
    protected _tunnel: Tunnel;
    protected e: Environment;
    constructor(e: Environment, name: string);
    readonly id: string;
    toString(): string;
    name: string;
    readonly tunnel: Tunnel;
    register(tunnel: Tunnel): void;
    arrive(job: Job): void;
}
