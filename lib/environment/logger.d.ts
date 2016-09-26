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
    createLogger(): void;
    log(type: number, message: string, instance?: any): void;
}
