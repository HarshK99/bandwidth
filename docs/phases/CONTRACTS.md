# Shared implementation contracts

Read with APP_SOURCE_OF_TRUTH.md, STATUS.md, and the master plan. These are planned interfaces, not claims that implementation exists.

## Phase 1: catalogue and filters

Create `lib/work/types.ts`, `lib/work/modes.ts`, and `lib/work/catalog.ts`. Reuse `lib/direction/coverage.ts` for filtering rather than adding a second Coverage engine.

```ts
export type Effort = 'deep' | 'production' | 'light' | 'recovery';
export type AreaId = 'wave' | 'freelance' | 'content' | 'side-projects' | 'jobs' | 'recovery';
export type ActivityNode =
  | { id: string; kind: 'group'; label: string; children: readonly ActivityNode[] }
  | { id: string; kind: 'activity'; label: string; efforts: readonly Effort[] };
export interface ActivityArea {
  id: AreaId;
  label: string;
  children: readonly ActivityNode[];
}
export interface CoverageFilter { area: AreaId | null; effort: Effort | null }
export interface WorkMode { label: string; guide?: string }
// modes.ts
export const WORK_MODES: Record<Effort, WorkMode>;
// catalog.ts
export const ACTIVITY_AREAS: readonly ActivityArea[];
// direction/coverage.ts
export function filterActivities(areas: readonly ActivityArea[], filter: CoverageFilter): ActivityArea[];
export function parseCoverageFilter(params: URLSearchParams): CoverageFilter;
```

Use stable full-path IDs, for example `wave.outreach` and `recovery.hobbies.painting`. Duplicate labels in different businesses are allowed; duplicate IDs are not. A multi-effort activity is one record. Only leaves carry effort memberships. Preserve authored order and ancestors of matching leaves; omit empty groups. Do not mutate the source tree.

URLs: `/coverage?effort=production`, optionally `&area=freelance`. Omitted/unknown values mean All. The obsolete `type` parameter has no supported meaning; no compatibility mapping is required. Change filters with replace so browsing choices does not fill history with every selection. Keep the existing Suspense wrapper or equivalent required by installed Next.js documentation.

## Phase 2: schedule and storage

DayBar includes fixed presentation copy: `Wave Link · +5%/week` / `Active users`, `Income · ≥₹60k/month` / `Reliable income`, then `Work: advance a goal or tackle its blocker.` Keep this in the existing DayBar; no goal type, storage, editable values, or tracking. Replace the separate weekday row and whole-day progress bar with this compact layout; preserve current-block rail progress.

Replace the contents of `lib/direction/types.ts` and `lib/life/life.ts`; reduce `lib/life/index.ts` to new schedule exports. Work data lives only in lib/work.

```ts
import type { Effort } from '../work/types';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type BlockType = Effort | 'break';
export interface TimeBlock {
  id: string;
  name: string;
  start: string; // HH:MM, local clock
  end: string;   // HH:MM, local clock
  type: BlockType;
}
export interface DirectionPlan {
  version: 2;
  week: Record<DayOfWeek, TimeBlock[]>;
}
export type BlockStatus = 'past' | 'current' | 'upcoming';
export interface DayEntry {
  block: TimeBlock;
  name: string;
  status: BlockStatus;
  minutesRemaining: number;
  progress: number;
}
export interface DaySchedule {
  blocks: TimeBlock[];
  entries: DayEntry[];
  current: DayEntry | null;
  next: DayEntry | null;
  minutesUntilNext: number | null;
}
export interface PlanIssue { field: string; message: string }
export type PlanChange = { ok: true; plan: DirectionPlan } | { ok: false; issues: PlanIssue[] };
```

No assignments, nodeId, serves, per-task notes, inherited hours, or dated overrides in the new plan. Each weekday owns its own blocks; do not silently change all weekdays when editing one. IDs are unique within a day, stable across edits, and keyed by day plus ID in cross-day views.

```ts
// life/index.ts
export function createDefaultPlan(): DirectionPlan;
// direction/schedule.ts
export function getOperationalDate(now: Date): Date;
export function getDaySchedule(plan: DirectionPlan, date: Date, now: Date): DaySchedule;
export function sortBlocks(blocks: readonly TimeBlock[]): TimeBlock[];
export function blockDurationMinutes(block: TimeBlock): number;
export function toMinutes(value: string): number;
export function toISODate(date: Date): string;
export function fromISODate(value: string): Date;
export function addDays(date: Date, count: number): Date;
export function isSameDate(a: Date, b: Date): boolean;
// Keep the existing getDayRuler and formatting export names
// where their signatures still fit. Record any changed signatures in STATUS.
// direction/storage.ts
export function loadPlan(): DirectionPlan;
export function savePlan(plan: DirectionPlan): boolean;
export function clearStoredPlan(): void;
// direction/plan-ops.ts
export function setBlockMode(plan: DirectionPlan, day: DayOfWeek, blockId: string, type: BlockType): PlanChange;
```

The operating day is 07:00 to the next 07:00 in browser-local time. Default selected date before 07:00 is the previous calendar date. Manual date navigation is not shifted again. At an exact block boundary only the new block is current. At exactly 07:00 select the new day. Real gaps remain gaps, with a next-block message; do not invent an activity. An empty day has an honest empty state.

For block validation map clock minutes into the operational day: `(clockMinutes - 420 + 1440) % 1440`; an end at 07:00 maps to 1440. Require start < end, no zero duration, no crossing the 07:00 boundary, and no overlaps within a day. A block may cross midnight. Display time remains HH:MM; do not use a fixed milliseconds-per-day increment to step dates across timezone changes.

New storage key: `bandwidth.direction.plan.v2`. Old key: `bandwidth.direction.plan.v1`. Initialize from the new defaults if the new record is missing, invalid, or unsupported. Do not migrate the old business schedule. Remove only the old plan key after successful new initialization/save; leave Calendar and unrelated storage alone. Keep the existing external store and stable snapshots. If saving fails, retain the in-memory change and expose a small honest not-saved message in Week; do not report success silently. Reset to defaults removes/replaces only v2 plan data.

Maintain calendar lane inputs `DayEntry.block` and `[data-timeline-box]` attributes. Do necessary compile-facing adjustments in Phase 2; complete operational-day calendar filtering in Phase 4.

## Phase 3: editing

```ts
// Extend direction/plan-ops.ts; these do not exist until Phase 3.
export function upsertBlock(plan: DirectionPlan, day: DayOfWeek, block: TimeBlock): PlanChange;
export function removeBlock(plan: DirectionPlan, day: DayOfWeek, blockId: string): PlanChange;
export function copyDay(plan: DirectionPlan, source: DayOfWeek, target: DayOfWeek): PlanChange;
export function validateDay(blocks: readonly TimeBlock[]): PlanIssue[];
```

Block form fields: name, start, end, mode (including Break). Work-mode names default to WORK_MODES labels when choosing a mode; protected blocks retain useful names like Exercise and Sleep. Do not offer area/task/goal fields. Validate required name, strict HH:MM, unique IDs, positive intervals within the operational day, and overlaps. Keep invalid drafts in the editor with field-level errors; no partial mutation. Copying a day replaces only the chosen destination after an explicit in-app confirmation naming that day. Cancel changes nothing. This confirmation is for the product's destructive action, not a permission question to the coding agent.

## Navigation and return behaviour

Phase 2 owns the Today-to-Coverage return. Add `lib/direction/navigation.ts` only if needed to isolate this responsibility. Carry a validated `date=YYYY-MM-DD` on Today and a `fromDate=YYYY-MM-DD` on card links to Coverage. Accept only a valid local date, never an arbitrary return URL.

Keep one small sessionStorage entry `bandwidth.direction.return.v2` with `{ date: string, scrollY: number, blockId: string }` when entering Coverage from a card. On explicit back-to-Today, restore the matching date, scroll position, and focus after the timeline is ready. Prefer normal browser back behaviour for browser Back. Direct Coverage entry without a return record falls back to Today and does not navigate away from the app. Session state is navigation state, not task history.

## Phase 4: Calendar boundary adapter

Retain the read-only calendar connection and cache. Add/replace a helper in `lib/calendar/day-events.ts`:

```ts
export function eventsForOperationalDate(events: CalendarEvent[], date: Date): CalendarEvent[];
export function operationalMinutesInto(date: Date, instantMs: number): number;
```

Use the visible date's 07:00 through next date's 07:00 interval. Include events intersecting the interval; clamp geometry to the visible range. Display original event times honestly. Do not double-shift operational minutes in EventsLane, which currently rotates clock minutes internally. Changing the helper requires updating its callers together. Do not send calendar messages, create events, or request write permissions.
