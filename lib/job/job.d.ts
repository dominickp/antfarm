import { Tunnel } from '../tunnel/tunnel';
import { Nest } from '../nest/nest';
import { Environment } from "../environment/environment";
export declare class Job extends Environment {
    name: string;
    path: string;
    tunnel: Tunnel;
    nest: Nest;
    constructor(name: string);
    fail(reason: string): void;
    setPath(path: any): void;
}
