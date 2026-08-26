// lib/direction/schedule.ts
// Pure derivation for the Direction feature — no React, no storage.
// Everything the views show about "what am I in / what's next" is computed
// here from a DirectionPlan plus a Date.

import type {
  DateOverride,
  DayOfWeek,
  DirectionPlan,
  TimeBlock,
  WeekAssignment,
} from "./types";

const MINUTES_PER_DAY = 1440;

/** Week starts Monday — the template is read as a working week. */
export const WEEK_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function dayName(day: DayOfWeek): string {
  return DAY_NAMES[day];
}

export function shortDayName(day: DayOfWeek): string {
  return DAY_NAMES[day].slice(0, 3);
}

/** "HH:MM" → minutes from midnight. Invalid input reads as 0. */
export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

/**
 * A block's end in minutes. An end at or before the start means "runs to
 * midnight" (so 20:00–00:00 works); blocks are never allowed to wrap into
 * the next day — that would make "which block am I in" ambiguous.
 */
function blockEndMinutes(block: TimeBlock): number {
  const start = toMinutes(block.start);
  const end = toMinutes(block.end);
  return end <= start ? MINUTES_PER_DAY : end;
}

function blockStartMinutes(block: TimeBlock): number {
  return toMinutes(block.start);
}

export function blockDurationMinutes(block: TimeBlock): number {
  return blockEndMinutes(block) - blockStartMinutes(block);
}

/** Chronological order, with `order` as the tiebreaker for equal starts. */
export function sortBlocks(blocks: TimeBlock[]): TimeBlock[] {
  return [...blocks].sort(
    (a, b) => blockStartMinutes(a) - blockStartMinutes(b) || a.order - b.order
  );
}

function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Local calendar date as "YYYY-MM-DD" (never UTC — days are local here). */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isSameDate(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

// ---------- focus resolution ----------

/** Key for the maps built by indexAssignments/indexOverrides. */
export function assignmentKey(day: DayOfWeek, blockId: string): string {
  return `${day}:${blockId}`;
}

function overrideKey(date: string, blockId: string): string {
  return `${date}:${blockId}`;
}

export function indexAssignments(
  assignments: WeekAssignment[]
): Map<string, WeekAssignment> {
  return new Map(assignments.map((a) => [assignmentKey(a.day, a.blockId), a]));
}

function indexOverrides(overrides: DateOverride[]): Map<string, string> {
  return new Map(
    overrides.map((o) => [overrideKey(o.date, o.blockId), o.focus])
  );
}

export type BlockStatus = "past" | "current" | "upcoming";

export interface DayEntry {
  block: TimeBlock;
  /** The block's name on this day — an assignment may rename it. */
  name: string;
  focus: string;
  /** Quiet second line under the area. Empty when there isn't one. */
  note: string;
  /** True when a date override supplied this focus (including a blank one). */
  isOverride: boolean;
  status: BlockStatus;
  /** Minutes left in the block — only meaningful when status is "current". */
  minutesRemaining: number;
  /** 0–1 through the block. Only meaningful when status is "current". */
  progress: number;
}

interface DaySchedule {
  date: Date;
  iso: string;
  day: DayOfWeek;
  entries: DayEntry[];
  current: DayEntry | null;
  next: DayEntry | null;
  /** Minutes until `next` starts, when there is no current block. */
  minutesUntilNext: number | null;
}

/**
 * Resolve one day: every block in chronological order, its focus (override
 * beats template), and — when `now` falls on that date — which block is
 * live. Pass `now` as null (or a date other than `date`) to get a plain,
 * status-free view of the day, which is what the week view wants.
 */
export function getDaySchedule(
  plan: DirectionPlan,
  date: Date,
  now: Date | null = null
): DaySchedule {
  const iso = toISODate(date);
  const day = date.getDay() as DayOfWeek;
  const blocks = sortBlocks(plan.blocks);
  const assignments = indexAssignments(plan.assignments);
  const overrides = indexOverrides(plan.overrides);

  const isToday = now !== null && isSameDate(date, now);
  const nowMinutes = isToday && now ? minutesOfDay(now) : null;

  const entries: DayEntry[] = blocks.map((block) => {
    const assignment = assignments.get(assignmentKey(day, block.id));
    const override = overrides.get(overrideKey(iso, block.id));

    const focus = override ?? assignment?.focus ?? "";
    // The note belongs to the area: overriding the area makes the template's
    // note wrong, so it doesn't survive. The label is the opposite — it
    // describes how the day uses the slot, which an override doesn't change.
    const note = override !== undefined ? "" : (assignment?.note ?? "");
    const name = assignment?.label ?? block.name;

    const start = blockStartMinutes(block);
    const end = blockEndMinutes(block);

    let status: BlockStatus = "upcoming";
    let minutesRemaining = 0;
    let progress = 0;
    if (nowMinutes !== null) {
      if (nowMinutes >= end) status = "past";
      else if (nowMinutes >= start) {
        status = "current";
        minutesRemaining = end - nowMinutes;
        progress = end > start ? (nowMinutes - start) / (end - start) : 0;
      }
    }

    return {
      block,
      name,
      focus,
      note,
      isOverride: override !== undefined,
      status,
      minutesRemaining,
      progress,
    };
  });

  const current = entries.find((entry) => entry.status === "current") ?? null;
  const next = entries.find((entry) => entry.status === "upcoming") ?? null;
  const minutesUntilNext =
    !current && next && nowMinutes !== null
      ? blockStartMinutes(next.block) - nowMinutes
      : null;

  return { date, iso, day, entries, current, next, minutesUntilNext };
}

// ---------- formatting ----------

interface Clock12 {
  /** "8", "2:30" — no meridiem, so a range can share one. */
  text: string;
  suffix: "am" | "pm";
}

function toClock12(minutes: number): Clock12 {
  const wrapped = minutes % MINUTES_PER_DAY;
  const hours24 = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return {
    text: mins === 0 ? `${hours12}` : `${hours12}:${String(mins).padStart(2, "0")}`,
    suffix: hours24 < 12 ? "am" : "pm",
  };
}

/**
 * Start and end as two lines. A shared meridiem prints once, on the end —
 * "8" over "10am", "1" over "2:30pm" — so the stacked column stays about
 * four characters wide instead of nine.
 */
export function formatRangeParts(block: TimeBlock): { start: string; end: string } {
  const start = toClock12(blockStartMinutes(block));
  const end = toClock12(blockEndMinutes(block));
  return {
    start: start.suffix === end.suffix ? start.text : `${start.text}${start.suffix}`,
    end: `${end.text}${end.suffix}`,
  };
}

/**
 * Compact 12-hour range on one line: "8–10am", "10am–1pm", "1–2:30pm". Used
 * where a block is named inside running text or a dense list.
 */
export function formatRange(block: TimeBlock): string {
  const { start, end } = formatRangeParts(block);
  return `${start}–${end}`;
}

/**
 * How far `now` is through the day's *blocked* span (first start → last end),
 * 0–1, or null when the day isn't underway. Deliberately not
 * midnight-to-midnight: the hours you don't block shouldn't count as
 * progress.
 */
export function getDayProgress(blocks: TimeBlock[], now: Date): number | null {
  const ordered = sortBlocks(blocks);
  if (ordered.length === 0) return null;
  const start = blockStartMinutes(ordered[0]);
  const end = blockEndMinutes(ordered[ordered.length - 1]);
  if (end <= start) return null;
  const nowMinutes = minutesOfDay(now);
  if (nowMinutes <= start) return 0;
  if (nowMinutes >= end) return 1;
  return (nowMinutes - start) / (end - start);
}

/** "1h 12m" / "45m" — used for "time left in this block". */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatWeekday(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "long" });
}

export function formatDayMonth(date: Date): string {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Compact form for chips and lists, e.g. "Wed 26 Aug". */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function fromISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatClock(date: Date): string {
  const { text, suffix } = toClock12(minutesOfDay(date));
  return `${text.includes(":") ? text : `${text}:00`}${suffix}`;
}
