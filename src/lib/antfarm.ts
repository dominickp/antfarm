import tunnel = require('./tunnel/tunnel');
import nest = require('./nest/nest');
import folder = require('./nest/folder');
import job = require('./job/job');

import {Tunnel} from "./tunnel/tunnel";
import {Nest} from "./nest/nest";
import {Folder} from "./nest/folder";
import {Job} from "./job/job";


/**
 * Expose `Antfarm`.
 */

module.exports = {

    version(){
        return "1.0";
    },
    createTunnel(name){
        return new Tunnel(name);
    },
    createFolder(name){
        return new Folder(name);
    }
};