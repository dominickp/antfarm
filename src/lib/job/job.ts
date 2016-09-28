import { Tunnel } from "../tunnel/tunnel";
import { Nest } from "../nest/nest";
import {Environment} from "../environment/environment";
import {LifeEvent} from "../environment/lifeEvent";

const shortid = require("shortid");

export abstract class Job {

    protected name: string;
    protected tunnel: Tunnel;
    protected nest: Nest;
    protected e: Environment;
    protected locallyAvailable: boolean;
    protected lifeCycle: LifeEvent[];
    protected id: string;

    constructor(e: Environment, name: string) {

        this.e = e;

        this.id = shortid.generate();

        this.name = name;

        this.lifeCycle = [];

        this.createLifeEvent("created", null, name);
        this.e.log(1, `New Job "${name}" created.`, this);
    }

    public toString() {
        return "Job";
    }

    public isLocallyAvailable() {
        return this.locallyAvailable;
    }

    public setLocallyAvailable(available: boolean) {
        this.locallyAvailable = available;
    }

    public getLifeCycle() {
        return this.lifeCycle;
    }

    protected createLifeEvent(verb: string, start: string, finish: string) {
        this.lifeCycle.push(new LifeEvent(verb, start, finish));
    }

    public setName(name: string) {
        this.name = name;
    }

    public getId() {
        return this.id;
    }

    public getName() {
        return this.name;
    }

    public getNameProper() {
        return this.getName();
    }

    public setNest(nest: Nest) {
        this.nest = nest;
    }

    public getNest() {
        return this.nest;
    }

    public setTunnel(tunnel: Tunnel) {
        this.tunnel = tunnel;
    }

    public getTunnel() {
        return this.tunnel;
    }

    public fail(reason: string) {
        if (!this.tunnel) {
            this.e.log(3, `Job "${this.getName()}" failed before tunnel was set.`, this);
        }
        this.tunnel.executeFail(this, this.nest, reason);
    }

    /**
     * Transfer a job to another tunnel directly.
     * @param tunnel
     */
    public transfer(tunnel: Tunnel) {
        let job = this;
        let oldTunnel = this.getTunnel();
        job.setTunnel(tunnel);
        tunnel.arrive(job, null);

        job.e.log(1, `Transferred to Tunnel "${tunnel.getName()}".`, job, [oldTunnel]);
        job.createLifeEvent("transfer", oldTunnel.getName(), tunnel.getName());
    }


}