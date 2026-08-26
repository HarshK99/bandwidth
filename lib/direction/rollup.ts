// lib/direction/rollup.ts
// Weekly totals, read off the plan by walking each assignment's node up the
// hierarchy. Pure derivation — no React, no storage.
//
// This is what the nodeId pairing buys: hours per area, and the list of
// hierarchy nodes nothing points at, both computed rather than counted.

import type { HierarchyNode } from "../hierarchy-data";
import { getCoverageRows, type CoverageRow } from "./coverage";
import {
  blockDaysPerWeek,
  blockDurationMinutes,
  blockRunsOn,
  sortBlocks,
} from "./schedule";
import type { DayOfWeek, DirectionPlan, TimeBlock } from "./types";

interface WeeklyRollup {
  /** Structural nodes in tree order, with minutes rolled up from below. */
  rows: CoverageRow[];
  /** Nothing in the week points at these, or at anything beneath them. */
  gaps: HierarchyNode[];
  byDay: { day: DayOfWeek; minutes: number }[];
  namedMinutes: number;
  /** Everything awake that isn't pointed at an area: meals, routine, slack. */
  unnamedMinutes: number;
}

const DAY_ORDER: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

export function getWeeklyRollup(plan: DirectionPlan): WeeklyRollup {
  const blocks = new Map(sortBlocks(plan.blocks).map((b) => [b.id, b]));
  const perDay = new Map<DayOfWeek, number>();
  let named = 0;

  for (const assignment of plan.assignments) {
    const block = blocks.get(assignment.blockId);
    if (!block || !assignment.nodeId) continue;
    if (!blockRunsOn(block, assignment.day)) continue;
    const span = blockDurationMinutes(block);
    named += span;
    perDay.set(assignment.day, (perDay.get(assignment.day) ?? 0) + span);
  }

  // One tree walk, shared with the coverage view: it already credits every
  // ancestor and returns rows in depth-first order. Building them here from
  // the flat data file instead is what made this read as level-groups rather
  // than a tree, and gave Sustain's domains the indent of Build's.
  const rows = getCoverageRows(plan).filter((row) => row.node.level !== "task");
  const gaps: HierarchyNode[] = rows
    .filter((row) => row.minutes === 0)
    .map((row) => row.node);

  // The whole week of block time, so "unnamed" is honest rather than implied.
  // Times the days each block actually runs — a weekday-only block occupies
  // five mornings, not seven.
  const weekly = (block: TimeBlock) =>
    blockDurationMinutes(block) * blockDaysPerWeek(block);
  const weekMinutes = [...blocks.values()].reduce(
    (total, block) => total + weekly(block),
    0
  );
  const sleepMinutes = [...blocks.values()]
    .filter((block) => blockDurationMinutes(block) >= 240)
    .reduce((total, block) => total + weekly(block), 0);

  return {
    rows,
    gaps,
    byDay: DAY_ORDER.map((day) => ({ day, minutes: perDay.get(day) ?? 0 })),
    namedMinutes: named,
    unnamedMinutes: weekMinutes - sleepMinutes - named,
  };
}

/** "7h", "1.5h" — shared by both views that show weekly totals. */
export function formatHours(minutes: number): string {
  const value = minutes / 60;
  return `${Number.isInteger(value) ? value : value.toFixed(1)}h`;
}
