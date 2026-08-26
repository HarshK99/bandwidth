// lib/direction/plan-ops.ts
// Every mutation of a DirectionPlan, as pure functions returning a new plan.
// The React layer only calls these — it never edits plan arrays inline, so
// the rules (normalised order, no duplicate assignments, orphan cleanup)
// live in exactly one place.

import { blockRunsOn, sortBlocks, WEEK_DAYS } from "./schedule";
import type {
  BlockType,
  DayOfWeek,
  DirectionPlan,
  TimeBlock,
  WeekAssignment,
} from "./types";

/** Re-index `order` to match chronological position. */
function normaliseBlocks(blocks: TimeBlock[]): TimeBlock[] {
  return sortBlocks(blocks).map((block, index) => ({ ...block, order: index }));
}

function nextBlockId(): string {
  return `blk-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// ---------- weekly template ----------

/**
 * Point one cell of the template at a hierarchy node (or at nothing).
 *
 * A per-day `label` survives — it names how that day uses the slot, which
 * doesn't change just because the area did. The `note` does not: it described
 * the old area, so keeping it would leave a stale line under a new one.
 * Clearing the area drops the whole assignment unless a label is holding it.
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

// ---------- date overrides ----------

/**
 * A blank area is kept as a real override — "nothing today" is a decision,
 * and it must survive rather than falling back to the template. Use
 * clearOverride to actually return the date to the template.
 */
export function setOverride(
  plan: DirectionPlan,
  date: string,
  blockId: string,
  nodeId: string
): DirectionPlan {
  const rest = plan.overrides.filter(
    (o) => !(o.date === date && o.blockId === blockId)
  );
  return { ...plan, overrides: [...rest, { date, blockId, nodeId }] };
}

export function clearOverride(
  plan: DirectionPlan,
  date: string,
  blockId: string
): DirectionPlan {
  return {
    ...plan,
    overrides: plan.overrides.filter(
      (o) => !(o.date === date && o.blockId === blockId)
    ),
  };
}

export function clearOverridesForDate(
  plan: DirectionPlan,
  date: string
): DirectionPlan {
  return {
    ...plan,
    overrides: plan.overrides.filter((o) => o.date !== date),
  };
}

// ---------- blocks ----------

export function updateBlock(
  plan: DirectionPlan,
  blockId: string,
  patch: Partial<Omit<TimeBlock, "id">>
): DirectionPlan {
  const blocks = plan.blocks.map((block) =>
    block.id === blockId ? { ...block, ...patch } : block
  );
  return { ...plan, blocks: normaliseBlocks(blocks) };
}

/**
 * Switch one day on or off for a block.
 *
 * All seven days drops the field entirely rather than storing the full list —
 * "every day" is the default, and a block carrying `days: [0,1,2,3,4,5,6]`
 * would be indistinguishable from one that had been deliberately set that
 * way. The last remaining day can't be switched off: a block that runs on no
 * day is a deleted block, and there's a button for that.
 *
 * Assignments on a switched-off day are kept. They go dormant — every
 * consumer filters through `blockRunsOn` — and come back intact if the day is
 * switched on again, which is what you want when you're trying a shape out.
 */
export function toggleBlockDay(
  plan: DirectionPlan,
  blockId: string,
  day: DayOfWeek
): DirectionPlan {
  const blocks = plan.blocks.map((block) => {
    if (block.id !== blockId) return block;

    const current = block.days ?? WEEK_DAYS;
    const next = blockRunsOn(block, day)
      ? current.filter((value) => value !== day)
      : [...current, day];
    if (next.length === 0) return block;

    const ordered = WEEK_DAYS.filter((value) => next.includes(value));
    if (ordered.length < WEEK_DAYS.length) return { ...block, days: ordered };

    const everyDay = { ...block };
    delete everyDay.days;
    return everyDay;
  });
  return { ...plan, blocks };
}

export function addBlock(
  plan: DirectionPlan,
  block?: Partial<Omit<TimeBlock, "id" | "order">>
): DirectionPlan {
  const newBlock: TimeBlock = {
    id: nextBlockId(),
    name: block?.name ?? "New block",
    start: block?.start ?? "12:00",
    end: block?.end ?? "13:00",
    type: (block?.type ?? "custom") as BlockType,
    order: plan.blocks.length,
  };
  return { ...plan, blocks: normaliseBlocks([...plan.blocks, newBlock]) };
}

/** Removing a block takes its assignments and overrides with it. */
export function removeBlock(plan: DirectionPlan, blockId: string): DirectionPlan {
  return {
    ...plan,
    blocks: normaliseBlocks(plan.blocks.filter((b) => b.id !== blockId)),
    assignments: plan.assignments.filter((a) => a.blockId !== blockId),
    overrides: plan.overrides.filter((o) => o.blockId !== blockId),
  };
}

/**
 * Move a block one position earlier/later by swapping start/end times with
 * its neighbour. Order follows the clock, so reordering *is* a time change —
 * anything else would leave the list sorted differently than it reads.
 */
export function moveBlock(
  plan: DirectionPlan,
  blockId: string,
  direction: -1 | 1
): DirectionPlan {
  const ordered = sortBlocks(plan.blocks);
  const index = ordered.findIndex((b) => b.id === blockId);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= ordered.length) return plan;

  const a = ordered[index];
  const b = ordered[target];
  const swapped = ordered.map((block) => {
    if (block.id === a.id) return { ...block, start: b.start, end: b.end };
    if (block.id === b.id) return { ...block, start: a.start, end: a.end };
    return block;
  });
  return { ...plan, blocks: normaliseBlocks(swapped) };
}
