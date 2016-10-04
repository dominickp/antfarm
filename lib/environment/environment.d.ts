import { Logger } from "./logger";
import { WebhookNest } from "../nest/webhookNest";
import { ServerRequest } from "http";
import { ServerResponse } from "http";
import { WebhookInterface } from "../ui/webhookInterface";
import { Server } from "./server";
export declare class Environment {
    protected options: AntfarmOptions;
    protected logger: Logger;
    protected server: any;
    protected server2: Server;
    protected router: any;
    protected hookRoutes: any[];
    protected hookInterfaceRoutes: any[];
    constructor(options: AntfarmOptions);
    protected setOptions(options: AntfarmOptions): void;
    /**
     * Get the Antfarm options.
     * @returns {AntfarmOptions}
     */
    getOptions(): AntfarmOptions;
    getAutoManagedFolderDirectory(): string;
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
     * Handles request and response of the web hook interface.
     * @param ui
     * @param req
     * @param res
     * @param customHandler     Custom request handler.
     */
    protected handleHookInterfaceRequest: (ui: WebhookInterface, req: ServerRequest, res: ServerResponse, customHandler?: any) => void;
    /**
     * Adds a webhook to the webhook server.
     * @param nest
     */
    addWebhook(nest: WebhookNest): void;
    /**
     * Adds a webhook interface to the webhook server.
     * @param webhook_interface
     */
    addWebhookInterface(webhook_interface: WebhookInterface): void;
    toString(): string;
    log(type: number, message: string, actor?: any, instances?: any[]): void;
}
