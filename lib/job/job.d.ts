import { Tunnel } from '../tunnel/tunnel';
import { Nest } from '../nest/nest';
import { Environment } from "../environment/environment";
export declare class Job {
    name: string;
    path: string;
    tunnel: Tunnel;
    nest: Nest;
    protected e: Environment;
    constructor(e: Environment, name: string);
    fail(reason: string): void;
    setPath(path: any): void;
}
