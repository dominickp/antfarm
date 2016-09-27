import { Tunnel } from "../tunnel/tunnel";
import { Nest } from "../nest/nest";
import {Environment} from "../environment/environment";
import {LifeEvent} from "../environment/lifeEvent";

export abstract class Job {
    protected name: string;

    protected tunnel: Tunnel;

    protected nest: Nest;

    protected e: Environment;

    protected locallyAvailable: boolean;

    protected lifeCycle: LifeEvent[];

    constructor(e: Environment, name: string) {

        this.e = e;

        this.name = name;

        this.lifeCycle = [];

        this.createLifeEvent("created", null, name);

        this.e.log(1, `New Job "${name}" created.`, this);
    }

    isLocallyAvailable() {
        return this.locallyAvailable;
    }

    setLocallyAvailable(available: boolean) {
        this.locallyAvailable = available;
    }

    getLifeCycle() {
        return this.lifeCycle;
    }

    protected createLifeEvent(verb: string, start: string, finish: string) {
        this.lifeCycle.push(new LifeEvent(verb, start, finish));
    }

    setName(name: string) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    setNest(nest: Nest) {
        this.nest = nest;
    }

    getNest() {
        return this.nest;
    }

    setTunnel(tunnel: Tunnel) {
        this.tunnel = tunnel;
    }

    getTunnel() {
        return this.tunnel;
    }

    fail(reason: string) {
        if (!this.tunnel) {
            this.e.log(3, `Job "${this.getName()}" failed before tunnel was set.`, this);
        }
        this.tunnel.executeFail(this, this.nest, reason);
    }

    /**
     * Transfer a job to another tunnel directly.
     * @param tunnel
     */
    transfer(tunnel: Tunnel) {
        let job = this;
        let oldTunnel = this.getTunnel();
        job.setTunnel(tunnel);
        tunnel.arrive(job, null);

        job.e.log(1, `Job "${job.getName()}" transferred to Tunnel "${oldTunnel.getName()}".`, job);
        job.createLifeEvent("transfer", oldTunnel.getName(), tunnel.getName());
    }


}