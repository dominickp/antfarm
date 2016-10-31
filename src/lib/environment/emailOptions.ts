export class EmailOptions {

    public subject: string;

    public to: string|string[];

    public cc: string|string[];

    public bcc: string|string[];

    /**
     * A _path to a Pug template file.
     */
    public template: string;

    /**
     * Email body as HTML.
     */
    public html: string;

    /**
     * Email body as plain-text.
     */
    public text: string;

}