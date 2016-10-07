export declare class LifeEvent {
    protected date: Date;
    protected verb: string;
    protected start: string;
    protected finish: string;
    constructor(verb: any, start: any, finish: any);
    getStatement(): string;
}
