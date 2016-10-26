"use strict";
var nodemailer = require("nodemailer"), pug = require("pug");
/**
 * Emailing service
 */
var Emailer = (function () {
    function Emailer(e, credentials) {
        this.e = e;
        this.credentials = credentials;
        // this.nodemailerTransport = nodemailer.createTransport(credentials.transportMethod, {
        //     service: credentials.service,  // sets automatically host, port and nodemailerTransport security settings
        //     auth: {
        //         user: credentials.username,
        //         pass: credentials.password
        //     }
        // });
        //
        this.nodemailerTransport = nodemailer.createTransport(this.credentials);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9lbWFpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFNQSxJQUFRLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQ2xDLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFN0I7O0dBRUc7QUFDSDtJQU1JLGlCQUFZLENBQWMsRUFBRSxXQUE2QjtRQUNyRCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBRy9CLHVGQUF1RjtRQUN2RixnSEFBZ0g7UUFDaEgsY0FBYztRQUNkLHNDQUFzQztRQUN0QyxxQ0FBcUM7UUFDckMsUUFBUTtRQUNSLE1BQU07UUFDTixFQUFFO1FBQ0YsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRTVFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksMEJBQVEsR0FBZixVQUFnQixPQUFxQixFQUFFLEdBQVM7UUFDNUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRWQsZ0NBQWdDO1FBQ2hDLElBQUksaUJBQWlCLEdBQUc7WUFDcEIsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1lBQ2QsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1lBQ2QsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO1lBQ2hCLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztZQUN4QixJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxJQUFJO1NBQ00sQ0FBQztRQUVyQiw2QkFBNkI7UUFDN0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbkIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxVQUFDLElBQUk7Z0JBQ3ZDLGlCQUFpQixDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQzlCLEVBQUUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEIsaUJBQWlCLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDdEMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEIsaUJBQWlCLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDdEMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxzRUFBc0UsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RixDQUFDO0lBRUwsQ0FBQztJQUVEOzs7T0FHRztJQUNPLDZCQUFXLEdBQXJCLFVBQXNCLGlCQUFzQjtRQUN4QyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLFVBQUMsT0FBTyxFQUFFLFVBQVU7WUFDbkUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDVixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsK0JBQTZCLE9BQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGlCQUFlLFVBQVUsQ0FBQyxTQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDM0QsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNPLDZCQUFXLEdBQXJCLFVBQXNCLFFBQWdCLEVBQUUsR0FBUSxFQUFFLFFBQWE7UUFDM0QsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFDLEVBQUUsVUFBQyxHQUFHLEVBQUUsZ0JBQWdCO1lBQ3ZELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ04sRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLDBCQUF3QixHQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQy9CLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUVQLENBQUM7SUFFTCxjQUFDO0FBQUQsQ0E3RkEsQUE2RkMsSUFBQTtBQTdGWSxlQUFPLFVBNkZuQixDQUFBIiwiZmlsZSI6ImxpYi9lbnZpcm9ubWVudC9lbWFpbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbWFpbE9wdGlvbnN9IGZyb20gXCIuL2VtYWlsT3B0aW9uc1wiO1xuaW1wb3J0IHtFbWFpbENyZWRlbnRpYWxzfSBmcm9tIFwiLi9lbWFpbENyZWRlbnRpYWxzXCI7XG5pbXBvcnQge0Vudmlyb25tZW50fSBmcm9tIFwiLi9lbnZpcm9ubWVudFwiO1xuaW1wb3J0IHtKb2J9IGZyb20gXCIuLi9qb2Ivam9iXCI7XG5pbXBvcnQge1RyYW5zcG9ydGVyLCBTZW5kTWFpbE9wdGlvbnN9IGZyb20gXCJub2RlbWFpbGVyXCI7XG5cbmNvbnN0ICAgbm9kZW1haWxlciA9IHJlcXVpcmUoXCJub2RlbWFpbGVyXCIpLFxuICAgICAgICBwdWcgPSByZXF1aXJlKFwicHVnXCIpO1xuXG4vKipcbiAqIEVtYWlsaW5nIHNlcnZpY2VcbiAqL1xuZXhwb3J0IGNsYXNzIEVtYWlsZXIge1xuXG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuICAgIHByb3RlY3RlZCBub2RlbWFpbGVyVHJhbnNwb3J0OiBUcmFuc3BvcnRlcjtcbiAgICBwcm90ZWN0ZWQgY3JlZGVudGlhbHM6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBjcmVkZW50aWFsczogRW1haWxDcmVkZW50aWFscykge1xuICAgICAgICB0aGlzLmUgPSBlO1xuICAgICAgICB0aGlzLmNyZWRlbnRpYWxzID0gY3JlZGVudGlhbHM7XG5cblxuICAgICAgICAvLyB0aGlzLm5vZGVtYWlsZXJUcmFuc3BvcnQgPSBub2RlbWFpbGVyLmNyZWF0ZVRyYW5zcG9ydChjcmVkZW50aWFscy50cmFuc3BvcnRNZXRob2QsIHtcbiAgICAgICAgLy8gICAgIHNlcnZpY2U6IGNyZWRlbnRpYWxzLnNlcnZpY2UsICAvLyBzZXRzIGF1dG9tYXRpY2FsbHkgaG9zdCwgcG9ydCBhbmQgbm9kZW1haWxlclRyYW5zcG9ydCBzZWN1cml0eSBzZXR0aW5nc1xuICAgICAgICAvLyAgICAgYXV0aDoge1xuICAgICAgICAvLyAgICAgICAgIHVzZXI6IGNyZWRlbnRpYWxzLnVzZXJuYW1lLFxuICAgICAgICAvLyAgICAgICAgIHBhc3M6IGNyZWRlbnRpYWxzLnBhc3N3b3JkXG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLm5vZGVtYWlsZXJUcmFuc3BvcnQgPSBub2RlbWFpbGVyLmNyZWF0ZVRyYW5zcG9ydCh0aGlzLmNyZWRlbnRpYWxzKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbGxlY3RzIG9wdGlvbnMgYSBleGVjdXRlcyBub2RlbWFpbGVyLlxuICAgICAqIEBwYXJhbSBvcHRpb25zIHtFbWFpbE9wdGlvbnN9XG4gICAgICogQHBhcmFtIGpvYjoge0pvYn1cbiAgICAgKi9cbiAgICBwdWJsaWMgc2VuZE1haWwob3B0aW9uczogRW1haWxPcHRpb25zLCBqb2I/OiBKb2IpOiB2b2lkIHtcbiAgICAgICAgbGV0IG1zID0gdGhpcztcblxuICAgICAgICAvLyBJbml0aWFsaXplIG5vZGVtYWlsZXIgb3B0aW9uc1xuICAgICAgICBsZXQgbm9kZW1haWxlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICB0bzogb3B0aW9ucy50byxcbiAgICAgICAgICAgIGNjOiBvcHRpb25zLmNjLFxuICAgICAgICAgICAgYmNjOiBvcHRpb25zLmJjYyxcbiAgICAgICAgICAgIHN1YmplY3Q6IG9wdGlvbnMuc3ViamVjdCxcbiAgICAgICAgICAgIGh0bWw6IG51bGwsXG4gICAgICAgICAgICB0ZXh0OiBudWxsXG4gICAgICAgIH0gYXMgU2VuZE1haWxPcHRpb25zO1xuXG4gICAgICAgIC8vIEdldCBlbWFpbCBib2R5IGFuZCBleGVjdXRlXG4gICAgICAgIGlmIChvcHRpb25zLnRlbXBsYXRlKSB7XG4gICAgICAgICAgICBtcy5jb21waWxlSmFkZShvcHRpb25zLnRlbXBsYXRlLCBqb2IsIChodG1sKSA9PiB7XG4gICAgICAgICAgICAgICAgbm9kZW1haWxlck9wdGlvbnMuaHRtbCA9IGh0bWw7XG4gICAgICAgICAgICAgICAgbXMuZXhlY3V0ZVNlbmQobm9kZW1haWxlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5odG1sKSB7XG4gICAgICAgICAgICBub2RlbWFpbGVyT3B0aW9ucy5odG1sID0gb3B0aW9ucy5odG1sO1xuICAgICAgICAgICAgbXMuZXhlY3V0ZVNlbmQobm9kZW1haWxlck9wdGlvbnMpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMudGV4dCkge1xuICAgICAgICAgICAgbm9kZW1haWxlck9wdGlvbnMudGV4dCA9IG9wdGlvbnMudGV4dDtcbiAgICAgICAgICAgIG1zLmV4ZWN1dGVTZW5kKG5vZGVtYWlsZXJPcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1zLmUubG9nKDMsIGBFcnJvciBzZW5kaW5nIG1haWwuIFRlbXBsYXRlIG9yIGVtYWlsIGJvZHkgbm90IHNldCBpbiBlbWFpbCBvcHRpb25zLmAsIG1zKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhbiBlbWFpbCB3aXRoIG5vZGVtYWlsZXIuXG4gICAgICogQHBhcmFtIG5vZGVtYWlsZXJPcHRpb25zXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGV4ZWN1dGVTZW5kKG5vZGVtYWlsZXJPcHRpb25zOiBhbnkpIHtcbiAgICAgICAgbGV0IG1zID0gdGhpcztcbiAgICAgICAgbXMubm9kZW1haWxlclRyYW5zcG9ydC5zZW5kTWFpbChub2RlbWFpbGVyT3B0aW9ucywgKG5tRXJyb3IsIG5tUmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChubUVycm9yKSB7XG4gICAgICAgICAgICAgICAgbXMuZS5sb2coMywgYG5vZGVtYWlsZXIgc2VuZGluZyBlcnJvcjogJHtubUVycm9yfWAsIG1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbXMuZS5sb2coMCwgYEVtYWlsIHNlbnQuICR7bm1SZXNwb25zZS5tZXNzYWdlSWR9YCwgbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbXMubm9kZW1haWxlclRyYW5zcG9ydC5jbG9zZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZmluZHMgYW5kIGNvbXBpbGVzIGEgcGF0aCB0byBhIGphZGUgdGVtcGxhdGUgYW5kIHJldHVybnMgSFRNTCBpbiB0aGUgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIHtzdHJpbmd9ICAgICBUaGUgcGF0aCB0byB0aGUgZmlsZS5cbiAgICAgKiBAcGFyYW0gam9iIHtKb2J9ICAgICAgICAgICAgIFRoZSBqb2Igb2JqZWN0IHdoaWNoIGlzIHBhc3NlZCBpbnRvIEphZGUuXG4gICAgICogQHBhcmFtIGNhbGxiYWNrICAgICAgICAgICAgICByZXR1cm5zIHRoZSBjb21wbGllZCBqYWRlIHRlbXBsYXRlIGFzIGh0bWxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29tcGlsZUphZGUoZmlsZVBhdGg6IHN0cmluZywgam9iOiBKb2IsIGNhbGxiYWNrOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgbGV0IG1zID0gdGhpcztcbiAgICAgICAgcHVnLnJlbmRlckZpbGUoZmlsZVBhdGgsIHtqb2I6IGpvYn0sIChlcnIsIGNvbXBpbGVkVGVtcGxhdGUpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBtcy5lLmxvZygzLCBgcHVnIHJlbmRlcmluZyBlcnJvcjogJHtlcnJ9YCwgbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhjb21waWxlZFRlbXBsYXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbn1cbiJdfQ==
