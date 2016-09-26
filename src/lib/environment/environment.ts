import {Logger} from "./logger";

export class Environment {

    protected options: AntfarmOptions;

    protected logger: Logger;

    constructor(options?: AntfarmOptions) {

        this.options = options;

        this.logger = new Logger(this.options);
    }

    log(type: number, message: string, instance?: any) {
        this.logger.log(type, message, instance);
    }
}