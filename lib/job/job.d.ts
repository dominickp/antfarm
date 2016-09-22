import { Tunnel } from "../tunnel/tunnel";
import { Nest } from "../nest/nest";
import { Environment } from "../environment/environment";
export declare abstract class Job {
    protected name: string;
    protected tunnel: Tunnel;
    protected nest: Nest;
    protected e: Environment;
    protected isLocallyAvailable: boolean;
    constructor(e: Environment, name: string);
    getIsLocallyAvailable(): boolean;
    setIsLocallyAvailable(available: boolean): void;
    setName(name: string): void;
    getName(): string;
    setNest(nest: Nest): void;
    getNest(): Nest;
    setTunnel(tunnel: Tunnel): void;
    getTunnel(): Tunnel;
    fail(reason: string): void;
}
