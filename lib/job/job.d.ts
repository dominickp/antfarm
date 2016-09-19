import { Tunnel } from '../tunnel/tunnel';
import { Nest } from '../nest/nest';
export declare class Job {
    name: string;
    path: string;
    tunnel: Tunnel;
    nest: Nest;
    constructor(name: string);
    fail(reason: string): void;
    setPath(path: any): void;
}
