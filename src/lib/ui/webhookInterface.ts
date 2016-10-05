import {Environment} from "../environment/environment";
import {WebhookNest} from "../nest/webhookNest";
import {FolderNest} from "../nest/folderNest";

export class WebhookInterface {

    protected fields = [];

    protected e: Environment;

    protected nest: WebhookNest;

    protected checkpointNest: FolderNest;

    protected handleRequest: any;

    protected steps = [];

    /**
     * Constructor
     * @param {Environment} e
     * @param {WebhookNest} nest
     * @param handleRequest
     */
    constructor(e: Environment, nest: WebhookNest, handleRequest?: any) {
        this.e = e;
        this.nest = nest;
        this.handleRequest = handleRequest;
    }

    /**
     * Get the custom handleRequest function.
     * @returns {any}
     */
    public getCustomHandleRequest() {
        return this.handleRequest;
    }

    /**
     * Get the nest
     * @returns {WebhookNest}
     */
    public getNest() {
        return this.nest;
    }

    /**
     * Adds an interface field to the interface.
     * @param {FieldOptions} field
     */
    public addField(field: FieldOptions) {
        this.fields.push(field);
    }

    /**
     * Returns the interface for transport.
     * @returns {{fields: Array}}
     */
    public getInterface() {

        let jobs = this.getJobs();
        let jobsArray = [];

        jobs.forEach(function(job){
            jobsArray.push({
                id: job.getId(),
                name: job.getName(),
                path: job.getPath()
            });
        });

        // console.log(jobs as JobsInterface[]);

        return {
            fields: this.fields,
            jobs: jobsArray,
            steps: this.getSteps()
        };
    }

    /**
     * Get the nest path.
     * @returns {string}
     */
    public getPath() {
        return this.nest.getPath();
    }

    /**
     * Adds pending jobs to the interfaces job list.
     * @param nest
     */
    public checkNest(nest: FolderNest) {
        this.checkpointNest = nest;
    }

    public getJobs() {
        if (this.checkpointNest) {
            return this.checkpointNest.getUnwatchedJobs();
        } else {
            return [];
        }
    }


    /**
     * Adds a user interface step
     * @param name      Name of the step
     * @param callback
     */
    public addStep(name: string, callback: any) {
        this.steps.push({
            name: name,
            callback: callback
        });
    }

    /**
     * Get steps
     * @returns {Array}
     */
    public getSteps() {
        return this.steps;
    }
}