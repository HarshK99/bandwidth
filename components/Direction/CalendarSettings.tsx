"use client";

import { useEffect, useState } from "react";
import { formatSyncedAgo } from "@/lib/calendar/day-events";
import { useCalendar } from "./useCalendar";
import { useNow } from "./useNow";
import {
  BUTTON_INLINE,
  cx,
  FAINT,
  LABEL,
  LABEL_XS,
  MUTED,
  STRONG,
} from "./ui";

/**
 * Connect one Google Calendar, read-only. Its events show as a layer over
 * Today — never merged into the plan. See docs/APP_SOURCE_OF_TRUTH.md.
 */
export default function CalendarSettings() {
  const { state, connect, disconnect, forceSync, refreshCalendars, setCalendarId } =
    useCalendar();
  const now = useNow();
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

  const connected = state?.connected ?? false;
  const calendarCount = state?.calendars.length ?? 0;

  useEffect(() => {
    if (connected && calendarCount === 0) void refreshCalendars();
  }, [connected, calendarCount, refreshCalendars]);

  if (!state) return null;

  const syncedLine =
    state.status === "reconnect" ? "Calendar needs reconnecting. Use Sync now."
    : state.status === "error"
      ? state.lastSyncedMs && now
        ? `Sync failed · last ok ${formatSyncedAgo(state.lastSyncedMs, now.getTime())}`
        : "Sync failed"
      : state.lastSyncedMs && now
        ? `Synced ${formatSyncedAgo(state.lastSyncedMs, now.getTime())}`
        : "Not synced yet";

  return (
    <div>
      <h2 className={cx(LABEL, "text-zinc-700 dark:text-zinc-300")}>Calendar</h2>

      {!state.configured ? (
        <p className={cx("mt-3 text-[13px]", MUTED)}>
          Calendar connection is not available in this app yet. Your schedule still works.
        </p>
      ) : !connected ? (
        <div className="mt-3">
          <p className={cx("text-[13px]", MUTED)}>
            Read-only access to one calendar. Interviews and seminars show as a
            layer over the day — nothing is written back.
          </p>
          <button
            type="button"
            onClick={() => void connect()}
            disabled={state.status === "syncing"}
            className={cx(BUTTON_INLINE, "mt-3")}
          >
            {state.status === "syncing"
              ? "Connecting…"
              : "Connect Google Calendar"}
          </button>
          {state.error && (
            <p className={cx("mt-2 text-[12px]", FAINT)}>{state.error}</p>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          <div>
            <span className={cx(LABEL_XS, FAINT)}>Sync this calendar</span>
            <ul className="mt-2 space-y-1">
              {state.calendars.map((calendar) => (
                <li key={calendar.id}>
                  <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                    <input
                      type="radio"
                      name="calendar"
                      checked={state.calendarId === calendar.id}
                      onChange={() => setCalendarId(calendar.id)}
                      className="accent-[var(--accent)]"
                    />
                    <span
                      className={cx("min-w-0 break-words", state.calendarId === calendar.id ? STRONG : MUTED)}
                    >
                      {calendar.summary}
                    </span>
                    {calendar.primary && (
                      <span className={cx(LABEL_XS, FAINT)}>primary</span>
                    )}
                  </label>
                </li>
              ))}
              {calendarCount === 0 && (
                <li className={cx("text-[12px]", MUTED)}>{state.status === "reconnect" ? "Use Sync now to load your calendars." : state.status === "error" ? "Calendars could not be loaded." : "Loading calendars…"}</li>
              )}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void forceSync()}
              disabled={state.status === "syncing"}
              className={BUTTON_INLINE}
            >
              {state.status === "syncing" ? "Syncing…" : "Sync now"}
            </button>
            <span role="status" className={cx("text-[12px]", MUTED)}>{syncedLine}</span>
          </div>

          {state.error && state.status === "error" && (
            <p className={cx("text-[12px]", FAINT)}>{state.error}</p>
          )}

          {confirmingDisconnect ? (
            <div className="flex flex-wrap items-center gap-4">
              <span className={cx("text-[13px]", MUTED)}>Disconnect calendar?</span>
              <button
                type="button"
                onClick={() => {
                  disconnect();
                  setConfirmingDisconnect(false);
                }}
                className={cx(BUTTON_INLINE, "text-zinc-900 dark:text-zinc-100")}
              >
                Yes, disconnect
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDisconnect(false)}
                className={BUTTON_INLINE}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDisconnect(true)}
              className={BUTTON_INLINE}
            >
              Disconnect
            </button>
          )}
        </div>
      )}
    </div>
  );
}
