"use client";

import { useSyncExternalStore } from "react";
import {
  type CalendarSnapshot,
  connect,
  disconnect,
  forceSync,
  getServerSnapshot,
  getSnapshot,
  refreshCalendars,
  setCalendarId,
  subscribe,
  sync,
} from "@/lib/calendar/store";

interface CalendarStore {
  /** null on the server and during hydration; the store snapshot afterwards. */
  state: CalendarSnapshot | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sync: () => void;
  forceSync: () => void;
  refreshCalendars: () => Promise<void>;
  setCalendarId: (id: string) => void;
}

export function useCalendar(): CalendarStore {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    state,
    connect,
    disconnect,
    sync,
    forceSync,
    refreshCalendars,
    setCalendarId,
  };
}
