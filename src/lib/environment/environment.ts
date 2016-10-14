import {Logger} from "./logger";
import {WebhookNest} from "../nest/webhookNest";
import {Server} from "./server";
import {InterfaceManager} from "../ui/interfaceManager";
import {AntfarmOptions} from "./options";

const   fs = require("fs");

/**
 * The environment class controls all aspects of the antfarm environment, like options, logging,
 * and constructing globally referenced objects.
 */
export class Environment {

    protected options: AntfarmOptions;
    protected logger: Logger;
    protected _server: Server;
    protected hookRoutes = [];
    protected hookInterfaceRoutes = [];

    constructor(options: AntfarmOptions) {
        this.logger = new Logger(options);
        this.setOptions(options);
    }

    /**
     * Sets the options and creates other environmental objects if necessary.
     * @param options
     */
    protected setOptions(options: AntfarmOptions) {
        let e = this;

        if (options.auto_managed_folder_directory) {
            try {
                fs.statSync(options.auto_managed_folder_directory);
            } catch (err) {
                e.log(3, `Auto managed directory "${options.auto_managed_folder_directory}" does not exist.`, this);
            }
        }

        this.options = options;

        if (options.port) {
            this.createServer();
        }
    }

    /**
     * Get the Antfarm options.
     * @returns {AntfarmOptions}
     */
    public getOptions() {
        return this.options;
    }

    /**
     * Return the auto managed folder directory, if set.
     * @returns {string}
     */
    public getAutoManagedFolderDirectory() {
        return this.options.auto_managed_folder_directory;
    }

    /**
     * Creates the server.
     */
    protected createServer() {
        this._server = new Server(this);
    }

    /**
     * Get the server instance.
     * @returns {Server}
     */
    public get server() {
        return this._server;
    }

    /**
     * Adds a webhook to the webhook server.
     * @param nest
     */
    public addWebhook(nest: WebhookNest) {
        let e = this;
        e.server.addWebhook(nest);
    }

    /**
     * Adds a webhook interface to the webhook server.
     * @param im
     */
    public addWebhookInterface(im: InterfaceManager) {
        let e = this;
        e.server.addWebhookInterface(im);
    }

    public toString() {
        return "Environment";
    }

    /**
     * Adds a log entry to the Logger instance.
     * @param type {number}
     * @param message {string}       Log message.
     * @param actor  {any}           Instance which triggers the action being logged.
     * @param instances {any[]}      Array of of other involved instances.
     * #### Example
     * ```js
     * job.e.log(1, `Transferred to Tunnel "${tunnel.getName()}".`, job, [oldTunnel]);
     * ```
     */
    public log(type: number, message: string, actor?: any, instances = []) {
        this.logger.log(type, message, actor, instances);
    }
}