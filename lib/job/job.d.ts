import { Tunnel } from "../tunnel/tunnel";
import { Nest } from "../nest/nest";
import { Environment } from "../environment/environment";
import { LifeEvent } from "../environment/lifeEvent";
import { EmailOptions } from "../environment/emailOptions";
import { JobProperty } from "./jobProperty";
import { PackedJob } from "./packedJob";
export declare abstract class Job {
    protected _name: string;
    protected _tunnel: Tunnel;
    protected _nest: Nest;
    protected e: Environment;
    protected _locallyAvailable: boolean;
    protected _lifeCycle: LifeEvent[];
    protected _id: string;
    protected _properties: any;
    protected _type: string;
    /**
     * Job constructor
     * @param e
     * @param name
     */
    constructor(e: Environment, name: string);
    readonly type: string;
    /**
     * Class _name for logging.
     * @returns {string}
     */
    toString(): string;
    /**
     * Check if job is locally available.
     * @returns {boolean}
     */
    readonly isLocallyAvailable: boolean;
    /**
     * Set if the job is locally available.
     * @param available
     */
    locallyAvailable: boolean;
    /**
     * Get the life cycle object.
     * @returns {LifeEvent[]}
     */
    lifeCycle: LifeEvent[];
    /**
     * Create a new life event.
     * @param verb
     * @param start
     * @param finish
     */
    protected createLifeEvent(verb: string, start: string, finish: string): void;
    /**
     * Get the _name.
     * @returns {string}
     */
    /**
     * Set a new _name.
     * @param name
     */
    name: string;
    /**
     * Get the ID.
     * @returns {string}
     */
    readonly id: string;
    /**
     * Get the _name proper.
     * @returns {string}
     */
    readonly nameProper: string;
    /**
     * Get the nest.
     * @returns {Nest}
     */
    /**
     * Set the nest.
     * @param nest
     */
    nest: Nest;
    /**
     * Get the tunnel.
     * @returns {Tunnel}
     */
    /**
     * Set the tunnel.
     * @param tunnel
     */
    tunnel: Tunnel;
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
    /**
     * Move function error.
     */
    move(destinationNest: any, callback: any): void;
    /**
     * Sends an email.
     * @param emailOptions      Email options
     * #### Sending pug template email example
     * ```js
     * // my_tunnel.js
     * tunnel.run(function (job, nest) {
     *      job.email({
     *          subject: "Test email from pug template",
     *          to: "john.smith@example.com",
     *          template: __dirname + "./template_files/my_email.pug"
     *      });
     * });
     * ```
     *
     * ```js
     * // template_files/my_email.pug
     * h1="Example email!"
     * p="Got job ID " + job.getId()
     * ```
     * #### Sending plain-text email
     * ```js
     * tunnel.run(function (job, nest) {
     *      job.email({
     *          subject: "Test email with hard-coded plain-text",
     *          to: "john.smith@example.com",
     *          text: "My email body!"
     *      });
     * });
     * ```
     * #### Sending html email
     * ```js
     * tunnel.run(function (job, nest) {
     *      job.email({
     *          subject: "Test email with hard-coded html",
     *          to: "john.smith@example.com",
     *          html: "<h1>My email body!</h1>"
     *      });
     * });
     * ```
     */
    email(emailOptions: EmailOptions): void;
    /**
     * Attach job specific data to the job instance.
     * #### Example
     *
     * ```js
     * job.setPropertyValue("My Job Number", 123456);
     *
     * console.log(job.getPropertyValue("My Job Number"));
     * // 123456
     * ```
     *
     * @param key
     * @param value
     */
    setPropertyValue(key: string, value: any): void;
    propertyValues: Object;
    /**
     * Get the entire job property object.
     * @param key
     * @returns {JobProperty}
     */
    getProperty(key: string): JobProperty;
    readonly properties: any;
    /**
     * Get the value of a property if it has been previously set.
     * @param key
     * @returns {any}
     */
    getPropertyValue(key: string): any;
    /**
     * Get the type of a property.
     * #### Example
     *
     * ```js
     * job.setPropertyValue("My Job Number", 123456);
     *
     * console.log(job.getPropertyType("My Job Number"));
     * // "number"
     * ```
     *
     * @param key
     * @returns {string}
     */
    getPropertyType(key: string): any;
    /**
     * Packs the job instance and file together in a zip.
     * Returns a PackJob in the parameter of the callback.
     * @param callback
     * #### Example
     * ```js
     * job.pack(function(packJob){
     *      packJob.move(packed_folder_nest);
     * });
     * ```
     */
    pack(callback: (job: PackedJob) => void): void;
    /**
     * Unpacks a packed job. Returns a the original unpacked job in the parameter of the callback.
     * @param callback
     * #### Example
     * ```js
     * packedJob.unpack(function(unpackedJob){
     *     console.log("Unpacked", unpackedJob.name);
     *     unpackedJob.move(unpacked_folder);
     *     packedJob.remove();
     * });
     * ```
     */
    unpack(callback: (job: Job) => void): void;
    /**
     * Get the job object as JSON with circular references removed.
     * @returns {string}
     */
    getJSON(): any;
    path: string;
    isFile(): any;
    isFolder(): any;
    readonly files: any;
    getFile(index: any): any;
    rename(name: string): any;
    /**
     * Add a message to the log with this job as the actor.
     * @param level             0 = debug, 1 = info, 2, = warning, 3 = error
     * @param message           Log message
     * @returns {undefined}
     */
    log(level: number, message: string): void;
    readonly size: any;
    readonly sizeBytes: any;
}
