import { Environment } from "./environment";
import { WebhookNest } from "../nest/webhookNest";
export declare class Server {
    protected server: any;
    protected e: Environment;
    protected hookRoutes: any[];
    protected hookInterfaceRoutes: any[];
    constructor(e: Environment);
    /**
     * Creates the server.
     */
    protected createServer(): void;
    toString(): string;
    protected handleHookRequest(): void;
    addWebhook(nest: WebhookNest): void;
    /**
     * Handles request and response of the web hook, creates a new job, as well as calling the nest's arrive.
     * @param nest
     * @param req
     * @param res
     * @param customHandler     Custom request handler.
     */
    protected handleHookRequest: (nest: WebhookNest, req: any, res: any, customHandler?: any) => void;
}
