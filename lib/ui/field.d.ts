interface FieldOptions {
    /**
     * The query string ID of the field.
     */
    id: string;
    /**
     * The human-readable field name.
     */
    name: string;
    /**
     * Field max character length.
     */
    max_length?: number;
    /**
     * Required flag.
     */
    required?: boolean;
    /**
     * Field type. Drop-down, text, etc..
     */
    type?: string;
    /**
     * Acceptable options
     */
    valueList: any[];
}
