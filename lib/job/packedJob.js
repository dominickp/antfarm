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
    function PackedJob(e, job) {
        // let job_name = job.getName();
        _super.call(this, e, job.getName());
        var pj = this;
        pj.e = e;
        pj.job = job;
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
    PackedJob.prototype.buildZip = function (zip, callback) {
        // Save out zip
        var pj = this;
        var job = this.getJob();
        var tmpobj = tmp.dirSync();
        var dir = tmpobj.name;
        var file_name = job.getName() + ".antpack.zip";
        var file_path = dir + path.sep + file_name;
        zip
            .generateNodeStream({ type: "nodebuffer", streamFiles: true })
            .pipe(fs.createWriteStream(file_path))
            .on("finish", function () {
            // JSZip generates a readable stream with a "end" event,
            // but is piped here in a writable stream which emits a "finish" event.
            pj.setPath(file_path);
            pj.setName(file_name);
            callback();
        });
    };
    /**
     * Packs the related job on construction.
     */
    PackedJob.prototype.pack = function (done) {
        var pj = this;
        var job = pj.getJob();
        var ticketPath = pj.getJobTicket(job);
        var zip = new JSZip();
        // Add ticket to zip
        fs.readFile(ticketPath, function (err, data) {
            if (err)
                throw err;
            zip.file("_ticket/ticket.json", data);
            if (job.isFile()) {
                fs.readFile(job.getPath(), function (err, data) {
                    if (err)
                        throw err;
                    zip.file("_asset/" + job.getName(), data);
                    pj.buildZip(zip, function () {
                        done();
                    });
                });
            }
            else if (job.isFolder()) {
                job.getFiles().forEach(function (file) {
                    fs.readFile(file.getPath(), function (err, data) {
                        if (err)
                            throw err;
                        zip.file("_asset" + path.sep + job.getNameProper() + path.sep + file.getName(), data);
                        pj.buildZip(zip, function () {
                            done();
                        });
                    });
                });
            }
            else {
                pj.buildZip(zip, function () {
                    done();
                });
            }
        });
    };
    return PackedJob;
}(fileJob_1.FileJob));
exports.PackedJob = PackedJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QU0sR0FBRyxDQUFDO3dCQUNuQixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDdEYsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7NEJBQ2IsSUFBSSxFQUFFLENBQUM7d0JBQ1gsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7b0JBQ2IsSUFBSSxFQUFFLENBQUM7Z0JBQ1gsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1FBRUwsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDO0lBRUwsZ0JBQUM7QUFBRCxDQTNHQSxBQTJHQyxDQTNHOEIsaUJBQU8sR0EyR3JDO0FBM0dZLGlCQUFTLFlBMkdyQixDQUFBIiwiZmlsZSI6ImxpYi9qb2IvcGFja2VkSm9iLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5pbXBvcnQge0ZpbGVKb2J9IGZyb20gXCIuL2ZpbGVKb2JcIjtcbmltcG9ydCB7Sm9ifSBmcm9tIFwiLi9qb2JcIjtcblxuY29uc3QgICB0bXAgPSByZXF1aXJlKFwidG1wXCIpLFxuICAgICAgICBmcyA9IHJlcXVpcmUoXCJmc1wiKSxcbiAgICAgICAgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxuICAgICAgICBKU1ppcCA9IHJlcXVpcmUoXCJqc3ppcFwiKTtcblxuZXhwb3J0IGNsYXNzIFBhY2tlZEpvYiBleHRlbmRzIEZpbGVKb2Ige1xuXG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuICAgIHByb3RlY3RlZCBqb2I6IEpvYjtcblxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBqb2I6IEpvYikge1xuICAgICAgICAvLyBsZXQgam9iX25hbWUgPSBqb2IuZ2V0TmFtZSgpO1xuICAgICAgICBzdXBlcihlLCBqb2IuZ2V0TmFtZSgpKTtcbiAgICAgICAgbGV0IHBqID0gdGhpcztcbiAgICAgICAgcGouZSA9IGU7XG4gICAgICAgIHBqLmpvYiA9IGpvYjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtKb2J9XG4gICAgICovXG4gICAgcHVibGljIGdldEpvYigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuam9iO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGpvYiB0aWNrZXQgYW5kIHJldHVybnMgdGhlIHBhdGggdG8gdGhlIHRlbXBvcmFyeSBmaWxlLlxuICAgICAqIEBwYXJhbSBqb2JcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRKb2JUaWNrZXQoam9iOiBKb2IpIHtcbiAgICAgICAgbGV0IHBqID0gdGhpcztcbiAgICAgICAgLy8gTWFrZSBqb2IgdGlja2V0XG4gICAgICAgIGxldCBqc29uID0gam9iLmdldEpTT04oKTtcbiAgICAgICAgbGV0IHRtcG9iaiA9IHRtcC5kaXJTeW5jKCk7XG4gICAgICAgIGxldCBkaXIgPSB0bXBvYmoubmFtZTtcbiAgICAgICAgbGV0IGZpbGVfbmFtZSA9IGRpciArIHBhdGguc2VwICsgXCJ0aWNrZXQuanNvblwiO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVfbmFtZSwganNvbiwgXCJ1dGY4XCIpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHBqLmUubG9nKDMsIGBFcnJvciB3cml0aW5nIGpvYiB0aWNrZXQgdG8gdGVtcG9yYXJ5IGZpbGVgLCBwaik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGVfbmFtZTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYnVpbGRaaXAoemlwOiBhbnksIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIFNhdmUgb3V0IHppcFxuICAgICAgICBsZXQgcGogPSB0aGlzO1xuICAgICAgICBsZXQgam9iID0gdGhpcy5nZXRKb2IoKTtcbiAgICAgICAgbGV0IHRtcG9iaiA9IHRtcC5kaXJTeW5jKCk7XG4gICAgICAgIGxldCBkaXIgPSB0bXBvYmoubmFtZTtcbiAgICAgICAgbGV0IGZpbGVfbmFtZSA9IGpvYi5nZXROYW1lKCkgKyBcIi5hbnRwYWNrLnppcFwiO1xuICAgICAgICBsZXQgZmlsZV9wYXRoID0gZGlyICsgcGF0aC5zZXAgKyBmaWxlX25hbWU7XG4gICAgICAgIHppcFxuICAgICAgICAgICAgLmdlbmVyYXRlTm9kZVN0cmVhbSh7dHlwZTogXCJub2RlYnVmZmVyXCIsIHN0cmVhbUZpbGVzOiB0cnVlfSlcbiAgICAgICAgICAgIC5waXBlKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGZpbGVfcGF0aCkpXG4gICAgICAgICAgICAub24oXCJmaW5pc2hcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIEpTWmlwIGdlbmVyYXRlcyBhIHJlYWRhYmxlIHN0cmVhbSB3aXRoIGEgXCJlbmRcIiBldmVudCxcbiAgICAgICAgICAgICAgICAvLyBidXQgaXMgcGlwZWQgaGVyZSBpbiBhIHdyaXRhYmxlIHN0cmVhbSB3aGljaCBlbWl0cyBhIFwiZmluaXNoXCIgZXZlbnQuXG4gICAgICAgICAgICAgICAgcGouc2V0UGF0aChmaWxlX3BhdGgpO1xuICAgICAgICAgICAgICAgIHBqLnNldE5hbWUoZmlsZV9uYW1lKTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFja3MgdGhlIHJlbGF0ZWQgam9iIG9uIGNvbnN0cnVjdGlvbi5cbiAgICAgKi9cbiAgICBwdWJsaWMgcGFjayhkb25lKSB7XG4gICAgICAgIGxldCBwaiA9IHRoaXM7XG4gICAgICAgIGxldCBqb2IgPSBwai5nZXRKb2IoKTtcblxuICAgICAgICBsZXQgdGlja2V0UGF0aCA9IHBqLmdldEpvYlRpY2tldChqb2IpO1xuXG4gICAgICAgIGxldCB6aXAgPSBuZXcgSlNaaXAoKTtcblxuICAgICAgICAvLyBBZGQgdGlja2V0IHRvIHppcFxuICAgICAgICBmcy5yZWFkRmlsZSh0aWNrZXRQYXRoLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgICAgICAgIHppcC5maWxlKFwiX3RpY2tldC90aWNrZXQuanNvblwiLCBkYXRhKTtcblxuICAgICAgICAgICAgaWYgKGpvYi5pc0ZpbGUoKSkge1xuXG4gICAgICAgICAgICAgICAgZnMucmVhZEZpbGUoam9iLmdldFBhdGgoKSwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgemlwLmZpbGUoXCJfYXNzZXQvXCIgKyBqb2IuZ2V0TmFtZSgpLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgcGouYnVpbGRaaXAoemlwLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChqb2IuaXNGb2xkZXIoKSkge1xuICAgICAgICAgICAgICAgIGpvYi5nZXRGaWxlcygpLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKGZpbGUuZ2V0UGF0aCgpLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHppcC5maWxlKFwiX2Fzc2V0XCIgKyBwYXRoLnNlcCArIGpvYi5nZXROYW1lUHJvcGVyKCkgKyBwYXRoLnNlcCArIGZpbGUuZ2V0TmFtZSgpLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBqLmJ1aWxkWmlwKHppcCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGouYnVpbGRaaXAoemlwLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxufSJdfQ==
