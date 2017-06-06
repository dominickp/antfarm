"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFjLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDO2dCQUNELElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QixjQUFjLEVBQUUsQ0FBQztZQUNyQixDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDVCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUscUNBQWtDLFFBQVEsWUFBTSxDQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekUsQ0FBQztRQUNMLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsWUFBVSxjQUFjLGdCQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSSxxQkFBRyxHQUFWLFVBQVcsSUFBWSxFQUFFLE9BQWUsRUFBRSxLQUFXLEVBQUUsU0FBYztRQUFkLDBCQUFBLEVBQUEsY0FBYztRQUNqRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBQ0wsY0FBQztBQUFELENBdEtBLEFBc0tDLElBQUE7QUF0S1ksMEJBQU87QUF3S3BCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDIiwiZmlsZSI6ImxpYi9hbnRmYXJtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR1bm5lbCA9IHJlcXVpcmUoXCIuL3R1bm5lbC90dW5uZWxcIik7XHJcbmltcG9ydCBuZXN0ID0gcmVxdWlyZShcIi4vbmVzdC9uZXN0XCIpO1xyXG5pbXBvcnQgZm9sZGVyTmVzdCA9IHJlcXVpcmUoXCIuL25lc3QvZm9sZGVyTmVzdFwiKTtcclxuaW1wb3J0IGpvYiA9IHJlcXVpcmUoXCIuL2pvYi9qb2JcIik7XHJcbmltcG9ydCB7VHVubmVsfSBmcm9tIFwiLi90dW5uZWwvdHVubmVsXCI7XHJcbmltcG9ydCB7RnRwTmVzdH0gZnJvbSBcIi4vbmVzdC9mdHBOZXN0XCI7XHJcbmltcG9ydCB7Rm9sZGVyTmVzdH0gZnJvbSBcIi4vbmVzdC9mb2xkZXJOZXN0XCI7XHJcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gXCIuL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XHJcbmltcG9ydCB7V2ViaG9va05lc3R9IGZyb20gXCIuL25lc3Qvd2ViaG9va05lc3RcIjtcclxuaW1wb3J0IHtBdXRvRm9sZGVyTmVzdH0gZnJvbSBcIi4vbmVzdC9hdXRvRm9sZGVyTmVzdFwiO1xyXG5pbXBvcnQge0FudGZhcm1PcHRpb25zfSBmcm9tIFwiLi9lbnZpcm9ubWVudC9vcHRpb25zXCI7XHJcbmltcG9ydCB7UzNOZXN0fSBmcm9tIFwiLi9uZXN0L3MzTmVzdFwiO1xyXG5cclxuLyoqXHJcbiAqIEV4cG9zZSBgQW50ZmFybWAuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQW50ZmFybSB7XHJcblxyXG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQW50ZmFybSBjb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIG9wdGlvbnMgICBBbnRmYXJtIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucz86IEFudGZhcm1PcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5lID0gbmV3IEVudmlyb25tZW50KG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuZS5sb2coMSwgXCJTdGFydGVkIGFudGZhcm1cIiwgdGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZlcnNpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiMC4wLjFcIjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZhY3RvcnkgbWV0aG9kIHdoaWNoIHJldHVybnMgYSBUdW5uZWwuXHJcbiAgICAgKiBAcGFyYW0gbmFtZVxyXG4gICAgICogQHJldHVybnMge1R1bm5lbH1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGNyZWF0ZVR1bm5lbChuYW1lKSB7XHJcbiAgICAgICAgbGV0IGEgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgVHVubmVsKGEuZSwgbmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGYWN0b3J5IG1ldGhvZCB3aGljaCByZXR1cm5zIGEgRm9sZGVyTmVzdC5cclxuICAgICAqIEBwYXJhbSBwYXRoICAgICAgICAgIFBhdGggb2YgdGhlIGZvbGRlci5cclxuICAgICAqIEBwYXJhbSBhbGxvd0NyZWF0ZSAgIE9wdGlvbmFsIGJvb2xlYW4gZmxhZyB0byBhbGxvdyBjcmVhdGlvbiBvZiBmb2xkZXIgaWYgaXQgZG9lcyBub3QgZXhpc3QuXHJcbiAgICAgKiBAcmV0dXJucyB7Rm9sZGVyTmVzdH1cclxuICAgICAqICMjIyMgRXhhbXBsZVxyXG4gICAgICogYGBganNcclxuICAgICAqIHZhciBvdXRfZm9sZGVyID0gYWYuY3JlYXRlRm9sZGVyTmVzdChcIi9Vc2Vycy9kb21pbmljay9EZXNrdG9wL015IEZvbGRlci9cIik7XHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNyZWF0ZUZvbGRlck5lc3QocGF0aD86IHN0cmluZywgYWxsb3dDcmVhdGUgPSBmYWxzZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRm9sZGVyTmVzdCh0aGlzLmUsIHBhdGgsIGFsbG93Q3JlYXRlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZhY3RvcnkgbWV0aG9kIHdoaWNoIHJldHVybnMgYW4gQXV0b0ZvbGRlck5lc3QuIElmIHRoZSBhdXRvIG1hbmFnZWQgZGlyZWN0b3J5IGRvZXMgbm90IGV4aXN0LCBpdCBpcyBjcmVhdGVkLlxyXG4gICAgICogQHBhcmFtIGhpZXJhcmNoeSAgICAgUGF0aCBvZiB0aGUgZm9sZGVyIGFzIGEgc3RyaW5nIG9yIGFuIGFycmF5IG9mIHN0cmluZ3MgYXMgX3BhdGggc2VnbWVudHMuXHJcbiAgICAgKiBAcmV0dXJucyB7QXV0b0ZvbGRlck5lc3R9XHJcbiAgICAgKlxyXG4gICAgICogIyMjIyBFeGFtcGxlXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogYWYuY3JlYXRlQXV0b0ZvbGRlck5lc3QoXCJvdXRmb2xkZXJcIilcclxuICAgICAqIC8vIC9Vc2Vycy9kb21pbmljay9NeSBBdXRvbWFuYWdlZCBEaXJlY3Rvcnkvb3V0Zm9sZGVyXHJcbiAgICAgKiBgYGBcclxuICAgICAqICMjIyMgRXhhbXBsZVxyXG4gICAgICogYGBganNcclxuICAgICAqIGFmLmNyZWF0ZUF1dG9Gb2xkZXJOZXN0KFtcInByb29maW5nXCIsIFwib3RoZXJzXCJdKVxyXG4gICAgICogLy8gL1VzZXJzL2RvbWluaWNrL015IEF1dG9tYW5hZ2VkIERpcmVjdG9yeS9wcm9vZmluZy9vdGhlcnNcclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY3JlYXRlQXV0b0ZvbGRlck5lc3QoaGllcmFyY2h5OiBzdHJpbmd8c3RyaW5nW10pIHtcclxuICAgICAgICByZXR1cm4gbmV3IEF1dG9Gb2xkZXJOZXN0KHRoaXMuZSwgaGllcmFyY2h5KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZhY3RvcnkgbWV0aG9kIHdoaWNoIHJldHVybnMgYW4gRnRwTmVzdC5cclxuICAgICAqIEBwYXJhbSBob3N0ICAgICAgICAgIEhvc3RuYW1lIG9yIElQIGFkZHJlc3Mgb2YgdGhlIEZUUCBzZXJ2ZXIuXHJcbiAgICAgKiBAcGFyYW0gcG9ydCAgICAgICAgICBQb3J0IG51bWJlciBvZiB0aGUgRlRQIHNlcnZlci5cclxuICAgICAqIEBwYXJhbSB1c2VybmFtZSAgICAgIEZUUCBhY2NvdW50IHVzZXJuYW1lLlxyXG4gICAgICogQHBhcmFtIHBhc3N3b3JkICAgICAgRlRQIGFjY291bnQgcGFzc3dvcmQuXHJcbiAgICAgKiBAcGFyYW0gY2hlY2tFdmVyeSAgICBGcmVxdWVuY3kgb2YgcmUtY2hlY2tpbmcgRlRQIGluIG1pbnV0ZXMuXHJcbiAgICAgKiBAcmV0dXJucyB7RnRwTmVzdH1cclxuICAgICAqICMjIyMgRXhhbXBsZVxyXG4gICAgICogYGBganNcclxuICAgICAqIC8vIENoZWNrIEZUUCBkaXJlY3RvcnkgZXZlcnkgMiBtaW51dGVzXHJcbiAgICAgKiB2YXIgbXlfZnRwID0gYWYuY3JlYXRlRnRwTmVzdChcImZ0cC5leGFtcGxlLmNvbVwiLCAyMSwgXCJcIiwgXCJcIiwgMik7XHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNyZWF0ZUZ0cE5lc3QoaG9zdDogc3RyaW5nLCBwb3J0ID0gMjEsIHVzZXJuYW1lID0gXCJcIiwgcGFzc3dvcmQgPSBcIlwiLCBjaGVja0V2ZXJ5ID0gMTApIHtcclxuICAgICAgICByZXR1cm4gbmV3IEZ0cE5lc3QodGhpcy5lLCBob3N0LCBwb3J0LCB1c2VybmFtZSwgcGFzc3dvcmQsIGNoZWNrRXZlcnkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmFjdG9yeSBtZXRob2QgdG8gY3JlYXRlIGFuZCByZXR1cm4gYW4gUzMgbmVzdC5cclxuICAgICAqIEBwYXJhbSBidWNrZXRcclxuICAgICAqIEBwYXJhbSBrZXlQcmVmaXhcclxuICAgICAqIEBwYXJhbSBjaGVja0V2ZXJ5XHJcbiAgICAgKiBAcGFyYW0gYWxsb3dDcmVhdGlvblxyXG4gICAgICogQHJldHVybnMge1MzTmVzdH1cclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiB2YXIgYnVja2V0ID0gYWYuY3JlYXRlUzNOZXN0KFwibXktYnVja2V0LV9uYW1lXCIsIFwiXCIsIDEsIHRydWUpO1xyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjcmVhdGVTM05lc3QoYnVja2V0OiBzdHJpbmcsIGtleVByZWZpeD86IHN0cmluZywgY2hlY2tFdmVyeTogbnVtYmVyID0gNSwgYWxsb3dDcmVhdGlvbjogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTM05lc3QodGhpcy5lLCBidWNrZXQsIGtleVByZWZpeCwgY2hlY2tFdmVyeSwgYWxsb3dDcmVhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGYWN0b3J5IG1ldGhvZCB3aGljaCByZXR1cm5zIGEgV2ViaG9va05lc3QuXHJcbiAgICAgKiBAcGFyYW0gcGF0aCAgICAgICAgICAgICAgVGhlIF9wYXRoIHdoaWNoIGlzIGdlbmVyYXRlZCBpbiB0aGUgd2ViaG9vaydzIHJvdXRlLiBZb3UgY2FuIHN1cHBseSBhIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzLlxyXG4gICAgICogQHBhcmFtIGh0dHBNZXRob2QgICAgICAgIEhUVFAgbWV0aG9kIGZvciB0aGlzIHdlYmhvb2suIENob29zZSBcImFsbFwiIGZvciBhbnkgSFRUUCBtZXRob2QuXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlUmVxdWVzdCAgICAgT3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaGFuZGxlIHRoZSByZXF1ZXN0LCBmb3Igc2VuZGluZyBhIGN1c3RvbSByZXNwb25zZS5cclxuICAgICAqIEByZXR1cm5zIHtXZWJob29rTmVzdH1cclxuICAgICAqXHJcbiAgICAgKiAjIyMjIEV4YW1wbGVcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiB2YXIgd2ViaG9vayA9IGFmLmNyZWF0ZVdlYmhvb2tOZXN0KFtcInByb29mXCIsIFwiY3JlYXRlXCJdLCBcInBvc3RcIik7XHJcbiAgICAgKiBgYGBcclxuICAgICAqXHJcbiAgICAgKiAjIyMjIEV4YW1wbGUgcmV0dXJuaW5nIGN1c3RvbSByZXNwb25zZVxyXG4gICAgICogYGBganNcclxuICAgICAqIHZhciB3ZWJob29rID0gYWYuY3JlYXRlV2ViaG9va05lc3QoW1wicHJvb2ZcIiwgXCJjcmVhdGVcIl0sIFwicG9zdFwiLCBmdW5jdGlvbihyZXEsIHJlcywgam9iLCBuZXN0KXtcclxuICAgICAqICAgICByZXMuc2V0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiKTtcclxuICAgICAqICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAqICAgICAgICAgIGpvYl9uYW1lOiBqb2IuZ2V0TmFtZSgpLFxyXG4gICAgICogICAgICAgICAgam9iX2lkOiBqb2IuZ2V0SWQoKSxcclxuICAgICAqICAgICAgICAgIG1lc3NhZ2U6IFwiUHJvb2YgY3JlYXRlZCFcIlxyXG4gICAgICogICAgIH0pKTtcclxuICAgICAqIH0pO1xyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjcmVhdGVXZWJob29rTmVzdChwYXRoOiBzdHJpbmd8c3RyaW5nW10sIGh0dHBNZXRob2QgPSBcImFsbFwiLCBoYW5kbGVSZXF1ZXN0PzogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBXZWJob29rTmVzdCh0aGlzLmUsIHBhdGgsIGh0dHBNZXRob2QsIGhhbmRsZVJlcXVlc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTG9hZCBhbiBlbnRpcmUgZGlyZWN0b3J5IG9mIHdvcmtmbG93IG1vZHVsZXMuXHJcbiAgICAgKiBAcGFyYW0gZGlyZWN0b3J5ICAgICBQYXRoIHRvIHRoZSB3b3JrZmxvdyBtb2R1bGVzLlxyXG4gICAgICogIyMjIyBFeGFtcGxlXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogYWYubG9hZERpcihcIi4vd29ya2Zsb3dzXCIpO1xyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBsb2FkRGlyKGRpcmVjdG9yeTogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGFmID0gdGhpcztcclxuICAgICAgICBsZXQgd29ya2Zsb3dzID0gcmVxdWlyZShcInJlcXVpcmUtZGlyLWFsbFwiKShkaXJlY3RvcnksIHtcclxuICAgICAgICAgICAgX3BhcmVudHNUb1NraXA6IDEsXHJcbiAgICAgICAgICAgIGluZGV4QXNQYXJlbnQ6IHRydWUsXHJcbiAgICAgICAgICAgIHRocm93Tm9EaXI6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgbG9hZGVkX2NvdW50ZXIgPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB3b3JrZmxvdyBpbiB3b3JrZmxvd3MpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIG5ldyB3b3JrZmxvd3Nbd29ya2Zsb3ddKGFmKTtcclxuICAgICAgICAgICAgICAgIGxvYWRlZF9jb3VudGVyKys7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGFmLmUubG9nKDMsIGBDb3VsZG4ndCBsb2FkIHdvcmtmbG93IG1vZHVsZSBcIiR7d29ya2Zsb3d9XCIuICR7ZX1gLCBhZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFmLmUubG9nKDEsIGBMb2FkZWQgJHtsb2FkZWRfY291bnRlcn0gd29ya2Zsb3dzLmAsIGFmKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvZyBtZXNzYWdlcyBpbnRvIHRoZSBhbnRmYXJtIGxvZ2dlci5cclxuICAgICAqIEBwYXJhbSB0eXBlIHtudW1iZXJ9ICAgICAgICAgVGhlIGxvZyBsZXZlbC4gMCA9IGRlYnVnLCAxID0gaW5mbywgMiA9IHdhcm5pbmcsIDMgPSBlcnJvclxyXG4gICAgICogQHBhcmFtIG1lc3NhZ2Uge3N0cmluZ30gICAgICAgTG9nIG1lc3NhZ2UuXHJcbiAgICAgKiBAcGFyYW0gYWN0b3IgIHthbnl9ICAgICAgICAgICBJbnN0YW5jZSB3aGljaCB0cmlnZ2VycyB0aGUgYWN0aW9uIGJlaW5nIGxvZ2dlZC5cclxuICAgICAqIEBwYXJhbSBpbnN0YW5jZXMge2FueVtdfSAgICAgIEFycmF5IG9mIG9mIG90aGVyIGludm9sdmVkIGluc3RhbmNlcy5cclxuICAgICAqICMjIyMgRXhhbXBsZVxyXG4gICAgICogYGBganNcclxuICAgICAqIGpvYi5lLmxvZygxLCBgVHJhbnNmZXJyZWQgdG8gVHVubmVsIFwiJHt0dW5uZWwuZ2V0TmFtZSgpfVwiLmAsIGpvYiwgW29sZFR1bm5lbF0pO1xyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBsb2codHlwZTogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcsIGFjdG9yPzogYW55LCBpbnN0YW5jZXMgPSBbXSkge1xyXG4gICAgICAgIGxldCBhZiA9IHRoaXM7XHJcbiAgICAgICAgYWYuZS5sb2codHlwZSwgbWVzc2FnZSwgYWN0b3IsIGluc3RhbmNlcyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQW50ZmFybTsiXX0=
