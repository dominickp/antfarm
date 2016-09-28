import { Logger } from "./logger";
export declare class Environment {
    protected options: AntfarmOptions;
    protected logger: Logger;
    constructor(options?: AntfarmOptions);
    toString(): string;
    log(type: number, message: string, actor?: any, instances?: any[]): void;
}
