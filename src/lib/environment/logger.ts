import {AntfarmOptions} from "./options";

const   fs = require("fs"),
        winston = require("winston"),
        _ = require("lodash");

/**
 * Logging service
 */
export class Logger {

    protected options: AntfarmOptions;

    protected logger;

    protected log_dir: string;

    /**
     * Valid log times
     * @type {{0: string; 1: string; 2: string; 3: string}}
     */
    protected log_types = {
        0: "debug",
        1: "info",
        2: "warn",
        3: "error"
    };

    constructor(options?: AntfarmOptions) {
        winston.emitErrs = true;
        this.options = options;
        this.createLogger();
    }

    /**
     * Console formatting function.
     * @param options
     * @returns {string}
     */
    protected consoleFormatter(options) {

        let kvString = "";

        _.forEach(options.meta, function(key, value){
            kvString += " " +
                        winston.config.colorize("silly", `${value}`) +
                        winston.config.colorize("debug", " > ") +
                        key;
        });

        let formattedDate = new Date().toLocaleString();

        return  winston.config.colorize(options.level, formattedDate) + " " +
                winston.config.colorize(options.level, _.padEnd(options.level, 6)) +
                options.message + " " +
                kvString;
    };

    /**
     * Initialize logger
     */
    protected createLogger() {
        let lg = this;
        if (this.options && this.options.log_dir) {

            // Create the log directory if it does not exist
            if (!fs.existsSync(this.options.log_dir)) {
                fs.mkdirSync(this.options.log_dir);
            }

            this.logger = new winston.Logger({
                transports: [
                    new winston.transports.File({
                        level: this.options.log_file_level || "info",
                        filename: `${this.options.log_dir}/antfarm.log`,
                        handleExceptions: true,
                        json: true,
                        maxsize: this.options.log_max_size || 5242880, // 5MB
                        maxFiles: this.options.log_max_files || 5,
                        colorize: false
                    }),
                    new winston.transports.Console({
                        level: this.options.log_out_level || "info",
                        handleExceptions: true,
                        prettyPrint: true,
                        colorize: true,
                        silent: false,
                        timestamp: function() {
                            return Date();
                        },
                        formatter: function(options) { return lg.consoleFormatter(options); }
                    })
                ],
                exitOnError: false
            });

        } else {
            this.logger = new winston.Logger({
                transports: [
                    new winston.transports.Console({
                        level: this.options.log_out_level || "info",
                        handleExceptions: true,
                        prettyPrint: true,
                        colorize: true,
                        silent: false,
                        timestamp: function() {
                            return Date();
                        },
                        formatter: function(options) { return lg.consoleFormatter(options); }
                    })
                ],
                exitOnError: false
            });
        }
    }

    /**
     * Generates a formatted logging entry.
     * @param entry
     * @param actor
     * @param instances
     * @returns {Object}
     */
    protected getEntry(entry: Object, actor?: any, instances = []) {
        instances.push(actor);
        if (instances) {
            instances.forEach(function(instance){
                if (instance && typeof instance !== "undefined") {
                    let super_name = instance.toString();

                    try {
                        entry[super_name] = instance.name;
                        if (super_name === "Job") entry["JobId"] = instance.getId();
                    } catch (e) {
                    }
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


    public query(options: LogQueryOptions, callback: any) {
        let l = this;
        l.logger.query(options, (err, results) => {
            if (err) {
                l.log(3, `Log query error: ${err}.`, l);
            }
            callback(results);
        });
    }

}

export interface LogQueryOptions {
    from: Date | number;
    until: Date | number;
    limit: number;
    start: number;
    order: string;
    fields: string[];
}