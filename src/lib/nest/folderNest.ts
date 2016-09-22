import {Environment} from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";

const   node_watch = require("node-watch"),
        fs = require("fs"),
        path_mod = require("path");

export class FolderNest extends Nest {
    path: string;

    constructor(e: Environment, path: string) {

        let nest_name = path_mod.basename(path);

        super(e, nest_name);

        this.path = path;
    }

    load() {

        let fl = this;
        fs.readdir(fl.path, function(err, items) {
            items = items.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

            items.forEach(function(filename){
                // Make a new Job and trigger arrived
                let job = new FileJob(fl.e, `${fl.path}/${filename}`);
                // job.setPath(fl.path + item);
                fl.arrive(job);
            });
        });
    }

    watch() {

        let fl = this;

        node_watch(fl.path, function (filepath) {

            // Verify file still exists, node-watch fires on any change, even delete
            try {
                fs.accessSync(filepath, fs.F_OK);
                // Make a new Job and trigger arrived
                let job = new FileJob(fl.e, filepath);
                fl.arrive(job);
            } catch (e) {
                // It isn't accessible
                fl.e.log(0, "Nest watch event was ignored because file did not exist.", fl);
            }

        });
    }

    arrive(job: FileJob) {
        super.arrive(job);
    }

    take(job: FileJob) {

        // the other nest that this is taking from should provide a temporary location or local path of the job

        let new_path = `${this.path}/${job.getBasename()}`;
        fs.renameSync(job.getPath(), new_path);
        return new_path;
    }
}