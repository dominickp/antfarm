import {EmailOptions} from "../src/lib/environment/emailOptions";
const Antfarm = require("../lib/antfarm"),

    options = {
        port: 8081,
        log_out_level: "debug",
        auto_managed_folder_directory: "./examples/auto-managed"
    },

    af = new Antfarm(options);

    let hf = af.createAutoFolderNest("email folder");

    let tunnel = af.createTunnel("email send");

    tunnel.watch(hf);

    tunnel.run(function (job, nest) {
        let emailOptions = {
            subject: "testing email",
            to: "samuelm@shawmutdelivers.com",
            from: "noreply@shawmutdelivers.com",

        } as EmailOptions;

        // another way to set email options;
        // let eo = new EmailOptions();
        // eo.subject = "this";

        job.email(emailOptions);
    });

