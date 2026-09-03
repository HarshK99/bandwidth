// lib/calendar/api.ts
// Direct REST to the Google Calendar API from the browser (CORS is allowed
// for Bearer-token requests). Normalises into our own shapes and drops
// everything Today shouldn't show.

import type { CalendarEvent, CalendarOption } from "./types";

const BASE = "https://www.googleapis.com/calendar/v3";

async function get<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Calendar API ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`
    );
  }
  return response.json() as Promise<T>;
}

interface CalendarListResponse {
  items?: {
    id: string;
    summary?: string;
    primary?: boolean;
    deleted?: boolean;
  }[];
}

/** The calendars in the account, primary first, for the Settings picker. */
export async function listCalendars(token: string): Promise<CalendarOption[]> {
  const data = await get<CalendarListResponse>(
    `${BASE}/users/me/calendarList?fields=items(id,summary,primary,deleted)&minAccessRole=reader`,
    token
  );
  return (data.items ?? [])
    .filter((item) => !item.deleted)
    .map((item) => ({
      id: item.id,
      summary: item.summary ?? item.id,
      primary: Boolean(item.primary),
    }))
    .sort((a, b) => Number(b.primary) - Number(a.primary) || a.summary.localeCompare(b.summary));
}

interface EventsResponse {
  items?: {
    id: string;
    status?: string;
    summary?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    attendees?: { self?: boolean; responseStatus?: string }[];
  }[];
}

/**
 * Timed events between two instants, recurrences expanded. Drops cancelled
 * events, ones you've declined, and all-day entries (v1 scope).
 */
export async function fetchEvents(
  token: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    fields:
      "items(id,status,summary,start(dateTime,date),end(dateTime,date),attendees(self,responseStatus))",
  });
  const data = await get<EventsResponse>(
    `${BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    token
  );

  const events: CalendarEvent[] = [];
  for (const item of data.items ?? []) {
    if (item.status === "cancelled") continue;
    if (!item.start?.dateTime || !item.end?.dateTime) continue; // all-day
    const declined = item.attendees?.some(
      (attendee) => attendee.self && attendee.responseStatus === "declined"
    );
    if (declined) continue;

    const startMs = Date.parse(item.start.dateTime);
    const endMs = Date.parse(item.end.dateTime);
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) continue;

    events.push({
      id: item.id,
      title: item.summary?.trim() || "Busy",
      startMs,
      endMs,
    });
  }
  return events;
}
