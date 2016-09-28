import { Environment } from "../environment/environment";
import { Nest } from "./nest";
export declare class WebhookNest extends Nest {
    protected port: number;
    protected server: any;
    constructor(e: Environment, port: number);
    /**
     * Handles request and sends a response.
     * @param request
     * @param response
     */
    protected handleRequest(request: any, response: any): void;
    load(): void;
    watch(): void;
}
