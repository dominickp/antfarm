import { Environment } from "../environment/environment";
import { Nest } from "./nest";
import { WebhookJob } from "../job/webhookJob";
export declare class WebhookNest extends Nest {
    protected path: string;
    protected httpMethod: string;
    constructor(e: Environment, path: string | string[], httpMethod: string);
    setPath(path: any): void;
    getPath(): string;
    getHttpMethod(): string;
    protected setHttpMethod(httpMethod: any): void;
    getName(): string;
    load(): void;
    /**
     * Add webhook to server watch list.
     */
    watch(): void;
    /**
     * Creates a new job
     * @param job
     */
    arrive(job: WebhookJob): void;
}
