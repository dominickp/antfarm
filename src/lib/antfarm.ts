import tunnel = require("./tunnel/tunnel");
import nest = require("./nest/nest");
import folderNest = require("./nest/folderNest");
// import Ftp = require('./nest/ftp');
import job = require("./job/job");

import {Tunnel} from "./tunnel/tunnel";
import {Nest} from "./nest/nest";
import {FtpNest} from "./nest/ftpNest";
import {FolderNest} from "./nest/folderNest";
import {Job} from "./job/job";
import {Environment} from "./environment/environment";
import {WebhookNest} from "./nest/webhookNest";


/**
 * Expose `Antfarm`.
 */

class Antfarm {

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
     */
    public createFolderNest(path: string, allowCreate = false) {
        return new FolderNest(this.e, path, allowCreate);
    }

    /**
     * Factory method which returns an FtpNest.
     * @param host          Hostname or IP address of the FTP server.
     * @param port          Port number of the FTP server.
     * @param username      FTP account username.
     * @param password      FTP account password.
     * @param checkEvery    Frequency of re-checking FTP in minutes.
     * @returns {FtpNest}
     */
    public createFtpNest(host: string, port = 21, username = "", password = "", checkEvery = 10) {
        return new FtpNest(this.e, host, port, username, password, checkEvery);
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
}

module.exports = Antfarm;