# Rebuild walkthrough — 2026-09-16

Core browser journeys were exercised and one Coverage bug was fixed. Phase 5 remains awaiting the remaining walkthrough below; this is not full verification or user acceptance.

## Environment and permission

- Windows, existing development server at `http://localhost:3000`; no server was started or restarted.
- User authorization: “you can use chromium to test.” Scope used: browser interactions, screenshots, clock controls, and isolated browser-storage scenarios. Builds, repository test commands, lint/type checks, and code review were not run.
- Chromium through installed Microsoft Edge 153.0.4234.32, controlled with Playwright from `%TEMP%/bandwidth-phase5-browser`. No test runner, dependency, or browser profile was added to the repository.
- Fresh temporary browser contexts; Asia/Kolkata for clock scenarios; 360×800 mobile, 1280×900 desktop, and 640×450 reflow. Light/dark and reduced motion exercised. The user's browser data and Calendar account were not accessed or changed.
- Evidence below is agent-observed through browser interactions and screenshots unless explicitly marked otherwise. The supplied user screenshot is separate evidence from the user's connected profile.

## Scenario results

| Scenario | Observed result | Evidence source | Remaining issue |
| --- | --- | --- | --- |
| Today header and timeline | Both fixed reminders and work guidance fit at 360px; header measured 122px. Current Production card, ruler, and guide fit in light/dark. | Agent browser/screenshots; user screenshot also shows reminders | No measurement of the pre-rebuild header for comparison. |
| Representative times | 09:00 Deep work: 2h left; 14:30 Light work: 1h left; 15:45 Production: 1h 15m left; 21:30 Exercise: 30m left. | Agent, fixed browser clock | Continuous live transitions not exercised. |
| Overnight/day boundary | 06:59 selects preceding date and Sleep with 1m left; 07:00 selects new date/Morning routine; midnight shows Sleep, 7h left, preceding date and next-morning label. | Agent, separate page loads at fixed times | Daylight-saving timezone not exercised. |
| Open and empty days | Sunday 09:00 shows open time and Lunch in 4h, with no current card; isolated empty-day data shows “No blocks on this day. The time is open.” | Agent browser; empty-day fixture in temporary storage | None in these scenarios. |
| Card → Coverage → Today | Deep, Light, Production, and Recovery select the matching effort, All areas, collapsed branches. Browser Back restores date/card focus and scroll; explicit Back restored Production within 1px. Now brings current card into view. | Agent browser | Other browser engines not exercised. |
| Coverage choices | Hobbies and Family and friends expand; Outreach appears under Deep and Light once each; All efforts shows memberships; Jobs + Production shows an honest empty state. Direct-entry Back reaches Today. | Agent browser | None in these scenarios. |
| Rapid filter changes | Before fix, choosing Recovery area then Recovery effort quickly lost the area. After fix both remain selected; rapid Wave Link + Light retains both URL values. Browser Back still returns to original Today card after filtering. | Agent reproduced before/after | Fixed in `components/Direction/CoverageView.tsx`. |
| Week editing | Name/end edits persist after reload; 08:00–12:00 overlap is rejected with inline error and draft retained; removing a block exposes open time; adding it back succeeds. Other six days remain byte-for-byte unchanged after a Wednesday edit. | Agent browser and temporary storage observation | Additional invalid clock/overnight forms not exercised. |
| Copy day | Cancelling Wednesday → Sunday keeps Sunday's seven protected blocks. Confirming named replacement gives Sunday twelve blocks and persists after reload. | Agent browser | None in these scenarios. |
| Storage replacement/failure | Fresh v2 initialization removes seeded v1 and preserves an unrelated sentinel key. Simulated v2 write failure keeps edited name in the tab and displays the not-saved warning. | Agent, isolated browser fixtures | Existing Calendar/Time/Upgrades state and cross-tab updates not verified. |
| Keyboard | Enter opens editor and Hobbies; initial editor focus is Name; Tab visits form controls without reaching background app controls; Escape closes and returns to invoking block. Native browser focus briefly leaves document at the end of the dialog sequence. | Agent keyboard interactions | Screen reader and full-page focus traversal not exercised. |
| Visual layouts | Today, mobile Week/editor, desktop Week, and expanded Coverage inspected; light/dark Today and Week inspected. No document-width overflow at 360px or 640px. | Agent screenshots | Actual browser zoom, text-only enlargement, exhaustive contrast measurements, and original header-height comparison not performed. |
| Retained routes | Calendar connection screen, Time year/milestones, and Upgrades content render. No page errors in the completed Today/Coverage/editing/retained-route capture. | Agent fresh browser | This does not verify prior user data preservation or account sync. |
| Connected Calendar | User screenshot shows “Calendar refresh failed. Saved events may be out of date.” Fresh agent profile shows Connect Google Calendar. | User-supplied screenshot; agent fresh profile | Cause unresolved; live sync, overnight/overlapping event layout, cached/failed/date-changing sync still require walkthrough. |

## Fix

Coverage now reads the current browser URL and replaces its history entry immediately through Next.js's supported native history integration. A second filter change therefore preserves the first choice instead of rebuilding from an older render. No visual design or activity memberships changed. Relevant local Next.js guidance and React guidance were read for this fix; no code review was performed.

## Resume only the remaining work

1. Resume `rebuild/phase-5-walkthrough`. Inspect the Calendar settings/status in a connected browser or obtain the user's actual observations; reproduce the refresh failure before changing Calendar code. Never record successful live sync from the fresh disconnected profile.
2. Walk overnight/overlapping Calendar events, cached/failed/date-changing sync, and preservation of existing retained-feature state when account access is available.
3. Exercise live 06:59→07:00 transitions, a daylight-saving timezone, actual zoom/text enlargement, and remaining keyboard/validation cases above. Record limitations where evidence remains unavailable.
4. Update this table and the compact handoff; user acceptance remains unrecorded. Builds and repository test/review commands still require their own explicit authorization.

No remote push, deployment, or merge to master/main was performed.
