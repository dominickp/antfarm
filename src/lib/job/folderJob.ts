import {Environment} from "../environment/environment";
import {Job} from "./job";
import {File} from "./file";

const   node_path = require("path"),
        fs = require("fs");

export class FolderJob extends Job {
    protected path: string;
    protected dirname: string;
    protected basename: string;

    protected files: File[];

    constructor(e: Environment, path: string) {
        super(e, path);

        this.path = path;

        this.files = [];

        this.basename = node_path.basename(this.path);
        this.dirname = node_path.dirname(this.path);

        // verify path leads to a valid, readable file, handle error if not
    }

    /**
     * Creates file objects for folder contents. Async operation returns a callback on completion.
     * @param callback
     */
    public createFiles(callback: any) {
        let fl = this;
        let folder_path = this.getPath();
        fs.readdir(folder_path, function(err, items) {
            items = items.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

            items.forEach(function(filename){
                let filepath = folder_path + node_path.sep + filename;
                let file = new File(fl.e, filepath);
                fl.addFile(file);
            });

            callback();
        });
    }

    getPath() {
        return this.path;
    }

    addFile(file: File) {
        this.files.push(file);
        this.e.log(0, `Adding file "${file.getName()}" to job.`, this);
    }

    getFile(index: number) {
        return this.files[index];
    }

    getFiles() {
        return this.files;
    }

    /**
     * Get the number of files in this folder.
     * @returns {number}
     */
    count() {
        return this.files.length;
    }

    getExtension() {
        return null;
    }

    isFolder() {
        return true;
    }

    isFile() {
        return false;
    }

}