// lib/direction/focus.ts
// Which areas to offer when assigning a focus. The plan is its own
// vocabulary: the areas already in use, most-used first. No separate list to
// keep in sync — an area exists because some block points at it.

import type { DirectionPlan } from "./types";

export function getFocusSuggestions(plan: DirectionPlan, limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const { focus } of plan.assignments) {
    if (focus) counts.set(focus, (counts.get(focus) ?? 0) + 1);
  }
  for (const { focus } of plan.overrides) {
    if (focus) counts.set(focus, (counts.get(focus) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([focus]) => focus);
}
