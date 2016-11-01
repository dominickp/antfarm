import {Logger} from "./logger";
import {WebhookNest} from "../nest/webhookNest";
import {Server} from "./server";
import {InterfaceManager} from "../ui/interfaceManager";
import {AntfarmOptions} from "./options";
import {Emailer} from "./emailer";
import {EmailCredentials} from "./emailCredentials";

const   fs = require("fs");

/**
 * The environment class controls all aspects of the antfarm environment, like options, logging,
 * and constructing globally referenced objects.
 */
export class Environment {

    protected _options: AntfarmOptions;
    protected logger: Logger;
    protected _server: Server;
    protected _emailer: Emailer;
    protected hookRoutes = [];
    protected hookInterfaceRoutes = [];

    constructor(options: AntfarmOptions) {
        this.logger = new Logger(options);
        this.options = options;
    }

    /**
     * Sets the options and creates other environmental objects if necessary.
     * @param options
     */
    public set options(options: AntfarmOptions) {
        let e = this;

        if (options.auto_managed_folder_directory) {
            try {
                fs.statSync(options.auto_managed_folder_directory);
            } catch (err) {
                e.log(3, `Auto managed directory "${options.auto_managed_folder_directory}" does not exist.`, this);
            }
        }

        this._options = options;

        if (options.port) {
            e.createServer();
            e.server.createLogServer(e.logger);
        }

        if (options.email_credentials) {
            e.createEmailer();
        }
    }

    /**
     * Get the Antfarm options.
     * @returns {AntfarmOptions}
     */
    public get options() {
        return this._options;
    }

    /**
     * Creates an Emailer object to send emails.
     */
    protected createEmailer() {
        let e = this;
        // Get options needed and pass to emailer
        let credentials = e.options.email_credentials;
        e._emailer = new Emailer(e, credentials);
    }

    public get emailer() {
        return this._emailer;
    }

    /**
     * Return the auto managed folder directory, if set.
     * @returns {string}
     */
    public get autoManagedFolderDirectory() {
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
     * @param type {number}          The log level. 0 = debug, 1 = info, 2 = warning, 3 = error
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