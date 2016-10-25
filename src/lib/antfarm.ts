import tunnel = require("./tunnel/tunnel");
import nest = require("./nest/nest");
import folderNest = require("./nest/folderNest");
import job = require("./job/job");
import {Tunnel} from "./tunnel/tunnel";
import {FtpNest} from "./nest/ftpNest";
import {FolderNest} from "./nest/folderNest";
import {Environment} from "./environment/environment";
import {WebhookNest} from "./nest/webhookNest";
import {AutoFolderNest} from "./nest/autoFolderNest";
import {AntfarmOptions} from "./environment/options";
import {S3Nest} from "./nest/s3Nest";

/**
 * Expose `Antfarm`.
 */
export class Antfarm {

    protected e: Environment;

    /**
     * Antfarm constructor
     * @param options   Antfarm options
     */
    constructor(options?: AntfarmOptions) {
        this.e = new Environment(options);
        this.e.log(1, "Started antfarm", this);
    }

    public version() {
        return "0.0.1";
    }

    /**
     * Factory method which returns a Tunnel.
     * @param name
     * @returns {Tunnel}
     */
    public createTunnel(name) {
        return new Tunnel(this.e, name);
    }

    /**
     * Factory method which returns a FolderNest.
     * @param path          Path of the folder.
     * @param allowCreate   Optional boolean flag to allow creation of folder if it does not exist.
     * @returns {FolderNest}
     * #### Example
     * ```js
     * var out_folder = af.createFolderNest("/Users/dominick/Desktop/My Folder/");
     * ```
     */
    public createFolderNest(path?: string, allowCreate = false) {
        return new FolderNest(this.e, path, allowCreate);
    } 

    /**
     * Factory method which returns an AutoFolderNest. If the auto managed directory does not exist, it is created.
     * @param hierarchy     Path of the folder as a string or an array of strings as path segments.
     * @returns {AutoFolderNest}
     *
     * #### Example
     * ```js
     * af.createAutoFolderNest("outfolder")
     * // /Users/dominick/My Automanaged Directory/outfolder
     * ```
     * #### Example
     * ```js
     * af.createAutoFolderNest(["proofing", "others"])
     * // /Users/dominick/My Automanaged Directory/proofing/others
     * ```
     */
    public createAutoFolderNest(hierarchy: string|string[]) {
        return new AutoFolderNest(this.e, hierarchy);
    }

    /**
     * Factory method which returns an FtpNest.
     * @param host          Hostname or IP address of the FTP server.
     * @param port          Port number of the FTP server.
     * @param username      FTP account username.
     * @param password      FTP account password.
     * @param checkEvery    Frequency of re-checking FTP in minutes.
     * @returns {FtpNest}
     * #### Example
     * ```js
     * // Check FTP directory every 2 minutes
     * var my_ftp = af.createFtpNest("ftp.example.com", 21, "", "", 2);
     * ```
     */
    public createFtpNest(host: string, port = 21, username = "", password = "", checkEvery = 10) {
        return new FtpNest(this.e, host, port, username, password, checkEvery);
    }

    /**
     * Factory method to create and return an S3 nest.
     * @param bucket
     * @param keyPrefix
     * @param checkEvery
     * @param allowCreation
     * @returns {S3Nest}
     * ```js
     * var bucket = af.createS3Nest("my-bucket-name", "", 1, true);
     * ```
     */
    public createS3Nest(bucket: string, keyPrefix?: string, checkEvery: number = 5, allowCreation: boolean = false) {
        return new S3Nest(this.e, bucket, keyPrefix, checkEvery, allowCreation);
    }

    /**
     * Factory method which returns a WebhookNest.
     * @param path              The path which is generated in the webhook's route. You can supply a string or array of strings.
     * @param httpMethod        HTTP method for this webhook. Choose "all" for any HTTP method.
     * @param handleRequest     Optional callback function to handle the request, for sending a custom response.
     * @returns {WebhookNest}
     *
     * #### Example
     * ```js
     * var webhook = af.createWebhookNest(["proof", "create"], "post");
     * ```
     *
     * #### Example returning custom response
     * ```js
     * var webhook = af.createWebhookNest(["proof", "create"], "post", function(req, res, job, nest){
     *     res.setHeader("Content-Type", "application/json; charset=utf-8");
     *     res.end(JSON.stringify({
     *          job_name: job.getName(),
     *          job_id: job.getId(),
     *          message: "Proof created!"
     *     }));
     * });
     * ```
     */
    public createWebhookNest(path: string|string[], httpMethod = "all", handleRequest?: any) {
        return new WebhookNest(this.e, path, httpMethod, handleRequest);
    }

    /**
     * Load an entire directory of workflow modules.
     * @param directory     Path to the workflow modules.
     * #### Example
     * ```js
     * af.loadDir("./workflows");
     * ```
     */
    public loadDir(directory: string) {
        let af = this;
        let workflows = require("require-dir-all")(directory, {
            _parentsToSkip: 1,
            indexAsParent: true,
            throwNoDir: true
        });
        let loaded_counter = 0;

        for (let workflow in workflows) {
            try {
                new workflows[workflow](af);
                loaded_counter++;
            } catch (e) {
                af.e.log(3, `Couldn't load workflow module "${workflow}". ${e}`, af);
            }
        }

        af.e.log(1, `Loaded ${loaded_counter} workflows.`, af);
    }

    /**
     * Log messages into the antfarm logger.
     * @param type {number}         The log level. 0 = debug, 1 = info, 2 = warning, 3 = error
     * @param message {string}       Log message.
     * @param actor  {any}           Instance which triggers the action being logged.
     * @param instances {any[]}      Array of of other involved instances.
     * #### Example
     * ```js
     * job.e.log(1, `Transferred to Tunnel "${tunnel.getName()}".`, job, [oldTunnel]);
     * ```
     */
    public log(type: number, message: string, actor?: any, instances = []) {
        let af = this;
        af.e.log(type, message, actor, instances);
    }
}

module.exports = Antfarm;