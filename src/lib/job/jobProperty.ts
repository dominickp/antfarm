import {isArray} from "util";
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
        let type = typeof(jp.value);
        if (isArray(jp.value)) {
            jp.type = "array";
        } else {
            jp.type = type;
        }
    }

    public getValue() {
        return this.value;
    }

    public getType() {
        return this.type;
    }
}