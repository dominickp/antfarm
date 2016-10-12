import { Tunnel } from "../tunnel/tunnel";
import { Job } from "../job/job";
import { Environment } from "../environment/environment";

const   shortid = require("shortid");

/**
 * A nest is a resource that holds or produces jobs.
 */
export abstract class Nest {

    protected id: string;
    protected name: string;
    protected tunnel: Tunnel;
    protected e: Environment;

    constructor(e: Environment, name: string) {
        this.e = e;
        this.id = shortid.generate();
        this.name = name;
    }

    public getId() {
        return this.id;
    }

    public toString() {
        return "Nest";
    }

    public getName() {
        return this.name;
    }

    public getTunnel() {
        return this.tunnel;
    }

    public register(tunnel: Tunnel) {
        this.tunnel = tunnel;
    }

    public arrive(job: Job) {
        let ns = this;
        ns.e.log(1, `Job "${job.getName()}" arrived in Nest "${ns.name}".`, ns);
        job.setTunnel(ns.tunnel);
        job.setNest(ns);
        ns.tunnel.arrive(job, ns);
    }
}