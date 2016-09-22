import {FileJob} from "./fileJob";
import {Environment} from "./../environment/environment";

const   tmp = require("tmp"),
        fs = require("fs");

export class FtpFileJob extends FileJob {

    constructor(e: Environment, basename) {
        // Create temp file
        let tmpobj = tmp.fileSync();
        super(e, tmpobj.name);
        this.setName(basename);
        this.isLocallyAvailable = false;
    }

}