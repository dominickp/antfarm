import tunnel = require('./tunnel/tunnel');
import nest = require('./nest/nest');
import folderNest = require('./nest/folderNest');
// import Ftp = require('./nest/ftp');
import job = require('./job/job');

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
        //this.hello = options.hello;
    }

    version(){
        return "0.0.1";
    }
    createTunnel(name){
        return new Tunnel(this.e, name);
    }
    createFolderNest(name : string){
        return new FolderNest(this.e, name);
    }
    createFtpNest(host : string, port: number, username: string, password: string, checkEvery: number){
        return new FtpNest(this.e, host, port, username, password, checkEvery);
    }
}

module.exports = Antfarm;