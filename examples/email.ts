import {EmailOptions} from "../src/lib/environment/emailOptions";
import {AntfarmOptions} from "../src/lib/environment/options";
const Antfarm = require("../lib/antfarm"),

    options = {
        port: 8081,
        log_out_level: "debug",
        auto_managed_folder_directory: "./examples/auto-managed",
        email_credentials: {
            username: "noreply@shawmutdelivers.com",
            password: "",
            service: "Gmail",
            transportMethod: "SMTP"
        }
    } as AntfarmOptions,

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

