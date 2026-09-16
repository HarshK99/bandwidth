# Rebuild walkthrough — 2026-09-16

Phase 5 walkthrough is complete with the limitations below. Core browser journeys were exercised, one Coverage bug was fixed, and the user subsequently reported that Calendar sync worked. This is not exhaustive verification or overall user acceptance.

## Environment and permission

- Windows, existing development server at `http://localhost:3000`; no server was started or restarted.
- User authorization: “you can use chromium to test.” Scope used: browser interactions, screenshots, clock controls, and isolated browser-storage scenarios. Builds, repository test commands, lint/type checks, and code review were not run.
- Continuation: “sync worked; proceed.” Recorded as user-reported live sync success and authorization to finish this same phase; no broader check or publication permission inferred.
- Chromium through installed Microsoft Edge 153.0.4234.32, controlled with Playwright from `%TEMP%/bandwidth-phase5-browser`. No test runner, dependency, or browser profile was added to the repository.
- Fresh temporary browser contexts; Asia/Kolkata for clock scenarios; 360×800 mobile, 1280×900 desktop, and 640×450 reflow. Light/dark and reduced motion exercised. The user's browser data and Calendar account were not accessed or changed.
- Evidence below is agent-observed through browser interactions and screenshots unless explicitly marked otherwise. The supplied user screenshot is separate evidence from the user's connected profile.

## Scenario results

| Scenario | Observed result | Evidence source | Remaining issue |
| --- | --- | --- | --- |
| Today header and timeline | Both fixed reminders and work guidance fit at 360px; header measured 122px. Current Production card, ruler, and guide fit in light/dark. | Agent browser/screenshots; user screenshot also shows reminders | No measurement of the pre-rebuild header for comparison. |
| Representative times | 09:00 Deep work: 2h left; 14:30 Light work: 1h left; 15:45 Production: 1h 15m left; 21:30 Exercise: 30m left. | Agent, fixed browser clock | Not every adjacent block transition exercised. |
| Overnight/day boundary | 06:59 selects preceding date/Sleep; advancing the running browser clock through 07:00 changes to the new date/Morning routine without reload. Midnight load shows Sleep, 7h left and next-morning label. New York's November 1 autumn clock change advances from 01:59 to 01:00 while retaining October 31's Sleep block. | Agent, fixed-time page loads and running simulated clock in Asia/Kolkata and America/New_York | Spring clock change and continuous midnight transition not exercised. |
| Open and empty days | Sunday 09:00 shows open time and Lunch in 4h, with no current card; isolated empty-day data shows “No blocks on this day. The time is open.” | Agent browser; empty-day fixture in temporary storage | None in these scenarios. |
| Card → Coverage → Today | Deep, Light, Production, and Recovery select the matching effort, All areas, collapsed branches. Browser Back restores date/card focus and scroll; explicit Back restored Production within 1px. Now brings current card into view. | Agent browser | Other browser engines not exercised. |
| Coverage choices | Hobbies and Family and friends expand; Outreach appears under Deep and Light once each; All efforts shows memberships; Jobs + Production shows an honest empty state. Direct-entry Back reaches Today. | Agent browser | None in these scenarios. |
| Rapid filter changes | Before fix, choosing Recovery area then Recovery effort quickly lost the area. After fix both remain selected; rapid Wave Link + Light retains both URL values. Browser Back still returns to original Today card after filtering. | Agent reproduced before/after | Fixed in `components/Direction/CoverageView.tsx`. |
| Week editing | Name/end edits persist after reload; overlap is rejected with inline error and draft retained; remove/add exposes/refills open time. Other six days remain unchanged. Equal clocks, 25:00, and crossing 07:00 are rejected; 23:00–07:00 Sleep saves after freeing the preceding hour. | Agent browser and temporary storage observation | None in these scenarios. |
| Copy day | Cancelling Wednesday → Sunday keeps Sunday's seven protected blocks. Confirming named replacement gives Sunday twelve blocks and persists after reload. | Agent browser | None in these scenarios. |
| Storage replacement/failure | Fresh v2 initialization removes seeded v1 while preserving an unrelated sentinel and six sample Calendar events. Simulated v2 write failure keeps edited name in the tab and displays the not-saved warning. Renaming a block updates a second open tab. | Agent, isolated browser fixtures and two tabs | User's pre-existing data was not directly inspected. |
| Keyboard | Enter opens editor and Hobbies; initial editor focus is Name; Tab visits form controls without reaching background app controls; Escape closes and returns to invoking block. Native browser focus briefly leaves document at the end of the dialog sequence. | Agent keyboard interactions | Screen reader and full-page focus traversal not exercised. |
| Visual layouts | Today, mobile Week/editor, desktop Week, and expanded Coverage inspected; light/dark Today and Week inspected. No document-width overflow at 360px or 640px. | Agent screenshots | Actual browser zoom, text-only enlargement, exhaustive contrast measurements, and original header-height comparison not performed. |
| Retained routes | Calendar connection screen, Time year/milestones, and Upgrades content render. No page errors in the completed Today/Coverage/editing/retained-route capture. | Agent fresh browser | This does not verify prior user data preservation or account sync. |
| Calendar event layout/cache | Sample overlapping events occupy separate columns; full details open in a dialog. Overnight details include both dates; events crossing the 07:00 edges are included and an event wholly outside the day is absent. Events remain visible over an empty day. Forced refresh failure retains cached events and shows the stale-cache warning. | Agent browser, synthetic Calendar cache in temporary profile; screenshots inspected | Sample data, not proof of live API behavior. Mobile overlap columns shorten labels; dialog provides full text. |
| Connected Calendar | Initial user screenshot showed refresh failure; user subsequently stated “sync worked.” Agent saw the disconnected screen and, separately, settings with the synthetic cache. | User-reported live success; agent fixture observations | Agent did not independently authenticate or diagnose the earlier failure. Changing dates during a live request not exercised. |

## Fix

Coverage now reads the current browser URL and replaces its history entry immediately through Next.js's supported native history integration. A second filter change therefore preserves the first choice instead of rebuilding from an older render. No visual design or activity memberships changed. Relevant local Next.js guidance and React guidance were read for this fix; no code review was performed.

## Limitations and next decision

No further app issue was observed during the continuation. Live Calendar request races, direct inspection of the user's prior data, other browser engines, screen readers, actual browser zoom/text enlargement, exhaustive contrast measurements, the spring clock change, and comparison with the old header height were not checked. The 640px viewport observation is reflow evidence, not actual browser zoom.

The user can now decide whether to request builds, repository tests, or code review, or accept the app. These activities and publication remain separately authorized; there is no next planned phase. If Calendar failure recurs, reproduce it in the connected profile before changing Calendar code.

No remote push, deployment, or merge to master/main was performed.
