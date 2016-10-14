import { EmailOptions } from "./emailOptions";
/**
 * Emailing service
 */
export declare class Emailer {
    protected port: number;
    constructor();
    sendMail(options: EmailOptions): void;
}
