import { Tunnel } from "./tunnel/tunnel";
import { Nest } from "./nest/nest";
import { Folder } from "./nest/folder";
import { Job } from "./job/job";
/**
 * Expose `Antfarm`.
 */
export interface Antfarm {
    tunnel: Tunnel;
    nest: Nest;
    folder: Folder;
    job: Job;
}
