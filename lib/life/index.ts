// lib/life/index.ts
// One import point: the authored files above, compiled to the flat arrays the
// rest of the app queries, and checked once on the way through.

import type { DirectionPlan } from "../direction/types";
import { PLAN_VERSION } from "../direction/types";
import { AREAS } from "./areas";
import { DAY, WEEK } from "./life";
import { buildBlocks, buildWeek, flatten, validate } from "./schema";
import type { HierarchyNode } from "./schema";

export type { HierarchyNode, NodeKind } from "./schema";
export type { NodeId } from "./areas";
export type { BlockId } from "./life";

/** The tree, depth-first in authored order. */
export const hierarchy: HierarchyNode[] = flatten(AREAS);

const BLOCKS = buildBlocks(DAY);
const ASSIGNMENTS = buildWeek(WEEK, BLOCKS);

// Ids are checked by the compiler; everything it can't reach is checked here,
// once, at import. A broken reference should fail at startup rather than turn
// up months later as an area quietly worth zero hours.
validate(hierarchy, BLOCKS, ASSIGNMENTS);

/**
 * The shipped week. Once anything is edited the stored plan wins entirely
 * (see lib/direction/storage.ts) and this is only read again on a reset.
 */
export function createDefaultPlan(): DirectionPlan {
  return {
    version: PLAN_VERSION,
    blocks: BLOCKS.map((block) => ({ ...block })),
    assignments: ASSIGNMENTS.map((assignment) => ({ ...assignment })),
    overrides: [],
  };
}
