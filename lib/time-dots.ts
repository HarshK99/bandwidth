// lib/time-dots.ts
// Pure data layer for the Time Dots view — no UI. Mirrors lib/life's
// split between data/derivation and rendering.
//
// All "elapsed" counts use Jan 1 as the turnover point (calendar year), not
// exact anniversary dates — e.g. a life-year is considered "done" on Jan 1
// of the following year, not on the birthday. Simpler and good enough for a
// visual "how much is left" gut-check.

import type { Milestone } from "./milestones";

export const BIRTH_YEAR = 1999;
export const LIFE_EXPECTANCY_YEARS = 70;
export const WEEKS_PER_YEAR = 52;

export type TimeUnit = "day" | "week";
export type LifeUnit = "year" | "week";

export interface DotCount {
  total: number;
  elapsed: number;
}

export interface LifeWeeksCount extends DotCount {
  weeksPerYear: number;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function dayOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffMs = date.getTime() - startOfYear.getTime();
  return Math.floor(diffMs / 86_400_000) + 1;
}

export function getThisYearDots(unit: TimeUnit, now: Date): DotCount {
  const year = now.getFullYear();
  const daysInYear = isLeapYear(year) ? 366 : 365;
  const elapsedDays = Math.min(dayOfYear(now), daysInYear);

  if (unit === "day") {
    return { total: daysInYear, elapsed: elapsedDays };
  }

  // Fixed 52-dot grid regardless of 52/53-week years — a 53rd week would
  // read as a rounding blip, not worth a variable-size grid for.
  const elapsedWeeks = Math.min(WEEKS_PER_YEAR, Math.ceil(elapsedDays / 7));
  return { total: WEEKS_PER_YEAR, elapsed: elapsedWeeks };
}

export function getThisMonthDots(now: Date): DotCount {
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return { total: daysInMonth, elapsed: now.getDate() };
}

// One dot per year of life expectancy (not just working years — see
// LIFE_EXPECTANCY_YEARS).
export function getLifeYearsDots(now: Date): DotCount {
  const elapsed = Math.min(
    LIFE_EXPECTANCY_YEARS,
    Math.max(0, now.getFullYear() - BIRTH_YEAR)
  );
  return { total: LIFE_EXPECTANCY_YEARS, elapsed };
}

// Calendar-style "life in weeks": one row per year of life expectancy,
// WEEKS_PER_YEAR columns. Continuous with getLifeYearsDots/getThisYearDots
// at year boundaries — completed years contribute a full row, the current
// year contributes however many weeks of it have passed.
export function getLifeWeeksDots(now: Date): LifeWeeksCount {
  const yearsElapsed = getLifeYearsDots(now).elapsed;
  const weeksElapsedThisYear = getThisYearDots("week", now).elapsed;
  const total = LIFE_EXPECTANCY_YEARS * WEEKS_PER_YEAR;
  const elapsed = Math.min(total, yearsElapsed * WEEKS_PER_YEAR + weeksElapsedThisYear);
  return { total, elapsed, weeksPerYear: WEEKS_PER_YEAR };
}

// Which dot grid is currently on screen — same shape the UI's scope toggle
// produces. Used only to map a milestone date to a dot index (below); the
// count functions above don't need it since each has its own signature.
export type DotScope =
  | { kind: "month" }
  | { kind: "year"; unit: TimeUnit }
  | { kind: "life"; unit: LifeUnit };

// Maps a milestone date to its dot index in the given scope, or null if the
// date falls outside that scope's current window (e.g. a milestone next
// month doesn't appear on This Month).
function getMilestoneIndex(scope: DotScope, now: Date, date: Date): number | null {
  switch (scope.kind) {
    case "month":
      if (date.getFullYear() !== now.getFullYear() || date.getMonth() !== now.getMonth())
        return null;
      return date.getDate() - 1;
    case "year": {
      if (date.getFullYear() !== now.getFullYear()) return null;
      return scope.unit === "day"
        ? dayOfYear(date) - 1
        : Math.min(WEEKS_PER_YEAR - 1, Math.ceil(dayOfYear(date) / 7) - 1);
    }
    case "life": {
      const yearIndex = date.getFullYear() - BIRTH_YEAR;
      if (yearIndex < 0 || yearIndex >= LIFE_EXPECTANCY_YEARS) return null;
      if (scope.unit === "year") return yearIndex;
      const weekIndex = Math.min(WEEKS_PER_YEAR - 1, Math.ceil(dayOfYear(date) / 7) - 1);
      return yearIndex * WEEKS_PER_YEAR + weekIndex;
    }
  }
}

export interface MilestoneMarker {
  index: number;
  milestone: Milestone;
}

// Which milestones fall inside the given scope's current window, and which
// dot each one lands on. A milestone whose date isn't visible in this scope
// right now (e.g. a 2028 date on This Year while it's 2026) is simply
// omitted — it reappears here on its own once the scope's window reaches it.
export function getMilestoneMarkers(
  items: Milestone[],
  scope: DotScope,
  now: Date
): MilestoneMarker[] {
  const markers: MilestoneMarker[] = [];
  for (const item of items) {
    const index = getMilestoneIndex(scope, now, new Date(item.date));
    if (index !== null) markers.push({ index, milestone: item });
  }
  return markers;
}
