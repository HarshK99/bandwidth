# Plan: Schedule redesign

> **v4 (shipped) — real meal times + a coverage-backlog block.**
> See [the v4 section below](#v4--real-meal-times--a-coverage-backlog-block).
> Everything above that heading is the v3 record; v4 supersedes its timing.
>
> **Still planned:** the Today block → Coverage link — see
> [PLAN_BLOCK_LINKS.md](./PLAN_BLOCK_LINKS.md).

---

**Status: shipped.** `DAY`/`WEEK` in `lib/life/life.ts` rewritten,
`career.prep.product` task added, `learning.reading` relabelled,
`PLAN_VERSION` → 3 (a pre-v3 stored plan is swapped for the current seed on
load — no manual Reset needed). `validate()` passes; the derived week reads
as documented below.

Decisions taken: afternoon block is **Build** (morning back to **Deep
Work**); sleep 23:30–07:00; Study Mon–Sat; reading Sunday-only; afternoon
default is Side Project with client work preempting; posting is a Wind-down
note.

One adjustment during build: Thursday Deep Work went to `wave.system`
(sharpen the machine) with outreach follow-ups moved to Thursday evening,
and Applications moved to Tuesday evening — running Wave outreach with zero
time on the outreach *system* was a hole the Coverage check caught.

## Why

The current day has 14 blocks, ~7 of them pointing at a different area each
day. A single weekday touches 6–7 domains in 1–1.5h slivers. The morning
works because it's one arc (study → build) with one next action. Everything
after lunch is a different mode and a different project every 60–90 minutes,
placed in the post-lunch circadian dip, with four decision points where the
day can come off the rails.

Observed reality: mornings hold. After lunch it's ~2h PS5, then self-directed
building ("vibe coding") on client work or the side project. Reading hasn't
happened in a month. The evening blocks are finely sliced for time that's
actually fluid.

The task tree (`lib/life/areas/`) is not the problem — it's a first-
principles list of what needs doing, and it stays. Only the *split* changes:
`DAY` and `WEEK` in `lib/life/life.ts`.

## Principles

1. **Two pushes: Websites and Wave.** Websites pays now; Wave is the long
   bet and its whole job is users (outreach, not features). Everything else
   is a keystone habit, a weekly slot, or weekend-only.
2. **Job hunting is live** but rides as the daily Study block + one weekly
   Applications slot — not a third push competing for peak hours.
3. **Peak mornings go only to the two pushes.** Websites 3× (Mon/Wed/Fri),
   Wave 2× (Tue/Thu). Wave mornings are outreach — business hours, high
   energy, the thing that's easiest to avoid.
4. **The day's "must" ends at lunch.** Study + one deep session. The
   afternoon is upside, not a debt.
5. **The dip is named.** A real block for decompressing (PS5), so missing it
   is impossible and the session after it reads as bonus, not "finally
   starting".
6. **Afternoons are for building**, self-directed. Default target = Side
   Project; client work preempts it whenever a build or deadline is live
   that week.
7. **Evenings are light** — editing, admin, design, people. No deep work
   after dinner.
8. **Themes, not slivers.** Morning and afternoon point at the *same*
   domain most days, so "what's today?" has a one-word answer and there's
   no cold restart at 3pm.

## New `DAY` — 11 blocks (from 14)

| Time | Block | Type | Runs |
|---|---|---|---|
| 07:00–07:45 | Morning Routine | custom | daily |
| 07:45–09:00 | Study | focus | mon–fri |
| 09:15–12:45 | Deep Work | focus | daily |
| 12:45–13:30 | Lunch | buffer | daily |
| 13:30–15:15 | Decompress | hobby | daily |
| 15:15–18:15 | Build | execution | daily |
| 18:15–19:15 | Dinner | buffer | daily |
| 19:15–21:00 | Evening | admin | daily |
| 21:00–22:00 | Exercise | custom | daily |
| 22:00–23:30 | Wind-down | hobby | daily |
| 23:30–07:00 | Sleep | custom | daily |

- The 09:00–09:15 gap between Study and Deep Work is deliberate (matches the
  existing pattern) — breaks up what would otherwise be ~5h of unbroken
  focus.
- `Decompress` replaces `Admin` + `Reset`. `Build` replaces `Second Push`.
  `CTP`, `Free Time` are gone (see fold-ins below).
- Weekends: `Study` doesn't run, so Sat/Sun start with a 07:45–09:15 gap —
  fine, weekends are genuinely looser and the day model already allows real
  gaps.

```ts
export const DAY = [
  { id: "blk-morning",    label: "Morning Routine", start: "07:00", end: "07:45", type: "custom" },
  { id: "blk-study",      label: "Study",           start: "07:45", end: "09:00", type: "focus", days: "mon-fri" },
  { id: "blk-deep",       label: "Deep Work",       start: "09:15", end: "12:45", type: "focus" },
  { id: "blk-lunch",      label: "Lunch",           start: "12:45", end: "13:30", type: "buffer" },
  { id: "blk-decompress", label: "Decompress",      start: "13:30", end: "15:15", type: "hobby" },
  { id: "blk-build",      label: "Build",           start: "15:15", end: "18:15", type: "execution" },
  { id: "blk-dinner",     label: "Dinner",          start: "18:15", end: "19:15", type: "buffer" },
  { id: "blk-evening",    label: "Evening",         start: "19:15", end: "21:00", type: "admin" },
  { id: "blk-exercise",   label: "Exercise",        start: "21:00", end: "22:00", type: "custom" },
  { id: "blk-winddown",   label: "Wind-down",       start: "22:00", end: "23:30", type: "hobby" },
  { id: "blk-sleep",      label: "Sleep",           start: "23:30", end: "07:00", type: "custom" },
] as const satisfies readonly DayBlock[];
```

## New `WEEK`

| Day | Theme | Deep Work | Build | Evening |
|---|---|---|---|---|
| Mon | Websites | client build | client dev + debug | Digital Products (design) |
| Tue | Wave | outreach batch | Side Project (MVP) | Applications + tracking |
| Wed | Websites | client dev | client dev | Skit editing |
| Thu | Wave | sharpen the outreach system | Side Project (MVP) | Outreach follow-ups |
| Fri | Websites | pipeline — line up next work | Side Project / catch-up | Invoicing + wrap-up |
| Sat | Content | skit filming (daylight) | Life Admin / errands | Rest / hobbies |
| Sun | Review | weekly review | Financial + portfolio | Relationships |

Study: product-sense practice, Mon–Sat. Exercise: daily workout. Wind-down:
15-min post-and-engage then down; Sunday carries the week's one real reading
session.

```ts
export const WEEK = {
  "blk-study": {
    "mon-sat": { node: "career.prep", do: ["product"] },
  },

  "blk-deep": {
    mon: { node: "web.build", do: ["dev"], note: "Client build — clear this week's deadlines" },
    tue: { node: "wave.outreach", do: ["batch"] },
    wed: { node: "web.build", do: ["dev"] },
    thu: { node: "wave.system", do: ["script", "review"] },
    fri: { node: "web.pipeline", do: ["outreach", "referral"], note: "Line up next month's work" },
    sat: { node: "brand.shoot", do: ["film"], label: "Filming", note: "Skits — needs daylight" },
    sun: { node: "rest", do: ["review"], label: "Weekly Review" },
  },

  "blk-build": {
    mon: { node: "web.build", do: ["dev", "debug"] },
    tue: { node: "side.dev", do: ["mvp"] },
    wed: { node: "web.build", do: ["dev"] },
    thu: { node: "side.dev", do: ["mvp"] },
    fri: { node: "side.dev", do: ["mvp"], label: "Build / Catch-up" },
    sat: { node: "lifeadmin", do: ["errands"], label: "Life Admin" },
    sun: { node: "financial", do: ["trading"], label: "Financial" },
  },

  "blk-evening": {
    mon: { node: "dp.design", do: ["make"] },
    tue: { node: "career.apply", do: ["send", "track"], label: "Applications" },
    wed: { node: "brand.edit", do: ["cut"] },
    thu: { node: "wave.outreach", do: ["followup"], label: "Outreach follow-ups" },
    fri: { node: "web.payment", do: ["invoice", "chase"], label: "Invoicing + wrap-up" },
    sat: { node: "rest", do: ["hobbies"] },
    sun: { node: "relationships", label: "Relationships" },
  },

  "blk-exercise": {
    all: { node: "health", do: ["workout"] },
  },

  "blk-winddown": {
    "mon-sat": { note: "Post & engage (15 min), then wind down" },
    sun: { node: "learning", do: ["reading"], label: "Reading" },
  },
} as const satisfies Week &
  Partial<Readonly<Record<BlockId, Readonly<Record<string, Slot>>>>>;
```

## Data-model changes

1. **`lib/life/areas/career.ts`** — add a `product` task under `career.prep`
   (Study points at it):

   ```ts
   tasks: {
     product: "Product sense practice",
     technical: "Interview technical prep",
     behavioural: "Resume tailoring / STAR stories / mock interviews",
   },
   ```

2. **`lib/life/areas/sustain.ts`** — relabel `learning.reading` from
   `"Reading rotation (day-themed)"` to `"Reading (Sunday, with review)"`,
   matching where it now actually lives. No structural change.

3. **No schema change.** `days`, `note`, `label`, `serves`, `do` already
   express everything above. `parseDays` already handles `"mon-sat"`.

4. **`PLAN_VERSION` 2 → 3, migration ladder simplified.** Old block ids
   (`blk-prep`, `blk-admin`, `blk-reset`, `blk-ctp`, `blk-free`, `blk-push`)
   no longer exist, so a pre-v3 stored plan points at nothing — `migrate()`
   now swaps any plan below the current version for the current seed, and
   the dead v1→v2 node-id rename table (`V2_NODE_IDS`, `toV2` — 60-odd
   lines) is deleted. No manual Reset needed; a stale plan self-heals on
   load. A plan from a *newer* build is still left untouched.

## What this does NOT change

- **The tree** (`lib/life/areas/*.ts`) — every area, stage and task stays,
  except the one task *added* (`career.prep.product`) and one relabel.
- **The Coverage list.** Coverage walks the tree, not the schedule
  (`getCoverageRows` reads `hierarchy`). Rewriting `DAY`/`WEEK` cannot
  delete a row from it. What changes is each row's *state* and hours.
- Any UI or app logic. `components/` untouched; `lib/direction/` only the
  `PLAN_VERSION`/`migrate()` change above.

## Coverage impact

Nothing is deleted; some stages just move from `covered` to `inherited` (an
ancestor is scheduled, the work happens inside it) or `gap` (no time in the
chain). Verified against the built plan:

| Node | Was | Now | Note |
|---|---|---|---|
| `wave.system` | — | **covered** (Thu) | gained a slot — sharpening the machine |
| `web.scoping` | Wed CTP | inherited | scope a warm lead inside a Websites Deep Work session |
| `web.aftercare` | Tue Admin | inherited | check-ins fold into Friday's pipeline |
| `brand.script` | Mon+Thu CTP | **gap** | filming has a slot, scripting doesn't — script during Decompress or before Saturday's shoot, or give it Saturday's Build slot if content gets serious |
| `brand.growth` | Wed Admin | **gap** | the 15-min daily post is a Wind-down note, deliberately not credited 90 min/day |
| `psych.confidence` / `psych.fluency` / `psych.judgment` | Tue/Thu Reset | **gap** | solo scheduled speaking practice never held; re-attach to real calls later |
| `side.ideation` / `side.content` | Fri CTP | inherited | brainstorming happens at the start of a Build session |
| `dp.listing` / `dp.fulfilment` | Fri Hobbies / — | **gap** / inherited | DP is #6; listing rides Monday's design session, fulfilment is event-driven |
| `career.interview` / `career.offer` | — | gap | event-driven, unschedulable — expected |
| `learning` | daily Reset | covered (Sun only) | honest — it was zero for a month at daily |

The remaining gaps are the point of Coverage working: it names what has no
real place so the call is made with eyes open. `brand.script` is the one
worth a second look if Personal Brand stops being #5.

## The override expectation

- **The themes are the "nothing's on fire" default, not a debt.** A bent
  week isn't made up later — resume the themes next week. No backlog.
- **Client crunch** (a launch within ~5 days): Deep Work *and* Build
  collapse to client work every day until it ships. Wave, Side Project and
  Content pause. **Study and Applications do not pause** — crunch is exactly
  when the hedge gets dropped, and that's how a job search dies.
- **An interview lands:** it takes that day's Deep Work. Study stays (it's
  prep). The rest of the day flexes freely.
- Mechanically: you just know it. The plan doesn't encode the exception, and
  there's no per-date override UI any more — it makes the default obvious
  enough that leaving it is a noticed choice.

## Decisions taken

1. **Afternoon block:** `Build` (morning back to `Deep Work`).
2. **Sleep:** 23:30–07:00.
3. **Study:** Mon–Sat.
4. **Reading:** Sunday-only, with the review.
5. **Afternoon default:** Side Project; client work preempts during crunch.
6. **Personal Brand posting:** Wind-down note.

## What shipped

- [x] `career.prep.product` task added (`lib/life/areas/career.ts`).
- [x] `learning.reading` relabelled (`lib/life/areas/sustain.ts`).
- [x] `DAY` rewritten — 11 blocks (`lib/life/life.ts`).
- [x] `WEEK` rewritten — 41 assignments; `validate()` passes.
- [x] `PLAN_VERSION` → 3; `migrate()` simplified; `V2_NODE_IDS`/`toV2`
  deleted (`lib/direction/{types,storage}.ts`).
- [x] `docs/DIRECTION.md` "The seed week" + migration paragraph refreshed;
  `docs/DATA_MODEL.md` examples updated off the dead block ids.

## To verify in the running app

Reset is automatic (a pre-v3 stored plan self-heals). Walk Today for each
weekday, check the Week grid reads as one theme a day, and check Coverage
against the table above — `brand.script`, `brand.growth`, the `psych`
stages and `dp.listing` should show as gaps, everything in the two pushes
should be covered.

---

# v4 — real meal times + a coverage-backlog block

**Status: shipped.** `DAY`/`WEEK` retimed, `blk-break` + `blk-loose` added,
`PLAN_VERSION` → 4 (pre-v4 stored plans self-heal on load). `validate()`
passes; 13 blocks, 48 assignments. This section supersedes the v3 timing
above; the v3 principles all still hold.

## What changed and why

Three things surfaced from living with v3:

1. **The meal blocks were fiction.** Real times: lunch **1:00–1:30**, dinner
   **7:00–7:30**, and an unmodelled **5:00–5:45** break to go out and eat.
   v3 had lunch 12:45–13:30, dinner 6:15–7:15, no evening break.
2. **"Decompress" was doing too much as one word.** ~2h of post-lunch
   recovery — not 2h of scheduled PS5. The PS5 wording goes, and it now
   points at `rest` (`do: ["hobbies"]`) rather than being unassigned: it's
   genuinely rest time, Rest/Reflection *should* read as heavily covered,
   and pointing it there makes the block linkable like every other one. One
   block, every day.
3. **The coverage backlog had no home.** v3 left `web.scoping`,
   `web.aftercare`, `brand.script`, `brand.growth`, `dp.listing` and
   `side.ideation` as gaps — "happens inside a bigger block" was optimistic.
   The new pre-dinner slot (`Loose Ends`, 5:45–7:00) becomes a **rotation**
   that visits one of them per weekday, so every non-event-driven stage gets
   a real weekly slot.

The two new work-adjacent blocks (`Break`, `Loose Ends`) split what was one
3h `Build` block. Build's protected deep-build time drops from 3h to 1h30;
the pre-dinner hour becomes light rotation work, not more building — the
5pm break is a real context switch (you leave the house), so heavy work
after it wasn't realistic.

## New `DAY` — 13 blocks

| Time | Block | Type | Change |
|---|---|---|---|
| 07:00–08:00 | Morning Routine | custom | +15m |
| 08:00–09:15 | Study | focus (mon–sat) | shifted later |
| 09:30–13:00 | Deep Work | focus | shifted, ends at lunch |
| 13:00–13:30 | Lunch | buffer | 30m, starts at 1 |
| 13:30–15:30 | Decompress | hobby | now points at `rest`; PS5 wording gone |
| 15:30–17:00 | Build | execution | 1h30, self-directed |
| 17:00–17:45 | **Break** | buffer | **new** — out to eat |
| 17:45–19:00 | **Loose Ends** | admin | **new** — coverage-backlog rotation |
| 19:00–19:30 | Dinner | buffer | 30m, starts at 7 |
| 19:30–21:00 | Evening | admin | starts after dinner |
| 21:00–22:00 | Exercise | custom | — |
| 22:00–23:30 | Wind-down | hobby | — |
| 23:30–07:00 | Sleep | custom | — |

Only gap: 09:15–09:30. Weekend mornings also open at 09:30 (Study is Mon–Sat,
so only Sunday starts with the longer 08:00–09:30 gap).

```ts
export const DAY = [
  { id: "blk-morning",    label: "Morning Routine", start: "07:00", end: "08:00", type: "custom" },
  { id: "blk-study",      label: "Study",           start: "08:00", end: "09:15", type: "focus", days: "mon-sat" },
  { id: "blk-deep",       label: "Deep Work",       start: "09:30", end: "13:00", type: "focus" },
  { id: "blk-lunch",      label: "Lunch",           start: "13:00", end: "13:30", type: "buffer" },
  { id: "blk-decompress", label: "Decompress",      start: "13:30", end: "15:30", type: "hobby" },
  { id: "blk-build",      label: "Build",           start: "15:30", end: "17:00", type: "execution" },
  { id: "blk-break",      label: "Break",           start: "17:00", end: "17:45", type: "buffer" },
  { id: "blk-loose",      label: "Loose Ends",      start: "17:45", end: "19:00", type: "admin" },
  { id: "blk-dinner",     label: "Dinner",          start: "19:00", end: "19:30", type: "buffer" },
  { id: "blk-evening",    label: "Evening",         start: "19:30", end: "21:00", type: "admin" },
  { id: "blk-exercise",   label: "Exercise",        start: "21:00", end: "22:00", type: "custom" },
  { id: "blk-winddown",   label: "Wind-down",       start: "22:00", end: "23:30", type: "hobby" },
  { id: "blk-sleep",      label: "Sleep",           start: "23:30", end: "07:00", type: "custom" },
] as const satisfies readonly DayBlock[];
```

## `WEEK` — only `blk-loose` is new

Every existing block keeps its id and its assignments. `blk-loose` gets the
rotation; the `blk-winddown` "post & engage" note is dropped (posting now has
a real Tuesday slot). `blk-break` is unassigned (life-support), like the
meals.

```ts
"blk-decompress": {
  all: { node: "rest", do: ["hobbies"] },
},

"blk-loose": {
  mon: { node: "web.scoping",   do: ["proposal", "pricing"] },
  tue: { node: "brand.growth",  do: ["post"], label: "Post & engage" },
  wed: { node: "web.aftercare", do: ["checkin", "upsell"] },
  thu: { node: "brand.script",  do: ["ideas"], label: "Scripting" },
  fri: { node: "dp.listing",    do: ["publish"] },
  sat: { node: "side.ideation", do: ["brainstorm"], label: "Ideas" },
  // sun — open. Sunday is a genuinely different day and wants a different
  // structure, not just different assignments; the model can't express that
  // yet (block *times* are the same every day — see below). Left open for now.
},

"blk-winddown": {
  sun: { node: "learning", do: ["reading"], label: "Reading" },
},
```

Days in the rotation are swappable — the point is the *set* is covered each
week.

**Per-day structure is a known model gap.** `days` and the `WEEK` cells make
*which blocks run* and *what they point at* per-day already, but every
block's **start/end is the same all seven days**. Sunday genuinely wants its
own shape (later start, fewer blocks, different rhythm). Deferred — not part
of v4.

## Coverage after v4

Gaps closed: `web.scoping`, `web.aftercare`, `brand.script`, `brand.growth`,
`dp.listing`, `side.ideation`. Plus `rest` jumps to ~14h/week (Decompress,
daily) — deliberate; Rest/Reflection *should* read as heavily covered, and a
Sustain area isn't a bet the rollup needs protecting from.

Still gaps, all correct: `dp.fulfilment`, `side.content`, `career.interview`,
`career.offer` (event-driven — scheduling them would be fiction), and
`psych.confidence` / `psych.fluency` / `psych.judgment` — **deliberately
unscheduled** (decision (c): stop scheduling solo speaking practice, count
the visibility already happening via the Tuesday post and outreach calls).

## What shipped (v4)

- [x] `lib/life/life.ts` — blocks retimed; `blk-break` + `blk-loose` added;
  `WEEK` gained `blk-decompress` (→ `rest`) and the `blk-loose` rotation,
  lost the `blk-winddown` Mon–Sat note; header comment updated.
- [x] `lib/direction/types.ts` — `PLAN_VERSION` 3 → 4.
- [x] `lib/direction/storage.ts` — `migrate()` comment updated for v4.
- [x] `docs/DIRECTION.md` "The seed week" — meal breaks, Loose Ends,
  Decompress → `rest`, per-day-structure gap noted.
- [x] `docs/DATA_MODEL.md` — `blk-study` example time.

`migrate()` swaps any pre-v4 plan for the seed, so it applies on next load
with no manual step. `validate()` has no time-overlap check, but the blocks
are contiguous bar the one intended gap (09:15–09:30).

## To verify in the running app

Walk Today for each weekday: one theme a day (Mon/Wed/Fri Websites, Tue/Thu
Wave, Sat Personal Brand, Sun Rest); `Loose Ends` shows a different backlog
stage each day. Coverage: `web.scoping` / `web.aftercare` / `brand.script` /
`brand.growth` / `dp.listing` / `side.ideation` no longer gaps; `rest` ~19h;
remaining gaps are `dp.fulfilment`, `side.content`, `career.interview`,
`career.offer`, `psych.*` only.

## Decisions taken (v4)

1. **Decompress** — one block, points at `rest`, label kept as "Decompress",
   PS5 wording removed.
2. **Coverage filter** — stays **type-only** (energy lens). No area filter.
   Drives the block→Coverage link design in `PLAN_BLOCK_LINKS.md`.
3. **Sunday `Loose Ends`** — left open. Sunday wants its own day shape, which
   the model can't express yet; revisit with per-day structure.

## Deferred

- **Per-day block structure** — Sunday (and Saturday) want different start
  times / fewer blocks, not just different assignments. Needs a model change
  (`DAY` becomes per-day, or an override layer). Not v4.
