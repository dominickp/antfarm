import {Logger} from "./logger";

export class Environment {

    protected options: AntfarmOptions;

    protected logger: Logger;

    constructor(options?: AntfarmOptions) {

        this.options = options;

        this.logger = new Logger(this.options);
    }

    public toString() {
        return "Environment";
    }

    public log(type: number, message: string, actor?: any, instances = []) {
        // try {
        //     this.logger.log(type, message, actor, instances);
        // } catch (e) {
        //     console.log(e);
        // }
        this.logger.log(type, message, actor, instances);
    }
}