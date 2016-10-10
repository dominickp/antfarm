/**
 * An interface step which allows GET requests to be made against the interface itself.
 */
export interface Step {
    /**
     * The human-readable step name.
     */
    name: string;
    /**
     * Flag if step is complete or not
     */
    complete?: boolean;
    /**
     * Callback function to run on step execution.
     */
    callback?: any;
    /**
     * Step validation error.
     */
    failure?: string;
}
