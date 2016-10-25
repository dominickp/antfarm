"use strict";
var tunnel_1 = require("./tunnel/tunnel");
var ftpNest_1 = require("./nest/ftpNest");
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
        return new tunnel_1.Tunnel(this.e, name);
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
    // public createFolderNest(path?: string, allowCreate = false) {
    //     return new FolderNest(this.e, path, allowCreate);
    // } 
    /**
     * Factory method which returns an AutoFolderNest. If the auto managed directory does not exist, it is created.
     * @param hierarchy     Path of the folder as a string or an array of strings as path segments.
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
     * var bucket = af.createS3Nest("my-bucket-name", "", 1, true);
     * ```
     */
    Antfarm.prototype.createS3Nest = function (bucket, keyPrefix, checkEvery, allowCreation) {
        if (checkEvery === void 0) { checkEvery = 5; }
        if (allowCreation === void 0) { allowCreation = false; }
        return new s3Nest_1.S3Nest(this.e, bucket, keyPrefix, checkEvery, allowCreation);
    };
    /**
     * Factory method which returns a WebhookNest.
     * @param path              The path which is generated in the webhook's route. You can supply a string or array of strings.
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDO2dCQUNELElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QixjQUFjLEVBQUUsQ0FBQztZQUNyQixDQUFFO1lBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDVCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUscUNBQWtDLFFBQVEsWUFBTSxDQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekUsQ0FBQztRQUNMLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsWUFBVSxjQUFjLGdCQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSSxxQkFBRyxHQUFWLFVBQVcsSUFBWSxFQUFFLE9BQWUsRUFBRSxLQUFXLEVBQUUsU0FBYztRQUFkLHlCQUFjLEdBQWQsY0FBYztRQUNqRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBQ0wsY0FBQztBQUFELENBcktBLEFBcUtDLElBQUE7QUFyS1ksZUFBTyxVQXFLbkIsQ0FBQTtBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDIiwiZmlsZSI6ImxpYi9hbnRmYXJtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR1bm5lbCA9IHJlcXVpcmUoXCIuL3R1bm5lbC90dW5uZWxcIik7XG5pbXBvcnQgbmVzdCA9IHJlcXVpcmUoXCIuL25lc3QvbmVzdFwiKTtcbmltcG9ydCBmb2xkZXJOZXN0ID0gcmVxdWlyZShcIi4vbmVzdC9mb2xkZXJOZXN0XCIpO1xuaW1wb3J0IGpvYiA9IHJlcXVpcmUoXCIuL2pvYi9qb2JcIik7XG5pbXBvcnQge1R1bm5lbH0gZnJvbSBcIi4vdHVubmVsL3R1bm5lbFwiO1xuaW1wb3J0IHtGdHBOZXN0fSBmcm9tIFwiLi9uZXN0L2Z0cE5lc3RcIjtcbmltcG9ydCB7Rm9sZGVyTmVzdH0gZnJvbSBcIi4vbmVzdC9mb2xkZXJOZXN0XCI7XG5pbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtXZWJob29rTmVzdH0gZnJvbSBcIi4vbmVzdC93ZWJob29rTmVzdFwiO1xuaW1wb3J0IHtBdXRvRm9sZGVyTmVzdH0gZnJvbSBcIi4vbmVzdC9hdXRvRm9sZGVyTmVzdFwiO1xuaW1wb3J0IHtBbnRmYXJtT3B0aW9uc30gZnJvbSBcIi4vZW52aXJvbm1lbnQvb3B0aW9uc1wiO1xuaW1wb3J0IHtTM05lc3R9IGZyb20gXCIuL25lc3QvczNOZXN0XCI7XG5cbi8qKlxuICogRXhwb3NlIGBBbnRmYXJtYC5cbiAqL1xuZXhwb3J0IGNsYXNzIEFudGZhcm0ge1xuXG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuXG4gICAgLyoqXG4gICAgICogQW50ZmFybSBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBvcHRpb25zICAgQW50ZmFybSBvcHRpb25zXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucz86IEFudGZhcm1PcHRpb25zKSB7XG4gICAgICAgIHRoaXMuZSA9IG5ldyBFbnZpcm9ubWVudChvcHRpb25zKTtcbiAgICAgICAgdGhpcy5lLmxvZygxLCBcIlN0YXJ0ZWQgYW50ZmFybVwiLCB0aGlzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdmVyc2lvbigpIHtcbiAgICAgICAgcmV0dXJuIFwiMC4wLjFcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGYWN0b3J5IG1ldGhvZCB3aGljaCByZXR1cm5zIGEgVHVubmVsLlxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHJldHVybnMge1R1bm5lbH1cbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlVHVubmVsKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdW5uZWwodGhpcy5lLCBuYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGYWN0b3J5IG1ldGhvZCB3aGljaCByZXR1cm5zIGEgRm9sZGVyTmVzdC5cbiAgICAgKiBAcGFyYW0gcGF0aCAgICAgICAgICBQYXRoIG9mIHRoZSBmb2xkZXIuXG4gICAgICogQHBhcmFtIGFsbG93Q3JlYXRlICAgT3B0aW9uYWwgYm9vbGVhbiBmbGFnIHRvIGFsbG93IGNyZWF0aW9uIG9mIGZvbGRlciBpZiBpdCBkb2VzIG5vdCBleGlzdC5cbiAgICAgKiBAcmV0dXJucyB7Rm9sZGVyTmVzdH1cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIHZhciBvdXRfZm9sZGVyID0gYWYuY3JlYXRlRm9sZGVyTmVzdChcIi9Vc2Vycy9kb21pbmljay9EZXNrdG9wL015IEZvbGRlci9cIik7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgLy8gcHVibGljIGNyZWF0ZUZvbGRlck5lc3QocGF0aD86IHN0cmluZywgYWxsb3dDcmVhdGUgPSBmYWxzZSkge1xuICAgIC8vICAgICByZXR1cm4gbmV3IEZvbGRlck5lc3QodGhpcy5lLCBwYXRoLCBhbGxvd0NyZWF0ZSk7XG4gICAgLy8gfSBcblxuICAgIC8qKlxuICAgICAqIEZhY3RvcnkgbWV0aG9kIHdoaWNoIHJldHVybnMgYW4gQXV0b0ZvbGRlck5lc3QuIElmIHRoZSBhdXRvIG1hbmFnZWQgZGlyZWN0b3J5IGRvZXMgbm90IGV4aXN0LCBpdCBpcyBjcmVhdGVkLlxuICAgICAqIEBwYXJhbSBoaWVyYXJjaHkgICAgIFBhdGggb2YgdGhlIGZvbGRlciBhcyBhIHN0cmluZyBvciBhbiBhcnJheSBvZiBzdHJpbmdzIGFzIHBhdGggc2VnbWVudHMuXG4gICAgICogQHJldHVybnMge0F1dG9Gb2xkZXJOZXN0fVxuICAgICAqXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChcIm91dGZvbGRlclwiKVxuICAgICAqIC8vIC9Vc2Vycy9kb21pbmljay9NeSBBdXRvbWFuYWdlZCBEaXJlY3Rvcnkvb3V0Zm9sZGVyXG4gICAgICogYGBgXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChbXCJwcm9vZmluZ1wiLCBcIm90aGVyc1wiXSlcbiAgICAgKiAvLyAvVXNlcnMvZG9taW5pY2svTXkgQXV0b21hbmFnZWQgRGlyZWN0b3J5L3Byb29maW5nL290aGVyc1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBjcmVhdGVBdXRvRm9sZGVyTmVzdChoaWVyYXJjaHk6IHN0cmluZ3xzdHJpbmdbXSkge1xuICAgICAgICByZXR1cm4gbmV3IEF1dG9Gb2xkZXJOZXN0KHRoaXMuZSwgaGllcmFyY2h5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGYWN0b3J5IG1ldGhvZCB3aGljaCByZXR1cm5zIGFuIEZ0cE5lc3QuXG4gICAgICogQHBhcmFtIGhvc3QgICAgICAgICAgSG9zdG5hbWUgb3IgSVAgYWRkcmVzcyBvZiB0aGUgRlRQIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gcG9ydCAgICAgICAgICBQb3J0IG51bWJlciBvZiB0aGUgRlRQIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gdXNlcm5hbWUgICAgICBGVFAgYWNjb3VudCB1c2VybmFtZS5cbiAgICAgKiBAcGFyYW0gcGFzc3dvcmQgICAgICBGVFAgYWNjb3VudCBwYXNzd29yZC5cbiAgICAgKiBAcGFyYW0gY2hlY2tFdmVyeSAgICBGcmVxdWVuY3kgb2YgcmUtY2hlY2tpbmcgRlRQIGluIG1pbnV0ZXMuXG4gICAgICogQHJldHVybnMge0Z0cE5lc3R9XG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiAvLyBDaGVjayBGVFAgZGlyZWN0b3J5IGV2ZXJ5IDIgbWludXRlc1xuICAgICAqIHZhciBteV9mdHAgPSBhZi5jcmVhdGVGdHBOZXN0KFwiZnRwLmV4YW1wbGUuY29tXCIsIDIxLCBcIlwiLCBcIlwiLCAyKTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlRnRwTmVzdChob3N0OiBzdHJpbmcsIHBvcnQgPSAyMSwgdXNlcm5hbWUgPSBcIlwiLCBwYXNzd29yZCA9IFwiXCIsIGNoZWNrRXZlcnkgPSAxMCkge1xuICAgICAgICByZXR1cm4gbmV3IEZ0cE5lc3QodGhpcy5lLCBob3N0LCBwb3J0LCB1c2VybmFtZSwgcGFzc3dvcmQsIGNoZWNrRXZlcnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZhY3RvcnkgbWV0aG9kIHRvIGNyZWF0ZSBhbmQgcmV0dXJuIGFuIFMzIG5lc3QuXG4gICAgICogQHBhcmFtIGJ1Y2tldFxuICAgICAqIEBwYXJhbSBrZXlQcmVmaXhcbiAgICAgKiBAcGFyYW0gY2hlY2tFdmVyeVxuICAgICAqIEBwYXJhbSBhbGxvd0NyZWF0aW9uXG4gICAgICogQHJldHVybnMge1MzTmVzdH1cbiAgICAgKiBgYGBqc1xuICAgICAqIHZhciBidWNrZXQgPSBhZi5jcmVhdGVTM05lc3QoXCJteS1idWNrZXQtbmFtZVwiLCBcIlwiLCAxLCB0cnVlKTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlUzNOZXN0KGJ1Y2tldDogc3RyaW5nLCBrZXlQcmVmaXg/OiBzdHJpbmcsIGNoZWNrRXZlcnk6IG51bWJlciA9IDUsIGFsbG93Q3JlYXRpb246IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gbmV3IFMzTmVzdCh0aGlzLmUsIGJ1Y2tldCwga2V5UHJlZml4LCBjaGVja0V2ZXJ5LCBhbGxvd0NyZWF0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGYWN0b3J5IG1ldGhvZCB3aGljaCByZXR1cm5zIGEgV2ViaG9va05lc3QuXG4gICAgICogQHBhcmFtIHBhdGggICAgICAgICAgICAgIFRoZSBwYXRoIHdoaWNoIGlzIGdlbmVyYXRlZCBpbiB0aGUgd2ViaG9vaydzIHJvdXRlLiBZb3UgY2FuIHN1cHBseSBhIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzLlxuICAgICAqIEBwYXJhbSBodHRwTWV0aG9kICAgICAgICBIVFRQIG1ldGhvZCBmb3IgdGhpcyB3ZWJob29rLiBDaG9vc2UgXCJhbGxcIiBmb3IgYW55IEhUVFAgbWV0aG9kLlxuICAgICAqIEBwYXJhbSBoYW5kbGVSZXF1ZXN0ICAgICBPcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0byBoYW5kbGUgdGhlIHJlcXVlc3QsIGZvciBzZW5kaW5nIGEgY3VzdG9tIHJlc3BvbnNlLlxuICAgICAqIEByZXR1cm5zIHtXZWJob29rTmVzdH1cbiAgICAgKlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogdmFyIHdlYmhvb2sgPSBhZi5jcmVhdGVXZWJob29rTmVzdChbXCJwcm9vZlwiLCBcImNyZWF0ZVwiXSwgXCJwb3N0XCIpO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogIyMjIyBFeGFtcGxlIHJldHVybmluZyBjdXN0b20gcmVzcG9uc2VcbiAgICAgKiBgYGBqc1xuICAgICAqIHZhciB3ZWJob29rID0gYWYuY3JlYXRlV2ViaG9va05lc3QoW1wicHJvb2ZcIiwgXCJjcmVhdGVcIl0sIFwicG9zdFwiLCBmdW5jdGlvbihyZXEsIHJlcywgam9iLCBuZXN0KXtcbiAgICAgKiAgICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIik7XG4gICAgICogICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAqICAgICAgICAgIGpvYl9uYW1lOiBqb2IuZ2V0TmFtZSgpLFxuICAgICAqICAgICAgICAgIGpvYl9pZDogam9iLmdldElkKCksXG4gICAgICogICAgICAgICAgbWVzc2FnZTogXCJQcm9vZiBjcmVhdGVkIVwiXG4gICAgICogICAgIH0pKTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlV2ViaG9va05lc3QocGF0aDogc3RyaW5nfHN0cmluZ1tdLCBodHRwTWV0aG9kID0gXCJhbGxcIiwgaGFuZGxlUmVxdWVzdD86IGFueSkge1xuICAgICAgICByZXR1cm4gbmV3IFdlYmhvb2tOZXN0KHRoaXMuZSwgcGF0aCwgaHR0cE1ldGhvZCwgaGFuZGxlUmVxdWVzdCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBhbiBlbnRpcmUgZGlyZWN0b3J5IG9mIHdvcmtmbG93IG1vZHVsZXMuXG4gICAgICogQHBhcmFtIGRpcmVjdG9yeSAgICAgUGF0aCB0byB0aGUgd29ya2Zsb3cgbW9kdWxlcy5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIGFmLmxvYWREaXIoXCIuL3dvcmtmbG93c1wiKTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgbG9hZERpcihkaXJlY3Rvcnk6IHN0cmluZykge1xuICAgICAgICBsZXQgYWYgPSB0aGlzO1xuICAgICAgICBsZXQgd29ya2Zsb3dzID0gcmVxdWlyZShcInJlcXVpcmUtZGlyLWFsbFwiKShkaXJlY3RvcnksIHtcbiAgICAgICAgICAgIF9wYXJlbnRzVG9Ta2lwOiAxLFxuICAgICAgICAgICAgaW5kZXhBc1BhcmVudDogdHJ1ZSxcbiAgICAgICAgICAgIHRocm93Tm9EaXI6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBsb2FkZWRfY291bnRlciA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgd29ya2Zsb3cgaW4gd29ya2Zsb3dzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG5ldyB3b3JrZmxvd3Nbd29ya2Zsb3ddKGFmKTtcbiAgICAgICAgICAgICAgICBsb2FkZWRfY291bnRlcisrO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGFmLmUubG9nKDMsIGBDb3VsZG4ndCBsb2FkIHdvcmtmbG93IG1vZHVsZSBcIiR7d29ya2Zsb3d9XCIuICR7ZX1gLCBhZik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhZi5lLmxvZygxLCBgTG9hZGVkICR7bG9hZGVkX2NvdW50ZXJ9IHdvcmtmbG93cy5gLCBhZik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9nIG1lc3NhZ2VzIGludG8gdGhlIGFudGZhcm0gbG9nZ2VyLlxuICAgICAqIEBwYXJhbSB0eXBlIHtudW1iZXJ9ICAgICAgICAgVGhlIGxvZyBsZXZlbC4gMCA9IGRlYnVnLCAxID0gaW5mbywgMiA9IHdhcm5pbmcsIDMgPSBlcnJvclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIHtzdHJpbmd9ICAgICAgIExvZyBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSBhY3RvciAge2FueX0gICAgICAgICAgIEluc3RhbmNlIHdoaWNoIHRyaWdnZXJzIHRoZSBhY3Rpb24gYmVpbmcgbG9nZ2VkLlxuICAgICAqIEBwYXJhbSBpbnN0YW5jZXMge2FueVtdfSAgICAgIEFycmF5IG9mIG9mIG90aGVyIGludm9sdmVkIGluc3RhbmNlcy5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5lLmxvZygxLCBgVHJhbnNmZXJyZWQgdG8gVHVubmVsIFwiJHt0dW5uZWwuZ2V0TmFtZSgpfVwiLmAsIGpvYiwgW29sZFR1bm5lbF0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBsb2codHlwZTogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcsIGFjdG9yPzogYW55LCBpbnN0YW5jZXMgPSBbXSkge1xuICAgICAgICBsZXQgYWYgPSB0aGlzO1xuICAgICAgICBhZi5lLmxvZyh0eXBlLCBtZXNzYWdlLCBhY3RvciwgaW5zdGFuY2VzKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQW50ZmFybTsiXX0=
