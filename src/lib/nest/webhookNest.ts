import {Environment} from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
import {WebhookJob} from "../job/webhookJob";

const   http = require("http");

export class WebhookNest extends Nest {

    protected path: string;

    protected httpMethod: string;

    constructor(e: Environment, path: string|string[], httpMethod = "all") {
        super(e, path.toString());
        let wh = this;
        wh.setPath(path);
        wh.setHttpMethod(httpMethod);
    }

    public setPath(path: any) {
        let wh = this;
        let modifiedPath = "";
        if (typeof(path) === "string") {
            modifiedPath = encodeURIComponent(path);
        } else if (path instanceof Array) {
            path.forEach(function(pi){
                modifiedPath += "/" + encodeURIComponent(pi);
            });
        } else {
            throw `Path should be a string or array, ${typeof(path)} found.`;
        }
        if (modifiedPath.charAt(0) !== "/") {
            modifiedPath = "/" + modifiedPath;
        }
        wh.path = modifiedPath;
    }

    public getPath() {
        return this.path;
    }

    public getHttpMethod() {
        return this.httpMethod;
    }

    protected setHttpMethod(httpMethod) {
        let lower = httpMethod.toLowerCase();
        let acceptableMethods = [ "get", "post", "put", "head", "delete", "options", "trace", "copy", "lock", "mkcol", "move", "purge", "propfind", "proppatch", "unlock", "report", "mkactivity", "checkout", "merge", "m-search", "notify", "subscribe", "unsubscribe", "patch", "search", "connect", "all" ];
        if (acceptableMethods.indexOf(lower) === -1) {
            throw `HTTP method "${lower}" is not an acceptable value. ${JSON.stringify(acceptableMethods)}`;
        }
        this.httpMethod = lower;
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
        wh.e.addWebhook(wh);
    }

    /**
     * Creates a new job
     * @param job
     */
    public arrive(job: WebhookJob) {
        super.arrive(job);
    }

}