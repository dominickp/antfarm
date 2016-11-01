export declare class JobProperty {
    protected _key: string;
    protected _value: any;
    protected _type: string;
    constructor(key: string, value: any);
    value: any;
    protected resolveType(): void;
    key: string;
    type: string;
}
