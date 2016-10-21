import {Environment} from "../environment/environment";
import {FileJob} from "./fileJob";
import {Job} from "./job";

const   tmp = require("tmp"),
        fs = require("fs"),
        path = require("path"),
        JSZip = require("jszip");

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
                console.log("out.zip written.", file_path);

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
        console.log(ticketPath);


        let zip = new JSZip();

        // Add ticket to zip
        fs.readFile(ticketPath, function(err, data) {
            if (err) throw err;
            zip.file("_ticket/ticket.json", data);

            if (job.isFile()) {
                console.log("packing", job.getPath());
                fs.readFile(job.getPath(), function(err, data) {
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

}