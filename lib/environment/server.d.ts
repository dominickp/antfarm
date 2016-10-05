import { Environment } from "./environment";
import { WebhookNest } from "../nest/webhookNest";
import * as express from "express";
import { InterfaceManager } from "../ui/interfaceManager";
/**
 * Webhook and logging server.
 */
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
    /**
     * Log name
     * @returns {string}
     */
    toString(): string;
    /**
     * Adds a webhook to the server.
     * @param nest {WebhookNest}
     */
    addWebhook(nest: WebhookNest): void;
    /**
     * Handles request and response of the web hook, creates a new job, as well as calling the nest's arrive.
     * @param nest {WebhookNest}
     * @param req {express.Request}
     * @param res {express.Response}
     * @param customHandler     Custom request handler.
     */
    protected handleHookRequest: (nest: WebhookNest, req: any, res: any, customHandler?: any) => void;
    /**
     * Adds a webhook interface to the webhook server.
     * @param im {InterfaceManager}
     */
    addWebhookInterface(im: InterfaceManager): void;
    /**
     * Handles request and response of the web hook interface.
     * @param im {InterfaceManager}
     * @param req {express.Request}
     * @param res {express.Response}
     * @param customHandler             Custom request handler.
     */
    protected handleHookInterfaceRequest: (im: InterfaceManager, req: any, res: any, customHandler?: any) => void;
}
