import {Environment} from "../environment/environment";
import {FileJob} from "./fileJob";
import {Job} from "./job";
import {FolderJob} from "./folderJob";
import {JobProperty} from "./jobProperty";

const   tmp = require("tmp"),
        fs = require("fs"),
        path = require("path"),
        JSZip = require("jszip"),
        _ = require("lodash"),
        Reflect = require("reflect-metadata");

export class PackedJob extends FileJob {

    protected e: Environment;
    protected job: Job;

    constructor(e: Environment, job: Job) {
        // let job_name = job.name;
        super(e, job.name);
        let pj = this;
        pj.e = e;
        pj.job = job;
    }

    /**
     *
     * @returns {Job}
     */
    public getJob() {
        return this.job;
    }

    /**
     * Makes job ticket and returns the _path to the temporary file.
     * @param job
     * @returns {string}
     */
    protected getJobTicket(job: Job) {
        let pj = this;
        // Make job ticket
        let json = job.getJSON();
        let tmpobj = tmp.dirSync();
        let dir = tmpobj.name;
        let file_name = dir + path.sep + "ticket.json";

        try {
            fs.writeFileSync(file_name, json, "utf8");
        } catch (err) {
            pj.e.log(3, `Error writing job ticket to temporary file`, pj);
        }
        return file_name;
    }

    protected buildZip(zip: any, callback) {
        // Save out zip
        let pj = this;
        let job = this.getJob();
        let tmpobj = tmp.dirSync();
        let dir = tmpobj.name;
        let file_name = job.name + ".antpack.zip";
        let file_path = dir + path.sep + file_name;
        zip
            .generateNodeStream({type: "nodebuffer", streamFiles: true})
            .pipe(fs.createWriteStream(file_path))
            .on("finish", function () {
                // JSZip generates a readable stream with a "end" event,
                // but is piped here in a writable stream which emits a "_finish" event.
                pj.path = file_path;
                pj.name = file_name;
                callback();
            });
    }

    /**
     * Packs the related job on construction.
     */
    public execPack(done) {
        let pj = this;
        let job = pj.getJob();

        let ticketPath = pj.getJobTicket(job);

        let zip = new JSZip();

        // Add ticket to zip
        fs.readFile(ticketPath, function(err, data) {
            if (err) throw err;
            zip.file("_ticket/ticket.json", data);

            if (job.isFile()) {

                fs.readFile(job.path, (err, data) => {
                    if (err) throw err;
                    zip.file("_asset/" + job.name, data);
                    pj.buildZip(zip, () => {
                        done();
                    });
                });
            } else if (job.isFolder()) {
                job.files.forEach(file => {
                    fs.readFile(file.path, function(err, data) {
                        if (err) throw err;
                        zip.file("_asset" + path.sep + job.nameProper + path.sep + file.name, data);
                        pj.buildZip(zip, () => {
                            done();
                        });
                    });
                });
            } else {
                pj.buildZip(zip, () => {
                    done();
                });
            }

        });

    }

    protected restoreJobTicket(jsonTicket) {
        let pj = this;
        let jobObject, job;
        try {
            jobObject = JSON.parse(jsonTicket);

            if (jobObject._type === "file") {
                job = new FileJob(pj.e, jobObject._id);
            } else if (jobObject._type === "folder") {
                job = new FolderJob(pj.e, jobObject._id);
            } else {
                pj.e.log(3, `Cannot unpack this type of job: ${jobObject._type}`, pj);
            }
        } catch (err) {
            pj.e.log(3, `Unpack ticket parse error: ${err}.`, pj);
            pj.e.log(3, `Unparsable ticket: ${jsonTicket}.`, pj);
        }

        // Restore property values
        let props = {};

        _.each(jobObject._properties, prop => {
            props[prop._key] = new JobProperty(prop._key, prop._value);
        });
        job.propertyValues = props;

        // Restore lifecycle
        job.lifeCycle = jobObject._lifeCycle;

        return job;
    }

    public execUnpack(done) {
        // console.log("unpacking");

        let pj = this;
        let job = pj.getJob();

        // Read the zip to a buffer
        fs.readFile(job.path, (err, data) => {
            if (err) {
                pj.e.log(3, `Unpacking readFile error: ${err}`, pj);
            }
            // Open the zip in JSZip
            JSZip.loadAsync(data).then((zip) => {
                // Restore job ticket and create job
                zip.folder("_ticket").forEach((relativePath, file) => {
                    zip.file(`_ticket${path.sep}${relativePath}`).async("string")
                    .then((content) => {

                        // Restore old job ticket
                        job = pj.restoreJobTicket(content);

                        // Restore _files
                        pj.restoreFiles(job, zip, (unpackedJob) => {
                            done(unpackedJob);
                        });

                    });
                });
            });
        });
    }

    protected restoreFiles(job: Job, zip: any, callback) {

        let pj = this;


        // Check for valid pack format
        if (zip.folder("_asset").length > 1) {
            pj.e.log(2, `Restored job did not contain any file assets.`, pj, [job]);
        }

        if (job.isFolder()) {
            pj.extractFiles(zip, false, "_asset/", (folderPath, folderName) => {
                job.path = folderPath;
                job.rename(folderName);
                callback(job);
            });
        } else if (job.isFile()) {
            pj.extractFiles(zip, true, "_asset/", (filePath, fileName) => {
                job.path = filePath;
                job.rename(fileName);
                callback(job);
            });
        }
    }

    protected extractFiles(zip: any, single: boolean, zipPath: string, callback: any, totalFiles?: number) {
        let pj = this;

        let tmpobj = tmp.dirSync();
        let tempPath = tmpobj.name;

        let fileNumber = 1;

        if (!totalFiles) {
            totalFiles = 0;
            zip.folder(zipPath).forEach((asset) => totalFiles++ );
        }

        if (single === true) {

            zip.folder(zipPath).forEach((relativePath, asset) => {

                if (fileNumber > 1) {
                    pj.e.log(3, `More than 1 files found when extracting a file job.`, pj);
                } else {

                    let newRelPath = zipPath + relativePath;

                    if (asset.dir === "true") {
                        totalFiles--;
                        pj.extractFiles(zip, single, newRelPath, callback, totalFiles);
                    } else {
                        zip.file(newRelPath).async("nodebuffer")
                        .then((content) => {
                            fileNumber++;
                            let filePath = tempPath + path.sep + relativePath;
                            fs.writeFileSync(filePath, content);
                            callback(filePath, relativePath);
                        });
                    }
                }
            });

        } else {
            zip.folder(zipPath).forEach((relativePath, asset) => {
                let newRelPath = zipPath + relativePath;

                if (asset.dir === true) {
                    totalFiles--;

                    pj.extractFiles(zip, single, newRelPath, callback, totalFiles);
                } else {

                    zip.file(newRelPath).async("nodebuffer")
                    .then((content) => {

                        let filePath = tempPath + path.sep + relativePath;
                        fs.writeFileSync(filePath, content);

                        if (totalFiles === fileNumber) {
                            let rootFolderName = newRelPath.split(path.sep)[1];
                            callback(tempPath, rootFolderName);
                        }
                        fileNumber++;

                    });
                }

            });
        }

    }

}