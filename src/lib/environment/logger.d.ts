import { AntfarmOptions } from "./options";
/**
 * Logging service
 */
export declare class Logger {
    protected options: AntfarmOptions;
    protected logger: any;
    protected log_dir: string;
    /**
     * Valid log times
     * @type {{0: string; 1: string; 2: string; 3: string}}
     */
    protected log_types: {
        0: string;
        1: string;
        2: string;
        3: string;
    };
    constructor(options?: AntfarmOptions);
    /**
     * Console formatting function.
     * @param options
     * @returns {string}
     */
    protected consoleFormatter(options: any): string;
    /**
     * Initializae logger
     */
    protected createLogger(): void;
    /**
     * Generates a formatted logging entry.
     * @param entry
     * @param actor
     * @param instances
     * @returns {Object}
     */
    protected getEntry(entry: Object, actor?: any, instances?: any[]): Object;
    /**
     * Create a log entry. Used for log files and console reporting.
     * @param type
     * @param message
     * @param actor
     * @param instances
     */
    log(type: number, message: string, actor?: any, instances?: any): void;
}
