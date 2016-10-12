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

    /**
     * Job constructor
     * @param e
     * @param name
     */
    constructor(e: Environment, name: string) {
        this.e = e;
        this.id = shortid.generate();
        this.name = name;
        this.lifeCycle = [];

        this.createLifeEvent("created", null, name);
        this.e.log(1, `New Job "${name}" created.`, this);
    }

    /**
     * Class name for logging.
     * @returns {string}
     */
    public toString() {
        return "Job";
    }

    /**
     * Check if job is locally available.
     * @returns {boolean}
     */
    public isLocallyAvailable() {
        return this.locallyAvailable;
    }

    /**
     * Set if the job is locally available.
     * @param available
     */
    public setLocallyAvailable(available: boolean) {
        this.locallyAvailable = available;
    }

    /**
     * Get the life cycle object.
     * @returns {LifeEvent[]}
     */
    public getLifeCycle() {
        return this.lifeCycle;
    }

    /**
     * Create a new life event.
     * @param verb
     * @param start
     * @param finish
     */
    protected createLifeEvent(verb: string, start: string, finish: string) {
        this.lifeCycle.push(new LifeEvent(verb, start, finish));
    }

    /**
     * Set a new name.
     * @param name
     */
    public setName(name: string) {
        this.name = name;
    }

    /**
     * Get the name.
     * @returns {string}
     */
    public getName() {
        return this.name;
    }

    /**
     * Get the ID.
     * @returns {string}
     */
    public getId() {
        return this.id;
    }

    /**
     * Get the name proper.
     * @returns {string}
     */
    public getNameProper() {
        return this.getName();
    }

    /**
     * Set the nest.
     * @param nest
     */
    public setNest(nest: Nest) {
        this.nest = nest;
    }

    /**
     * Get the nest.
     * @returns {Nest}
     */
    public getNest() {
        return this.nest;
    }

    /**
     * Set the tunnel.
     * @param tunnel
     */
    public setTunnel(tunnel: Tunnel) {
        this.tunnel = tunnel;
    }

    /**
     * Get the tunnel.
     * @returns {Tunnel}
     */
    public getTunnel() {
        return this.tunnel;
    }

    /**
     * Function to call to fail a job while in a tunnel.
     * @param reason
     */
    public fail(reason: string) {
        let j = this;
        if (!j.tunnel) {
            j.e.log(3, `Job "${j.getName()}" failed before tunnel was set.`, j);
        }
        j.tunnel.executeFail(j, j.getNest(), reason);
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


    /**
     * Move function error.
     */
    public move(destinationNest, callback) {
        throw "This type of job cannot be moved.";
    }

}