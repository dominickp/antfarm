import { Tunnel } from "../tunnel/tunnel";
import { Nest } from "../nest/nest";
import {Environment} from "../environment/environment";
import {LifeEvent} from "../environment/lifeEvent";
import {EmailOptions} from "../environment/emailOptions";
import {JobProperty} from "./jobProperty";

// Handle the circular dependency by stashing the type in a variable for requiring later.
// import * as PackedJobTypes from "./packedJob";
// let PackedJob: typeof PackedJobTypes.PackedJob;

const   shortid = require("shortid"),
        _ = require("lodash");

export abstract class Job {

    protected name: string;
    protected tunnel: Tunnel;
    protected nest: Nest;
    protected e: Environment;
    protected locallyAvailable: boolean;
    protected lifeCycle: LifeEvent[];
    protected id: string;
    protected properties;

    /**
     * Job constructor
     * @param e
     * @param name
     */
    constructor(e: Environment, name: string) {
        let j = this;
        j.e = e;
        j.id = shortid.generate();
        j.name = name;
        j.lifeCycle = [];
        j.properties = {};

        j.createLifeEvent("created", null, name);
        j.e.log(1, `New Job "${name}" created.`, j);
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
        if (!j.getTunnel()) {
            j.e.log(3, `Job "${j.getName()}" failed before tunnel was set.`, j);
        }
        if (!j.getNest()) {
            j.e.log(3, `Job "${j.getName()}" does not have a nest.`, j);
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
     *          template: "./template_files/my_email.pug"
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
    public email(emailOptions: EmailOptions) {
        let job = this;
        let emailer = job.e.getEmailer();

        emailer.sendMail(emailOptions, job);
    }

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
    public setPropertyValue(key: string, value: any) {
        let job = this;
        let prop = new JobProperty(key, value);

        job.properties[key] = prop;
        job.e.log(1, `Property "${key}" added to job properties.`, job);
    }


    /**
     * Get the entire job property object.
     * @param key
     * @returns {JobProperty}
     */
    public getProperty(key: string) {
        return this.properties[key] as JobProperty;
    }

    /**
     * Get the value of a property if it has been previously set.
     * @param key
     * @returns {any}
     */
    public getPropertyValue(key: string) {
        let job = this;
        if (job.properties[key]) {
            return job.properties[key].value;
        } else {
            return null;
        }
    }

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
    public getPropertyType(key: string) {
        let job = this;
        if (job.properties[key]) {
            return job.properties[key].getType();
        } else {
            return null;
        }
    }

    /**
     * Packs the job instance and file together in a zip.
     * Returns a PackJob in the parameter of the callback.
     * @param callback
     * #### Example
     * ```js
     * job.getPack(function(packJob){
     *      packJob.move(packed_folder_nest);
     * });
     * ```
     */
    public getPack(callback) {
        let job = this;
        let PackedJob = require("./packedJob").PackedJob;
        let pj = new PackedJob(job.e, job);
        pj.pack(() => {
            callback(pj);
        });
    }

    /**
     * Get the job object as JSON with circular references removed.
     * @returns {string}
     */
    public getJSON() {
        let job = this;
        let json;
        let replacer = function(key, value) {
            // Filtering out properties
            if (key === "nest" || key === "e" || key === "tunnel") {
                return undefined;
            }
            return value;
        };

        try {
            json = JSON.stringify(job, replacer);
        } catch (err) {
            job.e.log(3, `getJSON stringify error: ${err}`, job);
        }

        return json;
    }

    public getPath() {
        return undefined;
    }

    public isFile() {
        return undefined;
    }

    public isFolder() {
        return undefined;
    }

    public getFiles() {
        return undefined;
    }

    public getFile(index: any) {
        return undefined;
    }

}