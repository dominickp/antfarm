import { FileJob } from "./fileJob";
import { File } from "./file";
import { Environment } from "./../environment/environment";
export declare class S3FileJob extends FileJob {
    protected _file: File;
    private _bucket;
    private _key;
    private _eTag;
    constructor(e: Environment, basename: any);
    /**
     * Get remote bucket location.
     * @returns {string}
     */
    /**
     * Set remote bucket location.
     * @param bucket
     */
    bucket: string;
    /**
     * Get remote key
     * @returns {string}
     */
    /**
     * Set remote key.
     * @param key
     */
    key: string;
    /**
     * Get remote ETag
     * @returns {string}
     */
    /**
     * Set remote ETag
     * @param eTag
     */
    eTag: string;
}
