import { WebhookNest } from "../nest/webhookNest";
import { WebhookInterface } from "./webhookInterface";
import { Environment } from "../environment/environment";
import { FieldOptions } from "./field";
import { Step } from "./step";
import { InterfaceMetadata } from "./interfaceMetadata";
import { InterfaceProperty } from "./InterfaceProperty";
import { FolderNest } from "../nest/folderNest";
/**
 * The interface manager allows you to separate your interface fields for stepped user interfaces.
 * It's a factory that handles the construction and session handling of WebhookInterface instances.
 * #### Example
 * ```js
 * var manager = webhook.getInterfaceManager();
 * manager.addField({
 *      id: "job_number",
 *      _name: "Job Number";
 *      type: "text"
 * });
 * ```
 */
export declare class InterfaceManager {
    protected e: Environment;
    protected _nest: WebhookNest;
    protected _fields: FieldOptions[];
    protected _steps: Step[];
    protected _interfaceInstances: WebhookInterface[];
    protected _handleRequest: any;
    protected _metadata: InterfaceMetadata;
    protected _checkpointNest: FolderNest;
    /**
     *
     * @param e
     * @param webhookNest
     * @param handleRequest     Optional custom request handler for webhooks.
     */
    constructor(e: Environment, webhookNest: WebhookNest, handleRequest?: any);
    protected initMetadata(): void;
    metadata: InterfaceMetadata;
    description: string;
    tooltip: string;
    addInterfaceProperty(property: InterfaceProperty): void;
    interfaceProperties: InterfaceProperty[];
    readonly interfaceInstances: WebhookInterface[];
    checkpointNest: FolderNest;
    /**
     * Get the custom handleRequest function.
     * @returns {any}
     */
    readonly customHandleRequest: any;
    /**
     * Get the nest
     * @returns {WebhookNest}
     */
    readonly nest: WebhookNest;
    /**
     * Get the nest _path.
     * @returns {string}
     */
    readonly path: any;
    /**
     * Adds an interface field to the interface.
     * @param {FieldOptions} field
     */
    addField(field: FieldOptions): boolean;
    /**
     * Gets an array of interface fields.
     * @returns {FieldOptions[]}
     */
    readonly fields: FieldOptions[];
    /**
     * Adds a user interface step.
     * @param stepName
     * @param callback          Parameters: WebhookJob, WebhookInterface, Step, Done callback
     * #### Example
     * ```js
     *  manager.addStep("Check job number", function(webhookJob, webhookInterface, step, done){
     *      if(webhookJob.getQueryStringValue("job_number")){
     *          webhookInterface.addField({
     *              id: "something_else",
     *              _name: "Some other field",
     *              type: "text",
     *              description: "Thanks for adding a job number!"
     *          });
     *          step.complete = true; // Mark step as complete
     *          done(); // Callback to do next step or send response if complete
     *      }
     * });
     * ```
     */
    addStep(stepName: string, callback: any): void;
    /**
     * Get an array of user interface steps.
     * @returns {Step[]}
     */
    readonly steps: Step[];
    protected addInterfaceInstance(wi: WebhookInterface): void;
    protected removeInterfaceInstance(wi: WebhookInterface): void;
    /**
     * Find or return a new webhook interface instance.
     * @param sessionId
     * @returns {WebhookInterface}
     */
    getInterface(sessionId?: string): any;
    /**
     * Adds pending jobs to the interfaces job list.
     * @param nest
     */
    checkNest(nest: FolderNest): void;
}
