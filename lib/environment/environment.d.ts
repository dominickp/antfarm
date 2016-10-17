import { Logger } from "./logger";
import { WebhookNest } from "../nest/webhookNest";
import { Server } from "./server";
import { InterfaceManager } from "../ui/interfaceManager";
import { AntfarmOptions } from "./options";
import { Emailer } from "./emailer";
/**
 * The environment class controls all aspects of the antfarm environment, like options, logging,
 * and constructing globally referenced objects.
 */
export declare class Environment {
    protected options: AntfarmOptions;
    protected logger: Logger;
    protected _server: Server;
    protected emailer: Emailer;
    protected hookRoutes: any[];
    protected hookInterfaceRoutes: any[];
    constructor(options: AntfarmOptions);
    /**
     * Sets the options and creates other environmental objects if necessary.
     * @param options
     */
    protected setOptions(options: AntfarmOptions): void;
    protected createEmailer(): void;
    getEmailer(): Emailer;
    /**
     * Get the Antfarm options.
     * @returns {AntfarmOptions}
     */
    getOptions(): AntfarmOptions;
    /**
     * Return the auto managed folder directory, if set.
     * @returns {string}
     */
    getAutoManagedFolderDirectory(): string;
    /**
     * Creates the server.
     */
    protected createServer(): void;
    /**
     * Get the server instance.
     * @returns {Server}
     */
    server: Server;
    /**
     * Adds a webhook to the webhook server.
     * @param nest
     */
    addWebhook(nest: WebhookNest): void;
    /**
     * Adds a webhook interface to the webhook server.
     * @param im
     */
    addWebhookInterface(im: InterfaceManager): void;
    toString(): string;
    /**
     * Adds a log entry to the Logger instance.
     * @param type {number}          The log level. 0 = debug, 1 = info, 2 = warning, 3 = error
     * @param message {string}       Log message.
     * @param actor  {any}           Instance which triggers the action being logged.
     * @param instances {any[]}      Array of of other involved instances.
     * #### Example
     * ```js
     * job.e.log(1, `Transferred to Tunnel "${tunnel.getName()}".`, job, [oldTunnel]);
     * ```
     */
    log(type: number, message: string, actor?: any, instances?: any[]): void;
}
