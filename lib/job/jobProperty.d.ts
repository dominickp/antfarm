export declare class JobProperty {
    protected key: string;
    protected value: any;
    protected type: string;
    constructor(key: string, value: any);
    protected setValue(value: any): void;
    protected resolveType(): void;
    getValue(): any;
    getType(): string;
}
