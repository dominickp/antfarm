export class JobProperty {

    protected key: string;
    protected value: any;
    protected type: string;

    constructor(key: string, value: any) {
        let jp = this;
        jp.key = key;
        jp.setValue(value);
    }

    protected setValue(value: any) {
        this.value = value;
        this.resolveType();
    }

    protected resolveType() {
        let jp = this;
        jp.type = typeof(jp.value);
    }

    public getValue() {
        return this.value;
    }

    public getType() {
        return this.type;
    }
}