import { Nest } from './nest';
import { FileJob } from './../job/fileJob';
import { Environment } from "../environment/environment";
export declare class Ftp extends Nest {
    client: any;
    config: {};
    checkEvery: number;
    checkEveryMs: number;
    constructor(e: Environment, host: string, port?: number, username?: string, password?: string, checkEvery?: number);
    load(): void;
    watch(): void;
    arrive(job: FileJob): void;
}
