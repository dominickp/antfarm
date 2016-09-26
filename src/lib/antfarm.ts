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


/**
 * Expose `Antfarm`.
 */

class Antfarm {

    protected e: Environment;

    constructor(options: Options) {
        this.e = new Environment(options);
    }

    version() {
        return "0.0.1";
    }
    createTunnel(name) {
        return new Tunnel(this.e, name);
    }
    createFolderNest(name: string) {
        return new FolderNest(this.e, name);
    }
    createFtpNest(host: string, port: number, username: string, password: string, checkEvery: number) {
        return new FtpNest(this.e, host, port, username, password, checkEvery);
    }

    /**
     * Load an entire directory of workflow modules.
     * @param directory
     */

    loadDir(directory: string) {
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