# Calendar — external events on the day

Interviews, seminars, anything scheduled *at* you rather than *by* you. They
come from one Google Calendar, read-only, and show up in Today as a layer
over the planned timeline — never merged into it.

## What this is not

- **Not part of the plan.** Nothing here touches `DirectionPlan`,
  `localStorage`'s plan key, `PLAN_VERSION`, or any migration. If the feature
  is off, unconfigured, or failing, Today renders exactly as it did before.
- **Not in the schedule engine.** `getDaySchedule`, `getDayRuler`,
  `getDayProgress`, `getDayTheme`, the touching-run logic — all keep
  operating on your planned blocks only. Calendar events are merged **at
  render time, in Today**, and nowhere else.
- **Not in Week / Hours / Coverage.** A one-off interview isn't a recurring
  template row and isn't capacity you allocate. It contributes zero hours to
  every rollup.
- **Not two-way.** The app never writes to Google.
- **No all-day events** (v1). Only timed events.

## Auth — client-side, no secrets

The app uses the **Google Identity Services token model**: the browser gets a
short-lived (~1h) read-only access token and calls the Calendar API directly.

- The only credential in the app is the **public** OAuth client ID
  (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`). No client secret, no server routes, no
  cookie, no token in `localStorage` or `sessionStorage`.
- The access token lives in a **module variable only** — never persisted.
- **`prompt` discipline** is what keeps "auth once" from becoming a popup on
  every refresh: `getAccessToken(interactive)` uses `prompt: ""` (may show UI)
  *only* behind a real gesture — the Connect button, Sync now. The sync on
  open and the calendar-list refresh pass `interactive: false` →
  `prompt: "none"`, which renews through a hidden iframe when the Google
  session is alive and rejects silently when it isn't.
- `localStorage` (`bandwidth.calendar.v1`) holds the `connected` flag, the
  chosen `calendarId`, the calendar list (so Settings doesn't re-fetch — and
  re-auth — on every load), and the last event cache.
- Scope: `https://www.googleapis.com/auth/calendar.readonly`. Worst case in
  any breach is "someone read a calendar," for at most an hour.
- The OAuth app stays in Google's **Testing** mode with you as the sole test
  user — no publishing, no verification. (Testing mode's 7-day expiry only
  affects *refresh* tokens, which this flow never issues.)

See the bottom of this doc for the one-time Google Cloud setup.

## Layers

| File | Responsibility |
| --- | --- |
| `lib/calendar/types.ts` | `CalendarEvent`, `CalendarOption`. |
| `lib/calendar/gis.ts` | Loads the GIS script; mints/caches/revokes the access token. |
| `lib/calendar/api.ts` | `listCalendars`, `fetchEvents` — direct REST to `googleapis.com`, normalised, declined/cancelled/all-day dropped. |
| `lib/calendar/store.ts` | External store (`subscribe`/`getSnapshot`, same as `plan-store`). `connected` + `calendarId` + calendar list + event cache + `lastSyncedMs` in `localStorage` (`bandwidth.calendar.v1`). Actions: `connect`, `disconnect`, `setCalendarId`, `sync`, `forceSync`, `refreshCalendars`. |
| `lib/calendar/day-events.ts` | Pure: `eventsForDate`, `minutesInto`, time / relative-time formatting. |
| `components/Direction/useCalendar.ts` | The hook over the store. |
| `components/Direction/EventsLane.tsx` | The overlay lane in Today — measurement, the minute→y map, the cards. |
| `components/Direction/CalendarSettings.tsx` | The Settings section. |

Touched, minimally: `TodayView` (renders the overlay, syncs on mount),
`SettingsView` (mounts the section), `TimelineRow` (one `data-timeline-box`
attribute so the lane can measure each block's rendered box).

## Fetching

- **Window**: today 00:00 → +8 days. `singleEvents=true` (recurrences
  expanded), `orderBy=startTime`.
- **On every Today mount**, `sync()` runs — throttled to once per 60s so
  rapid reloads don't hammer. Plus an explicit **Sync now** button in
  Settings for "I just added an event."
- **Filtered out**: `status: "cancelled"`, events you've RSVP'd `declined`,
  all-day (`start.date` with no `start.dateTime`).
- **Cache**: events + `lastSyncedMs` persisted. Stepping across the 7 days and
  reloading are instant; the network only refreshes. A failed sync keeps the
  last cache and only whispers about it in Settings — never in Today.

## The lane — an overlay, not a column

Calendar events render as duration-height blocks in a ~88px strip that
**floats over the right edge of the timeline**. The planned blocks keep their
full width, so `TimelineRow`'s text-fitting (`fitLead`) is untouched — the
alternative, a real column beside the timeline, squeezed the blocks narrow
enough that their leads clipped.

The vertical scale is piecewise (`boxHeight` is capped and non-linear, ticks
sit *within* each block), so there's no global pixels-per-minute. The lane
**measures the rendered timeline** instead:

- `TodayView` wraps the `<ol>` and the lane in one `relative` box. After
  layout — and on resize, and when the day or `now` changes — the lane reads
  each block box's `getBoundingClientRect()` and builds a reading-order
  `minute → y` map (linear within a block, linear across gaps, clamped at
  both ends). **Reading order matters**: the timeline runs 07:00 → 07:00, so
  Sleep's clock time is `00:00–07:00` but it sits last; events and blocks are
  both rotated to that same clock or a 1pm event maps past the end.
- Each event is a card positioned and sized by that map, `z-10` so it clears
  the live block's hero card. It shows the start time and the title
  truncated to one line; tap for a popover with the full title and range.
  `--surface` at 85% + a 2px backdrop-blur + a dashed `--type-admin` edge:
  reads as laid *on top of* the block it overlaps, while that block's own
  text stays faintly legible behind it. The strip is ~72px wide.
- Two events at once: the later card is nudged down to clear the earlier one
  (time-accuracy yields to legibility under contention).
- The lane renders only when the viewed day has ≥1 event. A calendar card can
  overlap the small `NOW` / `Next` tag at a block's top-right — accepted.

## States

| Situation | Today | Settings |
| --- | --- | --- |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` unset | nothing | "Set the client ID to enable." |
| Configured, not connected | nothing | "Connect Google Calendar" |
| Connected, no events in window | nothing | calendar picker · last synced · Sync |
| Connected, events | the lane | as above |
| Sync failed / offline | last cached events, silently | "Last synced 3h ago · sync failed" |
| Token can't renew silently | last cached events, silently | "Reconnect" |

## Explicitly not building

Writing to Google · editing or dismissing individual events (cancel it in
Google) · multiple calendars · all-day events · background/cron sync · any
rollup contribution · a server component of any kind.

---

## One-time Google Cloud setup

1. **Create a project** — <https://console.cloud.google.com/projectcreate>.
   Name it anything ("Bandwidth").
2. **Enable the API** — APIs & Services → Library → search "Google Calendar
   API" → Enable.
3. **OAuth consent screen** — APIs & Services → OAuth consent screen:
   - User type: **External**. Create.
   - App name, your email for support + developer contact. Save.
   - **Scopes**: Add `.../auth/calendar.readonly`. Save.
   - **Test users**: add your own Google address. Save.
   - Leave **Publishing status: Testing**. Do not publish.
4. **Create the client ID** — APIs & Services → Credentials → Create
   credentials → **OAuth client ID**:
   - Application type: **Web application**.
   - **Authorised JavaScript origins**: add `http://localhost:3000` and
     `https://<your-vercel-domain>` (both — no trailing slash).
   - Leave **Authorised redirect URIs** empty (the token flow doesn't use
     them).
   - Create. Copy the **Client ID** (ends `.apps.googleusercontent.com`).
5. **Set the env var**:
   - Local: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=...` in `.env.local`.
   - Vercel: Project → Settings → Environment Variables → add
     `NEXT_PUBLIC_GOOGLE_CLIENT_ID` for all environments → redeploy.

That's it. No secret, no redirect URIs, no verification. If you later add a
custom domain, add it to the JavaScript origins list.
