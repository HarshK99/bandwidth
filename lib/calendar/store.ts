// lib/calendar/store.ts
// A tiny external store over the calendar layer, same shape as
// lib/direction/plan-store.ts. The event cache, the chosen calendar and a
// "connected" flag live in localStorage; the access token never does.

import { fetchEvents, listCalendars } from "./api";
import { operationalBounds } from "./day-events";
import { addDays, getOperationalDate } from "../direction/schedule";
import { CalendarReconnectRequired, getAccessToken, isCalendarConfigured, revokeAccess } from "./gis";
import type { CalendarEvent, CalendarOption } from "./types";

const STORAGE_KEY = "bandwidth.calendar.v1";
const WINDOW_DAYS = 8;
const SYNC_THROTTLE_MS = 60_000;

export type SyncStatus = "idle" | "syncing" | "error" | "reconnect";

export interface CalendarSnapshot {
  /** NEXT_PUBLIC_GOOGLE_CLIENT_ID is set. */
  configured: boolean;
  /** The user has connected at least once. */
  connected: boolean;
  calendarId: string;
  /** The account's calendars, for the Settings picker. Not persisted. */
  calendars: CalendarOption[];
  events: CalendarEvent[];
  lastSyncedMs: number | null;
  timeMinMs: number | null;
  timeMaxMs: number | null;
  status: SyncStatus;
  error: string | null;
}

interface Persisted {
  connected: boolean;
  calendarId: string;
  calendars: CalendarOption[];
  events: CalendarEvent[];
  lastSyncedMs: number | null;
  timeMinMs: number | null;
  timeMaxMs: number | null;
}

function isCalendarOption(value: unknown): value is CalendarOption {
  if (typeof value !== "object" || value === null) return false;
  const option = value as Partial<CalendarOption>;
  return (
    typeof option.id === "string" &&
    typeof option.summary === "string" &&
    typeof option.primary === "boolean"
  );
}

function isEvent(value: unknown): value is CalendarEvent {
  if (typeof value !== "object" || value === null) return false;
  const event = value as Partial<CalendarEvent>;
  return (
    typeof event.id === "string" &&
    typeof event.title === "string" &&
    typeof event.startMs === "number" &&
    typeof event.endMs === "number"
  );
}

function load(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const value = parsed as Record<string, unknown>;
    return {
      connected: Boolean(value.connected),
      calendarId:
        typeof value.calendarId === "string" ? value.calendarId : "primary",
      calendars: Array.isArray(value.calendars)
        ? value.calendars.filter(isCalendarOption)
        : [],
      events: Array.isArray(value.events) ? value.events.filter(isEvent) : [],
      lastSyncedMs:
        typeof value.lastSyncedMs === "number" ? value.lastSyncedMs : null,
      timeMinMs: typeof value.timeMinMs === "number" ? value.timeMinMs : null,
      timeMaxMs: typeof value.timeMaxMs === "number" ? value.timeMaxMs : null,
    };
  } catch {
    return null;
  }
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    const value: Persisted = {
      connected: snapshot.connected,
      calendarId: snapshot.calendarId,
      calendars: snapshot.calendars,
      events: snapshot.events,
      lastSyncedMs: snapshot.lastSyncedMs,
      timeMinMs: snapshot.timeMinMs,
      timeMaxMs: snapshot.timeMaxMs,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Private mode / quota — the in-memory state still works this session.
  }
}

function initial(): CalendarSnapshot {
  const stored = load();
  return {
    configured: isCalendarConfigured,
    connected: stored?.connected ?? false,
    calendarId: stored?.calendarId ?? "primary",
    calendars: stored?.calendars ?? [],
    events: stored?.events ?? [],
    lastSyncedMs: stored?.lastSyncedMs ?? null,
    timeMinMs: stored?.timeMinMs ?? null,
    timeMaxMs: stored?.timeMaxMs ?? null,
    status: "idle",
    error: null,
  };
}

let snapshot: CalendarSnapshot = initial();
let requestedDate: Date | null = null;
let requestVersion = 0;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function set(patch: Partial<CalendarSnapshot>): void {
  snapshot = { ...snapshot, ...patch };
  emit();
}

function onStorage(event: StorageEvent): void {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  const stored = load();
  snapshot = {
    ...snapshot,
    connected: stored?.connected ?? false,
    calendarId: stored?.calendarId ?? "primary",
    calendars: stored?.calendars ?? snapshot.calendars,
    events: stored?.events ?? [],
    lastSyncedMs: stored?.lastSyncedMs ?? null,
    timeMinMs: stored?.timeMinMs ?? null,
    timeMaxMs: stored?.timeMaxMs ?? null,
  };
  emit();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function getSnapshot(): CalendarSnapshot {
  return snapshot;
}

export function getServerSnapshot(): null {
  return null;
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function syncWindow(date: Date): { timeMin: Date; timeMax: Date } {
  const timeMin = new Date(operationalBounds(date).startMs);
  const timeMax = new Date(operationalBounds(addDays(date, WINDOW_DAYS)).startMs);
  return { timeMin, timeMax };
}

async function runSync(force: boolean, interactive: boolean): Promise<void> {
  if (!snapshot.configured || !snapshot.connected) return;
  if (snapshot.status === "syncing") return;
  const date = requestedDate ?? getOperationalDate(new Date());
  const bounds = operationalBounds(date);
  const covered = snapshot.timeMinMs !== null && snapshot.timeMaxMs !== null &&
    snapshot.timeMinMs <= bounds.startMs && snapshot.timeMaxMs >= bounds.endMs;
  if (
    !force && covered &&
    snapshot.lastSyncedMs !== null &&
    Date.now() - snapshot.lastSyncedMs < SYNC_THROTTLE_MS
  ) {
    return;
  }

  const version = requestVersion;
  const calendarId = snapshot.calendarId;
  set({ status: "syncing", error: null });
  try {
    const token = await getAccessToken(interactive);
    // Manual sync also recovers a missing calendar list after reconnecting.
    const calendars = interactive && snapshot.calendars.length === 0
      ? await listCalendars(token) : null;
    const { timeMin, timeMax } = syncWindow(date);
    const events = await fetchEvents(token, calendarId, timeMin, timeMax);
    if (version !== requestVersion) return;
    set({ ...(calendars ? { calendars } : {}), events, timeMinMs: timeMin.getTime(), timeMaxMs: timeMax.getTime(), lastSyncedMs: Date.now(), status: "idle", error: null });
    persist();
  } catch (error) {
    if (version !== requestVersion) return;
    // Keep the last cache; Today and Settings disclose the failed refresh.
    set({ status: error instanceof CalendarReconnectRequired ? "reconnect" : "error", error: messageOf(error, "Sync failed") });
  } finally {
    // Navigation during a request must still fetch the newly visible day.
    if (version === requestVersion && requestedDate &&
      operationalBounds(requestedDate).startMs !== bounds.startMs) {
      void runSync(false, false);
    }
  }
}

/** Follow the visible date, throttling only when its full day is already cached. */
export function sync(date?: Date): void {
  requestedDate = date ? new Date(date) : getOperationalDate(new Date());
  void runSync(false, false);
}

/** The "Sync now" button — a real click, so an expired token may re-prompt. */
export function forceSync(): void {
  void runSync(true, true);
}

export async function connect(): Promise<void> {
  if (!snapshot.configured) return;
  set({ status: "syncing", error: null });
  try {
    const token = await getAccessToken(true);
    const calendars = await listCalendars(token);
    const keepChosen = calendars.some((c) => c.id === snapshot.calendarId);
    const calendarId = keepChosen
      ? snapshot.calendarId
      : (calendars.find((c) => c.primary)?.id ?? calendars[0]?.id ?? "primary");
    set({ connected: true, calendars, calendarId, status: "idle", error: null });
    persist();
    await runSync(true, false);
  } catch (error) {
    set({ status: "error", error: messageOf(error, "Could not connect") });
  }
}

export function disconnect(): void {
  requestVersion += 1;
  revokeAccess();
  set({
    connected: false,
    calendars: [],
    events: [],
    lastSyncedMs: null,
    timeMinMs: null,
    timeMaxMs: null,
    status: "idle",
    error: null,
  });
  persist();
}

export async function refreshCalendars(): Promise<void> {
  if (!snapshot.connected) return;
  try {
    const token = await getAccessToken();
    set({ calendars: await listCalendars(token) });
    persist();
  } catch (error) {
    set({ status: error instanceof CalendarReconnectRequired ? "reconnect" : "error", error: messageOf(error, "Could not list calendars") });
  }
}

export function setCalendarId(id: string): void {
  if (id === snapshot.calendarId) return;
  requestVersion += 1;
  set({ calendarId: id, events: [], lastSyncedMs: null, timeMinMs: null, timeMaxMs: null, status: "idle", error: null });
  persist();
  void runSync(true, false);
}
