"use strict";
var tunnel_1 = require("./tunnel/tunnel");
var ftpNest_1 = require("./nest/ftpNest");
var folderNest_1 = require("./nest/folderNest");
var environment_1 = require("./environment/environment");
var webhookNest_1 = require("./nest/webhookNest");
var autoFolderNest_1 = require("./nest/autoFolderNest");
var s3Nest_1 = require("./nest/s3Nest");
/**
 * Expose `Antfarm`.
 */
var Antfarm = (function () {
    /**
     * Antfarm constructor
     * @param options   Antfarm options
     */
    function Antfarm(options) {
        this.e = new environment_1.Environment(options);
        this.e.log(1, "Started antfarm", this);
    }
    Antfarm.prototype.version = function () {
        return "0.0.1";
    };
    /**
     * Factory method which returns a Tunnel.
     * @param name
     * @returns {Tunnel}
     */
    Antfarm.prototype.createTunnel = function (name) {
        var a = this;
        return new tunnel_1.Tunnel(a.e, name);
    };
    /**
     * Factory method which returns a FolderNest.
     * @param path          Path of the folder.
     * @param allowCreate   Optional boolean flag to allow creation of folder if it does not exist.
     * @returns {FolderNest}
     * #### Example
     * ```js
     * var out_folder = af.createFolderNest("/Users/dominick/Desktop/My Folder/");
     * ```
     */
    Antfarm.prototype.createFolderNest = function (path, allowCreate) {
        if (allowCreate === void 0) { allowCreate = false; }
        return new folderNest_1.FolderNest(this.e, path, allowCreate);
    };
    /**
     * Factory method which returns an AutoFolderNest. If the auto managed directory does not exist, it is created.
     * @param hierarchy     Path of the folder as a string or an array of strings as _path segments.
     * @returns {AutoFolderNest}
     *
     * #### Example
     * ```js
     * af.createAutoFolderNest("outfolder")
     * // /Users/dominick/My Automanaged Directory/outfolder
     * ```
     * #### Example
     * ```js
     * af.createAutoFolderNest(["proofing", "others"])
     * // /Users/dominick/My Automanaged Directory/proofing/others
     * ```
     */
    Antfarm.prototype.createAutoFolderNest = function (hierarchy) {
        return new autoFolderNest_1.AutoFolderNest(this.e, hierarchy);
    };
    /**
     * Factory method which returns an FtpNest.
     * @param host          Hostname or IP address of the FTP server.
     * @param port          Port number of the FTP server.
     * @param username      FTP account username.
     * @param password      FTP account password.
     * @param checkEvery    Frequency of re-checking FTP in minutes.
     * @returns {FtpNest}
     * #### Example
     * ```js
     * // Check FTP directory every 2 minutes
     * var my_ftp = af.createFtpNest("ftp.example.com", 21, "", "", 2);
     * ```
     */
    Antfarm.prototype.createFtpNest = function (host, port, username, password, checkEvery) {
        if (port === void 0) { port = 21; }
        if (username === void 0) { username = ""; }
        if (password === void 0) { password = ""; }
        if (checkEvery === void 0) { checkEvery = 10; }
        return new ftpNest_1.FtpNest(this.e, host, port, username, password, checkEvery);
    };
    /**
     * Factory method to create and return an S3 nest.
     * @param bucket
     * @param keyPrefix
     * @param checkEvery
     * @param allowCreation
     * @returns {S3Nest}
     * ```js
     * var bucket = af.createS3Nest("my-bucket-_name", "", 1, true);
     * ```
     */
    Antfarm.prototype.createS3Nest = function (bucket, keyPrefix, checkEvery, allowCreation) {
        if (checkEvery === void 0) { checkEvery = 5; }
        if (allowCreation === void 0) { allowCreation = false; }
        return new s3Nest_1.S3Nest(this.e, bucket, keyPrefix, checkEvery, allowCreation);
    };
    /**
     * Factory method which returns a WebhookNest.
     * @param path              The _path which is generated in the webhook's route. You can supply a string or array of strings.
     * @param httpMethod        HTTP method for this webhook. Choose "all" for any HTTP method.
     * @param handleRequest     Optional callback function to handle the request, for sending a custom response.
     * @returns {WebhookNest}
     *
     * #### Example
     * ```js
     * var webhook = af.createWebhookNest(["proof", "create"], "post");
     * ```
     *
     * #### Example returning custom response
     * ```js
     * var webhook = af.createWebhookNest(["proof", "create"], "post", function(req, res, job, nest){
     *     res.setHeader("Content-Type", "application/json; charset=utf-8");
     *     res.end(JSON.stringify({
     *          job_name: job.getName(),
     *          job_id: job.getId(),
     *          message: "Proof created!"
     *     }));
     * });
     * ```
     */
    Antfarm.prototype.createWebhookNest = function (path, httpMethod, handleRequest) {
        if (httpMethod === void 0) { httpMethod = "all"; }
        return new webhookNest_1.WebhookNest(this.e, path, httpMethod, handleRequest);
    };
    /**
     * Load an entire directory of workflow modules.
     * @param directory     Path to the workflow modules.
     * #### Example
     * ```js
     * af.loadDir("./workflows");
     * ```
     */
    Antfarm.prototype.loadDir = function (directory) {
        var af = this;
        var workflows = require("require-dir-all")(directory, {
            _parentsToSkip: 1,
            indexAsParent: true,
            throwNoDir: true
        });
        var loaded_counter = 0;
        for (var workflow in workflows) {
            try {
                new workflows[workflow](af);
                loaded_counter++;
            }
            catch (e) {
                af.e.log(3, "Couldn't load workflow module \"" + workflow + "\". " + e, af);
            }
        }
        af.e.log(1, "Loaded " + loaded_counter + " workflows.", af);
    };
    /**
     * Log messages into the antfarm logger.
     * @param type {number}         The log level. 0 = debug, 1 = info, 2 = warning, 3 = error
     * @param message {string}       Log message.
     * @param actor  {any}           Instance which triggers the action being logged.
     * @param instances {any[]}      Array of of other involved instances.
     * #### Example
     * ```js
     * job.e.log(1, `Transferred to Tunnel "${tunnel.getName()}".`, job, [oldTunnel]);
     * ```
     */
    Antfarm.prototype.log = function (type, message, actor, instances) {
        if (instances === void 0) { instances = []; }
        var af = this;
        af.e.log(type, message, actor, instances);
    };
    return Antfarm;
}());
exports.Antfarm = Antfarm;
module.exports = Antfarm;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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dW5uZWwgPSByZXF1aXJlKFwiLi90dW5uZWwvdHVubmVsXCIpO1xuaW1wb3J0IG5lc3QgPSByZXF1aXJlKFwiLi9uZXN0L25lc3RcIik7XG5pbXBvcnQgZm9sZGVyTmVzdCA9IHJlcXVpcmUoXCIuL25lc3QvZm9sZGVyTmVzdFwiKTtcbmltcG9ydCBqb2IgPSByZXF1aXJlKFwiLi9qb2Ivam9iXCIpO1xuaW1wb3J0IHtUdW5uZWx9IGZyb20gXCIuL3R1bm5lbC90dW5uZWxcIjtcbmltcG9ydCB7RnRwTmVzdH0gZnJvbSBcIi4vbmVzdC9mdHBOZXN0XCI7XG5pbXBvcnQge0ZvbGRlck5lc3R9IGZyb20gXCIuL25lc3QvZm9sZGVyTmVzdFwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7V2ViaG9va05lc3R9IGZyb20gXCIuL25lc3Qvd2ViaG9va05lc3RcIjtcbmltcG9ydCB7QXV0b0ZvbGRlck5lc3R9IGZyb20gXCIuL25lc3QvYXV0b0ZvbGRlck5lc3RcIjtcbmltcG9ydCB7QW50ZmFybU9wdGlvbnN9IGZyb20gXCIuL2Vudmlyb25tZW50L29wdGlvbnNcIjtcbmltcG9ydCB7UzNOZXN0fSBmcm9tIFwiLi9uZXN0L3MzTmVzdFwiO1xuXG4vKipcbiAqIEV4cG9zZSBgQW50ZmFybWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbnRmYXJtIHtcblxuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcblxuICAgIC8qKlxuICAgICAqIEFudGZhcm0gY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyAgIEFudGZhcm0gb3B0aW9uc1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBBbnRmYXJtT3B0aW9ucykge1xuICAgICAgICB0aGlzLmUgPSBuZXcgRW52aXJvbm1lbnQob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZS5sb2coMSwgXCJTdGFydGVkIGFudGZhcm1cIiwgdGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIHZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiBcIjAuMC4xXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmFjdG9yeSBtZXRob2Qgd2hpY2ggcmV0dXJucyBhIFR1bm5lbC5cbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtUdW5uZWx9XG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZVR1bm5lbChuYW1lKSB7XG4gICAgICAgIGxldCBhID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG5ldyBUdW5uZWwoYS5lLCBuYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGYWN0b3J5IG1ldGhvZCB3aGljaCByZXR1cm5zIGEgRm9sZGVyTmVzdC5cbiAgICAgKiBAcGFyYW0gcGF0aCAgICAgICAgICBQYXRoIG9mIHRoZSBmb2xkZXIuXG4gICAgICogQHBhcmFtIGFsbG93Q3JlYXRlICAgT3B0aW9uYWwgYm9vbGVhbiBmbGFnIHRvIGFsbG93IGNyZWF0aW9uIG9mIGZvbGRlciBpZiBpdCBkb2VzIG5vdCBleGlzdC5cbiAgICAgKiBAcmV0dXJucyB7Rm9sZGVyTmVzdH1cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIHZhciBvdXRfZm9sZGVyID0gYWYuY3JlYXRlRm9sZGVyTmVzdChcIi9Vc2Vycy9kb21pbmljay9EZXNrdG9wL015IEZvbGRlci9cIik7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZUZvbGRlck5lc3QocGF0aD86IHN0cmluZywgYWxsb3dDcmVhdGUgPSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gbmV3IEZvbGRlck5lc3QodGhpcy5lLCBwYXRoLCBhbGxvd0NyZWF0ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmFjdG9yeSBtZXRob2Qgd2hpY2ggcmV0dXJucyBhbiBBdXRvRm9sZGVyTmVzdC4gSWYgdGhlIGF1dG8gbWFuYWdlZCBkaXJlY3RvcnkgZG9lcyBub3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQuXG4gICAgICogQHBhcmFtIGhpZXJhcmNoeSAgICAgUGF0aCBvZiB0aGUgZm9sZGVyIGFzIGEgc3RyaW5nIG9yIGFuIGFycmF5IG9mIHN0cmluZ3MgYXMgX3BhdGggc2VnbWVudHMuXG4gICAgICogQHJldHVybnMge0F1dG9Gb2xkZXJOZXN0fVxuICAgICAqXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChcIm91dGZvbGRlclwiKVxuICAgICAqIC8vIC9Vc2Vycy9kb21pbmljay9NeSBBdXRvbWFuYWdlZCBEaXJlY3Rvcnkvb3V0Zm9sZGVyXG4gICAgICogYGBgXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChbXCJwcm9vZmluZ1wiLCBcIm90aGVyc1wiXSlcbiAgICAgKiAvLyAvVXNlcnMvZG9taW5pY2svTXkgQXV0b21hbmFnZWQgRGlyZWN0b3J5L3Byb29maW5nL290aGVyc1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBjcmVhdGVBdXRvRm9sZGVyTmVzdChoaWVyYXJjaHk6IHN0cmluZ3xzdHJpbmdbXSkge1xuICAgICAgICByZXR1cm4gbmV3IEF1dG9Gb2xkZXJOZXN0KHRoaXMuZSwgaGllcmFyY2h5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGYWN0b3J5IG1ldGhvZCB3aGljaCByZXR1cm5zIGFuIEZ0cE5lc3QuXG4gICAgICogQHBhcmFtIGhvc3QgICAgICAgICAgSG9zdG5hbWUgb3IgSVAgYWRkcmVzcyBvZiB0aGUgRlRQIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gcG9ydCAgICAgICAgICBQb3J0IG51bWJlciBvZiB0aGUgRlRQIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gdXNlcm5hbWUgICAgICBGVFAgYWNjb3VudCB1c2VybmFtZS5cbiAgICAgKiBAcGFyYW0gcGFzc3dvcmQgICAgICBGVFAgYWNjb3VudCBwYXNzd29yZC5cbiAgICAgKiBAcGFyYW0gY2hlY2tFdmVyeSAgICBGcmVxdWVuY3kgb2YgcmUtY2hlY2tpbmcgRlRQIGluIG1pbnV0ZXMuXG4gICAgICogQHJldHVybnMge0Z0cE5lc3R9XG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiAvLyBDaGVjayBGVFAgZGlyZWN0b3J5IGV2ZXJ5IDIgbWludXRlc1xuICAgICAqIHZhciBteV9mdHAgPSBhZi5jcmVhdGVGdHBOZXN0KFwiZnRwLmV4YW1wbGUuY29tXCIsIDIxLCBcIlwiLCBcIlwiLCAyKTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlRnRwTmVzdChob3N0OiBzdHJpbmcsIHBvcnQgPSAyMSwgdXNlcm5hbWUgPSBcIlwiLCBwYXNzd29yZCA9IFwiXCIsIGNoZWNrRXZlcnkgPSAxMCkge1xuICAgICAgICByZXR1cm4gbmV3IEZ0cE5lc3QodGhpcy5lLCBob3N0LCBwb3J0LCB1c2VybmFtZSwgcGFzc3dvcmQsIGNoZWNrRXZlcnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZhY3RvcnkgbWV0aG9kIHRvIGNyZWF0ZSBhbmQgcmV0dXJuIGFuIFMzIG5lc3QuXG4gICAgICogQHBhcmFtIGJ1Y2tldFxuICAgICAqIEBwYXJhbSBrZXlQcmVmaXhcbiAgICAgKiBAcGFyYW0gY2hlY2tFdmVyeVxuICAgICAqIEBwYXJhbSBhbGxvd0NyZWF0aW9uXG4gICAgICogQHJldHVybnMge1MzTmVzdH1cbiAgICAgKiBgYGBqc1xuICAgICAqIHZhciBidWNrZXQgPSBhZi5jcmVhdGVTM05lc3QoXCJteS1idWNrZXQtX25hbWVcIiwgXCJcIiwgMSwgdHJ1ZSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZVMzTmVzdChidWNrZXQ6IHN0cmluZywga2V5UHJlZml4Pzogc3RyaW5nLCBjaGVja0V2ZXJ5OiBudW1iZXIgPSA1LCBhbGxvd0NyZWF0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTM05lc3QodGhpcy5lLCBidWNrZXQsIGtleVByZWZpeCwgY2hlY2tFdmVyeSwgYWxsb3dDcmVhdGlvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmFjdG9yeSBtZXRob2Qgd2hpY2ggcmV0dXJucyBhIFdlYmhvb2tOZXN0LlxuICAgICAqIEBwYXJhbSBwYXRoICAgICAgICAgICAgICBUaGUgX3BhdGggd2hpY2ggaXMgZ2VuZXJhdGVkIGluIHRoZSB3ZWJob29rJ3Mgcm91dGUuIFlvdSBjYW4gc3VwcGx5IGEgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MuXG4gICAgICogQHBhcmFtIGh0dHBNZXRob2QgICAgICAgIEhUVFAgbWV0aG9kIGZvciB0aGlzIHdlYmhvb2suIENob29zZSBcImFsbFwiIGZvciBhbnkgSFRUUCBtZXRob2QuXG4gICAgICogQHBhcmFtIGhhbmRsZVJlcXVlc3QgICAgIE9wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUgcmVxdWVzdCwgZm9yIHNlbmRpbmcgYSBjdXN0b20gcmVzcG9uc2UuXG4gICAgICogQHJldHVybnMge1dlYmhvb2tOZXN0fVxuICAgICAqXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiB2YXIgd2ViaG9vayA9IGFmLmNyZWF0ZVdlYmhvb2tOZXN0KFtcInByb29mXCIsIFwiY3JlYXRlXCJdLCBcInBvc3RcIik7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiAjIyMjIEV4YW1wbGUgcmV0dXJuaW5nIGN1c3RvbSByZXNwb25zZVxuICAgICAqIGBgYGpzXG4gICAgICogdmFyIHdlYmhvb2sgPSBhZi5jcmVhdGVXZWJob29rTmVzdChbXCJwcm9vZlwiLCBcImNyZWF0ZVwiXSwgXCJwb3N0XCIsIGZ1bmN0aW9uKHJlcSwgcmVzLCBqb2IsIG5lc3Qpe1xuICAgICAqICAgICByZXMuc2V0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiKTtcbiAgICAgKiAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICogICAgICAgICAgam9iX25hbWU6IGpvYi5nZXROYW1lKCksXG4gICAgICogICAgICAgICAgam9iX2lkOiBqb2IuZ2V0SWQoKSxcbiAgICAgKiAgICAgICAgICBtZXNzYWdlOiBcIlByb29mIGNyZWF0ZWQhXCJcbiAgICAgKiAgICAgfSkpO1xuICAgICAqIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBjcmVhdGVXZWJob29rTmVzdChwYXRoOiBzdHJpbmd8c3RyaW5nW10sIGh0dHBNZXRob2QgPSBcImFsbFwiLCBoYW5kbGVSZXF1ZXN0PzogYW55KSB7XG4gICAgICAgIHJldHVybiBuZXcgV2ViaG9va05lc3QodGhpcy5lLCBwYXRoLCBodHRwTWV0aG9kLCBoYW5kbGVSZXF1ZXN0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGFuIGVudGlyZSBkaXJlY3Rvcnkgb2Ygd29ya2Zsb3cgbW9kdWxlcy5cbiAgICAgKiBAcGFyYW0gZGlyZWN0b3J5ICAgICBQYXRoIHRvIHRoZSB3b3JrZmxvdyBtb2R1bGVzLlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogYWYubG9hZERpcihcIi4vd29ya2Zsb3dzXCIpO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBsb2FkRGlyKGRpcmVjdG9yeTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBhZiA9IHRoaXM7XG4gICAgICAgIGxldCB3b3JrZmxvd3MgPSByZXF1aXJlKFwicmVxdWlyZS1kaXItYWxsXCIpKGRpcmVjdG9yeSwge1xuICAgICAgICAgICAgX3BhcmVudHNUb1NraXA6IDEsXG4gICAgICAgICAgICBpbmRleEFzUGFyZW50OiB0cnVlLFxuICAgICAgICAgICAgdGhyb3dOb0RpcjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGxvYWRlZF9jb3VudGVyID0gMDtcblxuICAgICAgICBmb3IgKGxldCB3b3JrZmxvdyBpbiB3b3JrZmxvd3MpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbmV3IHdvcmtmbG93c1t3b3JrZmxvd10oYWYpO1xuICAgICAgICAgICAgICAgIGxvYWRlZF9jb3VudGVyKys7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgYWYuZS5sb2coMywgYENvdWxkbid0IGxvYWQgd29ya2Zsb3cgbW9kdWxlIFwiJHt3b3JrZmxvd31cIi4gJHtlfWAsIGFmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGFmLmUubG9nKDEsIGBMb2FkZWQgJHtsb2FkZWRfY291bnRlcn0gd29ya2Zsb3dzLmAsIGFmKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2cgbWVzc2FnZXMgaW50byB0aGUgYW50ZmFybSBsb2dnZXIuXG4gICAgICogQHBhcmFtIHR5cGUge251bWJlcn0gICAgICAgICBUaGUgbG9nIGxldmVsLiAwID0gZGVidWcsIDEgPSBpbmZvLCAyID0gd2FybmluZywgMyA9IGVycm9yXG4gICAgICogQHBhcmFtIG1lc3NhZ2Uge3N0cmluZ30gICAgICAgTG9nIG1lc3NhZ2UuXG4gICAgICogQHBhcmFtIGFjdG9yICB7YW55fSAgICAgICAgICAgSW5zdGFuY2Ugd2hpY2ggdHJpZ2dlcnMgdGhlIGFjdGlvbiBiZWluZyBsb2dnZWQuXG4gICAgICogQHBhcmFtIGluc3RhbmNlcyB7YW55W119ICAgICAgQXJyYXkgb2Ygb2Ygb3RoZXIgaW52b2x2ZWQgaW5zdGFuY2VzLlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogam9iLmUubG9nKDEsIGBUcmFuc2ZlcnJlZCB0byBUdW5uZWwgXCIke3R1bm5lbC5nZXROYW1lKCl9XCIuYCwgam9iLCBbb2xkVHVubmVsXSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGxvZyh0eXBlOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZywgYWN0b3I/OiBhbnksIGluc3RhbmNlcyA9IFtdKSB7XG4gICAgICAgIGxldCBhZiA9IHRoaXM7XG4gICAgICAgIGFmLmUubG9nKHR5cGUsIG1lc3NhZ2UsIGFjdG9yLCBpbnN0YW5jZXMpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBbnRmYXJtOyJdfQ==
