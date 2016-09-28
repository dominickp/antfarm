const   fs = require("fs"),
        winston = require("winston");

export class Logger {

    protected options: AntfarmOptions;

    protected logger;

    protected log_dir: string;

    protected log_types = {
        0: "debug",
        1: "info",
        2: "warning",
        3: "error"
    };

    constructor(options?: AntfarmOptions) {
        winston.emitErrs = true;

        this.options = options;

        this.createLogger();
    }


    createLogger() {
        if (this.options) {

            if (this.options.log_dir) {

                // Create the log directory if it does not exist
                if (!fs.existsSync(this.options.log_dir)) {
                    fs.mkdirSync(this.options.log_dir);
                }

                this.logger = new winston.Logger({
                    transports: [
                        new winston.transports.File({
                            level: this.options.log_file_level || "info",
                            filename: `${this.options.log_dir}/somefile.log`,
                            handleExceptions: true,
                            json: true,
                            maxsize: this.options.log_max_size || 5242880, // 5MB
                            maxFiles: this.options.log_max_files || 5,
                            colorize: false
                        }),
                        new winston.transports.Console({
                            level: this.options.log_out_level || "debug",
                            handleExceptions: true,
                            prettyPrint: true,
                            colorize: true,
                            silent: false,
                            timestamp: true,
                            formatter: function (options) {
                                return winston.config.colorize(options.level, options.level)
                                    + options.message + " " + JSON.stringify(options.meta);
                            }
                        })
                    ],
                    exitOnError: false
                });
            }
        } else {
            this.logger = new winston.Logger({
                transports: [
                    new winston.transports.Console({
                        level: "debug",
                        handleExceptions: true,
                        json: false,
                        colorize: true,
                        prettyPrint: true
                    })
                ],
                exitOnError: false
            });
        }
    }

    protected getEntry(entry: Object, actor?: any, instances = []) {

        instances.push(actor);

        if (instances) {
            instances.forEach(function(instance){
                if (instance && typeof instance !== "undefined") {
                    try {
                        let super_name = instance.toString();
                        entry[super_name] = instance.getName();
                    } catch (e) {
                        entry["Undefined"] = "got one";
                    }

                    //
                    entry["date"] = new Date();
                }
            });
        }

        return entry;
    }

    /**
     * Create a log entry. Used for log files and console reporting.
     * @param type
     * @param message
     * @param actor
     * @param instances
     */
    public log(type: number, message: string, actor?: any,  instances?: any) {
        if (typeof(this.log_types[type]) === "undefined") {
            type = 0;
        }

        let log_types = this.log_types;

        let entry = {
            message: message,
            actor: actor.constructor.name
        };

        let modified_entry = this.getEntry(entry, actor, instances);

        this.logger.log(log_types[type], modified_entry);
    }

}