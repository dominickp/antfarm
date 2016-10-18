import {EmailOptions} from "./emailOptions";
import {EmailCredentials} from "./emailCredentials";
import {Environment} from "./environment";

const   nodemailer = require("nodemailer"),
        jade = require("jade");

/**
 * Emailing service
 */
export class Emailer {

    protected e: Environment;
    protected connection: any;
    protected credentials: any;

    constructor(e: Environment, credentials: EmailCredentials) {
        this.e = e;
        this.credentials = credentials;
        // console.log(this.credentials);
        // console.log(credentials.service);
        this.connection = nodemailer.createTransport(credentials.transportMethod, {
            service: credentials.service,  // sets automatically host, port and connection security settings
            auth: {
                user: credentials.username,
                pass: credentials.password
            }
        });
    }

    public sendMail(options: EmailOptions) {
        let ms = this;
        let variableData;
        ms.compileJade(options.template, variableData, function (html) {
            ms.connection.sendMail({
                from: ms.credentials.username, // sender address.  Must be the same as authenticated user if using Gmail.
                to: options.to, // receiver
                subject: options.subject, // subject
                html: html // body
            }, function(error, response) {
                if (error) {
                    ms.e.log(3, `nodemailer sending error: ${error}`, ms);
                } else {
                    ms.e.log(0, `nodemailer sent email`, ms);
                }
            });
            ms.connection.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
        });
    }

    /**
     * This finds and compiles a path to a jade template and returns HTML in the callback.
     * @param filePath {string}     The path to the file.
     * @param data {object}    Used for passing variables to jade template
     * @param callback     returns the complied jade template as html
     */
    private compileJade(filePath: string, data: any, callback: any): void {
        let ms = this;
        filePath = process.cwd() + "/email-templates" + filePath;
        jade.renderFile(filePath, data, (err, compiledTemplate) => {
            if (err) {
                ms.e.log(3, `pug rendering error: ${err}`, ms);
            } else {
                callback(compiledTemplate);
            }
        });

    }

}
