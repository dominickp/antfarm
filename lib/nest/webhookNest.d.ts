import { Environment } from "../environment/environment";
import { Nest } from "./nest";
import { WebhookJob } from "../job/webhookJob";
export declare class WebhookNest extends Nest {
    protected port: number;
    protected server: any;
    constructor(e: Environment, port: number);
    /**
     * Creates the server.
     */
    protected createServer(): void;
    load(): void;
    /**
     * Start server listening
     */
    watch(): void;
    /**
     * Creates a new job
     * @param job
     */
    arrive(job: WebhookJob): void;
}
