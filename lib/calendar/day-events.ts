// lib/calendar/day-events.ts
// Pure helpers for turning cached events into what Today draws. No React,
// no network, no DOM.

import type { CalendarEvent } from "./types";

/** Local 07:00 boundaries, using calendar dates across daylight-saving changes. */
export function operationalBounds(date: Date): { startMs: number; endMs: number } {
  return {
    startMs: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 7).getTime(),
    endMs: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 7).getTime(),
  };
}

/**
 * Events intersecting the visible 07:00-to-next-07:00 day, earliest first.
 * Keep original instants; only the lane's geometry is clipped.
 */
export function eventsForOperationalDate(
  events: CalendarEvent[],
  date: Date
): CalendarEvent[] {
  const { startMs: dayStart, endMs: dayEnd } = operationalBounds(date);
  return events
    .filter((event) => event.startMs < dayEnd && event.endMs > dayStart)
    .sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
}

/** Wall-clock minutes on the schedule ruler, clamped to the visible day. */
export function operationalMinutesInto(date: Date, instantMs: number): number {
  const { startMs, endMs } = operationalBounds(date);
  if (instantMs <= startMs) return 0;
  if (instantMs >= endMs) return 1440;
  const instant = new Date(instantMs);
  const nextDate = instant.getFullYear() !== date.getFullYear() ||
    instant.getMonth() !== date.getMonth() || instant.getDate() !== date.getDate();
  return (nextDate ? 1440 : 0) + instant.getHours() * 60 + instant.getMinutes() +
    instant.getSeconds() / 60 - 420;
}

const TIME_OPTS: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

export function formatEventStart(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, TIME_OPTS);
}

export function formatEventRange(startMs: number, endMs: number): string {
  const startDate = new Date(startMs);
  const endDate = new Date(endMs);
  const sameDate = startDate.toDateString() === endDate.toDateString();
  const options: Intl.DateTimeFormatOptions = sameDate ? TIME_OPTS : { ...TIME_OPTS, month: "short", day: "numeric" };
  const start = startDate.toLocaleString(undefined, options);
  const end = endDate.toLocaleString(undefined, options);
  return `${start} – ${end}`;
}

/** "just now" / "5m ago" / "3h ago" / "yesterday" / "4 days ago". */
export function formatSyncedAgo(lastSyncedMs: number, nowMs: number): string {
  const seconds = Math.max(0, Math.round((nowMs - lastSyncedMs) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}
