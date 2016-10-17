"use strict";
var nodemailer = require("nodemailer"), jade = require("jade");
/**
 * Emailing service
 */
var Emailer = (function () {
    function Emailer(credentials) {
        this.credentials = credentials;
        this.connection = nodemailer.createTransport(credentials.transportMethod, {
            service: credentials.service,
            auth: {
                user: credentials.username,
                pass: credentials.password
            }
        });
    }
    Emailer.prototype.sendMail = function (options) {
        var ms = this;
        var variableData;
        ms.compileJade(options.template, variableData, function (html) {
            ms.connection.sendMail({
                from: ms.credentials.username,
                to: options.to,
                subject: options.subject,
                html: html // body
            }, function (error, response) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log("Message sent: " + response.message);
                }
            });
            ms.connection.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
        });
    };
    /**
     * This finds and compiles a path to a jade template and returns HTML in the callback.
     * @param filePath {string}     The path to the file.
     * @param data {object}    Used for passing variables to jade template
     * @param callback     returns the complied jade template as html
     */
    Emailer.prototype.compileJade = function (filePath, data, callback) {
        filePath = process.cwd() + "/email-templates" + filePath;
        jade.renderFile(filePath, data, function (err, compiledTemplate) {
            if (err) {
                console.log(err);
            }
            else {
                callback(compiledTemplate);
            }
        });
    };
    return Emailer;
}());
exports.Emailer = Emailer;
//# sourceMappingURL=emailer.js.map