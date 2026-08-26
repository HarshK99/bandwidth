// lib/direction/types.ts
// Types for the Direction feature — "what kind of work should I be doing
// right now, and on what area". Deliberately has NO task entity: the model
// is only Block × Day → focus, plus per-date exceptions.

/**
 * Block type. Influences presentation only (see BLOCK_TYPE_META in
 * lib/direction/block-types.ts) — never scheduling behaviour.
 */
export type BlockType =
  | "focus"
  | "execution"
  | "admin"
  | "buffer"
  | "thinking"
  | "hobby"
  | "custom";

/** 0 = Sunday … 6 = Saturday — matches Date.prototype.getDay(). */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TimeBlock {
  id: string;
  name: string; // "Complex problem solving"
  start: string; // "HH:MM", 24h, local time
  end: string; // "HH:MM" — "00:00" means midnight at the end of the day
  type: BlockType;
  order: number; // ascending; normalised on every mutation
  /**
   * The days this block actually runs. Omitted — the normal case — means all
   * seven.
   *
   * Before this existed, "weekdays only" could only be said by leaving the
   * weekend cells unassigned, which is a different statement: the block still
   * stood there on Saturday, empty, as if something were missing. Prep on a
   * Sunday isn't unplanned, it doesn't happen.
   *
   * Assignments for a day the block no longer runs are kept, not deleted:
   * they go dormant and come back if the day is switched on again. Every
   * consumer filters through `blockRunsOn`.
   */
  days?: DayOfWeek[];
}

/** The recurring weekly template: this day-of-week + this block → this area. */
export interface WeekAssignment {
  day: DayOfWeek;
  blockId: string;
  /**
   * The hierarchy node this block is aimed at (see lib/direction/nodes.ts).
   * Not free text: a typed area silently drops out of every rollup, which is
   * exactly how Relationships and Financial Health came to show zero hours
   * while actually occupying four. Omit it for a block that genuinely has no
   * area — lunch, sleep, open time.
   */
  nodeId?: string;
  /**
   * What this block is actually for on this day ("Website dev"). One line,
   * or a few when the block genuinely holds two things — buffer time is
   * loose ends *and* the day's reading. Direction, not a task list: there is
   * nothing to complete, reorder or check off.
   */
  note?: string | string[];
  /**
   * What this slot's output is *for*, when that differs from where the work
   * sits in the tree. Content is one skill serving several goals: the
   * scripting stage lives under Personal Brand, but a given Thursday's script
   * may be marketing for Wave. Without this the hours all land on Audience
   * and "how much am I investing in marketing Wave?" has no answer.
   *
   * Attribution here is approximate on purpose — one shoot can produce two
   * videos. It records primary intent, not accounting.
   */
  serves?: string;
  /**
   * Renames the block for this day only. Some days genuinely use a slot
   * differently — Saturday's 9–12 is filming, not deep work — and calling it
   * by the weekday name would simply be wrong. The block still owns the
   * hours; only its name changes.
   */
  label?: string;
}

/** A one-off exception for a specific date. Never edits the template. */
export interface DateOverride {
  date: string; // ISO "YYYY-MM-DD", local calendar date
  blockId: string;
  /** "" is meaningful: explicitly nothing for that block, that day. */
  nodeId: string;
}

/**
 * The shape this build writes. Bumped whenever a stored plan needs changing
 * to be read correctly — see the migration ladder in storage.ts. Cheap to
 * carry now, impossible to add retroactively: without it, an old plan and a
 * new one are indistinguishable.
 */
export const PLAN_VERSION = 1;

/** Everything the feature persists, as one object. */
export interface DirectionPlan {
  /** Absent in plans stored before versioning; read as 0. */
  version: number;
  blocks: TimeBlock[];
  assignments: WeekAssignment[];
  overrides: DateOverride[];
}
