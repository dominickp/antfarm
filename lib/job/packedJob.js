"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fileJob_1 = require("./fileJob");
var tmp = require("tmp"), fs = require("fs"), path = require("path"), JSZip = require("jszip");
var PackedJob = (function (_super) {
    __extends(PackedJob, _super);
    function PackedJob(e, job, callback) {
        // let job_name = job.getName();
        _super.call(this, e, job.getName());
        var pj = this;
        pj.e = e;
        pj.job = job;
        console.log("PACKED JOB");
        pj.pack(function () {
            callback(pj);
        });
    }
    /**
     *
     * @returns {Job}
     */
    PackedJob.prototype.getJob = function () {
        return this.job;
    };
    /**
     * Makes job ticket and returns the path to the temporary file.
     * @param job
     * @returns {string}
     */
    PackedJob.prototype.getJobTicket = function (job) {
        var pj = this;
        // Make job ticket
        var json = job.getJSON();
        var tmpobj = tmp.dirSync();
        var dir = tmpobj.name;
        var file_name = dir + path.sep + "ticket.json";
        try {
            fs.writeFileSync(file_name, json, "utf8");
        }
        catch (err) {
            pj.e.log(3, "Error writing job ticket to temporary file", pj);
        }
        return file_name;
    };
    /**
     * Packs the related job on construction.
     */
    PackedJob.prototype.pack = function (callback) {
        var pj = this;
        var job = pj.getJob();
        var ticketPath = pj.getJobTicket(job);
        console.log(ticketPath);
        var zip = new JSZip();
        // Add ticket to zip
        fs.readFile(ticketPath, function (err, data) {
            if (err)
                throw err;
            zip.file("ticket.json", data);
            // Save out zip
            var tmpobj = tmp.dirSync();
            var dir = tmpobj.name;
            var file_name = job.getName() + ".ant.zip";
            var file_path = dir + path.sep + file_name;
            zip
                .generateNodeStream({ type: "nodebuffer", streamFiles: true })
                .pipe(fs.createWriteStream(file_path))
                .on("finish", function () {
                // JSZip generates a readable stream with a "end" event,
                // but is piped here in a writable stream which emits a "finish" event.
                console.log("out.zip written.", file_path);
                pj.setPath(file_path);
                pj.setName(file_name);
                callback();
            });
        });
        if (job.getPath()) {
            console.log("packing", job.getPath());
        }
    };
    return PackedJob;
}(fileJob_1.FileJob));
exports.PackedJob = PackedJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQztZQUMzQyxHQUFHO2lCQUNFLGtCQUFrQixDQUFDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFDLENBQUM7aUJBQzNELElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ3JDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ1Ysd0RBQXdEO2dCQUN4RCx1RUFBdUU7Z0JBQ3ZFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBRTNDLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3RCLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3RCLFFBQVEsRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7UUFFWCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDMUMsQ0FBQztJQUtMLENBQUM7SUFFTCxnQkFBQztBQUFELENBaEdBLEFBZ0dDLENBaEc4QixpQkFBTyxHQWdHckM7QUFoR1ksaUJBQVMsWUFnR3JCLENBQUEiLCJmaWxlIjoibGliL2pvYi9wYWNrZWRKb2IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7RmlsZUpvYn0gZnJvbSBcIi4vZmlsZUpvYlwiO1xuaW1wb3J0IHtKb2J9IGZyb20gXCIuL2pvYlwiO1xuXG5jb25zdCAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIiksXG4gICAgICAgIGZzID0gcmVxdWlyZShcImZzXCIpLFxuICAgICAgICBwYXRoID0gcmVxdWlyZShcInBhdGhcIiksXG4gICAgICAgIEpTWmlwID0gcmVxdWlyZShcImpzemlwXCIpO1xuXG5leHBvcnQgY2xhc3MgUGFja2VkSm9iIGV4dGVuZHMgRmlsZUpvYiB7XG5cbiAgICBwcm90ZWN0ZWQgZTogRW52aXJvbm1lbnQ7XG4gICAgcHJvdGVjdGVkIGpvYjogSm9iO1xuXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIGpvYjogSm9iLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBsZXQgam9iX25hbWUgPSBqb2IuZ2V0TmFtZSgpO1xuICAgICAgICBzdXBlcihlLCBqb2IuZ2V0TmFtZSgpKTtcbiAgICAgICAgbGV0IHBqID0gdGhpcztcbiAgICAgICAgcGouZSA9IGU7XG4gICAgICAgIHBqLmpvYiA9IGpvYjtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIlBBQ0tFRCBKT0JcIik7XG5cbiAgICAgICAgcGoucGFjaygoKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhwaik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHJldHVybnMge0pvYn1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Sm9iKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qb2I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFrZXMgam9iIHRpY2tldCBhbmQgcmV0dXJucyB0aGUgcGF0aCB0byB0aGUgdGVtcG9yYXJ5IGZpbGUuXG4gICAgICogQHBhcmFtIGpvYlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldEpvYlRpY2tldChqb2I6IEpvYikge1xuICAgICAgICBsZXQgcGogPSB0aGlzO1xuICAgICAgICAvLyBNYWtlIGpvYiB0aWNrZXRcbiAgICAgICAgbGV0IGpzb24gPSBqb2IuZ2V0SlNPTigpO1xuICAgICAgICBsZXQgdG1wb2JqID0gdG1wLmRpclN5bmMoKTtcbiAgICAgICAgbGV0IGRpciA9IHRtcG9iai5uYW1lO1xuICAgICAgICBsZXQgZmlsZV9uYW1lID0gZGlyICsgcGF0aC5zZXAgKyBcInRpY2tldC5qc29uXCI7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZV9uYW1lLCBqc29uLCBcInV0ZjhcIik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcGouZS5sb2coMywgYEVycm9yIHdyaXRpbmcgam9iIHRpY2tldCB0byB0ZW1wb3JhcnkgZmlsZWAsIHBqKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmlsZV9uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhY2tzIHRoZSByZWxhdGVkIGpvYiBvbiBjb25zdHJ1Y3Rpb24uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHBhY2soY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IHBqID0gdGhpcztcbiAgICAgICAgbGV0IGpvYiA9IHBqLmdldEpvYigpO1xuXG4gICAgICAgIGxldCB0aWNrZXRQYXRoID0gcGouZ2V0Sm9iVGlja2V0KGpvYik7XG4gICAgICAgIGNvbnNvbGUubG9nKHRpY2tldFBhdGgpO1xuXG5cbiAgICAgICAgbGV0IHppcCA9IG5ldyBKU1ppcCgpO1xuXG4gICAgICAgIC8vIEFkZCB0aWNrZXQgdG8gemlwXG4gICAgICAgIGZzLnJlYWRGaWxlKHRpY2tldFBhdGgsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgICAgICAgICAgaWYgKGVycikgdGhyb3cgZXJyO1xuICAgICAgICAgICAgemlwLmZpbGUoXCJ0aWNrZXQuanNvblwiLCBkYXRhKTtcblxuXG4gICAgICAgICAgICAvLyBTYXZlIG91dCB6aXBcbiAgICAgICAgICAgIGxldCB0bXBvYmogPSB0bXAuZGlyU3luYygpO1xuICAgICAgICAgICAgbGV0IGRpciA9IHRtcG9iai5uYW1lO1xuICAgICAgICAgICAgbGV0IGZpbGVfbmFtZSA9IGpvYi5nZXROYW1lKCkgKyBcIi5hbnQuemlwXCI7XG4gICAgICAgICAgICBsZXQgZmlsZV9wYXRoID0gZGlyICsgcGF0aC5zZXAgKyBmaWxlX25hbWU7XG4gICAgICAgICAgICB6aXBcbiAgICAgICAgICAgICAgICAuZ2VuZXJhdGVOb2RlU3RyZWFtKHt0eXBlOiBcIm5vZGVidWZmZXJcIiwgc3RyZWFtRmlsZXM6IHRydWV9KVxuICAgICAgICAgICAgICAgIC5waXBlKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGZpbGVfcGF0aCkpXG4gICAgICAgICAgICAgICAgLm9uKFwiZmluaXNoXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSlNaaXAgZ2VuZXJhdGVzIGEgcmVhZGFibGUgc3RyZWFtIHdpdGggYSBcImVuZFwiIGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAvLyBidXQgaXMgcGlwZWQgaGVyZSBpbiBhIHdyaXRhYmxlIHN0cmVhbSB3aGljaCBlbWl0cyBhIFwiZmluaXNoXCIgZXZlbnQuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwib3V0LnppcCB3cml0dGVuLlwiLCBmaWxlX3BhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHBqLnNldFBhdGgoZmlsZV9wYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgcGouc2V0TmFtZShmaWxlX25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChqb2IuZ2V0UGF0aCgpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInBhY2tpbmdcIiwgam9iLmdldFBhdGgoKSk7XG4gICAgICAgIH1cblxuXG5cblxuICAgIH1cblxufSJdfQ==
