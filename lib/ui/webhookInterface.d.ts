import { Environment } from "../environment/environment";
import { WebhookNest } from "../nest/webhookNest";
import { FolderNest } from "../nest/folderNest";
export declare class WebhookInterface {
    protected fields: any[];
    protected e: Environment;
    protected nest: WebhookNest;
    protected checkpointNest: FolderNest;
    protected handleRequest: any;
    protected steps: any[];
    /**
     * Constructor
     * @param {Environment} e
     * @param {WebhookNest} nest
     * @param handleRequest
     */
    constructor(e: Environment, nest: WebhookNest, handleRequest?: any);
    /**
     * Get the custom handleRequest function.
     * @returns {any}
     */
    getCustomHandleRequest(): any;
    /**
     * Get the nest
     * @returns {WebhookNest}
     */
    getNest(): WebhookNest;
    /**
     * Adds an interface field to the interface.
     * @param {FieldOptions} field
     */
    addField(field: FieldOptions): void;
    /**
     * Returns the interface for transport.
     * @returns {{fields: Array}}
     */
    getInterface(): {
        fields: any[];
        jobs: any[];
        steps: any[];
    };
    /**
     * Get the nest path.
     * @returns {string}
     */
    getPath(): string;
    /**
     * Adds pending jobs to the interfaces job list.
     * @param nest
     */
    checkNest(nest: FolderNest): void;
    getJobs(): any[];
    /**
     * Adds a user interface step
     * @param name      Name of the step
     * @param callback
     */
    addStep(name: string, callback: any): void;
    /**
     * Get steps
     * @returns {Array}
     */
    getSteps(): any[];
}
