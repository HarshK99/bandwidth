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
}

/** The recurring weekly template: this day-of-week + this block → this area. */
export interface WeekAssignment {
  day: DayOfWeek;
  blockId: string;
  focus: string;
  /**
   * A quieter second line under the area — what that area means on this day
   * ("Client mid-week delivery push"). Direction, not a task: there is
   * nothing to complete, reorder or check off.
   */
  note?: string;
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
  focus: string; // "" is meaningful: explicitly nothing for that block
}

/** Everything the feature persists, as one object. */
export interface DirectionPlan {
  blocks: TimeBlock[];
  assignments: WeekAssignment[];
  overrides: DateOverride[];
}
