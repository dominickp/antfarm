export declare class Logger {
    protected options: AntfarmOptions;
    protected logger: any;
    protected log_dir: string;
    protected log_types: {
        0: string;
        1: string;
        2: string;
        3: string;
    };
    constructor(options?: AntfarmOptions);
    protected consoleFormatter(options: any): string;
    protected createLogger(): void;
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
