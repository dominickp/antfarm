import { Tunnel } from '../tunnel/tunnel'
import { Nest } from '../nest/nest';
import {Environment} from "../environment/environment";

export class Job extends Environment {
    name: string;

    path: string;

    tunnel: Tunnel;

    nest: Nest;

    constructor(name: string) {
        super();
        this.name = name;

        super.log(1, `New Job "${name}" created.`);
    }

    fail(reason: string){
        if(!this.tunnel){
            super.log(3, `Job "${name}" failed before tunnel was set.`);
        }
        this.tunnel.executeFail(this, this.nest, reason);
    }

    setPath(path){
        this.path = path;
    }


}