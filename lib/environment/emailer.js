"use strict";
var nodemailer = require("nodemailer"), jade = require("jade");
/**
 * Emailing service
 */
var Emailer = (function () {
    function Emailer(options) {
        this.connection = email.createTransport(options.transportMethod, {
            service: options.service,
            auth: {
                user: options.username,
                pass: options.password
            }
        });
    }
    Emailer.prototype.sendMail = function (options) {
        var ms = this;
        var emailTemplate = options.templatePath;
        ms.compileJade(emailTemplate, variableData, function (html) {
            ms.connection.sendMail({
                from: "",
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
