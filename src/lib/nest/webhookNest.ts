import {Environment} from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";

const   http = require("http");

export class WebhookNest extends Nest {

    protected port: number;

    protected server;

    constructor(e: Environment, port: number) {

        super(e, port.toString());

        this.port = port;

        this.server = http.createServer(this.handleRequest);
    }

    /**
     * Handles request and sends a response.
     * @param request
     * @param response
     */
    protected handleRequest(request, response) {
        response.end("It Works!! Path Hit: " + request.url);
    }

    public load() {

    }

    public watch() {
        let wh = this;

        wh.server.listen(wh.port, function(){
            // Callback triggered when server is successfully listening.
            wh.e.log(1, `Server listening on: http://localhost:${wh.port}.`, wh);
        });
    }

}