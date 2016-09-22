import {FileJob} from "./fileJob";
import {Environment} from "./../environment/environment";

const   tmp = require("tmp"),
        fs = require("fs");

export class FtpFileJob extends FileJob {

    protected downloaded: boolean;

    constructor(e: Environment, basename) {
        // Create temp file
        let tmpobj = tmp.fileSync();
        super(e, tmpobj.name);
        this.basename = basename;
        this.downloaded = false;
    }

    getDownloaded() {
        return this.downloaded;
    }
    setDownloaded(downloaded: boolean) {
        this.downloaded = downloaded;
    }
}