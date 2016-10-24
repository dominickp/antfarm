import {Environment} from "../environment/environment";
import {FileJob} from "./fileJob";
import {Job} from "./job";
import {FolderJob} from "./folderJob";

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
        // let job_name = job.getName();
        super(e, job.getName());
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
     * Makes job ticket and returns the path to the temporary file.
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
        let file_name = job.getName() + ".antpack.zip";
        let file_path = dir + path.sep + file_name;
        zip
            .generateNodeStream({type: "nodebuffer", streamFiles: true})
            .pipe(fs.createWriteStream(file_path))
            .on("finish", function () {
                // JSZip generates a readable stream with a "end" event,
                // but is piped here in a writable stream which emits a "finish" event.
                pj.setPath(file_path);
                pj.setName(file_name);
                callback();
            });
    }

    /**
     * Packs the related job on construction.
     */
    public pack(done) {
        let pj = this;
        let job = pj.getJob();

        let ticketPath = pj.getJobTicket(job);

        let zip = new JSZip();

        // Add ticket to zip
        fs.readFile(ticketPath, function(err, data) {
            if (err) throw err;
            zip.file("_ticket/ticket.json", data);

            if (job.isFile()) {

                fs.readFile(job.getPath(), (err, data) => {
                    if (err) throw err;
                    zip.file("_asset/" + job.getName(), data);
                    pj.buildZip(zip, () => {
                        done();
                    });
                });
            } else if (job.isFolder()) {
                job.getFiles().forEach(file => {
                    fs.readFile(file.getPath(), function(err, data) {
                        if (err) throw err;
                        zip.file("_asset" + path.sep + job.getNameProper() + path.sep + file.getName(), data);
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
            console.log("job type =>", jobObject.type, typeof jobObject);

            if (jobObject.type === "file") {
                job = new FileJob(pj.e, jobObject.basename);
            } else if (jobObject.type === "folder") {
                job = new FolderJob(pj.e, jobObject.basename);
            } else {
                pj.e.log(3, `Cannot unpack this type of job: ${jobObject.type}`, pj);
            }
        } catch (err) {
            pj.e.log(3, `Unpack ticket parse error: ${err}.`, pj);
        }

        // Restore property values
        job.setPropertyValues(jobObject.properties);

        // Restore lifecycle
        job.setLifeCycle(jobObject.lifeCycle);

        return job;
    }

    public unpack(done) {
        // console.log("unpacking");

        let pj = this;
        let job = pj.getJob();

        // Read the zip to a buffer
        fs.readFile(job.getPath(), (err, data) => {
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

                        // Restore files
                        pj.restoreFiles(job, zip, (job) => {
                            done(job);
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
            console.log("running folder");
            pj.extractFiles(zip, false, "_asset/", (folderPath, folderName) => {
                console.log("got callback", folderName, folderPath)
                job.setPath(folderPath);
                job.rename(folderName);
                console.log("DONE RESTORING");
                callback(job);
            });
        } else if (job.isFile()) {
            pj.extractFiles(zip, true, "_asset/", (filePath, fileName) => {
                job.setPath(filePath);
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
            console.log("totalFiles" + totalFiles);
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
                        console.log("EXTRACTING SINGLE");
                        zip.file(newRelPath).async("nodebuffer")
                        .then((content) => {
                            fileNumber++;
                            let filePath = tempPath + path.sep + relativePath;
                            console.log("*** filepath", filePath);
                            fs.writeFileSync(filePath, content);
                            callback(filePath, relativePath);
                        });
                    }
                }
            });

        } else {
            console.log("Extracting folder");

            zip.folder(zipPath).forEach((relativePath, asset) => {
                let newRelPath = zipPath + relativePath;

                console.log("file newRelPath", newRelPath);


                if (asset.dir === true) {
                    totalFiles--;

                    console.log("dir found", totalFiles);

                    pj.extractFiles(zip, single, newRelPath, callback, totalFiles);
                } else {

                    zip.file(newRelPath).async("nodebuffer")
                    .then((content) => {

                        console.log(newRelPath, relativePath, typeof asset.dir);


                        let filePath = tempPath + path.sep + relativePath;
                        fs.writeFileSync(filePath, content);

                        console.log("Wrote out", filePath, totalFiles, fileNumber);

                        if (totalFiles === fileNumber) {
                            let rootFolderName = newRelPath.split(path.sep)[1];
                            console.log("Calling back, done unzipping", rootFolderName);
                            console.log(tempPath, rootFolderName);
                            callback(tempPath, rootFolderName);
                        }
                        fileNumber++;

                    });
                }

            });
        }

    }

}