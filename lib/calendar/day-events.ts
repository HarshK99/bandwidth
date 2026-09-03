// lib/calendar/day-events.ts
// Pure helpers for turning cached events into what Today draws. No React,
// no network, no DOM.

import type { CalendarEvent } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Local midnight of a date. */
function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * The events that touch a given calendar day, earliest first. Uses local
 * midnight-to-midnight — an interview or seminar is never in the small hours,
 * so the timeline's 07:00 day-start isn't worth modelling here yet.
 */
export function eventsForDate(
  events: CalendarEvent[],
  date: Date
): CalendarEvent[] {
  const dayStart = startOfDay(date);
  const dayEnd = dayStart + DAY_MS;
  return events
    .filter((event) => event.startMs < dayEnd && event.endMs > dayStart)
    .sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
}

/** Minutes from local midnight of `date` for an instant, clamped to [0, 1440]. */
export function minutesInto(date: Date, ms: number): number {
  const offset = (ms - startOfDay(date)) / 60_000;
  return Math.max(0, Math.min(24 * 60, offset));
}

const TIME_OPTS: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

export function formatEventStart(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, TIME_OPTS);
}

export function formatEventRange(startMs: number, endMs: number): string {
  const start = new Date(startMs).toLocaleTimeString(undefined, TIME_OPTS);
  const end = new Date(endMs).toLocaleTimeString(undefined, TIME_OPTS);
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
