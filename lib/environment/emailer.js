"use strict";
var nodemailer = require("nodemailer"), pug = require("pug");
/**
 * Emailing service
 */
var Emailer = (function () {
    function Emailer(e, credentials) {
        this.e = e;
        this.credentials = credentials;
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
     * This finds and compiles a _path to a jade template and returns HTML in the callback.
     * @param filePath {string}     The _path to the file.
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9lbWFpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFNQSxJQUFRLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQ2xDLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFN0I7O0dBRUc7QUFDSDtJQU1JLGlCQUFZLENBQWMsRUFBRSxXQUE2QjtRQUNyRCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBRS9CLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLDBCQUFRLEdBQWYsVUFBZ0IsT0FBcUIsRUFBRSxHQUFTO1FBQzVDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUVkLGdDQUFnQztRQUNoQyxJQUFJLGlCQUFpQixHQUFHO1lBQ3BCLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRTtZQUNkLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRTtZQUNkLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztZQUNoQixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87WUFDeEIsSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsSUFBSTtTQUNNLENBQUM7UUFFckIsNkJBQTZCO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsVUFBQyxJQUFJO2dCQUN2QyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUM5QixFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLGlCQUFpQixDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ3RDLEVBQUUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLGlCQUFpQixDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ3RDLEVBQUUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsc0VBQXNFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUYsQ0FBQztJQUVMLENBQUM7SUFFRDs7O09BR0c7SUFDTyw2QkFBVyxHQUFyQixVQUFzQixpQkFBc0I7UUFDeEMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxVQUFDLE9BQU8sRUFBRSxVQUFVO1lBQ25FLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLCtCQUE2QixPQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDNUQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxpQkFBZSxVQUFVLENBQUMsU0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNELENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDTyw2QkFBVyxHQUFyQixVQUFzQixRQUFnQixFQUFFLEdBQVEsRUFBRSxRQUFhO1FBQzNELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBQyxFQUFFLFVBQUMsR0FBRyxFQUFFLGdCQUFnQjtZQUN2RCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNOLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSwwQkFBd0IsR0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMvQixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDO0lBRUwsY0FBQztBQUFELENBbkZBLEFBbUZDLElBQUE7QUFuRlksZUFBTyxVQW1GbkIsQ0FBQSIsImZpbGUiOiJsaWIvZW52aXJvbm1lbnQvZW1haWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW1haWxPcHRpb25zfSBmcm9tIFwiLi9lbWFpbE9wdGlvbnNcIjtcbmltcG9ydCB7RW1haWxDcmVkZW50aWFsc30gZnJvbSBcIi4vZW1haWxDcmVkZW50aWFsc1wiO1xuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4vZW52aXJvbm1lbnRcIjtcbmltcG9ydCB7Sm9ifSBmcm9tIFwiLi4vam9iL2pvYlwiO1xuaW1wb3J0IHtUcmFuc3BvcnRlciwgU2VuZE1haWxPcHRpb25zfSBmcm9tIFwibm9kZW1haWxlclwiO1xuXG5jb25zdCAgIG5vZGVtYWlsZXIgPSByZXF1aXJlKFwibm9kZW1haWxlclwiKSxcbiAgICAgICAgcHVnID0gcmVxdWlyZShcInB1Z1wiKTtcblxuLyoqXG4gKiBFbWFpbGluZyBzZXJ2aWNlXG4gKi9cbmV4cG9ydCBjbGFzcyBFbWFpbGVyIHtcblxuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcbiAgICBwcm90ZWN0ZWQgbm9kZW1haWxlclRyYW5zcG9ydDogVHJhbnNwb3J0ZXI7XG4gICAgcHJvdGVjdGVkIGNyZWRlbnRpYWxzOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgY3JlZGVudGlhbHM6IEVtYWlsQ3JlZGVudGlhbHMpIHtcbiAgICAgICAgdGhpcy5lID0gZTtcbiAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGNyZWRlbnRpYWxzO1xuXG4gICAgICAgIHRoaXMubm9kZW1haWxlclRyYW5zcG9ydCA9IG5vZGVtYWlsZXIuY3JlYXRlVHJhbnNwb3J0KHRoaXMuY3JlZGVudGlhbHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbGxlY3RzIG9wdGlvbnMgYSBleGVjdXRlcyBub2RlbWFpbGVyLlxuICAgICAqIEBwYXJhbSBvcHRpb25zIHtFbWFpbE9wdGlvbnN9XG4gICAgICogQHBhcmFtIGpvYjoge0pvYn1cbiAgICAgKi9cbiAgICBwdWJsaWMgc2VuZE1haWwob3B0aW9uczogRW1haWxPcHRpb25zLCBqb2I/OiBKb2IpOiB2b2lkIHtcbiAgICAgICAgbGV0IG1zID0gdGhpcztcblxuICAgICAgICAvLyBJbml0aWFsaXplIG5vZGVtYWlsZXIgb3B0aW9uc1xuICAgICAgICBsZXQgbm9kZW1haWxlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICB0bzogb3B0aW9ucy50byxcbiAgICAgICAgICAgIGNjOiBvcHRpb25zLmNjLFxuICAgICAgICAgICAgYmNjOiBvcHRpb25zLmJjYyxcbiAgICAgICAgICAgIHN1YmplY3Q6IG9wdGlvbnMuc3ViamVjdCxcbiAgICAgICAgICAgIGh0bWw6IG51bGwsXG4gICAgICAgICAgICB0ZXh0OiBudWxsXG4gICAgICAgIH0gYXMgU2VuZE1haWxPcHRpb25zO1xuXG4gICAgICAgIC8vIEdldCBlbWFpbCBib2R5IGFuZCBleGVjdXRlXG4gICAgICAgIGlmIChvcHRpb25zLnRlbXBsYXRlKSB7XG4gICAgICAgICAgICBtcy5jb21waWxlSmFkZShvcHRpb25zLnRlbXBsYXRlLCBqb2IsIChodG1sKSA9PiB7XG4gICAgICAgICAgICAgICAgbm9kZW1haWxlck9wdGlvbnMuaHRtbCA9IGh0bWw7XG4gICAgICAgICAgICAgICAgbXMuZXhlY3V0ZVNlbmQobm9kZW1haWxlck9wdGlvbnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5odG1sKSB7XG4gICAgICAgICAgICBub2RlbWFpbGVyT3B0aW9ucy5odG1sID0gb3B0aW9ucy5odG1sO1xuICAgICAgICAgICAgbXMuZXhlY3V0ZVNlbmQobm9kZW1haWxlck9wdGlvbnMpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMudGV4dCkge1xuICAgICAgICAgICAgbm9kZW1haWxlck9wdGlvbnMudGV4dCA9IG9wdGlvbnMudGV4dDtcbiAgICAgICAgICAgIG1zLmV4ZWN1dGVTZW5kKG5vZGVtYWlsZXJPcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1zLmUubG9nKDMsIGBFcnJvciBzZW5kaW5nIG1haWwuIFRlbXBsYXRlIG9yIGVtYWlsIGJvZHkgbm90IHNldCBpbiBlbWFpbCBvcHRpb25zLmAsIG1zKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhbiBlbWFpbCB3aXRoIG5vZGVtYWlsZXIuXG4gICAgICogQHBhcmFtIG5vZGVtYWlsZXJPcHRpb25zXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGV4ZWN1dGVTZW5kKG5vZGVtYWlsZXJPcHRpb25zOiBhbnkpIHtcbiAgICAgICAgbGV0IG1zID0gdGhpcztcbiAgICAgICAgbXMubm9kZW1haWxlclRyYW5zcG9ydC5zZW5kTWFpbChub2RlbWFpbGVyT3B0aW9ucywgKG5tRXJyb3IsIG5tUmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChubUVycm9yKSB7XG4gICAgICAgICAgICAgICAgbXMuZS5sb2coMywgYG5vZGVtYWlsZXIgc2VuZGluZyBlcnJvcjogJHtubUVycm9yfWAsIG1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbXMuZS5sb2coMCwgYEVtYWlsIHNlbnQuICR7bm1SZXNwb25zZS5tZXNzYWdlSWR9YCwgbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbXMubm9kZW1haWxlclRyYW5zcG9ydC5jbG9zZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZmluZHMgYW5kIGNvbXBpbGVzIGEgX3BhdGggdG8gYSBqYWRlIHRlbXBsYXRlIGFuZCByZXR1cm5zIEhUTUwgaW4gdGhlIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCB7c3RyaW5nfSAgICAgVGhlIF9wYXRoIHRvIHRoZSBmaWxlLlxuICAgICAqIEBwYXJhbSBqb2Ige0pvYn0gICAgICAgICAgICAgVGhlIGpvYiBvYmplY3Qgd2hpY2ggaXMgcGFzc2VkIGludG8gSmFkZS5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgICAgICAgICAgICAgIHJldHVybnMgdGhlIGNvbXBsaWVkIGphZGUgdGVtcGxhdGUgYXMgaHRtbFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjb21waWxlSmFkZShmaWxlUGF0aDogc3RyaW5nLCBqb2I6IEpvYiwgY2FsbGJhY2s6IGFueSk6IHZvaWQge1xuICAgICAgICBsZXQgbXMgPSB0aGlzO1xuICAgICAgICBwdWcucmVuZGVyRmlsZShmaWxlUGF0aCwge2pvYjogam9ifSwgKGVyciwgY29tcGlsZWRUZW1wbGF0ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIG1zLmUubG9nKDMsIGBwdWcgcmVuZGVyaW5nIGVycm9yOiAke2Vycn1gLCBtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNvbXBpbGVkVGVtcGxhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cblxufVxuIl19
