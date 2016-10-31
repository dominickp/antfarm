import {EmailOptions} from "./emailOptions";
import {EmailCredentials} from "./emailCredentials";
import {Environment} from "./environment";
import {Job} from "../job/job";
import {Transporter, SendMailOptions} from "nodemailer";

const   nodemailer = require("nodemailer"),
        pug = require("pug");

/**
 * Emailing service
 */
export class Emailer {

    protected e: Environment;
    protected nodemailerTransport: Transporter;
    protected credentials: any;

    constructor(e: Environment, credentials: EmailCredentials) {
        this.e = e;
        this.credentials = credentials;

        this.nodemailerTransport = nodemailer.createTransport(this.credentials);
    }

    /**
     * Collects options a executes nodemailer.
     * @param options {EmailOptions}
     * @param job: {Job}
     */
    public sendMail(options: EmailOptions, job?: Job): void {
        let ms = this;

        // Initialize nodemailer options
        let nodemailerOptions = {
            to: options.to,
            cc: options.cc,
            bcc: options.bcc,
            subject: options.subject,
            html: null,
            text: null
        } as SendMailOptions;

        // Get email body and execute
        if (options.template) {
            ms.compileJade(options.template, job, (html) => {
                nodemailerOptions.html = html;
                ms.executeSend(nodemailerOptions);
            });
        } else if (options.html) {
            nodemailerOptions.html = options.html;
            ms.executeSend(nodemailerOptions);
        } else if (options.text) {
            nodemailerOptions.text = options.text;
            ms.executeSend(nodemailerOptions);
        } else {
            ms.e.log(3, `Error sending mail. Template or email body not set in email options.`, ms);
        }

    }

    /**
     * Send an email with nodemailer.
     * @param nodemailerOptions
     */
    protected executeSend(nodemailerOptions: any) {
        let ms = this;
        ms.nodemailerTransport.sendMail(nodemailerOptions, (nmError, nmResponse) => {
            if (nmError) {
                ms.e.log(3, `nodemailer sending error: ${nmError}`, ms);
            } else {
                ms.e.log(0, `Email sent. ${nmResponse.messageId}`, ms);
            }
        });
        ms.nodemailerTransport.close();
    }

    /**
     * This finds and compiles a _path to a jade template and returns HTML in the callback.
     * @param filePath {string}     The _path to the file.
     * @param job {Job}             The job object which is passed into Jade.
     * @param callback              returns the complied jade template as html
     */
    protected compileJade(filePath: string, job: Job, callback: any): void {
        let ms = this;
        pug.renderFile(filePath, {job: job}, (err, compiledTemplate) => {
            if (err) {
                ms.e.log(3, `pug rendering error: ${err}`, ms);
            } else {
                callback(compiledTemplate);
            }
        });

    }

}
