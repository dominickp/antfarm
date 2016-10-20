import {MyPackedJob} from "./packedJob";

export abstract class MyJob {

    protected name: string;

    constructor(name: string) {
        this.name = name;
    }

    public pack() {
        return new MyPackedJob(this);
    }
}