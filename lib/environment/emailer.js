"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9lbWFpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsSUFBUSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUNsQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRTdCOztHQUVHO0FBQ0g7SUFNSSxpQkFBWSxDQUFjLEVBQUUsV0FBNkI7UUFDckQsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUUvQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSwwQkFBUSxHQUFmLFVBQWdCLE9BQXFCLEVBQUUsR0FBUztRQUM1QyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFZCxnQ0FBZ0M7UUFDaEMsSUFBSSxpQkFBaUIsR0FBRztZQUNwQixFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUU7WUFDZCxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUU7WUFDZCxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7WUFDaEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1lBQ3hCLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLElBQUk7U0FDTSxDQUFDO1FBRXJCLDZCQUE2QjtRQUM3QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNuQixFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLFVBQUMsSUFBSTtnQkFDdkMsaUJBQWlCLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDOUIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN0QixpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztZQUN0QyxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN0QixpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztZQUN0QyxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLHNFQUFzRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVGLENBQUM7SUFFTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ08sNkJBQVcsR0FBckIsVUFBc0IsaUJBQXNCO1FBQ3hDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsVUFBQyxPQUFPLEVBQUUsVUFBVTtZQUNuRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNWLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSwrQkFBNkIsT0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsaUJBQWUsVUFBVSxDQUFDLFNBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzRCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ08sNkJBQVcsR0FBckIsVUFBc0IsUUFBZ0IsRUFBRSxHQUFRLEVBQUUsUUFBYTtRQUMzRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUMsRUFBRSxVQUFDLEdBQUcsRUFBRSxnQkFBZ0I7WUFDdkQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDTixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsMEJBQXdCLEdBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNuRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDL0IsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBRVAsQ0FBQztJQUVMLGNBQUM7QUFBRCxDQW5GQSxBQW1GQyxJQUFBO0FBbkZZLDBCQUFPIiwiZmlsZSI6ImxpYi9lbnZpcm9ubWVudC9lbWFpbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbWFpbE9wdGlvbnN9IGZyb20gXCIuL2VtYWlsT3B0aW9uc1wiO1xyXG5pbXBvcnQge0VtYWlsQ3JlZGVudGlhbHN9IGZyb20gXCIuL2VtYWlsQ3JlZGVudGlhbHNcIjtcclxuaW1wb3J0IHtFbnZpcm9ubWVudH0gZnJvbSBcIi4vZW52aXJvbm1lbnRcIjtcclxuaW1wb3J0IHtKb2J9IGZyb20gXCIuLi9qb2Ivam9iXCI7XHJcbmltcG9ydCB7VHJhbnNwb3J0ZXIsIFNlbmRNYWlsT3B0aW9uc30gZnJvbSBcIm5vZGVtYWlsZXJcIjtcclxuXHJcbmNvbnN0ICAgbm9kZW1haWxlciA9IHJlcXVpcmUoXCJub2RlbWFpbGVyXCIpLFxyXG4gICAgICAgIHB1ZyA9IHJlcXVpcmUoXCJwdWdcIik7XHJcblxyXG4vKipcclxuICogRW1haWxpbmcgc2VydmljZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEVtYWlsZXIge1xyXG5cclxuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcclxuICAgIHByb3RlY3RlZCBub2RlbWFpbGVyVHJhbnNwb3J0OiBUcmFuc3BvcnRlcjtcclxuICAgIHByb3RlY3RlZCBjcmVkZW50aWFsczogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBjcmVkZW50aWFsczogRW1haWxDcmVkZW50aWFscykge1xyXG4gICAgICAgIHRoaXMuZSA9IGU7XHJcbiAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGNyZWRlbnRpYWxzO1xyXG5cclxuICAgICAgICB0aGlzLm5vZGVtYWlsZXJUcmFuc3BvcnQgPSBub2RlbWFpbGVyLmNyZWF0ZVRyYW5zcG9ydCh0aGlzLmNyZWRlbnRpYWxzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbGxlY3RzIG9wdGlvbnMgYSBleGVjdXRlcyBub2RlbWFpbGVyLlxyXG4gICAgICogQHBhcmFtIG9wdGlvbnMge0VtYWlsT3B0aW9uc31cclxuICAgICAqIEBwYXJhbSBqb2I6IHtKb2J9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZW5kTWFpbChvcHRpb25zOiBFbWFpbE9wdGlvbnMsIGpvYj86IEpvYik6IHZvaWQge1xyXG4gICAgICAgIGxldCBtcyA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgbm9kZW1haWxlciBvcHRpb25zXHJcbiAgICAgICAgbGV0IG5vZGVtYWlsZXJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICB0bzogb3B0aW9ucy50byxcclxuICAgICAgICAgICAgY2M6IG9wdGlvbnMuY2MsXHJcbiAgICAgICAgICAgIGJjYzogb3B0aW9ucy5iY2MsXHJcbiAgICAgICAgICAgIHN1YmplY3Q6IG9wdGlvbnMuc3ViamVjdCxcclxuICAgICAgICAgICAgaHRtbDogbnVsbCxcclxuICAgICAgICAgICAgdGV4dDogbnVsbFxyXG4gICAgICAgIH0gYXMgU2VuZE1haWxPcHRpb25zO1xyXG5cclxuICAgICAgICAvLyBHZXQgZW1haWwgYm9keSBhbmQgZXhlY3V0ZVxyXG4gICAgICAgIGlmIChvcHRpb25zLnRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIG1zLmNvbXBpbGVKYWRlKG9wdGlvbnMudGVtcGxhdGUsIGpvYiwgKGh0bWwpID0+IHtcclxuICAgICAgICAgICAgICAgIG5vZGVtYWlsZXJPcHRpb25zLmh0bWwgPSBodG1sO1xyXG4gICAgICAgICAgICAgICAgbXMuZXhlY3V0ZVNlbmQobm9kZW1haWxlck9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuaHRtbCkge1xyXG4gICAgICAgICAgICBub2RlbWFpbGVyT3B0aW9ucy5odG1sID0gb3B0aW9ucy5odG1sO1xyXG4gICAgICAgICAgICBtcy5leGVjdXRlU2VuZChub2RlbWFpbGVyT3B0aW9ucyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnRleHQpIHtcclxuICAgICAgICAgICAgbm9kZW1haWxlck9wdGlvbnMudGV4dCA9IG9wdGlvbnMudGV4dDtcclxuICAgICAgICAgICAgbXMuZXhlY3V0ZVNlbmQobm9kZW1haWxlck9wdGlvbnMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1zLmUubG9nKDMsIGBFcnJvciBzZW5kaW5nIG1haWwuIFRlbXBsYXRlIG9yIGVtYWlsIGJvZHkgbm90IHNldCBpbiBlbWFpbCBvcHRpb25zLmAsIG1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2VuZCBhbiBlbWFpbCB3aXRoIG5vZGVtYWlsZXIuXHJcbiAgICAgKiBAcGFyYW0gbm9kZW1haWxlck9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGV4ZWN1dGVTZW5kKG5vZGVtYWlsZXJPcHRpb25zOiBhbnkpIHtcclxuICAgICAgICBsZXQgbXMgPSB0aGlzO1xyXG4gICAgICAgIG1zLm5vZGVtYWlsZXJUcmFuc3BvcnQuc2VuZE1haWwobm9kZW1haWxlck9wdGlvbnMsIChubUVycm9yLCBubVJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChubUVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBtcy5lLmxvZygzLCBgbm9kZW1haWxlciBzZW5kaW5nIGVycm9yOiAke25tRXJyb3J9YCwgbXMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbXMuZS5sb2coMCwgYEVtYWlsIHNlbnQuICR7bm1SZXNwb25zZS5tZXNzYWdlSWR9YCwgbXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbXMubm9kZW1haWxlclRyYW5zcG9ydC5jbG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBmaW5kcyBhbmQgY29tcGlsZXMgYSBfcGF0aCB0byBhIGphZGUgdGVtcGxhdGUgYW5kIHJldHVybnMgSFRNTCBpbiB0aGUgY2FsbGJhY2suXHJcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGgge3N0cmluZ30gICAgIFRoZSBfcGF0aCB0byB0aGUgZmlsZS5cclxuICAgICAqIEBwYXJhbSBqb2Ige0pvYn0gICAgICAgICAgICAgVGhlIGpvYiBvYmplY3Qgd2hpY2ggaXMgcGFzc2VkIGludG8gSmFkZS5cclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayAgICAgICAgICAgICAgcmV0dXJucyB0aGUgY29tcGxpZWQgamFkZSB0ZW1wbGF0ZSBhcyBodG1sXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjb21waWxlSmFkZShmaWxlUGF0aDogc3RyaW5nLCBqb2I6IEpvYiwgY2FsbGJhY2s6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBtcyA9IHRoaXM7XHJcbiAgICAgICAgcHVnLnJlbmRlckZpbGUoZmlsZVBhdGgsIHtqb2I6IGpvYn0sIChlcnIsIGNvbXBpbGVkVGVtcGxhdGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgbXMuZS5sb2coMywgYHB1ZyByZW5kZXJpbmcgZXJyb3I6ICR7ZXJyfWAsIG1zKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNvbXBpbGVkVGVtcGxhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufVxyXG4iXX0=
