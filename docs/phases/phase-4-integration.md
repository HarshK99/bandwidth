# Phase 4 — Integration and Polish Implementation Plan

**Goal:** Make the retained surfaces and existing design work consistently with the new schedule and Coverage.
**Architecture:** Adapt existing components and calendar geometry; remove obsolete implementation remnants instead of adding compatibility layers.
**Tech stack:** Existing React, Next.js, Tailwind, read-only Calendar integration.
**Spec:** ../APP_SOURCE_OF_TRUTH.md. **Branch:** rebuild/phase-4-integration → main_new.

## Start and inputs

Trigger: `start phase 4`. Read AGENTS.md, source of truth, STATUS.md, master plan, CONTRACTS.md, HTML, and the Phase 3 handoff. Check the recorded answer/default for Calendar, Time, and Upgrades. Phases 1–3 must be integrated.

Use interface-design and ui-ux-pro-max for precise UI adjustments, vercel-react-best-practices for changed components. Read installed Next.js guidance for any navigation changes. This is implementation and manual visual work, not authorization for a code review, build, or test command.

## Files

- Adapt components/Direction/EventsLane.tsx, TodayView.tsx, CalendarView.tsx, CalendarSettings.tsx only where integration requires it.
- Adapt lib/calendar/day-events.ts to the Phase 4 contract; change api/store fetching only if required to cover the visible overnight interval.
- Adapt components/AppTabs.tsx, components/Direction/DirectionNav.tsx, DayNav.tsx, TimelineRow.tsx, CoverageView.tsx, WeekGrid.tsx, BlockEditor.tsx, ui.ts, and app/globals.css only for concrete inconsistencies.
- Retain app/time/page.tsx, app/upgrades/page.tsx, components/TimeDots/*, components/Upgrades/*, lib/time-dots.ts, lib/milestones.ts, and lib/upgrades.ts under the keep-all default. Do not redesign or purge their data.
- Remove obsolete unused work/schedule exports/files missed during their owner phases, and update README/STATUS as needed.

## Tasks

- [ ] Preserve working navigation for Today, Week, Calendar, Coverage, Time, and Upgrades under the keep-all default. Never copy the prototype's disabled navigation into the application. If the user chose removal, remove the named feature's routes/navigation and unused dependencies together; do not infer removal from lack of an HTML demo.
- [ ] Align Calendar events and Today to the same local 07:00 operational day. Implement eventsForOperationalDate and operationalMinutesInto, include intersecting overnight events, clip only their geometry, and update EventsLane without applying the boundary offset twice. Preserve real gaps, timeline measurement attributes, and honest original event times.
- [ ] Keep Calendar read-only. Preserve current connection state/cache and selection; do not request additional scopes or send/create anything. For disconnected/unavailable Calendar, the schedule must remain usable. Do not display “no events” as proof of a successful sync when no sync happened.
- [ ] Compare the browser appearance, if available, to the accepted HTML: current green card, generic guide, compact Coverage toolbar/list, collapsed-area defaults, no area names in time blocks. Fix only concrete visual differences or usability problems, keeping the existing font/components.
- [ ] Address narrow-width wrapping, sticky header/footer overlap, keyboard focus, popover dismissal/focus return, and light/dark readability. Do not add ellipsis/line clamps to hide required card text. Production/Light work must remain distinguishable, and only the current block uses the green hero surface.
- [ ] Finish removal of old business assignments, inherited/gap calculations, dead helpers, stale old-document links, and legacy-only fields in touched implementation. Keep unrelated preserved feature data. This is scoped cleanup needed for the rebuild, not a general code-quality review.
- [ ] Record actual remaining limitations, authorizations/checks, and touched files. Commit, merge to main_new, and stop.

## Manual walkthrough scenarios

- Calendar disconnected, connected, empty, failed refresh, and overlapping events all leave Today usable.
- An event crossing midnight appears in the intended operational day, with no double shift; an event at 07:00 is on the next day.
- Today → Coverage → back restores place. Browser Back and direct Coverage URLs behave predictably.
- 360px mobile and desktop, light/dark mode, long leaf labels, keyboard-only navigation, and zoom do not conceal essential text or controls.
- Time and Upgrades still open and preserve their existing content under the keep-all decision.

Use real observed states where available. If Calendar credentials or browser access are missing, record the exact scenarios not checked; do not create synthetic “success” claims.

## Deliverable and stop

Integrated, visually consistent new version on main_new, with the retained surfaces intact and obsolete work-model remnants removed. No deployment or original-main merge. Stop before Phase 5.
