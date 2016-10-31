/**
 * An interface step which allows GET requests to be made against the interface itself.
 */
export declare class Step {
    /**
     * The human-readable step _name.
     */
    name: string;
    /**
     * Flag if step is complete or not
     */
    complete: boolean;
    /**
     * Callback function to run on step execution.
     */
    callback: any;
    /**
     * Step validation error.
     */
    failure: string;
    /**
     * Set complete and wipe out any failure
     * @param complete
     */
    setComplete(complete: boolean): void;
}
