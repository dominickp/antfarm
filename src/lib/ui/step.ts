/**
 * An interface step which allows GET requests to be made against the interface itself.
 */
export class Step {

    /**
     * The human-readable step name.
     */
    public name: string;

    /**
     * Flag if step is complete or not
     */
    public complete: boolean;

    /**
     * Callback function to run on step execution.
     */
    public callback: any;

    /**
     * Step validation error.
     */
    public failure: string;

    /**
     * Set complete and wipe out any failure
     * @param complete
     */
    public setComplete(complete: boolean) {
        let s = this;
        if (complete === true) {
            s.complete = true;
            s.failure = null;
        } else {
            s.complete = false;
        }
    }
}