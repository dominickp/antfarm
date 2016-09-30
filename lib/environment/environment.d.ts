import { Logger } from "./logger";
import { WebhookNest } from "../nest/webhookNest";
import { ServerRequest } from "http";
import { ServerResponse } from "http";
export declare class Environment {
    protected options: AntfarmOptions;
    protected logger: Logger;
    protected server: any;
    protected router: any;
    protected hookRoutes: any[];
    constructor(options?: AntfarmOptions);
    /**
     * Creates the server.
     */
    protected createServer(): void;
    /**
     * Handles request and response of the web hook, creates a new job, as well as calling the nest's arrive.
     * @param nest
     * @param req
     * @param res
     * @param customHandler     Custom request handler.
     */
    protected handleHookRequest: (nest: WebhookNest, req: ServerRequest, res: ServerResponse, customHandler?: any) => void;
    /**
     * Adds a webhook to the webhook server.
     * @param nest
     */
    addWebhook(nest: WebhookNest): void;
    toString(): string;
    log(type: number, message: string, actor?: any, instances?: any[]): void;
}
