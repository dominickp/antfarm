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

        this.e.log(1, `New Job "${name}" created.`, this);
    }

    getName(){
        return this.name;
    }

    fail(reason: string){
        if(!this.tunnel){
            this.e.log(3, `Job "${this.getName()}" failed before tunnel was set.`, this);
        }
        this.tunnel.executeFail(this, this.nest, reason);
    }


}