import { Tunnel } from '../tunnel/tunnel'
import { Job } from '../job/job'
import {Environment} from "../environment/environment";

export class Nest extends Environment {
    name: string;

    tunnel: Tunnel;

    constructor(name: string) {
        super();
        this.name = name;
    }

    register(tunnel: Tunnel){
        this.tunnel = tunnel;
    }

    arrive(job: Job) {
        super.log(1, `Job "${job.name}" arrived in Nest "${this.name}".`);
        job.tunnel = this.tunnel;
        this.tunnel.arrive(job, this);
    }
}