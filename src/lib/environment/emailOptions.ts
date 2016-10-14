export class EmailOptions {

    public subject: string;

    public to: string|string[];

    public cc: string|string[];

    public bcc: string|string[];

    public templatePath?: string;

    public body?: string;

}