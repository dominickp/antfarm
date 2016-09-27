export class LifeEvent {

    protected date: Date;

    protected verb: string;

    protected start: string;

    protected finish: string;

    constructor(verb, start, finish) {
        let le = this;
        le.date = new Date();
        le.verb = verb;
        le.start = start;
        le.finish = finish;
    }

    public getStatement() {
        let le = this;
        return `${le.verb} from ${le.start} to ${le.finish}`;
    };

}