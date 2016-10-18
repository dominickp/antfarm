"use strict";
var nodemailer = require("nodemailer"), jade = require("jade");
/**
 * Emailing service
 */
var Emailer = (function () {
    function Emailer(e, credentials) {
        this.e = e;
        this.credentials = credentials;
        // console.log(this.credentials);
        // console.log(credentials.service);
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
                    ms.e.log(3, "nodemailer sending error: " + error, ms);
                }
                else {
                    ms.e.log(0, "nodemailer sent email", ms);
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
        var ms = this;
        filePath = process.cwd() + "/email-templates" + filePath;
        jade.renderFile(filePath, data, function (err, compiledTemplate) {
            if (err) {
                ms.e.log(3, "pug rendering error: " + err, ms);
            }
            else {
                callback(compiledTemplate);
            }
        });
    };
    return Emailer;
}());
exports.Emailer = Emailer;
