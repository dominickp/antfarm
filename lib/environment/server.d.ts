import { Environment } from "./environment";
import { WebhookNest } from "../nest/webhookNest";
import * as express from "express";
import { WebhookInterface } from "../ui/webhookInterface";
export declare class Server {
    protected server: express.Application;
    protected e: Environment;
    protected hookRoutes: any[];
    protected hookInterfaceRoutes: any[];
    protected upload: any;
    protected config: {
        hooks_prefix: string;
        hooks_ui_prefix: string;
    };
    constructor(e: Environment);
    /**
     * Creates the server.
     */
    protected createServer(): void;
    toString(): string;
    addWebhook(nest: WebhookNest): void;
    /**
     * Handles request and response of the web hook, creates a new job, as well as calling the nest's arrive.
     * @param nest
     * @param req
     * @param res
     * @param customHandler     Custom request handler.
     */
    protected handleHookRequest: (nest: WebhookNest, req: any, res: any, customHandler?: any) => void;
    /**
     * Adds a webhook interface to the webhook server.
     * @param ui
     */
    addWebhookInterface(ui: WebhookInterface): void;
    /**
     * Handles request and response of the web hook interface.
     * @param ui
     * @param req
     * @param res
     * @param customHandler     Custom request handler.
     */
    protected handleHookInterfaceRequest: (ui: WebhookInterface, req: any, res: any, customHandler?: any) => void;
}
