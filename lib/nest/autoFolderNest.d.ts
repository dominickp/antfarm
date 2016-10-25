import { FolderNest } from "./folderNest";
import { Environment } from "../environment/environment";
/**
 * An auto managed folder nest used for temporarily storing files.
 */
export declare class AutoFolderNest extends FolderNest {
    protected hierarchy: string | string[];
    protected hierarchyString: string;
    constructor(e: Environment, hierarchy: string | string[]);
}
