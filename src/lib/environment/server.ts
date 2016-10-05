import {Environment} from "./environment";
import {WebhookNest} from "../nest/webhookNest";
import {WebhookJob} from "../job/webhookJob";
import * as express from "express";
import {WebhookInterface} from "../ui/webhookInterface";
import {InterfaceManager} from "../ui/interfaceManager";

const
        cors = require("cors"),
        multer = require("multer"),
        path = require("path"),
        tmp = require("tmp");


export class Server {

    protected server: express.Application;
    protected e: Environment;
    protected hookRoutes = [];
    protected hookInterfaceRoutes = [];
    protected upload;

    protected config = {
        hooks_prefix: "/hooks",
        hooks_ui_prefix: "/hooks-ui"
    };

    constructor(e: Environment) {
        this.e = e;
        this.server = express();
        this.createServer();

        // let tmpDir = tmp.dirSync().name;
        let tmpDir = "./example";

        this.upload = multer({
                destination: tmpDir,
                storage: multer.diskStorage({
                    filename: function (req, file, cb) {
                        console.log(req.headers);

                        cb(null, file.fieldname + "-" + Date.now());
                    }
                })
            });


    }

    /**
     * Creates the server.
     */
    protected createServer() {
        let s = this;

        let port = s.e.getOptions().port;

        s.server.use(cors());

        // Add index routes
        s.server.get(s.config.hooks_prefix, function(req, res){
            res.json(s.hookRoutes);
        });
        s.server.get(s.config.hooks_ui_prefix, function(req, res){
            res.json(s.hookInterfaceRoutes);
        });

        s.server.listen(port, () => s.e.log(1, `Server up and listening on port ${port}.`, s));
    }

    public toString() {
        return "Server";
    }




    public addWebhook(nest: WebhookNest) {
        let s = this;
        let e = s.e;

        let httpMethod = nest.getHttpMethod();
        let hook_path = s.config.hooks_prefix + nest.getPath();
        let hook_ui_path;
        let im = nest.getInterfaceManager();


        let wi = im.getInterface();
        hook_ui_path = s.config.hooks_ui_prefix + im.getPath();

        s.e.log(1, `Watching webhook ${httpMethod.toUpperCase()} ${hook_path}`, s);

        s.hookRoutes.push({
            id: nest.getId(),
            path: hook_path,
            nest: nest.getName(),
            tunnel: nest.getTunnel().getName(),
            method: httpMethod,
            interface_path: hook_ui_path
        });

        s.server[httpMethod](hook_path, s.upload.any(), function (req, res) {

            // console.log(req.body, req.files, req.file);

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
    protected handleHookRequest = function(nest: WebhookNest, req, res, customHandler?: any) {
        let s = this;

        // Job arrive
        let job = new WebhookJob(s.e, req, res);
        nest.arrive(job);

        if (customHandler) {
            customHandler(req, res, job, nest);
        } else {
            let response = {
                message: `Job ${job.getId()} was created!`,
                job: {
                    id: job.getId(),
                    name: job.getName()
                },
                nest: {
                    name: nest.getName()
                }
            };
            res.json(response);
        }
    };



    /**
     * Adds a webhook interface to the webhook server.
     * @param im
     */
    public addWebhookInterface(im: InterfaceManager) {
        let s = this;
        let nest = im.getNest();

        let hook_path = s.config.hooks_prefix + nest.getPath();
        let hook_ui_path = s.config.hooks_ui_prefix + im.getPath();

        s.e.log(1, `Watching webhook interface GET ${hook_ui_path}`, s);

        this.hookInterfaceRoutes.push({
            id: nest.getId(),
            path: hook_ui_path,
            nest: nest.getName(),
            target: hook_path
            // tunnel: nest.getTunnel().getName()
        });

        s.server.get(hook_ui_path,  function (req, res) {

            let customHandler = im.getCustomHandleRequest();

            s.handleHookInterfaceRequest(im, req, res, customHandler);
        });
    }

    /**
     * Handles request and response of the web hook interface.
     * @param im
     * @param req
     * @param res
     * @param customHandler     Custom request handler.
     */
    protected handleHookInterfaceRequest = function(im: InterfaceManager, req, res, customHandler?: any) {
        let s = this;


        // Job arrive
        let job = new WebhookJob(s.e, req, res);

        // Fill in default values
        let params = job.getQueryStringValues();

        // If session not set, return a fresh ui somehow
        let sessionId = params["sessionId"] || job.getFormDataValue("sessionId");

        let ui = im.getInterface(sessionId);

        if (ui.getSessionId() === sessionId) {
            // Fill in default values
            let fields = ui.getInterface().fields;
            fields.forEach(field => {
                if (field.id in params && params[field.id] !== "undefined") {
                    field.value = params[field.id];
                }
            });

            // Do steps
            ui.getSteps().forEach(function(step){
                s.e.log(1, `Running UI step "${step.name}".`, s);
                step.callback(job, ui, step);
            });
        }

        if (customHandler) {
            customHandler(req, res, ui);
        } else {
            res.json(ui.getInterface());
        }


    };



}