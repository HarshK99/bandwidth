# Focused rebuild review — 2026-09-16

Scope: rebuild changes through `d6d3c71`, prioritizing data loss, Calendar sign-in, navigation, and scheduling. The 20,000-token budget was reached during source inspection. This is a partial review, not approval to ship. Findings below follow directly from the inspected code paths; their reproduction steps have not been exercised in a browser during this review. No application code changed and no builds or test commands ran.

## Findings

### 1. High priority: returning to a tab can overwrite newer schedule changes

Location: `lib/direction/plan-store.ts`, `subscribe`, `getSnapshot`, and `updatePlan`.

The store removes its storage-change listener when its last subscriber leaves, but retains its cached plan. Only Today and Week subscribe. When a tab visits Coverage or another section, edits saved in another tab can therefore be missed. Returning to Week reattaches the listener without reloading storage; `getSnapshot` keeps the old cached plan. The next edit writes that whole old plan back, potentially erasing the other tab's saved changes, even on unrelated weekdays.

Confirmed in isolated Chromium after the user requested “yeah check 1”: opened two tabs sharing temporary storage; tab A visited Week then Coverage; tab B saved Monday's morning name as `Monday saved in tab B`. On returning to Week, tab A still displayed `Morning routine`. Saving an unrelated Wednesday name in A reverted Monday's stored name to `Morning routine`; reloading B confirmed the loss. The development indicator intercepted the first mouse attempt, so the completed run used keyboard activation of Direction. No real user schedule was touched and no application fix was made.

Suggested fix: reconcile storage when the store becomes active again, and ensure updates start from the latest saved plan. Preserve and disclose unsaved local edits rather than silently replacing them during reconciliation.

Resolution: user authorized fixing finding 1. The store now reads the latest valid saved plan on subscription and before updating. It retains failed-save edits and rejects a save when they conflict with a newer saved plan, leaving the draft open with an explanation. Repeating the original two-tab browser sequence preserved both Monday and Wednesday edits after reload. A simulated failed-save conflict kept both the newer stored schedule and the unsaved local work. No build or repository test command was run for the fix; findings 2–3 remain unfixed.

### 2. Medium priority: a late Calendar response can overwrite another tab's calendar selection

Location: `lib/calendar/store.ts`, `onStorage` and `runSync`.

Local calendar changes and disconnect increment `requestVersion`, which makes old requests harmless. `onStorage` applies the equivalent changes from another tab without incrementing that version. An in-progress fetch for calendar A can consequently finish after another tab selects calendar B, pass the unchanged version check, and persist A's events under the current B selection. After a cross-tab disconnect, it can also repopulate the cache that disconnect just cleared.

Reproduction to confirm: delay a sync response in tab A; change the selected calendar or disconnect in tab B; release A's response and inspect the persisted selection/events.

Suggested fix: invalidate pending requests when storage events change the connection or selected calendar, reconcile sync status, and fetch the selected calendar only when appropriate. Apply the same guard to asynchronous calendar-list work.

### 3. Medium priority: Coverage return can pin Today to yesterday after 07:00

Location: `lib/direction/navigation.ts`, `rememberToday`; `components/Direction/TodayView.tsx`, selected-date derivation and return restoration.

Opening Coverage from the live Today page changes its history entry to an explicit `date=YYYY-MM-DD`. Returning retains that date. Today always prefers this parameter over the current operational date, so when 07:00 arrives the page remains on the preceding day and loses its current block instead of advancing. The code does not distinguish a deliberate historical-date selection from a date attached only to restore Coverage navigation.

Reproduction to confirm: open the live Today page at 06:59, open Sleep's Coverage, return, then advance through 07:00. Compare with a fresh `/direction` page.

Suggested fix: retain whether the user was following Today or browsing a chosen date. Restore the prior position, then let live Today continue following the operational day; preserve explicitly chosen historical dates.

## Coverage and limitations

Inspected schedule parsing/derivation and validation, plan persistence and editing, Today/Coverage navigation and centering, Calendar request coordination/access handling/event geometry, and activity filtering/catalogue. The no-automatic-sign-in guard is present before Google's token request; this review did not repeat the prior simulated browser checks or authenticate a real account.

Not completed: browser confirmation of these findings, exhaustive Calendar races/token cancellation and revoked-access handling, full accessibility/security review, or all remaining changed UI/style code. The earlier successful build remains separate evidence and does not validate these behavior paths.

Next: confirm the three scenarios, then fix them only when authorized. Continue the remaining review only with additional scope/budget from the user.
