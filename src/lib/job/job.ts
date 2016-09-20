import { Tunnel } from '../tunnel/tunnel'
import { Nest } from '../nest/nest';
import {Environment} from "../environment/environment";

export abstract class Job {
    name: string;

    tunnel: Tunnel;

    nest: Nest;

    protected e: Environment;

    constructor(e: Environment, name: string) {

        this.e = e;

        this.name = name;

        this.e.log(1, `New Job "${name}" created.`);
    }

    fail(reason: string){
        if(!this.tunnel){
            this.e.log(3, `Job "${name}" failed before tunnel was set.`);
        }
        this.tunnel.executeFail(this, this.nest, reason);
    }


}