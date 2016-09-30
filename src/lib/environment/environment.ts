import {Logger} from "./logger";
import {WebhookJob} from "../job/webhookJob";
import {WebhookNest} from "../nest/webhookNest";
import {ServerRequest} from "http";
import {ServerResponse} from "http";

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

        if (options.port) {
            this.createServer();
        }

        this.options = options;
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
            res.end(JSON.stringify(e.hookRoutes));
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
     * Adds a webhook to the webhook server.
     * @param nest
     */
    public addWebhook(nest: WebhookNest) {
        let e = this;
        let httpMethod = nest.getHttpMethod();
        let path = nest.getPath();

        let hook = e.router.route("/hooks" + path);

        e.log(1, `Watching webhook ${httpMethod.toUpperCase()} /hooks${path}`, e);

        this.hookRoutes.push({
            path: hook.path,
            nest: nest.getName(),
            tunnel: nest.getTunnel().getName(),
            methods: hook.methods
        });

        hook[httpMethod](function (req, res) {

            let customHandler = nest.getCustomHandleRequest();

            e.handleHookRequest(nest, req, res, customHandler);
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