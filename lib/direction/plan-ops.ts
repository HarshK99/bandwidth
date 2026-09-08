// lib/direction/plan-ops.ts
// Every mutation of a DirectionPlan, as pure functions returning a new plan.
// The React layer only calls these — it never edits plan arrays inline, so
// the rules (no duplicate assignments, label kept across an area change) live
// in exactly one place.
//
// The day's block structure and single-date overrides are code-defined now
// (lib/life/life.ts, see docs/PLAN_SCHEDULE.md), so the only thing the UI
// still edits is which area a weekly cell points at.

import type { DayOfWeek, DirectionPlan, WeekAssignment } from "./types";

/**
 * Point one cell of the template at a hierarchy node (or at nothing).
 *
 * A per-day `label` survives — it names how that day uses the slot, which
 * doesn't change just because the area did. The `note` and the chosen `tasks`
 * do not: both described the old area, so keeping either would leave a stale
 * line under a new one. Clearing the area drops the whole assignment unless a
 * label is holding it.
 */
export function setAssignment(
  plan: DirectionPlan,
  day: DayOfWeek,
  blockId: string,
  nodeId: string
): DirectionPlan {
  const existing = plan.assignments.find(
    (a) => a.day === day && a.blockId === blockId
  );
  const rest = plan.assignments.filter(
    (a) => !(a.day === day && a.blockId === blockId)
  );
  if (!nodeId && !existing?.label) return { ...plan, assignments: rest };

  const next: WeekAssignment = { day, blockId };
  if (nodeId) next.nodeId = nodeId;
  if (existing?.label) next.label = existing.label;
  return { ...plan, assignments: [...rest, next] };
}
