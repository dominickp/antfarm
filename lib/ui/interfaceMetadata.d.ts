import { InterfaceProperty } from "./InterfaceProperty";
/**
 * Metadata of the interface itself.
 */
export interface InterfaceMetadata {
    /**
     * Description of the interface.
     */
    description?: string;
    /**
     * Tooltip
     */
    tooltip?: string;
    /**
     * Read-only properties as key => value pairs.
     */
    interfaceProperties?: InterfaceProperty[];
}
