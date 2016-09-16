import { Nest } from './nest';
export declare class Folder extends Nest {
    path: string;
    constructor(path: string);
    watch(): void;
}
