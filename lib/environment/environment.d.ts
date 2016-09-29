import { Logger } from "./logger";
import { Nest } from "./../nest/nest";
export declare class Environment {
    protected options: AntfarmOptions;
    protected logger: Logger;
    protected server: any;
    protected router: any;
    protected routes: any[];
    constructor(options?: AntfarmOptions);
    /**
     * Creates the server.
     */
    protected createServer(): void;
    addWebhook(nest: Nest, name: string): void;
    toString(): string;
    log(type: number, message: string, actor?: any, instances?: any[]): void;
}
