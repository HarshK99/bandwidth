// lib/calendar/types.ts
// External calendar events — see docs/CALENDAR.md. These never enter the
// DirectionPlan; they're a read-only layer merged only in Today.

/** One timed event, normalised from the Google Calendar API. */
export interface CalendarEvent {
  id: string;
  title: string;
  /** Absolute epoch ms. Google gives an offset-qualified dateTime; we resolve it. */
  startMs: number;
  endMs: number;
}

/** A calendar in the connected account, for the Settings picker. */
export interface CalendarOption {
  id: string;
  summary: string;
  primary: boolean;
}
