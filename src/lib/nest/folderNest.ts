import {Environment} from "../environment/environment";
import { Nest } from "./nest";
import { FileJob } from "./../job/fileJob";
import { FolderJob } from "./../job/folderJob";

const   node_watch = require("node-watch"),
        fs = require("fs"),
        path_mod = require("path");

export class FolderNest extends Nest {

    protected path: string;
    protected allowCreate: boolean;

    constructor(e: Environment, path: string, allowCreate: boolean) {

        let nest_name = path_mod.basename(path);

        super(e, nest_name);

        this.allowCreate = allowCreate;

        this.checkDirectorySync(path);

        this.path = path;
    }

    protected checkDirectorySync(directory) {
        let fn = this;
        try {
            fs.statSync(directory);
        } catch (e) {
            if (fn.allowCreate) {
                fs.mkdirSync(directory);
                fn.e.log(1, `Directory "${directory}" was created since it did not already exist.`, this);
            } else {
                fn.e.log(3, `Directory "${directory}" did not exist and was created.`, this);
            }
        }
    }

    protected createJob(path: string) {

        let fl = this;
        let job;
        // Verify file still exists, node-watch fires on any change, even delete
        try {
            fs.accessSync(path, fs.F_OK);

            // Check job is folder
            let path_stats = fs.lstatSync(path);

            if (path_stats.isDirectory()) {
                job = new FolderJob(fl.e, path);
                job.createFiles(function(){
                    // Trigger arrived
                    fl.arrive(job);
                });
            } else if (path_stats.isFile()) {
                job = new FileJob(fl.e, path);
                // Trigger arrived
                fl.arrive(job);
            } else {
                throw "Path is not a file or folder!";
            }
        } catch (e) {
            // It isn't accessible
            fl.e.log(0, "Job creation ignored because file did not exist.", fl);
        }

        return job;
    }

    public load() {

        let fl = this;
        fs.readdir(fl.path, function(err, items) {
            items = items.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

            items.forEach(function(filename){

                let filepath = fl.path + path_mod.sep + filename;

                fl.createJob(filepath); // Arrives as well
            });
        });
    }

    public watch() {

        let fl = this;

        let watch_options = {
            recursive: false
        };

        node_watch(fl.path, watch_options, function (filepath) {

            // Verify file still exists, node-watch fires on any change, even delete
            let job = fl.createJob(filepath); // Arrives as well
        });
    }

    public arrive(job: FileJob) {
        super.arrive(job);
    }

    public take(job: FileJob, callback: any) {

        // the other nest that this is taking from should provide a temporary location or local path of the job

        let new_path = `${this.path}/${job.getBasename()}`;

        fs.renameSync(job.getPath(), new_path);
        job.setPath(new_path);

        callback(new_path);
    }
}