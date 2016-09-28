import { Tunnel } from "../tunnel/tunnel";
import { Nest } from "../nest/nest";
import { Environment } from "../environment/environment";
import { LifeEvent } from "../environment/lifeEvent";
export declare abstract class Job {
    protected name: string;
    protected tunnel: Tunnel;
    protected nest: Nest;
    protected e: Environment;
    protected locallyAvailable: boolean;
    protected lifeCycle: LifeEvent[];
    protected id: string;
    constructor(e: Environment, name: string);
    toString(): string;
    isLocallyAvailable(): boolean;
    setLocallyAvailable(available: boolean): void;
    getLifeCycle(): LifeEvent[];
    protected createLifeEvent(verb: string, start: string, finish: string): void;
    setName(name: string): void;
    getId(): string;
    getName(): string;
    setNest(nest: Nest): void;
    getNest(): Nest;
    setTunnel(tunnel: Tunnel): void;
    getTunnel(): Tunnel;
    fail(reason: string): void;
    /**
     * Transfer a job to another tunnel directly.
     * @param tunnel
     */
    transfer(tunnel: Tunnel): void;
}
