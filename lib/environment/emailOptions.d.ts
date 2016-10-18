export declare class EmailOptions {
    subject: string;
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    /**
     * A path to a Pug template file.
     */
    template?: string;
    /**
     * Email body as HTML.
     */
    html?: string;
    /**
     * Email body as plain-text.
     */
    text?: string;
}
