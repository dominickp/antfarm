import tunnel = require('./tunnel/tunnel');
import nest = require('./nest/nest');
import folder = require('./nest/folder');
// import Ftp = require('./nest/ftp');
import job = require('./job/job');

import {Tunnel} from "./tunnel/tunnel";
import {Nest} from "./nest/nest";
import {Ftp} from "./nest/ftp";
import {Folder} from "./nest/folder";
import {Job} from "./job/job";


/**
 * Expose `Antfarm`.
 */

interface Options {

    hello?: string;
}


class Antfarm {

    hello: string;

    constructor(options: Options) {
        //this.hello = options.hello;
    }

    version(){
        return "1.0";
    }
    createTunnel(name){
        return new Tunnel(name);
    }
    createFolderNest(name : string){
        return new Folder(name);
    }
    createFTPNest(host : string, port: number, username: string, password: string, checkEvery: number){
        return new Ftp(host, port, username, password, checkEvery);
    }
};

module.exports = Antfarm;