import { Logger } from "./logger";
export declare class Environment {
    protected options: AntfarmOptions;
    protected logger: Logger;
    constructor(options?: AntfarmOptions);
    log(type: number, message: string, instance?: any): void;
}
