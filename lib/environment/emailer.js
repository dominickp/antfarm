"use strict";
var nodemailer = require("nodemailer"), pug = require("pug");
/**
 * Emailing service
 */
var Emailer = (function () {
    function Emailer(e, credentials) {
        this.e = e;
        this.credentials = credentials;
        this.nodemailerTransport = nodemailer.createTransport(credentials.transportMethod, {
            service: credentials.service,
            auth: {
                user: credentials.username,
                pass: credentials.password
            }
        });
    }
    /**
     * Collects options a executes nodemailer.
     * @param options {EmailOptions}
     * @param job: {Job}
     */
    Emailer.prototype.sendMail = function (options, job) {
        var ms = this;
        // Initialize nodemailer options
        var nodemailerOptions = {
            to: options.to,
            cc: options.cc,
            bcc: options.bcc,
            subject: options.subject,
            html: null,
            text: null
        };
        // Get email body and execute
        if (options.template) {
            ms.compileJade(options.template, job, function (html) {
                nodemailerOptions.html = html;
                ms.executeSend(nodemailerOptions);
            });
        }
        else if (options.html) {
            nodemailerOptions.html = options.html;
            ms.executeSend(nodemailerOptions);
        }
        else if (options.text) {
            nodemailerOptions.text = options.text;
            ms.executeSend(nodemailerOptions);
        }
        else {
            ms.e.log(3, "Error sending mail. Template or email body not set in email options.", ms);
        }
    };
    /**
     * Send an email with nodemailer.
     * @param nodemailerOptions
     */
    Emailer.prototype.executeSend = function (nodemailerOptions) {
        var ms = this;
        ms.nodemailerTransport.sendMail(nodemailerOptions, function (nmError, nmResponse) {
            if (nmError) {
                ms.e.log(3, "nodemailer sending error: " + nmError, ms);
            }
            else {
                ms.e.log(0, "Email sent. " + nmResponse.messageId, ms);
            }
        });
        ms.nodemailerTransport.close();
    };
    /**
     * This finds and compiles a path to a jade template and returns HTML in the callback.
     * @param filePath {string}     The path to the file.
     * @param job {Job}             The job object which is passed into Jade.
     * @param callback              returns the complied jade template as html
     */
    Emailer.prototype.compileJade = function (filePath, job, callback) {
        var ms = this;
        pug.renderFile(filePath, { job: job }, function (err, compiledTemplate) {
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
