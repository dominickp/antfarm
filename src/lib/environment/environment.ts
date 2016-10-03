import {Logger} from "./logger";
import {WebhookJob} from "../job/webhookJob";
import {WebhookNest} from "../nest/webhookNest";
import {ServerRequest} from "http";
import {ServerResponse} from "http";
import {WebhookInterface} from "../ui/webhookInterface";

const   http = require("http"),
        finalhandler = require("finalhandler"),
        Router = require("router"),
        fs = require("fs");

export class Environment {

    protected options: AntfarmOptions;
    protected logger: Logger;
    protected server;
    protected router;
    protected hookRoutes = [];
    protected hookInterfaceRoutes = [];

    constructor(options: AntfarmOptions) {

        this.router = Router({});

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

    public getAutoManagedFolderDirectory() {
        return this.options.auto_managed_folder_directory;
    }

    /**
     * Creates the server.
     */
    protected createServer() {
        let e = this;
        e.server = http.createServer(function(request, response) {
            try {
                e.router(request, response, finalhandler(request, response));
            } catch (err) {
                e.log(3, err, e);
            }
        });

        e.server.listen(e.options.port, function(){
            // Callback triggered when server is successfully listening. Hurray!
            e.log(1, "Server listening on: http://localhost:" +  e.options.port, e);
        });

        e.router.get("/hooks", function (req, res) {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify(e.hookRoutes));
        });
        e.router.get("/hooks-ui", function (req, res) {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify(e.hookInterfaceRoutes));
        });
    }

    /**
     * Handles request and response of the web hook, creates a new job, as well as calling the nest's arrive.
     * @param nest
     * @param req
     * @param res
     * @param customHandler     Custom request handler.
     */
    protected handleHookRequest = function(nest: WebhookNest, req: ServerRequest, res: ServerResponse, customHandler?: any) {
        let e = this;
        let job = new WebhookJob(e, req, res);
        nest.arrive(job);

        if (customHandler) {
            customHandler(req, res, job, nest);
        } else {
            let responseString = JSON.stringify({
                message: `Job ${job.getId()} was created!`,
                job: {
                    id: job.getId(),
                    name: job.getName()
                },
                nest: {
                    name: nest.getName()
                }
            });

            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(responseString);
        }
    };

    /**
     * Handles request and response of the web hook interface.
     * @param ui
     * @param req
     * @param res
     * @param customHandler     Custom request handler.
     */
    protected handleHookInterfaceRequest = function(ui: WebhookInterface, req: ServerRequest, res: ServerResponse, customHandler?: any) {
        let e = this;

        if (customHandler) {
            customHandler(req, res, ui);
        } else {
            let responseString = JSON.stringify(ui.getInterface());
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(responseString);
        }
    };

    /**
     * Adds a webhook to the webhook server.
     * @param nest
     */
    public addWebhook(nest: WebhookNest) {
        let e = this;
        let httpMethod = nest.getHttpMethod();
        let path = nest.getPath();

        let hook = e.router.route("/hooks" + path);

        e.log(1, `Watching webhook ${httpMethod.toUpperCase()} /hooks${path}`, e);

        let ui_path;
        if (nest.getInterface()) {
            ui_path = "hooks-ui" + nest.getInterface().getPath();
        }

        this.hookRoutes.push({
            id: nest.getId(),
            path: hook.path,
            nest: nest.getName(),
            tunnel: nest.getTunnel().getName(),
            methods: hook.methods,
            interface_path: ui_path
        });

        hook[httpMethod](function (req, res) {

            let customHandler = nest.getCustomHandleRequest();

            e.handleHookRequest(nest, req, res, customHandler);
        });
    }

    /**
     * Adds a webhook interface to the webhook server.
     * @param webhook_interface
     */
    public addWebhookInterface(webhook_interface: WebhookInterface) {
        let e = this;
        let nest = webhook_interface.getNest();
        let path = webhook_interface.getPath();

        let hook = e.router.route("/hooks-ui" + path);

        e.log(1, `Watching webhook interface GET /hooks-ui${path}`, e);

        this.hookInterfaceRoutes.push({
            id: nest.getId(),
            path: hook.path,
            nest: nest.getName(),
            target: "/hooks" + nest.getPath()
            // tunnel: nest.getTunnel().getName()
        });

        hook["get"](function (req, res) {

            let customHandler = webhook_interface.getCustomHandleRequest();

            e.handleHookInterfaceRequest(webhook_interface, req, res, customHandler);
        });
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