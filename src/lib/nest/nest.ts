import { Tunnel } from "../tunnel/tunnel";
import { Job } from "../job/job";
import { Environment } from "../environment/environment";

const   shortid = require("shortid");

/**
 * A nest is a resource that holds or produces jobs.
 */
export abstract class Nest {

    protected _id: string;
    protected _name: string;
    protected _tunnel: Tunnel;
    protected e: Environment;

    constructor(e: Environment, name: string) {
        this.e = e;
        this._id = shortid.generate();
        this._name = name;
    }

    public get id() {
        return this._id;
    }

    public toString() {
        return "Nest";
    }

    public get name() {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    public get tunnel() {
        return this._tunnel;
    }

    public register(tunnel: Tunnel) {
        this._tunnel = tunnel;
    }

    public arrive(job: Job) {
        let ns = this;
        ns.e.log(1, `Job "${job.name}" arrived in Nest "${ns.name}".`, ns);
        job.tunnel = ns.tunnel;
        job.nest = ns;
        ns.tunnel.arrive(job, ns);
    }
}