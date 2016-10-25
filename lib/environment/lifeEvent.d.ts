/**
 * The LifeEvent class provides a lifecycle that can be provided to debug job failures.
 */
export declare class LifeEvent {
    protected date: Date;
    protected verb: string;
    protected start: string;
    protected finish: string;
    constructor(verb: any, start: any, finish: any);
    getStatement(): string;
}
