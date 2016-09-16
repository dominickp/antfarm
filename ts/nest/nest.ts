import { Tunnel } from '../tunnel'
import { Job } from '../job/job'

export class Nest {
    name: string;

    tunnel: Tunnel;

    constructor(name: string) {
        this.name = name;
    }

    register(tunnel: Tunnel){
        this.tunnel = tunnel;
    }

    arrive(job: Job) {
        this.tunnel.arrive(job, this);
    }
}