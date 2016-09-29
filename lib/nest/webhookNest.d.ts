import { Environment } from "../environment/environment";
import { Nest } from "./nest";
import { WebhookJob } from "../job/webhookJob";
export declare class WebhookNest extends Nest {
    protected name: string;
    constructor(e: Environment, name: string);
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
