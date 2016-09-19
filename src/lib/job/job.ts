import { Tunnel } from '../tunnel/tunnel'
import { Nest } from '../nest/nest';

export class Job {
    name: string;

    path: string;

    tunnel: Tunnel;

    nest: Nest;

    constructor(name: string) {
        this.name = name;
    }

    fail(reason: string){
        if(!this.tunnel){
            console.error("Failed before tunnel set on job");
        }
        this.tunnel.executeFail(this, this.nest, reason);
    }

    setPath(path){
        this.path = path;
    }


}