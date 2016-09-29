import {Logger} from "./logger";
import {Nest} from "./../nest/nest";
import {ClientRequest} from "http";
import {ClientResponse} from "http";

const   http = require("http"),
        // Router = require("router"),
        finalhandler = require("finalhandler"),
        Router = require("router");

// const router = Router({});

export class Environment {

    protected options: AntfarmOptions;

    protected logger: Logger;

    protected server;

    protected router;

    protected routes = [];

    constructor(options?: AntfarmOptions) {

        this.options = options;

        this.router = Router({});


        if (this.options.port) {
            this.createServer();
        }

        this.logger = new Logger(this.options);

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

        e.router.get("/hooks",function (req, res) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(e.routes));
        });
    }

    // protected handleRequest

    public addWebhook(nest: Nest, name: string) {
        let e = this;

        let hook = e.router.route("/hooks/" + name);
        e.log(1, `Watching webhook /hooks/${name}`, e);

        this.routes.push(hook);

        hook.get(function (req, res) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.end('All Systems Green!')
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