import { Tunnel } from "../tunnel/tunnel";
import { Nest } from "../nest/nest";
import { Environment } from "../environment/environment";
import { LifeEvent } from "../environment/lifeEvent";
export declare abstract class Job {
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
    constructor(e: Environment, name: string);
    /**
     * Class name for logging.
     * @returns {string}
     */
    toString(): string;
    /**
     * Check if job is locally available.
     * @returns {boolean}
     */
    isLocallyAvailable(): boolean;
    /**
     * Set if the job is locally available.
     * @param available
     */
    setLocallyAvailable(available: boolean): void;
    /**
     * Get the life cycle object.
     * @returns {LifeEvent[]}
     */
    getLifeCycle(): LifeEvent[];
    /**
     * Create a new life event.
     * @param verb
     * @param start
     * @param finish
     */
    protected createLifeEvent(verb: string, start: string, finish: string): void;
    /**
     * Set a new name.
     * @param name
     */
    setName(name: string): void;
    /**
     * Get the name.
     * @returns {string}
     */
    getName(): string;
    /**
     * Get the ID.
     * @returns {string}
     */
    getId(): string;
    /**
     * Get the name proper.
     * @returns {string}
     */
    getNameProper(): string;
    /**
     * Set the nest.
     * @param nest
     */
    setNest(nest: Nest): void;
    /**
     * Get the nest.
     * @returns {Nest}
     */
    getNest(): Nest;
    /**
     * Set the tunnel.
     * @param tunnel
     */
    setTunnel(tunnel: Tunnel): void;
    /**
     * Get the tunnel.
     * @returns {Tunnel}
     */
    getTunnel(): Tunnel;
    /**
     * Function to call to fail a job while in a tunnel.
     * @param reason
     */
    fail(reason: string): void;
    /**
     * Transfer a job to another tunnel directly.
     * @param tunnel
     */
    transfer(tunnel: Tunnel): void;
}
