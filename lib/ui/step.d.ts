import { Job } from "../job/job";
import { WebhookInterface } from "./webhookInterface";
/**
 * An interface step which allows GET requests to be made against the interface itself.
 */
export declare class Step {
    /**
     * The human-readable step _name.
     */
    protected _name: string;
    /**
     * Flag if step is complete or not
     */
    protected _complete: boolean;
    /**
     * Callback function to run on step execution.
     */
    protected _callback: any;
    /**
     * Step validation error.
     */
    protected _failure: string;
    failure: string;
    callback: (job: Job, ui: WebhookInterface, step: Step) => void;
    name: string;
    /**
     * Set complete and wipe out any failure
     * @param complete
     */
    complete: boolean;
}
