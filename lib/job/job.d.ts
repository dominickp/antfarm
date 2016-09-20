import { Tunnel } from '../tunnel/tunnel';
import { Nest } from '../nest/nest';
import { Environment } from "../environment/environment";
export declare abstract class Job {
    name: string;
    tunnel: Tunnel;
    nest: Nest;
    protected e: Environment;
    constructor(e: Environment, name: string);
    getName(): string;
    fail(reason: string): void;
}
