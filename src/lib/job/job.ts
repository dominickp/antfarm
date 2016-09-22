import { Tunnel } from "../tunnel/tunnel";
import { Nest } from "../nest/nest";
import {Environment} from "../environment/environment";

export abstract class Job {
    protected name: string;

    protected tunnel: Tunnel;

    protected nest: Nest;

    protected e: Environment;

    protected isLocallyAvailable: boolean;

    constructor(e: Environment, name: string) {

        this.e = e;

        this.name = name;

        this.e.log(1, `New Job "${name}" created.`, this);
    }

    getIsLocallyAvailable() {
        return this.isLocallyAvailable;
    }

    setIsLocallyAvailable(available: boolean) {
        this.isLocallyAvailable = available;
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


}