/**
 * The LifeEvent class provides a lifecycle that can be provided to debug job failures.
 */
export declare class LifeEvent {
    protected _date: Date;
    protected _verb: string;
    protected _start: string;
    protected _finish: string;
    constructor(verb: any, start: any, finish: any);
    date: Date;
    verb: string;
    start: string;
    finish: string;
    readonly statement: string;
}
