/**
 * The LifeEvent class provides a lifecycle that can be provided to debug job failures.
 */
export class LifeEvent {

    protected _date: Date;
    protected _verb: string;
    protected _start: string;
    protected _finish: string;

    constructor(verb, start, finish) {
        let le = this;
        le._date = new Date();
        le._verb = verb;
        le._start = start;
        le._finish = finish;
    }

    public get statement() {
        let le = this;
        return `${le._verb} from ${le._start} to ${le._finish}`;
    };

}