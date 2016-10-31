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
    Antfarm.prototype.createFolderNest = function (path, allowCreate) {
        if (allowCreate === void 0) { allowCreate = false; }
        return new folderNest_1.FolderNest(this.e, path, allowCreate);
    };
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFFO1lBQ2xELGNBQWMsRUFBRSxDQUFDO1lBQ2pCLGFBQWEsRUFBRSxJQUFJO1lBQ25CLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztRQUV2QixHQUFHLENBQUMsQ0FBQyxJQUFJLFFBQVEsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQztnQkFDRCxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDNUIsY0FBYyxFQUFFLENBQUM7WUFDckIsQ0FBRTtZQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLHFDQUFrQyxRQUFRLFlBQU0sQ0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLENBQUM7UUFDTCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFlBQVUsY0FBYyxnQkFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0kscUJBQUcsR0FBVixVQUFXLElBQVksRUFBRSxPQUFlLEVBQUUsS0FBVyxFQUFFLFNBQWM7UUFBZCx5QkFBYyxHQUFkLGNBQWM7UUFDakUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUNMLGNBQUM7QUFBRCxDQXJLQSxBQXFLQyxJQUFBO0FBcktZLGVBQU8sVUFxS25CLENBQUE7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyIsImZpbGUiOiJsaWIvYW50ZmFybS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0dW5uZWwgPSByZXF1aXJlKFwiLi90dW5uZWwvdHVubmVsXCIpO1xuaW1wb3J0IG5lc3QgPSByZXF1aXJlKFwiLi9uZXN0L25lc3RcIik7XG5pbXBvcnQgZm9sZGVyTmVzdCA9IHJlcXVpcmUoXCIuL25lc3QvZm9sZGVyTmVzdFwiKTtcbmltcG9ydCBqb2IgPSByZXF1aXJlKFwiLi9qb2Ivam9iXCIpO1xuaW1wb3J0IHtUdW5uZWx9IGZyb20gXCIuL3R1bm5lbC90dW5uZWxcIjtcbmltcG9ydCB7RnRwTmVzdH0gZnJvbSBcIi4vbmVzdC9mdHBOZXN0XCI7XG5pbXBvcnQge0ZvbGRlck5lc3R9IGZyb20gXCIuL25lc3QvZm9sZGVyTmVzdFwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7V2ViaG9va05lc3R9IGZyb20gXCIuL25lc3Qvd2ViaG9va05lc3RcIjtcbmltcG9ydCB7QXV0b0ZvbGRlck5lc3R9IGZyb20gXCIuL25lc3QvYXV0b0ZvbGRlck5lc3RcIjtcbmltcG9ydCB7QW50ZmFybU9wdGlvbnN9IGZyb20gXCIuL2Vudmlyb25tZW50L29wdGlvbnNcIjtcbmltcG9ydCB7UzNOZXN0fSBmcm9tIFwiLi9uZXN0L3MzTmVzdFwiO1xuXG4vKipcbiAqIEV4cG9zZSBgQW50ZmFybWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbnRmYXJtIHtcblxuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcblxuICAgIC8qKlxuICAgICAqIEFudGZhcm0gY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyAgIEFudGZhcm0gb3B0aW9uc1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBBbnRmYXJtT3B0aW9ucykge1xuICAgICAgICB0aGlzLmUgPSBuZXcgRW52aXJvbm1lbnQob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZS5sb2coMSwgXCJTdGFydGVkIGFudGZhcm1cIiwgdGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIHZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiBcIjAuMC4xXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmFjdG9yeSBtZXRob2Qgd2hpY2ggcmV0dXJucyBhIFR1bm5lbC5cbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtUdW5uZWx9XG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZVR1bm5lbChuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVubmVsKHRoaXMuZSwgbmFtZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmFjdG9yeSBtZXRob2Qgd2hpY2ggcmV0dXJucyBhIEZvbGRlck5lc3QuXG4gICAgICogQHBhcmFtIHBhdGggICAgICAgICAgUGF0aCBvZiB0aGUgZm9sZGVyLlxuICAgICAqIEBwYXJhbSBhbGxvd0NyZWF0ZSAgIE9wdGlvbmFsIGJvb2xlYW4gZmxhZyB0byBhbGxvdyBjcmVhdGlvbiBvZiBmb2xkZXIgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAgICogQHJldHVybnMge0ZvbGRlck5lc3R9XG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiB2YXIgb3V0X2ZvbGRlciA9IGFmLmNyZWF0ZUZvbGRlck5lc3QoXCIvVXNlcnMvZG9taW5pY2svRGVza3RvcC9NeSBGb2xkZXIvXCIpO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBjcmVhdGVGb2xkZXJOZXN0KHBhdGg/OiBzdHJpbmcsIGFsbG93Q3JlYXRlID0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGb2xkZXJOZXN0KHRoaXMuZSwgcGF0aCwgYWxsb3dDcmVhdGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZhY3RvcnkgbWV0aG9kIHdoaWNoIHJldHVybnMgYW4gQXV0b0ZvbGRlck5lc3QuIElmIHRoZSBhdXRvIG1hbmFnZWQgZGlyZWN0b3J5IGRvZXMgbm90IGV4aXN0LCBpdCBpcyBjcmVhdGVkLlxuICAgICAqIEBwYXJhbSBoaWVyYXJjaHkgICAgIFBhdGggb2YgdGhlIGZvbGRlciBhcyBhIHN0cmluZyBvciBhbiBhcnJheSBvZiBzdHJpbmdzIGFzIHBhdGggc2VnbWVudHMuXG4gICAgICogQHJldHVybnMge0F1dG9Gb2xkZXJOZXN0fVxuICAgICAqXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChcIm91dGZvbGRlclwiKVxuICAgICAqIC8vIC9Vc2Vycy9kb21pbmljay9NeSBBdXRvbWFuYWdlZCBEaXJlY3Rvcnkvb3V0Zm9sZGVyXG4gICAgICogYGBgXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBhZi5jcmVhdGVBdXRvRm9sZGVyTmVzdChbXCJwcm9vZmluZ1wiLCBcIm90aGVyc1wiXSlcbiAgICAgKiAvLyAvVXNlcnMvZG9taW5pY2svTXkgQXV0b21hbmFnZWQgRGlyZWN0b3J5L3Byb29maW5nL290aGVyc1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBjcmVhdGVBdXRvRm9sZGVyTmVzdChoaWVyYXJjaHk6IHN0cmluZ3xzdHJpbmdbXSkge1xuICAgICAgICByZXR1cm4gbmV3IEF1dG9Gb2xkZXJOZXN0KHRoaXMuZSwgaGllcmFyY2h5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGYWN0b3J5IG1ldGhvZCB3aGljaCByZXR1cm5zIGFuIEZ0cE5lc3QuXG4gICAgICogQHBhcmFtIGhvc3QgICAgICAgICAgSG9zdG5hbWUgb3IgSVAgYWRkcmVzcyBvZiB0aGUgRlRQIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gcG9ydCAgICAgICAgICBQb3J0IG51bWJlciBvZiB0aGUgRlRQIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gdXNlcm5hbWUgICAgICBGVFAgYWNjb3VudCB1c2VybmFtZS5cbiAgICAgKiBAcGFyYW0gcGFzc3dvcmQgICAgICBGVFAgYWNjb3VudCBwYXNzd29yZC5cbiAgICAgKiBAcGFyYW0gY2hlY2tFdmVyeSAgICBGcmVxdWVuY3kgb2YgcmUtY2hlY2tpbmcgRlRQIGluIG1pbnV0ZXMuXG4gICAgICogQHJldHVybnMge0Z0cE5lc3R9XG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiAvLyBDaGVjayBGVFAgZGlyZWN0b3J5IGV2ZXJ5IDIgbWludXRlc1xuICAgICAqIHZhciBteV9mdHAgPSBhZi5jcmVhdGVGdHBOZXN0KFwiZnRwLmV4YW1wbGUuY29tXCIsIDIxLCBcIlwiLCBcIlwiLCAyKTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlRnRwTmVzdChob3N0OiBzdHJpbmcsIHBvcnQgPSAyMSwgdXNlcm5hbWUgPSBcIlwiLCBwYXNzd29yZCA9IFwiXCIsIGNoZWNrRXZlcnkgPSAxMCkge1xuICAgICAgICByZXR1cm4gbmV3IEZ0cE5lc3QodGhpcy5lLCBob3N0LCBwb3J0LCB1c2VybmFtZSwgcGFzc3dvcmQsIGNoZWNrRXZlcnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZhY3RvcnkgbWV0aG9kIHRvIGNyZWF0ZSBhbmQgcmV0dXJuIGFuIFMzIG5lc3QuXG4gICAgICogQHBhcmFtIGJ1Y2tldFxuICAgICAqIEBwYXJhbSBrZXlQcmVmaXhcbiAgICAgKiBAcGFyYW0gY2hlY2tFdmVyeVxuICAgICAqIEBwYXJhbSBhbGxvd0NyZWF0aW9uXG4gICAgICogQHJldHVybnMge1MzTmVzdH1cbiAgICAgKiBgYGBqc1xuICAgICAqIHZhciBidWNrZXQgPSBhZi5jcmVhdGVTM05lc3QoXCJteS1idWNrZXQtX25hbWVcIiwgXCJcIiwgMSwgdHJ1ZSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZVMzTmVzdChidWNrZXQ6IHN0cmluZywga2V5UHJlZml4Pzogc3RyaW5nLCBjaGVja0V2ZXJ5OiBudW1iZXIgPSA1LCBhbGxvd0NyZWF0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTM05lc3QodGhpcy5lLCBidWNrZXQsIGtleVByZWZpeCwgY2hlY2tFdmVyeSwgYWxsb3dDcmVhdGlvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmFjdG9yeSBtZXRob2Qgd2hpY2ggcmV0dXJucyBhIFdlYmhvb2tOZXN0LlxuICAgICAqIEBwYXJhbSBwYXRoICAgICAgICAgICAgICBUaGUgcGF0aCB3aGljaCBpcyBnZW5lcmF0ZWQgaW4gdGhlIHdlYmhvb2sncyByb3V0ZS4gWW91IGNhbiBzdXBwbHkgYSBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncy5cbiAgICAgKiBAcGFyYW0gaHR0cE1ldGhvZCAgICAgICAgSFRUUCBtZXRob2QgZm9yIHRoaXMgd2ViaG9vay4gQ2hvb3NlIFwiYWxsXCIgZm9yIGFueSBIVFRQIG1ldGhvZC5cbiAgICAgKiBAcGFyYW0gaGFuZGxlUmVxdWVzdCAgICAgT3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaGFuZGxlIHRoZSByZXF1ZXN0LCBmb3Igc2VuZGluZyBhIGN1c3RvbSByZXNwb25zZS5cbiAgICAgKiBAcmV0dXJucyB7V2ViaG9va05lc3R9XG4gICAgICpcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIHZhciB3ZWJob29rID0gYWYuY3JlYXRlV2ViaG9va05lc3QoW1wicHJvb2ZcIiwgXCJjcmVhdGVcIl0sIFwicG9zdFwiKTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqICMjIyMgRXhhbXBsZSByZXR1cm5pbmcgY3VzdG9tIHJlc3BvbnNlXG4gICAgICogYGBganNcbiAgICAgKiB2YXIgd2ViaG9vayA9IGFmLmNyZWF0ZVdlYmhvb2tOZXN0KFtcInByb29mXCIsIFwiY3JlYXRlXCJdLCBcInBvc3RcIiwgZnVuY3Rpb24ocmVxLCByZXMsIGpvYiwgbmVzdCl7XG4gICAgICogICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIpO1xuICAgICAqICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgKiAgICAgICAgICBqb2JfbmFtZTogam9iLmdldE5hbWUoKSxcbiAgICAgKiAgICAgICAgICBqb2JfaWQ6IGpvYi5nZXRJZCgpLFxuICAgICAqICAgICAgICAgIG1lc3NhZ2U6IFwiUHJvb2YgY3JlYXRlZCFcIlxuICAgICAqICAgICB9KSk7XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZVdlYmhvb2tOZXN0KHBhdGg6IHN0cmluZ3xzdHJpbmdbXSwgaHR0cE1ldGhvZCA9IFwiYWxsXCIsIGhhbmRsZVJlcXVlc3Q/OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBXZWJob29rTmVzdCh0aGlzLmUsIHBhdGgsIGh0dHBNZXRob2QsIGhhbmRsZVJlcXVlc3QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgYW4gZW50aXJlIGRpcmVjdG9yeSBvZiB3b3JrZmxvdyBtb2R1bGVzLlxuICAgICAqIEBwYXJhbSBkaXJlY3RvcnkgICAgIFBhdGggdG8gdGhlIHdvcmtmbG93IG1vZHVsZXMuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBhZi5sb2FkRGlyKFwiLi93b3JrZmxvd3NcIik7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGxvYWREaXIoZGlyZWN0b3J5OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGFmID0gdGhpcztcbiAgICAgICAgbGV0IHdvcmtmbG93cyA9IHJlcXVpcmUoXCJyZXF1aXJlLWRpci1hbGxcIikoZGlyZWN0b3J5LCB7XG4gICAgICAgICAgICBfcGFyZW50c1RvU2tpcDogMSxcbiAgICAgICAgICAgIGluZGV4QXNQYXJlbnQ6IHRydWUsXG4gICAgICAgICAgICB0aHJvd05vRGlyOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgbG9hZGVkX2NvdW50ZXIgPSAwO1xuXG4gICAgICAgIGZvciAobGV0IHdvcmtmbG93IGluIHdvcmtmbG93cykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBuZXcgd29ya2Zsb3dzW3dvcmtmbG93XShhZik7XG4gICAgICAgICAgICAgICAgbG9hZGVkX2NvdW50ZXIrKztcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBhZi5lLmxvZygzLCBgQ291bGRuJ3QgbG9hZCB3b3JrZmxvdyBtb2R1bGUgXCIke3dvcmtmbG93fVwiLiAke2V9YCwgYWYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYWYuZS5sb2coMSwgYExvYWRlZCAke2xvYWRlZF9jb3VudGVyfSB3b3JrZmxvd3MuYCwgYWYpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvZyBtZXNzYWdlcyBpbnRvIHRoZSBhbnRmYXJtIGxvZ2dlci5cbiAgICAgKiBAcGFyYW0gdHlwZSB7bnVtYmVyfSAgICAgICAgIFRoZSBsb2cgbGV2ZWwuIDAgPSBkZWJ1ZywgMSA9IGluZm8sIDIgPSB3YXJuaW5nLCAzID0gZXJyb3JcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSB7c3RyaW5nfSAgICAgICBMb2cgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gYWN0b3IgIHthbnl9ICAgICAgICAgICBJbnN0YW5jZSB3aGljaCB0cmlnZ2VycyB0aGUgYWN0aW9uIGJlaW5nIGxvZ2dlZC5cbiAgICAgKiBAcGFyYW0gaW5zdGFuY2VzIHthbnlbXX0gICAgICBBcnJheSBvZiBvZiBvdGhlciBpbnZvbHZlZCBpbnN0YW5jZXMuXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBqb2IuZS5sb2coMSwgYFRyYW5zZmVycmVkIHRvIFR1bm5lbCBcIiR7dHVubmVsLmdldE5hbWUoKX1cIi5gLCBqb2IsIFtvbGRUdW5uZWxdKTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgbG9nKHR5cGU6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nLCBhY3Rvcj86IGFueSwgaW5zdGFuY2VzID0gW10pIHtcbiAgICAgICAgbGV0IGFmID0gdGhpcztcbiAgICAgICAgYWYuZS5sb2codHlwZSwgbWVzc2FnZSwgYWN0b3IsIGluc3RhbmNlcyk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFudGZhcm07Il19
