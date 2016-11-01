/**
 * An interface step which allows GET requests to be made against the interface itself.
 */
export class Step {

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

    public set failure(message: string) {
        this._failure = message;
    }

    public get failure() {
        return this._failure;
    }

    public set callback(callback: any) {
        this._callback = callback;
    }

    public get callback() {
        return this._callback;
    }

    public get name() {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    /**
     * Set complete and wipe out any failure
     * @param complete
     */
    public set complete(complete: boolean) {
        let s = this;
        if (complete === true) {
            s._complete = true;
            s.failure = null;
        } else {
            s._complete = false;
        }
    }

    public get complete() {
        return this._complete;
    }
}