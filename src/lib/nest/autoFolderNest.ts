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

        if (!e.autoManagedFolderDirectory) {
            throw "Option auto_managed_folder_directory must be set to use auto managed folders.";
        }

        let cleanDirSegment = function(name) {
            name = name.replace(/\s+/gi, "-"); // Replace white space with dash
            return name.replace(/[^a-zA-Z0-9\-\_\.]/gi, ""); // Strip any special charactere
        };

        /**
         * Creates the hierarchy string used for the auto managed _path.
         * @param hierarchy
         */
        let getHierarchyString = (hierarchy: string|string[]) => {
            let hierarchyString = "";
            if (typeof(hierarchy) === "string") {
                hierarchyString = cleanDirSegment(hierarchy.toString());
            } else if (hierarchy instanceof Array) {
                hierarchy.forEach((pi) => {
                    hierarchyString += "/" + cleanDirSegment(pi);
                });
            } else {
                throw `Path should be a string or array, ${typeof(hierarchy)} found.`;
            }
            if (hierarchyString.charAt(0) !== "/") {
                hierarchyString = "/" + hierarchyString;
            }
            return hierarchyString;
        };

        let path = e.autoManagedFolderDirectory + getHierarchyString(hierarchy);

        super(e, path, true);

        this.hierarchy = hierarchy;
        this.hierarchyString = getHierarchyString(hierarchy);

    }


}