import {FolderNest} from "./folderNest";
import {Environment} from "../environment/environment";

const   fs = require("fs"),
        tmp = require("tmp");

/**
 * An auto managed folder nest used for temporarily storing _files.
 */
export class AutoFolderNest extends FolderNest {

    protected hierarchy: string|string[];
    protected hierarchyString: string;

    constructor(e: Environment, hierarchy: string|string[]) {

        if (!e.getAutoManagedFolderDirectory()) {
            throw "Option auto_managed_folder_directory must be set to use auto managed folders.";
        }

        /**
         * Creates the hierarchy string used for the auto managed _path.
         * @param hierarchy
         */
        let getHierarchyString = (hierarchy: string|string[]) => {
            let hierarchyString = "";
            if (typeof(hierarchy) === "string") {
                hierarchyString = encodeURIComponent(hierarchy.toString());
            } else if (hierarchy instanceof Array) {
                hierarchy.forEach((pi) => {
                    hierarchyString += "/" + encodeURIComponent(pi);
                });
            } else {
                throw `Path should be a string or array, ${typeof(hierarchy)} found.`;
            }
            if (hierarchyString.charAt(0) !== "/") {
                hierarchyString = "/" + hierarchyString;
            }
            return hierarchyString;
        };

        let path = e.getAutoManagedFolderDirectory() + getHierarchyString(hierarchy);

        super(e, path, true);

        this.hierarchy = hierarchy;
        this.hierarchyString = getHierarchyString(hierarchy);

    }


}