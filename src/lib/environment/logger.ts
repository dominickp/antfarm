const   fs = require('fs'),
        winston = require('winston');
winston.emitErrs = true;

export class Logger {

    protected options: Options;

    protected logger;

    protected log_dir: string;

    protected log_types = {
        0: "debug",
        1: "info",
        2: "warning",
        3: "error"
    };

    constructor(options?: Options){

        this.options = options;

        this.createLogger();
    }


    createLogger(){
        if(this.options) {

            if (this.options.log_dir) {

                // Create the log directory if it does not exist
                if (!fs.existsSync(this.options.log_dir)) {
                    fs.mkdirSync(this.options.log_dir);
                }

                this.logger = new winston.Logger({
                    transports: [
                        new winston.transports.File({
                            level: this.options.log_file_level || 'info',
                            filename: `${this.options.log_dir}/somefile.log`,
                            handleExceptions: true,
                            json: true,
                            maxsize: this.options.log_max_size || 5242880, //5MB
                            maxFiles: this.options.log_max_files || 5,
                            colorize: false
                        }),
                        new winston.transports.Console({
                            level: this.options.log_out_level || 'debug',
                            handleExceptions: true,
                            json: false,
                            colorize: true,
                            prettyPrint: true
                        })
                    ],
                    exitOnError: false
                });
            }
        } else {
            this.logger = new winston.Logger({
                transports: [
                    new winston.transports.Console({
                        level: 'debug',
                        handleExceptions: true,
                        json: false,
                        colorize: true
                    })
                ],
                exitOnError: false
            });
        }
    }

    log(type: number, message: string){
        if(typeof(this.log_types[type]) == "undefined"){
            type = 0;
        }

        let log_types = this.log_types;

        if(log_types[type] == "debug"){
            this.logger.debug(message);
        } else if(log_types[type] == "info") {
            this.logger.info(message);
        } else if(log_types[type] == "warning") {
            this.logger.warn(message);
        } else if(log_types[type] == "error") {
            this.logger.error(message);
        }

    }
}