// Pure schedule derivation. Dates denote the local 07:00-to-next-07:00 day.
import type { DayEntry, DayOfWeek, DaySchedule, DirectionPlan, TimeBlock } from "./types";

export const WEEK_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MINUTES_PER_DAY = 1440;
export function dayName(day: DayOfWeek): string { return DAY_NAMES[day]; }
export function shortDayName(day: DayOfWeek): string { return DAY_NAMES[day].slice(0, 3); }

export function toMinutes(value: string): number {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return NaN;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
export function operationalMinute(value: string): number {
  return (toMinutes(value) - 420 + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}
export function blockDurationMinutes(block: TimeBlock): number {
  const end = block.end === "07:00" ? 1440 : operationalMinute(block.end);
  return end - operationalMinute(block.start);
}
function blockStartMinutes(block: TimeBlock): number {
  return operationalMinute(block.start) + 420;
}
function blockEndMinutes(block: TimeBlock): number {
  return blockStartMinutes(block) + blockDurationMinutes(block);
}
export function sortBlocks(blocks: readonly TimeBlock[]): TimeBlock[] {
  return [...blocks].sort((a, b) => operationalMinute(a.start) - operationalMinute(b.start));
}
function minutesOfDay(date: Date): number { return date.getHours() * 60 + date.getMinutes(); }

export function toISODate(date: Date): string {
  return [String(date.getFullYear()).padStart(4, "0"), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}
export function fromISODate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(NaN);
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return toISODate(date) === value ? date : new Date(NaN);
}
export function addDays(date: Date, count: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + count);
  return result;
}
export function isSameDate(a: Date, b: Date): boolean { return toISODate(a) === toISODate(b); }
export function getOperationalDate(now: Date): Date {
  const date = new Date(now);
  if (now.getHours() < 7) date.setDate(date.getDate() - 1);
  date.setHours(0, 0, 0, 0);
  return date;
}
// Construct local instants rather than assuming every date contains 24 elapsed hours.
function blockInstant(date: Date, value: string, end = false): number {
  const minutes = toMinutes(value);
  const instant = addDays(date, minutes < 420 || (end && minutes === 420) ? 1 : 0);
  instant.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return instant.getTime();
}
export function getDaySchedule(plan: DirectionPlan, date: Date, now: Date): DaySchedule {
  const blocks = sortBlocks(plan.week[date.getDay() as DayOfWeek]);
  const clock = now.getTime();
  const entries: DayEntry[] = blocks.map((block) => {
    const start = blockInstant(date, block.start);
    const end = blockInstant(date, block.end, true);
    const status = clock >= end ? "past" : clock >= start ? "current" : "upcoming";
    return {
      block, name: block.name, status,
      minutesRemaining: status === "current" ? Math.ceil((end - clock) / 60000) : 0,
      progress: status === "current" ? (clock - start) / (end - start) : 0,
    };
  });
  const current = entries.find((entry) => entry.status === "current") ?? null;
  const next = entries.find((entry) => entry.status === "upcoming") ?? null;
  const minutesUntilNext = !current && next
    ? Math.ceil((blockInstant(date, next.block.start) - clock) / 60000) : null;
  return { blocks, entries, current, next, minutesUntilNext };
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

export function formatClock(date: Date): string {
  const { text, suffix } = toClock12(minutesOfDay(date));
  return `${text.includes(":") ? text : `${text}:00`}${suffix}`;
}
