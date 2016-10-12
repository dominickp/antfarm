import {Logger} from "./logger";
import {WebhookJob} from "../job/webhookJob";
import {WebhookNest} from "../nest/webhookNest";
import {WebhookInterface} from "../ui/webhookInterface";
import {Server} from "./server";
import {InterfaceManager} from "../ui/interfaceManager";
import {AntfarmOptions} from "./options";

const   fs = require("fs");

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

    public getAutoManagedFolderDirectory() {
        return this.options.auto_managed_folder_directory;
    }

    /**
     * Creates the server.
     */
    // protected createServer() {
    //     let e = this;
    //     e.server = http.createServer(function(request, response) {
    //         try {
    //             response.setHeader("Access-Control-Allow-Headers", "Content-Type,Accept");
    //             response.setHeader("Access-Control-Allow-Origin", "*");
    //             e.router(request, response, finalhandler(request, response));
    //         } catch (err) {
    //             e.log(3, err, e);
    //         }
    //     });
    //
    //     e.server.listen(e.options.port, function(){
    //         // Callback triggered when server is successfully listening. Hurray!
    //         e.log(1, "Server listening on: http://localhost:" +  e.options.port, e);
    //     });
    //
    //     e.router.get("/hooks", function (req, res) {
    //         res.setHeader("Content-Type", "application/json; charset=utf-8");
    //         res.setHeader("Access-Control-Allow-Origin", "*");
    //         res.end(JSON.stringify(e.hookRoutes));
    //     });
    //     e.router.get("/hooks-ui", function (req, res) {
    //         res.setHeader("Content-Type", "application/json; charset=utf-8");
    //         res.setHeader("Access-Control-Allow-Origin", "*");
    //         res.end(JSON.stringify(e.hookInterfaceRoutes));
    //     });
    // }

    protected createServer() {
        let server = new Server(this);
        this._server = server;
    }

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

    public log(type: number, message: string, actor?: any, instances = []) {
        // try {
        //     this.logger.log(type, message, actor, instances);
        // } catch (e) {
        //     console.log(e);
        // }
        this.logger.log(type, message, actor, instances);
    }
}