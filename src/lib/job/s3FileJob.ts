import {FileJob} from "./fileJob";
import {File} from "./file";
import {Environment} from "./../environment/environment";

const   tmp = require("tmp");

export class S3FileJob extends FileJob {

    protected file: File;

    constructor(e: Environment, basename) {
        // Create temp file
        let tmpobj = tmp.fileSync();
        super(e, tmpobj.name);
        this.rename(basename);
        this.setLocallyAvailable(false);
    }

}