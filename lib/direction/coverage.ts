// lib/direction/coverage.ts
// "Does everything have a place?" — the hierarchy walked top to bottom with
// the week's hours attached, so a gap is something you can see rather than
// something you have to remember to look for.
//
// Three states, because two would lie. A task under a scheduled stage does
// get time — it just isn't named by any block — and calling that a gap would
// bury the real gaps in noise.

import { hierarchyData, type HierarchyNode } from "../hierarchy-data";
import {
  blockDurationMinutes,
  blockRunsOn,
  sortBlocks,
  WEEK_DAYS,
} from "./schedule";
import type { DayOfWeek, DirectionPlan } from "./types";

type CoverageState =
  /** This node, or something beneath it, has scheduled time. */
  | "covered"
  /** Nothing here or below, but an ancestor is scheduled — it happens inside that. */
  | "inherited"
  /** No time anywhere in its chain. */
  | "gap";

export interface CoverageRow {
  node: HierarchyNode;
  /**
   * The parent *within this list* — null for the top rows. The capacity root
   * isn't included (a row reading "everything: 74.5h" tells you nothing), so
   * pointing at it would orphan every master function.
   */
  parentId: string | null;
  depth: number;
  hasChildren: boolean;
  minutes: number;
  /**
   * Minutes that *serve* this node from elsewhere in the tree — content shot
   * under Personal Brand but aimed at Wave. Kept apart from `minutes`: it is
   * real investment, but it isn't this branch's own time.
   */
  viaMinutes: number;
  state: CoverageState;
  /** Where it is scheduled, e.g. "Mon Wed · Second Push". Empty unless named. */
  slots: string[];
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Flat, in depth-first order — the view handles expansion by filtering. */
export function getCoverageRows(plan: DirectionPlan): CoverageRow[] {
  const childrenOf = new Map<string | null, HierarchyNode[]>();
  for (const node of hierarchyData) {
    const list = childrenOf.get(node.parentId) ?? [];
    list.push(node);
    childrenOf.set(node.parentId, list);
  }

  const blocks = new Map(sortBlocks(plan.blocks).map((b) => [b.id, b]));

  // Minutes credited to a node and every ancestor of it.
  const minutes = new Map<string, number>();
  const via = new Map<string, number>();
  const namedHere = new Set<string>();
  const slotsByNode = new Map<string, Map<string, Set<DayOfWeek>>>();

  const parentOf = new Map(hierarchyData.map((n) => [n.id, n.parentId]));

  for (const assignment of plan.assignments) {
    const block = blocks.get(assignment.blockId);
    if (!block || !assignment.nodeId) continue;
    // An assignment on a day its block doesn't run is dormant, not scheduled:
    // counting it would credit hours that never happen.
    if (!blockRunsOn(block, assignment.day)) continue;
    namedHere.add(assignment.nodeId);

    const perBlock = slotsByNode.get(assignment.nodeId) ?? new Map();
    const days = perBlock.get(block.name) ?? new Set<DayOfWeek>();
    days.add(assignment.day);
    perBlock.set(block.name, days);
    slotsByNode.set(assignment.nodeId, perBlock);

    const span = blockDurationMinutes(block);
    let id: string | null | undefined = assignment.nodeId;
    while (id) {
      minutes.set(id, (minutes.get(id) ?? 0) + span);
      id = parentOf.get(id) ?? null;
    }

    let servedId: string | null | undefined = assignment.serves;
    while (servedId) {
      via.set(servedId, (via.get(servedId) ?? 0) + span);
      servedId = parentOf.get(servedId) ?? null;
    }
  }

  const rows: CoverageRow[] = [];
  const walk = (node: HierarchyNode, depth: number, ancestorNamed: boolean) => {
    const total = minutes.get(node.id) ?? 0;
    const children = childrenOf.get(node.id) ?? [];

    const perBlock = slotsByNode.get(node.id);
    const slots = perBlock
      ? [...perBlock.entries()].map(([blockName, days]) => {
          const ordered = WEEK_DAYS.filter((day) => days.has(day));
          const weekdays =
            ordered.length === 5 && ordered.every((day) => day >= 1 && day <= 5);
          const when =
            ordered.length === 7
              ? "Daily"
              : weekdays
                ? "Weekdays"
                : ordered.map((day) => DAY_NAMES[day]).join(" ");
          return `${when} · ${blockName}`;
        })
      : [];

    rows.push({
      node,
      parentId: depth === 0 ? null : node.parentId,
      depth,
      hasChildren: children.length > 0,
      minutes: total,
      viaMinutes: via.get(node.id) ?? 0,
      // State follows owned time only: hours aimed *at* a goal don't mean its
      // own stages are covered.
      state: total > 0 ? "covered" : ancestorNamed ? "inherited" : "gap",
      slots,
    });

    for (const child of children) {
      walk(child, depth + 1, ancestorNamed || namedHere.has(node.id));
    }
  };

  // Start at the master functions: the capacity root is the whole tree, and
  // a row saying "everything: 74.5h" tells you nothing.
  for (const top of childrenOf.get("capacity-root") ?? []) walk(top, 0, false);
  return rows;
}
