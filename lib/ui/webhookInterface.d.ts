import { Environment } from "../environment/environment";
import { WebhookNest } from "../nest/webhookNest";
import { FolderNest } from "../nest/folderNest";
export declare class WebhookInterface {
    protected fields: FieldOptions[];
    protected e: Environment;
    protected nest: WebhookNest;
    protected checkpointNest: FolderNest;
    protected steps: Step[];
    protected sessionId: string;
    /**
     * Constructor
     * @param {Environment} e
     * @param {WebhookNest} nest
     */
    constructor(e: Environment, nest: WebhookNest);
    getSessionId(): string;
    /**
     * Get the nest
     * @returns {WebhookNest}
     */
    getNest(): WebhookNest;
    /**
     * Adds an interface field to the interface.
     * @param {FieldOptions} field
     */
    addField(field: FieldOptions): boolean;
    /**
     * Overwrites fields with a clone.
     * @param fields
     */
    setFields(fields: FieldOptions[]): void;
    getFields(): FieldOptions[];
    /**
     * Returns the interface for transport.
     * @returns {{fields: Array}}
     */
    getTransportInterface(): {
        sessionId: string;
        fields: FieldOptions[];
        jobs: any[];
        steps: Step[];
    };
    /**
     * Adds pending jobs to the interfaces job list.
     * @param nest
     */
    checkNest(nest: FolderNest): void;
    getJobs(): any[];
    /**
     * Adds a user interface step
     * @param stepName
     * @param callback
     */
    addStep(stepName: string, callback: any): void;
    /**
     *
     * @returns {Step[]}
     */
    getSteps(): Step[];
    setSteps(steps: any): void;
}
