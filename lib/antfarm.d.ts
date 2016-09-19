import { Tunnel } from "./tunnel/tunnel";
import { Nest } from "./nest/nest";
import { Job } from "./job/job";
/**
 * Expose `Antfarm`.
 */
export interface Antfarm {
    tunnel: Tunnel;
    nest: Nest;
    job: Job;
}
