var chalk = require('chalk');

export class Environment {

    protected log_types = {
        0: "debug",
        1: "info",
        2: "warning",
        3: "error"
    };

    log(type: number, message: string){
        if(typeof(this.log_types[type]) == "undefined"){
            type = 0;
        }

        let log_string = "» ";
        let log_types = this.log_types;

        if(log_types[type] == "debug"){
            log_string += chalk.cyan(log_types[type] + ": " + message);
        } else if(log_types[type] == "info") {
            log_string += chalk.white(log_types[type] + ": " + message);
        } else if(log_types[type] == "warning") {
            log_string += chalk.yellow(log_types[type] + ": " + message);
        } else if(log_types[type] == "error") {
            log_string += chalk.red(log_types[type] + ": " + message);
        }

        console.log(log_string);

    }
}