import { Environment } from "../environment/environment";
import { Nest } from './nest';
import { FileJob } from './../job/fileJob';
export declare class Folder extends Nest {
    path: string;
    constructor(e: Environment, path: string);
    load(): void;
    watch(): void;
    arrive(job: FileJob): void;
}
