"use strict";
var Antfarm = require("../lib/antfarm"), options = {
    port: 8081,
    log_out_level: "debug",
    auto_managed_folder_directory: "./examples/auto-managed"
}, af = new Antfarm(options);
var hf = af.createAutoFolderNest("email folder");
var tunnel = af.createTunnel("email send");
tunnel.watch(hf);
tunnel.run(function (job, nest) {
    console.log(job);
    var emailOptions = {
        subject: "testing email",
        to: "samuelm@shawmutdelivers.com",
        from: "noreply@shawmutdelivers.com"
    };
    // another way to set email options;
    // let eo = new EmailOptions();
    // eo.subject = "this";
    job.email(emailOptions);
});
