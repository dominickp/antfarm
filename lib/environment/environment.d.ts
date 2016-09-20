import { Logger } from "./logger";
export declare class Environment {
    protected options: Options;
    protected logger: Logger;
    constructor(options?: Options);
    log(type: number, message: string, instance?: any): void;
}
