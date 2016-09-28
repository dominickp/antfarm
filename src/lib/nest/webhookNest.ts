import {Environment} from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
import {WebhookJob} from "../job/webhookJob";

const   http = require("http");

export class WebhookNest extends Nest {

    protected port: number;

    protected server;

    constructor(e: Environment, port: number) {
        super(e, "Webhook " + port.toString());
        let wh = this;
        wh.port = port;
        wh.createServer();
    }

    /**
     * Creates the server.
     */
    protected createServer() {
        let wh = this;
        wh.server = http.createServer(function(request, response){
            response.end("It Works!! Path Hit: " + request.url);

            let job = new WebhookJob(wh.e, request, response);
            wh.arrive(job);

            wh.e.log(1, `Request received. Sent ${request.url}.`, wh);
        });
    }

    public load() {

    }

    /**
     * Start server listening
     */
    public watch() {
        let wh = this;

        wh.server.listen(wh.port, function(){
            // Callback triggered when server is successfully listening.
            wh.e.log(1, `Server listening on: http://localhost:${wh.port}/.`, wh);
        });
    }


    /**
     * Creates a new job
     * @param job
     */
    public arrive(job: WebhookJob) {
        super.arrive(job);
    }


}