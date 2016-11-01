import {isArray} from "util";

export class JobProperty {

    protected _key: string;
    protected _value: any;
    protected _type: string;

    constructor(key: string, value: any) {
        let jp = this;
        jp.key = key;
        jp.value = value;
    }

    public get value() {
        return this._value;
    }

    public set value(value: any) {
        this._value = value;
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

    public get key() {
        return this._key;
    }

    public set key(key: string) {
        this._key = key;
    }

    public get type() {
        return this._type;
    }

    public set type(type: string) {
        this._type = type;
    }
}