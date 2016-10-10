import tunnel = require("./tunnel/tunnel");
import folderNest = require("./nest/folderNest");
import { FtpNest } from "./nest/ftpNest";
import { Environment } from "./environment/environment";
import { WebhookNest } from "./nest/webhookNest";
import { AutoFolderNest } from "./nest/autoFolderNest";
import { AntfarmOptions } from "./environment/options";
import { S3Nest } from "./nest/s3Nest";
/**
 * Expose `Antfarm`.
 */
export declare class Antfarm {
    protected e: Environment;
    /**
     * Antfarm constructor
     * @param options   Antfarm options
     */
    constructor(options?: AntfarmOptions);
    version(): string;
    /**
     * Factory method which returns a Tunnel.
     * @param name
     * @returns {Tunnel}
     */
    createTunnel(name: any): tunnel.Tunnel;
    /**
     * Factory method which returns a FolderNest.
     * @param path          Path of the folder.
     * @param allowCreate   Optional boolean flag to allow creation of folder if it does not exist.
     * @returns {FolderNest}
     */
    createFolderNest(path?: string, allowCreate?: boolean): folderNest.FolderNest;
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
    createAutoFolderNest(hierarchy: string | string[]): AutoFolderNest;
    /**
     * Factory method which returns an FtpNest.
     * @param host          Hostname or IP address of the FTP server.
     * @param port          Port number of the FTP server.
     * @param username      FTP account username.
     * @param password      FTP account password.
     * @param checkEvery    Frequency of re-checking FTP in minutes.
     * @returns {FtpNest}
     */
    createFtpNest(host: string, port?: number, username?: string, password?: string, checkEvery?: number): FtpNest;
    /**
     * Factory method to create and return an S3 nest.
     * @param bucket
     * @param keyPrefix
     * @param checkEvery
     * @param allowCreation
     * @returns {S3Nest}
     */
    createS3Nest(bucket: string, keyPrefix?: string, checkEvery?: number, allowCreation?: boolean): S3Nest;
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
    createWebhookNest(path: string | string[], httpMethod?: string, handleRequest?: any): WebhookNest;
    /**
     * Load an entire directory of workflow modules.
     * @param directory     Path to the workflow modules.
     */
    loadDir(directory: string): void;
}
