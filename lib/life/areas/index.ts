// The two roots, and the id vocabulary derived from them.
//
// There is no "Total Capacity" node above these. It was one row reading
// "everything: 74.5h", which no view ever showed and neither needed.

import type { AreaIds } from "../schema";
import { build } from "./build";
import { sustain } from "./sustain";

export const AREAS = [build, sustain] as const;

/**
 * Every id in the tree, as a union: `"web"`, `"web.pipeline"`,
 * `"web.pipeline.outreach"`. This is what makes a mistyped reference in the
 * week grid a compile error rather than a slot that quietly books zero hours.
 */
export type NodeId = AreaIds<(typeof AREAS)[number]>;
