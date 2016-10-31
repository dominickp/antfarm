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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFFO1lBQ2xELGNBQWMsRUFBRSxDQUFDO1lBQ2pCLGFBQWEsRUFBRSxJQUFJO1lBQ25CLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztRQUV2QixHQUFHLENBQUMsQ0FBQyxJQUFJLFFBQVEsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQztnQkFDRCxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDNUIsY0FBYyxFQUFFLENBQUM7WUFDckIsQ0FBRTtZQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLHFDQUFrQyxRQUFRLFlBQU0sQ0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLENBQUM7UUFDTCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFlBQVUsY0FBYyxnQkFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0kscUJBQUcsR0FBVixVQUFXLElBQVksRUFBRSxPQUFlLEVBQUUsS0FBVyxFQUFFLFNBQWM7UUFBZCx5QkFBYyxHQUFkLGNBQWM7UUFDakUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUNMLGNBQUM7QUFBRCxDQXJLQSxBQXFLQyxJQUFBO0FBcktZLGVBQU8sVUFxS25CLENBQUE7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyIsImZpbGUiOiJsaWIvYW50ZmFybS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0dW5uZWwgPSByZXF1aXJlKFwiLi90dW5uZWwvdHVubmVsXCIpO1xuaW1wb3J0IG5lc3QgPSByZXF1aXJlKFwiLi9uZXN0L25lc3RcIik7XG5pbXBvcnQgZm9sZGVyTmVzdCA9IHJlcXVpcmUoXCIuL25lc3QvZm9sZGVyTmVzdFwiKTtcbmltcG9ydCBqb2IgPSByZXF1aXJlKFwiLi9qb2Ivam9iXCIpO1xuaW1wb3J0IHtUdW5uZWx9IGZyb20gXCIuL3R1bm5lbC90dW5uZWxcIjtcbmltcG9ydCB7RnRwTmVzdH0gZnJvbSBcIi4vbmVzdC9mdHBOZXN0XCI7XG5pbXBvcnQge0ZvbGRlck5lc3R9IGZyb20gXCIuL25lc3QvZm9sZGVyTmVzdFwiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4vZW52aXJvbm1lbnQvZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7V2ViaG9va05lc3R9IGZyb20gXCIuL25lc3Qvd2ViaG9va05lc3RcIjtcbmltcG9ydCB7QXV0b0ZvbGRlck5lc3R9IGZyb20gXCIuL25lc3QvYXV0b0ZvbGRlck5lc3RcIjtcbmltcG9ydCB7QW50ZmFybU9wdGlvbnN9IGZyb20gXCIuL2Vudmlyb25tZW50L29wdGlvbnNcIjtcbmltcG9ydCB7UzNOZXN0fSBmcm9tIFwiLi9uZXN0L3MzTmVzdFwiO1xuXG4vKipcbiAqIEV4cG9zZSBgQW50ZmFybWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbnRmYXJtIHtcblxuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcblxuICAgIC8qKlxuICAgICAqIEFudGZhcm0gY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyAgIEFudGZhcm0gb3B0aW9uc1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBBbnRmYXJtT3B0aW9ucykge1xuICAgICAgICB0aGlzLmUgPSBuZXcgRW52aXJvbm1lbnQob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZS5sb2coMSwgXCJTdGFydGVkIGFudGZhcm1cIiwgdGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIHZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiBcIjAuMC4xXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmFjdG9yeSBtZXRob2Qgd2hpY2ggcmV0dXJucyBhIFR1bm5lbC5cbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEByZXR1cm5zIHtUdW5uZWx9XG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZVR1bm5lbChuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVubmVsKHRoaXMuZSwgbmFtZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmFjdG9yeSBtZXRob2Qgd2hpY2ggcmV0dXJucyBhIEZvbGRlck5lc3QuXG4gICAgICogQHBhcmFtIHBhdGggICAgICAgICAgUGF0aCBvZiB0aGUgZm9sZGVyLlxuICAgICAqIEBwYXJhbSBhbGxvd0NyZWF0ZSAgIE9wdGlvbmFsIGJvb2xlYW4gZmxhZyB0byBhbGxvdyBjcmVhdGlvbiBvZiBmb2xkZXIgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAgICogQHJldHVybnMge0ZvbGRlck5lc3R9XG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiB2YXIgb3V0X2ZvbGRlciA9IGFmLmNyZWF0ZUZvbGRlck5lc3QoXCIvVXNlcnMvZG9taW5pY2svRGVza3RvcC9NeSBGb2xkZXIvXCIpO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBjcmVhdGVGb2xkZXJOZXN0KHBhdGg/OiBzdHJpbmcsIGFsbG93Q3JlYXRlID0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGb2xkZXJOZXN0KHRoaXMuZSwgcGF0aCwgYWxsb3dDcmVhdGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZhY3RvcnkgbWV0aG9kIHdoaWNoIHJldHVybnMgYW4gQXV0b0ZvbGRlck5lc3QuIElmIHRoZSBhdXRvIG1hbmFnZWQgZGlyZWN0b3J5IGRvZXMgbm90IGV4aXN0LCBpdCBpcyBjcmVhdGVkLlxuICAgICAqIEBwYXJhbSBoaWVyYXJjaHkgICAgIFBhdGggb2YgdGhlIGZvbGRlciBhcyBhIHN0cmluZyBvciBhbiBhcnJheSBvZiBzdHJpbmdzIGFzIF9wYXRoIHNlZ21lbnRzLlxuICAgICAqIEByZXR1cm5zIHtBdXRvRm9sZGVyTmVzdH1cbiAgICAgKlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogYWYuY3JlYXRlQXV0b0ZvbGRlck5lc3QoXCJvdXRmb2xkZXJcIilcbiAgICAgKiAvLyAvVXNlcnMvZG9taW5pY2svTXkgQXV0b21hbmFnZWQgRGlyZWN0b3J5L291dGZvbGRlclxuICAgICAqIGBgYFxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogYWYuY3JlYXRlQXV0b0ZvbGRlck5lc3QoW1wicHJvb2ZpbmdcIiwgXCJvdGhlcnNcIl0pXG4gICAgICogLy8gL1VzZXJzL2RvbWluaWNrL015IEF1dG9tYW5hZ2VkIERpcmVjdG9yeS9wcm9vZmluZy9vdGhlcnNcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlQXV0b0ZvbGRlck5lc3QoaGllcmFyY2h5OiBzdHJpbmd8c3RyaW5nW10pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBdXRvRm9sZGVyTmVzdCh0aGlzLmUsIGhpZXJhcmNoeSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmFjdG9yeSBtZXRob2Qgd2hpY2ggcmV0dXJucyBhbiBGdHBOZXN0LlxuICAgICAqIEBwYXJhbSBob3N0ICAgICAgICAgIEhvc3RuYW1lIG9yIElQIGFkZHJlc3Mgb2YgdGhlIEZUUCBzZXJ2ZXIuXG4gICAgICogQHBhcmFtIHBvcnQgICAgICAgICAgUG9ydCBudW1iZXIgb2YgdGhlIEZUUCBzZXJ2ZXIuXG4gICAgICogQHBhcmFtIHVzZXJuYW1lICAgICAgRlRQIGFjY291bnQgdXNlcm5hbWUuXG4gICAgICogQHBhcmFtIHBhc3N3b3JkICAgICAgRlRQIGFjY291bnQgcGFzc3dvcmQuXG4gICAgICogQHBhcmFtIGNoZWNrRXZlcnkgICAgRnJlcXVlbmN5IG9mIHJlLWNoZWNraW5nIEZUUCBpbiBtaW51dGVzLlxuICAgICAqIEByZXR1cm5zIHtGdHBOZXN0fVxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogLy8gQ2hlY2sgRlRQIGRpcmVjdG9yeSBldmVyeSAyIG1pbnV0ZXNcbiAgICAgKiB2YXIgbXlfZnRwID0gYWYuY3JlYXRlRnRwTmVzdChcImZ0cC5leGFtcGxlLmNvbVwiLCAyMSwgXCJcIiwgXCJcIiwgMik7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZUZ0cE5lc3QoaG9zdDogc3RyaW5nLCBwb3J0ID0gMjEsIHVzZXJuYW1lID0gXCJcIiwgcGFzc3dvcmQgPSBcIlwiLCBjaGVja0V2ZXJ5ID0gMTApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGdHBOZXN0KHRoaXMuZSwgaG9zdCwgcG9ydCwgdXNlcm5hbWUsIHBhc3N3b3JkLCBjaGVja0V2ZXJ5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGYWN0b3J5IG1ldGhvZCB0byBjcmVhdGUgYW5kIHJldHVybiBhbiBTMyBuZXN0LlxuICAgICAqIEBwYXJhbSBidWNrZXRcbiAgICAgKiBAcGFyYW0ga2V5UHJlZml4XG4gICAgICogQHBhcmFtIGNoZWNrRXZlcnlcbiAgICAgKiBAcGFyYW0gYWxsb3dDcmVhdGlvblxuICAgICAqIEByZXR1cm5zIHtTM05lc3R9XG4gICAgICogYGBganNcbiAgICAgKiB2YXIgYnVja2V0ID0gYWYuY3JlYXRlUzNOZXN0KFwibXktYnVja2V0LV9uYW1lXCIsIFwiXCIsIDEsIHRydWUpO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBjcmVhdGVTM05lc3QoYnVja2V0OiBzdHJpbmcsIGtleVByZWZpeD86IHN0cmluZywgY2hlY2tFdmVyeTogbnVtYmVyID0gNSwgYWxsb3dDcmVhdGlvbjogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUzNOZXN0KHRoaXMuZSwgYnVja2V0LCBrZXlQcmVmaXgsIGNoZWNrRXZlcnksIGFsbG93Q3JlYXRpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZhY3RvcnkgbWV0aG9kIHdoaWNoIHJldHVybnMgYSBXZWJob29rTmVzdC5cbiAgICAgKiBAcGFyYW0gcGF0aCAgICAgICAgICAgICAgVGhlIF9wYXRoIHdoaWNoIGlzIGdlbmVyYXRlZCBpbiB0aGUgd2ViaG9vaydzIHJvdXRlLiBZb3UgY2FuIHN1cHBseSBhIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzLlxuICAgICAqIEBwYXJhbSBodHRwTWV0aG9kICAgICAgICBIVFRQIG1ldGhvZCBmb3IgdGhpcyB3ZWJob29rLiBDaG9vc2UgXCJhbGxcIiBmb3IgYW55IEhUVFAgbWV0aG9kLlxuICAgICAqIEBwYXJhbSBoYW5kbGVSZXF1ZXN0ICAgICBPcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0byBoYW5kbGUgdGhlIHJlcXVlc3QsIGZvciBzZW5kaW5nIGEgY3VzdG9tIHJlc3BvbnNlLlxuICAgICAqIEByZXR1cm5zIHtXZWJob29rTmVzdH1cbiAgICAgKlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogdmFyIHdlYmhvb2sgPSBhZi5jcmVhdGVXZWJob29rTmVzdChbXCJwcm9vZlwiLCBcImNyZWF0ZVwiXSwgXCJwb3N0XCIpO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogIyMjIyBFeGFtcGxlIHJldHVybmluZyBjdXN0b20gcmVzcG9uc2VcbiAgICAgKiBgYGBqc1xuICAgICAqIHZhciB3ZWJob29rID0gYWYuY3JlYXRlV2ViaG9va05lc3QoW1wicHJvb2ZcIiwgXCJjcmVhdGVcIl0sIFwicG9zdFwiLCBmdW5jdGlvbihyZXEsIHJlcywgam9iLCBuZXN0KXtcbiAgICAgKiAgICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIik7XG4gICAgICogICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAqICAgICAgICAgIGpvYl9uYW1lOiBqb2IuZ2V0TmFtZSgpLFxuICAgICAqICAgICAgICAgIGpvYl9pZDogam9iLmdldElkKCksXG4gICAgICogICAgICAgICAgbWVzc2FnZTogXCJQcm9vZiBjcmVhdGVkIVwiXG4gICAgICogICAgIH0pKTtcbiAgICAgKiB9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlV2ViaG9va05lc3QocGF0aDogc3RyaW5nfHN0cmluZ1tdLCBodHRwTWV0aG9kID0gXCJhbGxcIiwgaGFuZGxlUmVxdWVzdD86IGFueSkge1xuICAgICAgICByZXR1cm4gbmV3IFdlYmhvb2tOZXN0KHRoaXMuZSwgcGF0aCwgaHR0cE1ldGhvZCwgaGFuZGxlUmVxdWVzdCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBhbiBlbnRpcmUgZGlyZWN0b3J5IG9mIHdvcmtmbG93IG1vZHVsZXMuXG4gICAgICogQHBhcmFtIGRpcmVjdG9yeSAgICAgUGF0aCB0byB0aGUgd29ya2Zsb3cgbW9kdWxlcy5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIGFmLmxvYWREaXIoXCIuL3dvcmtmbG93c1wiKTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgbG9hZERpcihkaXJlY3Rvcnk6IHN0cmluZykge1xuICAgICAgICBsZXQgYWYgPSB0aGlzO1xuICAgICAgICBsZXQgd29ya2Zsb3dzID0gcmVxdWlyZShcInJlcXVpcmUtZGlyLWFsbFwiKShkaXJlY3RvcnksIHtcbiAgICAgICAgICAgIF9wYXJlbnRzVG9Ta2lwOiAxLFxuICAgICAgICAgICAgaW5kZXhBc1BhcmVudDogdHJ1ZSxcbiAgICAgICAgICAgIHRocm93Tm9EaXI6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBsb2FkZWRfY291bnRlciA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgd29ya2Zsb3cgaW4gd29ya2Zsb3dzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG5ldyB3b3JrZmxvd3Nbd29ya2Zsb3ddKGFmKTtcbiAgICAgICAgICAgICAgICBsb2FkZWRfY291bnRlcisrO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGFmLmUubG9nKDMsIGBDb3VsZG4ndCBsb2FkIHdvcmtmbG93IG1vZHVsZSBcIiR7d29ya2Zsb3d9XCIuICR7ZX1gLCBhZik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhZi5lLmxvZygxLCBgTG9hZGVkICR7bG9hZGVkX2NvdW50ZXJ9IHdvcmtmbG93cy5gLCBhZik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9nIG1lc3NhZ2VzIGludG8gdGhlIGFudGZhcm0gbG9nZ2VyLlxuICAgICAqIEBwYXJhbSB0eXBlIHtudW1iZXJ9ICAgICAgICAgVGhlIGxvZyBsZXZlbC4gMCA9IGRlYnVnLCAxID0gaW5mbywgMiA9IHdhcm5pbmcsIDMgPSBlcnJvclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIHtzdHJpbmd9ICAgICAgIExvZyBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSBhY3RvciAge2FueX0gICAgICAgICAgIEluc3RhbmNlIHdoaWNoIHRyaWdnZXJzIHRoZSBhY3Rpb24gYmVpbmcgbG9nZ2VkLlxuICAgICAqIEBwYXJhbSBpbnN0YW5jZXMge2FueVtdfSAgICAgIEFycmF5IG9mIG9mIG90aGVyIGludm9sdmVkIGluc3RhbmNlcy5cbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKiBgYGBqc1xuICAgICAqIGpvYi5lLmxvZygxLCBgVHJhbnNmZXJyZWQgdG8gVHVubmVsIFwiJHt0dW5uZWwuZ2V0TmFtZSgpfVwiLmAsIGpvYiwgW29sZFR1bm5lbF0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBsb2codHlwZTogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcsIGFjdG9yPzogYW55LCBpbnN0YW5jZXMgPSBbXSkge1xuICAgICAgICBsZXQgYWYgPSB0aGlzO1xuICAgICAgICBhZi5lLmxvZyh0eXBlLCBtZXNzYWdlLCBhY3RvciwgaW5zdGFuY2VzKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQW50ZmFybTsiXX0=
