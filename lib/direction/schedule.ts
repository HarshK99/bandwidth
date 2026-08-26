// lib/direction/schedule.ts
// Pure derivation for the Direction feature — no React, no storage.
// Everything the views show about "what am I in / what's next" is computed
// here from a DirectionPlan plus a Date.

import { BLOCK_TYPE_META } from "./block-types";
import { getAreaLabel, getNode, getTasks } from "./nodes";
import type {
  DateOverride,
  DayOfWeek,
  DirectionPlan,
  TimeBlock,
  WeekAssignment,
} from "./types";

const MINUTES_PER_DAY = 1440;

/** Above this, a stage's tasks read as a list rather than as direction. */
const MAX_IMPLIED_TASKS = 3;

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
 * A block's end in minutes from *this day's* midnight, so a block that runs
 * past midnight returns more than 1440. An end at or before the start means
 * it wraps into the next day: 23:00–07:00 is 1380 → 1860 (8h), and the
 * common 20:00–00:00 case still lands exactly on 1440.
 */
function blockEndMinutes(block: TimeBlock): number {
  const start = toMinutes(block.start);
  const end = toMinutes(block.end);
  return end <= start ? end + MINUTES_PER_DAY : end;
}

/** True for a block that runs past midnight (sleep, typically). */
export function blockWraps(block: TimeBlock): boolean {
  return blockEndMinutes(block) > MINUTES_PER_DAY;
}

function blockStartMinutes(block: TimeBlock): number {
  return toMinutes(block.start);
}

export function blockDurationMinutes(block: TimeBlock): number {
  return blockEndMinutes(block) - blockStartMinutes(block);
}

/**
 * The day is modelled as running from this clock time to the same time the
 * next morning (see docs) — not from midnight. A block whose own start falls
 * before this (in practice, only sleep, whenever it starts after midnight)
 * still belongs at the *end* of the day's reading order, as the thing that
 * closes it out, not the thing that opens it.
 */
const DAY_STARTS_AT_MINUTES = 7 * 60;

/** Where a block sits in the day's reading order, 0 at the day's own start. */
function readingOrderMinutes(block: TimeBlock): number {
  const start = blockStartMinutes(block);
  return (start - DAY_STARTS_AT_MINUTES + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** Chronological order, with `order` as the tiebreaker for equal starts. */
export function sortBlocks(blocks: TimeBlock[]): TimeBlock[] {
  return [...blocks].sort(
    (a, b) => readingOrderMinutes(a) - readingOrderMinutes(b) || a.order - b.order
  );
}

/** No `days` means every day — the normal case, and the cheaper check. */
export function blockRunsOn(block: TimeBlock, day: DayOfWeek): boolean {
  return !block.days || block.days.includes(day);
}

/** How many days a week this block occupies — what weekly totals multiply by. */
export function blockDaysPerWeek(block: TimeBlock): number {
  return block.days?.length ?? 7;
}

/** The blocks a given weekday is actually made of, in clock order. */
export function blocksForDay(blocks: TimeBlock[], day: DayOfWeek): TimeBlock[] {
  return sortBlocks(blocks).filter((block) => blockRunsOn(block, day));
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
  return new Map(overrides.map((o) => [overrideKey(o.date, o.blockId), o.nodeId]));
}

export type BlockStatus = "past" | "current" | "upcoming";

export interface DayEntry {
  block: TimeBlock;
  /** The block's name on this day — an assignment may rename it. */
  name: string;
  focus: string;
  /** What the block is for today, as lines. Empty when there is nothing. */
  notes: string[];
  /** The hierarchy node in play, for rollups. Empty when unassigned. */
  nodeId: string;
  /** Label of what this slot's output serves, when it serves something else. */
  serves: string;
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
  /**
   * The blocks this day is made of — `plan.blocks` minus the ones that don't
   * run today. Returned so the ruler and the day-progress bar measure the
   * same day the entries describe.
   */
  blocks: TimeBlock[];
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
  const blocks = blocksForDay(plan.blocks, day);
  const assignments = indexAssignments(plan.assignments);
  const overrides = indexOverrides(plan.overrides);

  const isToday = now !== null && isSameDate(date, now);
  const nowMinutes = isToday && now ? minutesOfDay(now) : null;

  const entries: DayEntry[] = blocks.map((block) => {
    const assignment = assignments.get(assignmentKey(day, block.id));
    const override = overrides.get(overrideKey(iso, block.id));

    const nodeId = override ?? assignment?.nodeId ?? "";
    const node = nodeId ? getNode(nodeId) : null;
    // The area is the *context* line: the domain a stage belongs to. Dropped
    // when it would only repeat the lead.
    const area = nodeId ? getAreaLabel(nodeId) : "";
    // The note belongs to the area: overriding the area makes the template's
    // note wrong, so it doesn't survive. The label is the opposite — it
    // describes how the day uses the slot, which an override doesn't change.
    const rawNote = override !== undefined ? undefined : assignment?.note;
    const written =
      rawNote === undefined ? [] : Array.isArray(rawNote) ? rawNote : [rawNote];
    // Named tasks, then the node's own — stop retyping what the tree already
    // says. A written note still wins: it describes today specifically, which
    // is always more than a standing task can.
    const listed =
      override !== undefined
        ? []
        : (assignment?.tasks ?? [])
            .map((task) => getNode(task)?.label)
            .filter((label): label is string => Boolean(label));
    // Falling back to every task only reads as direction while the list is
    // short. Past that it's a menu, and the stage's own name says more.
    const own = nodeId ? getTasks(nodeId) : [];
    const implied = own.length > 0 && own.length <= MAX_IMPLIED_TASKS
      ? own.map((task) => task.label)
      : [];
    const notes =
      written.length > 0
        ? written
        : listed.length > 0
          ? listed
          : implied.length > 0
            ? implied
            : node
              ? [node.label]
              : [];
    const name = assignment?.label ?? block.name;
    // An override replaces the area, so the template's purpose goes with it.
    const servesId = override !== undefined ? undefined : assignment?.serves;
    const serves = servesId ? (getNode(servesId)?.label ?? "") : "";
    // Dropped when it would only repeat the lead or the block's own name.
    const focus = area && area !== notes[0] && area !== name ? area : "";

    const start = blockStartMinutes(block);
    const end = blockEndMinutes(block);

    let status: BlockStatus = "upcoming";
    let minutesRemaining = 0;
    let progress = 0;
    if (nowMinutes !== null) {
      // A wrapping block owns both ends of the clock, so the small hours are
      // measured against the previous evening: 03:00 reads as 1620, inside
      // 23:00–07:00.
      const clock =
        end > MINUTES_PER_DAY && nowMinutes < start
          ? nowMinutes + MINUTES_PER_DAY
          : nowMinutes;

      if (clock >= end) status = "past";
      else if (clock >= start) {
        status = "current";
        minutesRemaining = end - clock;
        progress = end > start ? (clock - start) / (end - start) : 0;
      }
    }

    return {
      block,
      name,
      focus,
      notes,
      nodeId,
      serves,
      isOverride: override !== undefined,
      status,
      minutesRemaining,
      progress,
    };
  });

  // Adjacent blocks that touch and say the exact same thing - Sunday's CTP,
  // Dinner and Hobbies can all resolve to "Relationships / Protected
  // family/friends time" - read as an error repeated three times, not as
  // three facts. Blank every repeat, so TimelineRow's own fallback promotes
  // each block's name into the lead: the run says what it is once, at its
  // head, and just names itself after that.
  //
  // Content is compared against the head of the run (not blanked, even
  // across several repeats), but adjacency is checked against the immediate
  // neighbour: a blanked entry is still physically touching the one after
  // it, so the chain must not break just because its own content was
  // cleared.
  let head: DayEntry | null = null;
  entries.forEach((entry, index) => {
    const prevEntry = index > 0 ? entries[index - 1] : null;
    const touchesPrev = prevEntry !== null && prevEntry.block.end === entry.block.start;
    const sameAsHead =
      touchesPrev &&
      head !== null &&
      Boolean(entry.nodeId) &&
      entry.nodeId === head.nodeId &&
      entry.notes.join("|") === head.notes.join("|") &&
      entry.focus === head.focus &&
      entry.serves === head.serves;

    if (sameAsHead) {
      entry.notes = [];
      entry.focus = "";
      entry.serves = "";
    } else {
      head = entry;
    }
  });

  const current = entries.find((entry) => entry.status === "current") ?? null;
  const next = entries.find((entry) => entry.status === "upcoming") ?? null;
  const minutesUntilNext =
    !current && next && nowMinutes !== null
      ? blockStartMinutes(next.block) - nowMinutes
      : null;

  return { date, iso, day, blocks, entries, current, next, minutesUntilNext };
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
function formatRangeParts(block: TimeBlock): { start: string; end: string } {
  const start = toClock12(blockStartMinutes(block));
  const end = toClock12(blockEndMinutes(block));
  return {
    start: start.suffix === end.suffix ? start.text : `${start.text}${start.suffix}`,
    end: `${end.text}${end.suffix}`,
  };
}

export interface RulerTick {
  /** 0–1 down the block's own height. */
  offset: number;
  label: string;
  /** A block start that doesn't land on the hour. */
  offHour: boolean;
}

/**
 * The left column as a continuous clock: every hour from the day's first to
 * its last, in order, never skipped or repeated.
 *
 * The scale is *piecewise*, not uniform — each hour sits at its proportional
 * position inside its own block, and block heights aren't proportional to
 * duration. So an hour of deep work is physically shorter than an hour of
 * admin. That's the trade for keeping a whole day on two screens: a uniform
 * scale would make 09:00–12:00 six times a 30-minute block and turn the page
 * into a calendar.
 *
 * A meridiem is printed only when it changes, the way a clock reads: 7am, 8,
 * 9 … 12pm, 1, 2 … 12am, 2, 4.
 */
export function getDayRuler(blocks: TimeBlock[]): Map<string, RulerTick[]> {
  const ordered = sortBlocks(blocks);
  const ruler = new Map<string, RulerTick[]>();
  let meridiem: "am" | "pm" | null = null;

  const label = (minutes: number): string => {
    const clock = toClock12(minutes);
    const text =
      clock.suffix === meridiem ? clock.text : `${clock.text}${clock.suffix}`;
    meridiem = clock.suffix;
    return text;
  };

  ordered.forEach((block, index) => {
    const start = blockStartMinutes(block);
    const end = blockEndMinutes(block);
    const span = end - start;
    if (span <= 0) {
      ruler.set(block.id, []);
      return;
    }

    const ticks: RulerTick[] = [];
    if (start % 60 !== 0) {
      ticks.push({ offset: 0, label: label(start), offHour: true });
    }

    const first = Math.ceil(start / 60) * 60;
    for (let minute = first; minute < end; minute += 60) {
      // Long blocks (sleep) thin to every other hour so the marks don't
      // crowd. Anchored to even hours, which keeps midnight on the ruler.
      const thinned = span > 240 && minute !== first && (minute / 60) % 2 !== 0;
      if (thinned) continue;
      ticks.push({ offset: (minute - start) / span, label: label(minute), offHour: false });
    }

    // The last block closes the loop — its end is the next day's first hour.
    if (index === ordered.length - 1) {
      ticks.push({ offset: 1, label: label(end), offHour: false });
    }

    ruler.set(block.id, ticks);
  });

  return ruler;
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
 * How far `now` is through the day's blocked span (first start → last end),
 * 0–1, or null when there is nothing to measure. Deliberately not
 * midnight-to-midnight: a day that starts at 07:00 and ends in the small
 * hours is one span, not two.
 */
export function getDayProgress(blocks: TimeBlock[], now: Date): number | null {
  const ordered = sortBlocks(blocks);
  if (ordered.length === 0) return null;
  const start = blockStartMinutes(ordered[0]);
  const end = blockEndMinutes(ordered[ordered.length - 1]);
  if (end <= start) return null;

  const nowMinutes = minutesOfDay(now);
  // Before the first block but inside a wrapping last block: still last night.
  const clock =
    end > MINUTES_PER_DAY && nowMinutes < start
      ? nowMinutes + MINUTES_PER_DAY
      : nowMinutes;

  if (clock <= start) return 0;
  if (clock >= end) return 1;
  return (clock - start) / (end - start);
}

/**
 * The area the day mostly goes to, by minutes — "today is a freelance day".
 *
 * Counts the blocks the day is *built* around (focus, execution, thinking)
 * rather than every assigned minute. Admin, buffer and evening hours are
 * real, but a day isn't themed by its errands, and sleep and meals — which
 * carry no area at all — never enter it. Falls back to every assigned block
 * if nothing structural is assigned, and to null if nothing is.
 */
export function getDayTheme(entries: DayEntry[]): string | null {
  const total = (only: (entry: DayEntry) => boolean) => {
    const minutes = new Map<string, number>();
    for (const entry of entries) {
      if (!entry.focus || !only(entry)) continue;
      minutes.set(
        entry.focus,
        (minutes.get(entry.focus) ?? 0) + blockDurationMinutes(entry.block)
      );
    }
    // Ties go to the earlier block: entries are chronological, and a tied
    // morning reads as the day's theme more than a tied evening.
    let theme: string | null = null;
    let best = 0;
    for (const [focus, sum] of minutes) {
      if (sum > best) {
        best = sum;
        theme = focus;
      }
    }
    return theme;
  };

  const structural = (entry: DayEntry) =>
    BLOCK_TYPE_META[entry.block.type].emphasis === "strong";
  return total(structural) ?? total(() => true);
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
