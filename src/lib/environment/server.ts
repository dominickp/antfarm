import {Environment} from "./environment";
import {WebhookNest} from "../nest/webhookNest";
import {WebhookJob} from "../job/webhookJob";
import express = require("express");

const   express = require("express"),
        cors = require("cors"),
        multer = require("multer"),
        path = require("path");


export class Server {

    protected server: express.Application;
    protected e: Environment;
    protected hookRoutes = [];
    protected hookInterfaceRoutes = [];

    constructor(e: Environment) {
        this.e = e;
        this.server = express();
        this.createServer();
    }

    /**
     * Creates the server.
     */
    protected createServer() {
        let s = this;

        let port = s.e.getOptions().port;

        s.server.use(cors());

        s.server.listen(port, () => s.e.log(1, `Server up and listening on port ${port}.`, s));
    }

    public toString() {
        return "Server";
    }

    protected handleHookRequest() {
        let s = this;

    }

    public addWebhook(nest: WebhookNest) {
        let s = this;
        let e = s.e;

        const   hooks_prefix = "/hooks",
                hooks_ui_prefix = "/hooks-ui";

        let httpMethod = nest.getHttpMethod();
        let hook_path = hooks_prefix + nest.getPath();
        let hook_ui_path;
        if (nest.getInterface()) {
            hook_ui_path = hooks_ui_prefix + nest.getInterface().getPath();
        }

        s.hookRoutes.push({
            id: nest.getId(),
            path: hook_path,
            nest: nest.getName(),
            tunnel: nest.getTunnel().getName(),
            methods: httpMethod,
            interface_path: hook_ui_path
        });

        s.server[httpMethod](function (req, res) {

            let customHandler = nest.getCustomHandleRequest();

             s.handleHookRequest(nest, req, res, customHandler);
        });
    }

    /**
     * Handles request and response of the web hook, creates a new job, as well as calling the nest's arrive.
     * @param nest
     * @param req
     * @param res
     * @param customHandler     Custom request handler.
     */
    protected handleHookRequest = function(nest: WebhookNest, req: express.Request, res: express.Response, customHandler?: any) {
        let e = this;

        // Job arrive
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
            res.json(responseString);
        }
    };


}