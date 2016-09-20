export declare class Logger {
    protected options: Options;
    protected logger: any;
    protected log_dir: string;
    protected log_types: {
        0: string;
        1: string;
        2: string;
        3: string;
    };
    constructor(options?: Options);
    createLogger(): void;
    log(type: number, message: string): void;
}
