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

    get date() {
        return this._date;
    }

    set date(date: Date) {
        this._date = date;
    }

    get verb() {
        return this._verb;
    }

    set verb(verb: string) {
        this._verb = verb;
    }

    get start() {
        return this._start;
    }

    set start(start: string) {
        this._start = start;
    }

    get finish() {
        return this._finish;
    }

    set finish(finish: string) {
        this._finish = finish;
    }

    public get statement() {
        let le = this;
        return `${le.verb} from ${le.start} to ${le.finish}`;
    };

}