import {Environment} from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
import {WebhookJob} from "../job/webhookJob";

const   http = require("http");

export class WebhookNest extends Nest {

    protected name: string;

    constructor(e: Environment, name: string) {
        super(e, name);
        let wh = this;
        wh.name = name;
    }


    public getName() {
        return this.name;
    }

    public load() {

    }

    /**
     * Add webhook to server watch list.
     */
    public watch() {
        let wh = this;
        wh.e.addWebhook(wh, wh.getName());
    }


    /**
     * Creates a new job
     * @param job
     */
    public arrive(job: WebhookJob) {
        super.arrive(job);
    }


}