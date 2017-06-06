"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webhookJob_1 = require("../job/webhookJob");
var express = require("express");
var cors = require("cors"), multer = require("multer"), path = require("path"), tmp = require("tmp"), async = require("async");
/**
 * Webhook and logging server.
 */
var Server = (function () {
    function Server(e) {
        this.hookRoutes = [];
        this.hookInterfaceRoutes = [];
        this.config = {
            hooks_prefix: "/hooks",
            hooks_ui_prefix: "/hooks-ui",
            log_prefix: "/log"
        };
        /**
         * Handles request and response of the web hook interface.
         * @param im {InterfaceManager}
         * @param req {express.Request}
         * @param res {express.Response}
         * @param customHandler             Custom request handler.
         */
        this.handleHookInterfaceRequest = function (im, req, res, customHandler) {
            var s = this;
            // Job arrive
            var job = new webhookJob_1.WebhookJob(s.e, req, res);
            // Fill in default values
            var params = job.getQueryStringValues();
            // If session not set, return a fresh ui somehow
            var sessionId = params["sessionId"] || job.getFormDataValue("sessionId");
            var ui = im.getInterface(sessionId);
            if (ui.sessionId === sessionId) {
                // Fill in default values
                ui.fields.forEach(function (field) {
                    if (field.id in params && params[field.id] !== "undefined") {
                        field.value = params[field.id];
                    }
                });
                // Do steps
                async.each(ui.steps, function (step, cb) {
                    s.e.log(0, "Running UI step \"" + step.name + "\".", s);
                    step.callback(job, ui, step, function () {
                        cb();
                    });
                }, function (err) {
                    if (err) {
                        s.e.log(3, "Error running UI steps. " + err, s);
                    }
                    else {
                        s.e.log(0, "Done running all UI steps.", s);
                    }
                    if (customHandler) {
                        customHandler(req, res, ui);
                    }
                    else {
                        res.json(ui.getTransportInterface());
                    }
                });
            }
            else {
                if (customHandler) {
                    customHandler(req, res, ui);
                }
                else {
                    res.json(ui.getTransportInterface());
                }
            }
        };
        var s = this;
        s.e = e;
        s.server = express();
        s.createServer();
        // let tmpDir = tmp.dirSync()._name;
        var tmpDir = "./example";
        s.upload = multer({
            destination: tmpDir,
            storage: multer.diskStorage({
                filename: function (req, file, cb) {
                    cb(null, file.fieldname + "-" + Date.now());
                }
            })
        });
    }
    /**
     * Creates the server.
     */
    Server.prototype.createServer = function () {
        var s = this;
        var port = s.e.options.port;
        s.server.use(cors());
        // Add index routes
        s.server.get(s.config.hooks_prefix, function (req, res) {
            res.json(s.hookRoutes);
        });
        s.server.get(s.config.hooks_ui_prefix, function (req, res) {
            res.json(s.hookInterfaceRoutes);
        });
        // Prevent duplicate listening for tests
        // if (!module.parent) {
        //     s.server.listen(port, () => s.e.log(1, `Server up and listening on port ${port}.`, s));
        // }
        s.server.listen(port, function () { return s.e.log(1, "Server up and listening on port " + port + ".", s); })
            .on("error", function (err) {
            s.e.log(3, "Server listen error: \"" + err.message + "\".", s);
        });
    };
    Server.prototype.createLogServer = function (logger) {
        var s = this;
        var options = {
            order: "desc",
            fields: ["message"]
        };
        // Add index routes
        s.server.get(s.config.log_prefix, function (req, res) {
            logger.query(options, function (results) {
                res.json(results);
            });
        });
    };
    /**
     * Log _name
     * @returns {string}
     */
    Server.prototype.toString = function () {
        return "Server";
    };
    /**
     * Adds a webhook to the server.
     * @param nest {WebhookNest}
     */
    Server.prototype.addWebhook = function (nest) {
        var s = this;
        var e = s.e;
        var httpMethod = nest.httpMethod;
        var hook_path = s.config.hooks_prefix + nest.path;
        var hook_ui_path;
        var im = nest.interfaceManager;
        var wi = im.getInterface();
        hook_ui_path = s.config.hooks_ui_prefix + im.path;
        s.e.log(1, "Watching webhook " + httpMethod.toUpperCase() + " " + hook_path, s);
        s.hookRoutes.push({
            id: nest.id,
            path: hook_path,
            nest: nest.name,
            tunnel: nest.tunnel.name,
            method: httpMethod,
            interface_path: hook_ui_path
        });
        s.server[httpMethod](hook_path, s.upload.any(), function (req, res) {
            var customHandler = nest.customHandleRequest;
            s.handleHookRequest(nest, req, res, customHandler);
        });
    };
    /**
     * Handles request and response of the web hook, creates a new job, as well as calling the nest's arrive.
     * @param nest {WebhookNest}
     * @param req {express.Request}
     * @param res {express.Response}
     * @param customHandler     Custom request handler.
     */
    Server.prototype.handleHookRequest = function (nest, req, res, customHandler) {
        var s = this;
        // Job arrive
        var job = new webhookJob_1.WebhookJob(s.e, req, res);
        nest.arrive(job);
        s.sendHookResponse(nest.holdResponse, job, nest, req, res, customHandler);
    };
    ;
    /**
     * Sends the actual hook response.
     * @param holdResponse      Flag to bypass sending now for held responses.
     * @param job               Webhook job
     * @param nest              Webhook nest
     * @param req
     * @param res
     * @param customHandler
     * @param message
     */
    Server.prototype.sendHookResponse = function (holdResponse, job, nest, req, res, customHandler, message) {
        if (holdResponse === true) {
            // do nothing
        }
        else if (customHandler) {
            job.responseSent = true;
            customHandler(req, res, job, nest);
        }
        else {
            job.responseSent = true;
            var response = {
                message: message || "Job " + job.id + " was created!",
                job: {
                    id: job.id,
                    name: job.name
                },
                nest: {
                    name: nest.name
                }
            };
            res.json(response);
        }
    };
    /**
     * Adds a webhook interface to the webhook server.
     * @param im {InterfaceManager}
     */
    Server.prototype.addWebhookInterface = function (im) {
        var s = this;
        var nest = im.nest;
        var hook_path = s.config.hooks_prefix + nest.path;
        var hook_ui_path = s.config.hooks_ui_prefix + im.path;
        s.e.log(1, "Watching webhook interface GET " + hook_ui_path, s);
        this.hookInterfaceRoutes.push({
            id: nest.id,
            path: hook_ui_path,
            nest: nest.name,
            target: hook_path
            // tunnel: nest.getTunnel().name
        });
        s.server.get(hook_ui_path, function (req, res) {
            var customHandler = im.customHandleRequest;
            s.handleHookInterfaceRequest(im, req, res, customHandler);
        });
    };
    return Server;
}());
exports.Server = Server;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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O1FBRWhFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7WUFDMUIsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ1gsSUFBSSxFQUFFLFlBQVk7WUFDbEIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsTUFBTSxFQUFFLFNBQVM7WUFDakIsZ0NBQWdDO1NBQ25DLENBQUMsQ0FBQztRQUVILENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRyxVQUFVLEdBQUcsRUFBRSxHQUFHO1lBRTFDLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztZQUUzQyxDQUFDLENBQUMsMEJBQTBCLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBNERMLGFBQUM7QUFBRCxDQXJRQSxBQXFRQyxJQUFBO0FBclFZLHdCQUFNIiwiZmlsZSI6ImxpYi9lbnZpcm9ubWVudC9zZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi9lbnZpcm9ubWVudFwiO1xyXG5pbXBvcnQge1dlYmhvb2tOZXN0fSBmcm9tIFwiLi4vbmVzdC93ZWJob29rTmVzdFwiO1xyXG5pbXBvcnQge1dlYmhvb2tKb2J9IGZyb20gXCIuLi9qb2Ivd2ViaG9va0pvYlwiO1xyXG5pbXBvcnQgKiBhcyBleHByZXNzIGZyb20gXCJleHByZXNzXCI7XHJcbmltcG9ydCB7SW50ZXJmYWNlTWFuYWdlcn0gZnJvbSBcIi4uL3VpL2ludGVyZmFjZU1hbmFnZXJcIjtcclxuaW1wb3J0IHtMb2dnZXIsIExvZ1F1ZXJ5T3B0aW9uc30gZnJvbSBcIi4vbG9nZ2VyXCI7XHJcbmltcG9ydCB7Sm9ifSBmcm9tIFwiLi4vam9iL2pvYlwiO1xyXG5pbXBvcnQge1dlYmhvb2tJbnRlcmZhY2V9IGZyb20gXCIuLi91aS93ZWJob29rSW50ZXJmYWNlXCI7XHJcbmltcG9ydCB7U3RlcH0gZnJvbSBcIi4uL3VpL3N0ZXBcIjtcclxuXHJcbmNvbnN0ICAgY29ycyA9IHJlcXVpcmUoXCJjb3JzXCIpLFxyXG4gICAgICAgIG11bHRlciA9IHJlcXVpcmUoXCJtdWx0ZXJcIiksXHJcbiAgICAgICAgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpLFxyXG4gICAgICAgIHRtcCA9IHJlcXVpcmUoXCJ0bXBcIiksXHJcbiAgICAgICAgYXN5bmMgPSByZXF1aXJlKFwiYXN5bmNcIik7XHJcblxyXG4vKipcclxuICogV2ViaG9vayBhbmQgbG9nZ2luZyBzZXJ2ZXIuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU2VydmVyIHtcclxuXHJcbiAgICBwcm90ZWN0ZWQgc2VydmVyOiBleHByZXNzLkFwcGxpY2F0aW9uO1xyXG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xyXG4gICAgcHJvdGVjdGVkIGhvb2tSb3V0ZXMgPSBbXTtcclxuICAgIHByb3RlY3RlZCBob29rSW50ZXJmYWNlUm91dGVzID0gW107XHJcbiAgICBwcm90ZWN0ZWQgdXBsb2FkO1xyXG5cclxuICAgIHByb3RlY3RlZCBjb25maWcgPSB7XHJcbiAgICAgICAgaG9va3NfcHJlZml4OiBcIi9ob29rc1wiLFxyXG4gICAgICAgIGhvb2tzX3VpX3ByZWZpeDogXCIvaG9va3MtdWlcIixcclxuICAgICAgICBsb2dfcHJlZml4OiBcIi9sb2dcIlxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCkge1xyXG4gICAgICAgIGxldCBzID0gdGhpcztcclxuICAgICAgICBzLmUgPSBlO1xyXG4gICAgICAgIHMuc2VydmVyID0gZXhwcmVzcygpO1xyXG5cclxuICAgICAgICBzLmNyZWF0ZVNlcnZlcigpO1xyXG5cclxuICAgICAgICAvLyBsZXQgdG1wRGlyID0gdG1wLmRpclN5bmMoKS5fbmFtZTtcclxuICAgICAgICBsZXQgdG1wRGlyID0gXCIuL2V4YW1wbGVcIjtcclxuXHJcbiAgICAgICAgcy51cGxvYWQgPSBtdWx0ZXIoe1xyXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb246IHRtcERpcixcclxuICAgICAgICAgICAgICAgIHN0b3JhZ2U6IG11bHRlci5kaXNrU3RvcmFnZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IGZ1bmN0aW9uIChyZXEsIGZpbGUsIGNiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKG51bGwsIGZpbGUuZmllbGRuYW1lICsgXCItXCIgKyBEYXRlLm5vdygpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgdGhlIHNlcnZlci5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVNlcnZlcigpIHtcclxuICAgICAgICBsZXQgcyA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCBwb3J0ID0gcy5lLm9wdGlvbnMucG9ydDtcclxuXHJcbiAgICAgICAgcy5zZXJ2ZXIudXNlKGNvcnMoKSk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBpbmRleCByb3V0ZXNcclxuICAgICAgICBzLnNlcnZlci5nZXQocy5jb25maWcuaG9va3NfcHJlZml4LCBmdW5jdGlvbihyZXEsIHJlcyl7XHJcbiAgICAgICAgICAgIHJlcy5qc29uKHMuaG9va1JvdXRlcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcy5zZXJ2ZXIuZ2V0KHMuY29uZmlnLmhvb2tzX3VpX3ByZWZpeCwgZnVuY3Rpb24ocmVxLCByZXMpe1xyXG4gICAgICAgICAgICByZXMuanNvbihzLmhvb2tJbnRlcmZhY2VSb3V0ZXMpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBQcmV2ZW50IGR1cGxpY2F0ZSBsaXN0ZW5pbmcgZm9yIHRlc3RzXHJcbiAgICAgICAgLy8gaWYgKCFtb2R1bGUucGFyZW50KSB7XHJcbiAgICAgICAgLy8gICAgIHMuc2VydmVyLmxpc3Rlbihwb3J0LCAoKSA9PiBzLmUubG9nKDEsIGBTZXJ2ZXIgdXAgYW5kIGxpc3RlbmluZyBvbiBwb3J0ICR7cG9ydH0uYCwgcykpO1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgICBzLnNlcnZlci5saXN0ZW4ocG9ydCwgKCkgPT4gcy5lLmxvZygxLCBgU2VydmVyIHVwIGFuZCBsaXN0ZW5pbmcgb24gcG9ydCAke3BvcnR9LmAsIHMpKVxyXG4gICAgICAgICAgICAub24oXCJlcnJvclwiLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzLmUubG9nKDMsIGBTZXJ2ZXIgbGlzdGVuIGVycm9yOiBcIiR7ZXJyLm1lc3NhZ2V9XCIuYCwgcyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlTG9nU2VydmVyKGxvZ2dlcjogTG9nZ2VyKSB7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgb3JkZXI6IFwiZGVzY1wiLFxyXG4gICAgICAgICAgICBmaWVsZHM6IFtcIm1lc3NhZ2VcIl1cclxuICAgICAgICB9IGFzIExvZ1F1ZXJ5T3B0aW9ucztcclxuXHJcbiAgICAgICAgLy8gQWRkIGluZGV4IHJvdXRlc1xyXG4gICAgICAgIHMuc2VydmVyLmdldChzLmNvbmZpZy5sb2dfcHJlZml4LCAocmVxLCByZXMpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGxvZ2dlci5xdWVyeShvcHRpb25zLCByZXN1bHRzID0+IHtcclxuICAgICAgICAgICAgICAgIHJlcy5qc29uKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2cgX25hbWVcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0b1N0cmluZygpIHtcclxuICAgICAgICByZXR1cm4gXCJTZXJ2ZXJcIjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSB3ZWJob29rIHRvIHRoZSBzZXJ2ZXIuXHJcbiAgICAgKiBAcGFyYW0gbmVzdCB7V2ViaG9va05lc3R9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRXZWJob29rKG5lc3Q6IFdlYmhvb2tOZXN0KSB7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzO1xyXG4gICAgICAgIGxldCBlID0gcy5lO1xyXG5cclxuICAgICAgICBsZXQgaHR0cE1ldGhvZCA9IG5lc3QuaHR0cE1ldGhvZDtcclxuICAgICAgICBsZXQgaG9va19wYXRoID0gcy5jb25maWcuaG9va3NfcHJlZml4ICsgbmVzdC5wYXRoO1xyXG4gICAgICAgIGxldCBob29rX3VpX3BhdGg7XHJcbiAgICAgICAgbGV0IGltID0gbmVzdC5pbnRlcmZhY2VNYW5hZ2VyO1xyXG5cclxuICAgICAgICBsZXQgd2kgPSBpbS5nZXRJbnRlcmZhY2UoKTtcclxuICAgICAgICBob29rX3VpX3BhdGggPSBzLmNvbmZpZy5ob29rc191aV9wcmVmaXggKyBpbS5wYXRoO1xyXG5cclxuICAgICAgICBzLmUubG9nKDEsIGBXYXRjaGluZyB3ZWJob29rICR7aHR0cE1ldGhvZC50b1VwcGVyQ2FzZSgpfSAke2hvb2tfcGF0aH1gLCBzKTtcclxuXHJcbiAgICAgICAgcy5ob29rUm91dGVzLnB1c2goe1xyXG4gICAgICAgICAgICBpZDogbmVzdC5pZCxcclxuICAgICAgICAgICAgcGF0aDogaG9va19wYXRoLFxyXG4gICAgICAgICAgICBuZXN0OiBuZXN0Lm5hbWUsXHJcbiAgICAgICAgICAgIHR1bm5lbDogbmVzdC50dW5uZWwubmFtZSxcclxuICAgICAgICAgICAgbWV0aG9kOiBodHRwTWV0aG9kLFxyXG4gICAgICAgICAgICBpbnRlcmZhY2VfcGF0aDogaG9va191aV9wYXRoXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHMuc2VydmVyW2h0dHBNZXRob2RdKGhvb2tfcGF0aCwgcy51cGxvYWQuYW55KCksIGZ1bmN0aW9uIChyZXEsIHJlcykge1xyXG5cclxuICAgICAgICAgICAgbGV0IGN1c3RvbUhhbmRsZXIgPSBuZXN0LmN1c3RvbUhhbmRsZVJlcXVlc3Q7XHJcblxyXG4gICAgICAgICAgICAgcy5oYW5kbGVIb29rUmVxdWVzdChuZXN0LCByZXEsIHJlcywgY3VzdG9tSGFuZGxlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIHJlcXVlc3QgYW5kIHJlc3BvbnNlIG9mIHRoZSB3ZWIgaG9vaywgY3JlYXRlcyBhIG5ldyBqb2IsIGFzIHdlbGwgYXMgY2FsbGluZyB0aGUgbmVzdCdzIGFycml2ZS5cclxuICAgICAqIEBwYXJhbSBuZXN0IHtXZWJob29rTmVzdH1cclxuICAgICAqIEBwYXJhbSByZXEge2V4cHJlc3MuUmVxdWVzdH1cclxuICAgICAqIEBwYXJhbSByZXMge2V4cHJlc3MuUmVzcG9uc2V9XHJcbiAgICAgKiBAcGFyYW0gY3VzdG9tSGFuZGxlciAgICAgQ3VzdG9tIHJlcXVlc3QgaGFuZGxlci5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGhhbmRsZUhvb2tSZXF1ZXN0IChuZXN0OiBXZWJob29rTmVzdCwgcmVxLCByZXMsIGN1c3RvbUhhbmRsZXI/OiBhbnkpIHtcclxuICAgICAgICBsZXQgcyA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vIEpvYiBhcnJpdmVcclxuICAgICAgICBsZXQgam9iID0gbmV3IFdlYmhvb2tKb2Iocy5lLCByZXEsIHJlcyk7XHJcbiAgICAgICAgbmVzdC5hcnJpdmUoam9iKTtcclxuXHJcbiAgICAgICAgcy5zZW5kSG9va1Jlc3BvbnNlKG5lc3QuaG9sZFJlc3BvbnNlLCBqb2IsIG5lc3QsIHJlcSwgcmVzLCBjdXN0b21IYW5kbGVyKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2VuZHMgdGhlIGFjdHVhbCBob29rIHJlc3BvbnNlLlxyXG4gICAgICogQHBhcmFtIGhvbGRSZXNwb25zZSAgICAgIEZsYWcgdG8gYnlwYXNzIHNlbmRpbmcgbm93IGZvciBoZWxkIHJlc3BvbnNlcy5cclxuICAgICAqIEBwYXJhbSBqb2IgICAgICAgICAgICAgICBXZWJob29rIGpvYlxyXG4gICAgICogQHBhcmFtIG5lc3QgICAgICAgICAgICAgIFdlYmhvb2sgbmVzdFxyXG4gICAgICogQHBhcmFtIHJlcVxyXG4gICAgICogQHBhcmFtIHJlc1xyXG4gICAgICogQHBhcmFtIGN1c3RvbUhhbmRsZXJcclxuICAgICAqIEBwYXJhbSBtZXNzYWdlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZW5kSG9va1Jlc3BvbnNlIChob2xkUmVzcG9uc2U6IGJvb2xlYW4sIGpvYjogV2ViaG9va0pvYiwgbmVzdDogV2ViaG9va05lc3QsIHJlcSwgcmVzLCBjdXN0b21IYW5kbGVyPzogYW55LCBtZXNzYWdlPzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKGhvbGRSZXNwb25zZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXHJcbiAgICAgICAgfSBlbHNlIGlmIChjdXN0b21IYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIGpvYi5yZXNwb25zZVNlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBjdXN0b21IYW5kbGVyKHJlcSwgcmVzLCBqb2IsIG5lc3QpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGpvYi5yZXNwb25zZVNlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBsZXQgcmVzcG9uc2UgPSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlIHx8IGBKb2IgJHtqb2IuaWR9IHdhcyBjcmVhdGVkIWAsXHJcbiAgICAgICAgICAgICAgICBqb2I6IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogam9iLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGpvYi5uYW1lXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmVzdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5lc3QubmFtZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXMuanNvbihyZXNwb25zZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIHdlYmhvb2sgaW50ZXJmYWNlIHRvIHRoZSB3ZWJob29rIHNlcnZlci5cclxuICAgICAqIEBwYXJhbSBpbSB7SW50ZXJmYWNlTWFuYWdlcn1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZFdlYmhvb2tJbnRlcmZhY2UoaW06IEludGVyZmFjZU1hbmFnZXIpIHtcclxuICAgICAgICBsZXQgcyA9IHRoaXM7XHJcbiAgICAgICAgbGV0IG5lc3QgPSBpbS5uZXN0O1xyXG5cclxuICAgICAgICBsZXQgaG9va19wYXRoID0gcy5jb25maWcuaG9va3NfcHJlZml4ICsgbmVzdC5wYXRoO1xyXG4gICAgICAgIGxldCBob29rX3VpX3BhdGggPSBzLmNvbmZpZy5ob29rc191aV9wcmVmaXggKyBpbS5wYXRoO1xyXG5cclxuICAgICAgICBzLmUubG9nKDEsIGBXYXRjaGluZyB3ZWJob29rIGludGVyZmFjZSBHRVQgJHtob29rX3VpX3BhdGh9YCwgcyk7XHJcblxyXG4gICAgICAgIHRoaXMuaG9va0ludGVyZmFjZVJvdXRlcy5wdXNoKHtcclxuICAgICAgICAgICAgaWQ6IG5lc3QuaWQsXHJcbiAgICAgICAgICAgIHBhdGg6IGhvb2tfdWlfcGF0aCxcclxuICAgICAgICAgICAgbmVzdDogbmVzdC5uYW1lLFxyXG4gICAgICAgICAgICB0YXJnZXQ6IGhvb2tfcGF0aFxyXG4gICAgICAgICAgICAvLyB0dW5uZWw6IG5lc3QuZ2V0VHVubmVsKCkubmFtZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBzLnNlcnZlci5nZXQoaG9va191aV9wYXRoLCAgZnVuY3Rpb24gKHJlcSwgcmVzKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgY3VzdG9tSGFuZGxlciA9IGltLmN1c3RvbUhhbmRsZVJlcXVlc3Q7XHJcblxyXG4gICAgICAgICAgICBzLmhhbmRsZUhvb2tJbnRlcmZhY2VSZXF1ZXN0KGltLCByZXEsIHJlcywgY3VzdG9tSGFuZGxlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIHJlcXVlc3QgYW5kIHJlc3BvbnNlIG9mIHRoZSB3ZWIgaG9vayBpbnRlcmZhY2UuXHJcbiAgICAgKiBAcGFyYW0gaW0ge0ludGVyZmFjZU1hbmFnZXJ9XHJcbiAgICAgKiBAcGFyYW0gcmVxIHtleHByZXNzLlJlcXVlc3R9XHJcbiAgICAgKiBAcGFyYW0gcmVzIHtleHByZXNzLlJlc3BvbnNlfVxyXG4gICAgICogQHBhcmFtIGN1c3RvbUhhbmRsZXIgICAgICAgICAgICAgQ3VzdG9tIHJlcXVlc3QgaGFuZGxlci5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGhhbmRsZUhvb2tJbnRlcmZhY2VSZXF1ZXN0ID0gZnVuY3Rpb24oaW06IEludGVyZmFjZU1hbmFnZXIsIHJlcSwgcmVzLCBjdXN0b21IYW5kbGVyPzogYW55KSB7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzO1xyXG5cclxuICAgICAgICAvLyBKb2IgYXJyaXZlXHJcbiAgICAgICAgbGV0IGpvYiA9IG5ldyBXZWJob29rSm9iKHMuZSwgcmVxLCByZXMpO1xyXG5cclxuICAgICAgICAvLyBGaWxsIGluIGRlZmF1bHQgdmFsdWVzXHJcbiAgICAgICAgbGV0IHBhcmFtcyA9IGpvYi5nZXRRdWVyeVN0cmluZ1ZhbHVlcygpO1xyXG5cclxuICAgICAgICAvLyBJZiBzZXNzaW9uIG5vdCBzZXQsIHJldHVybiBhIGZyZXNoIHVpIHNvbWVob3dcclxuICAgICAgICBsZXQgc2Vzc2lvbklkID0gcGFyYW1zW1wic2Vzc2lvbklkXCJdIHx8IGpvYi5nZXRGb3JtRGF0YVZhbHVlKFwic2Vzc2lvbklkXCIpO1xyXG5cclxuICAgICAgICBsZXQgdWkgPSBpbS5nZXRJbnRlcmZhY2Uoc2Vzc2lvbklkKTtcclxuXHJcbiAgICAgICAgaWYgKHVpLnNlc3Npb25JZCA9PT0gc2Vzc2lvbklkKSB7XHJcbiAgICAgICAgICAgIC8vIEZpbGwgaW4gZGVmYXVsdCB2YWx1ZXNcclxuICAgICAgICAgICAgdWkuZmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpZWxkLmlkIGluIHBhcmFtcyAmJiBwYXJhbXNbZmllbGQuaWRdICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmllbGQudmFsdWUgPSBwYXJhbXNbZmllbGQuaWRdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIERvIHN0ZXBzXHJcbiAgICAgICAgICAgIGFzeW5jLmVhY2godWkuc3RlcHMsIChzdGVwLCBjYjogKCkgPT4gdm9pZCk6IHZvaWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgcy5lLmxvZygwLCBgUnVubmluZyBVSSBzdGVwIFwiJHtzdGVwLm5hbWV9XCIuYCwgcyk7XHJcbiAgICAgICAgICAgICAgICBzdGVwLmNhbGxiYWNrKGpvYiwgdWksIHN0ZXAsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjYigpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBzLmUubG9nKDMsIGBFcnJvciBydW5uaW5nIFVJIHN0ZXBzLiAke2Vycn1gLCBzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcy5lLmxvZygwLCBgRG9uZSBydW5uaW5nIGFsbCBVSSBzdGVwcy5gLCBzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY3VzdG9tSGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbUhhbmRsZXIocmVxLCByZXMsIHVpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmpzb24odWkuZ2V0VHJhbnNwb3J0SW50ZXJmYWNlKCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGN1c3RvbUhhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgIGN1c3RvbUhhbmRsZXIocmVxLCByZXMsIHVpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlcy5qc29uKHVpLmdldFRyYW5zcG9ydEludGVyZmFjZSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG59Il19
