# Direction — daily direction feature

A self-contained feature at `/direction`. It answers one question at any
moment of the day: **what block am I in, what area is it for, and what's
next?**

It is not a task manager. Tasks, notes and capture live in Apple Notes;
this feature has no entity for them and never asks for one. The only thing
it stores is the *shape* of a week.

## Routes

| Route                  | View     | Purpose                                          |
| ---------------------- | -------- | ------------------------------------------------ |
| `/direction`           | Today    | Primary screen. Read-only timeline of one day.   |
| `/direction/week`      | Week     | The recurring rhythm — block × day, click to set. |
| `/direction/settings`  | Settings | Block structure, and single-date overrides.      |

Direction is the app's home: `/` redirects to `/direction`, the mind-map
moved to `/map`, and the tab bar lists Direction first. Inside the section,
three words and an accent underline (`DirectionNav`) — no icons, no second
chrome layer.

### Today

- Date stepper (‹ · Today · ›) — other days are a glance ahead, not a place
  to live, so the control is understated and the view is identical for any
  date.
- A vertical timeline: time rail on the left, block name and area on the
  right. No proportional heights — this is not a calendar.
- Times stack vertically in a ~3.5rem column — "8" over "10am", "1" over
  "2:30pm". Whole hours drop their ":00" and a shared meridiem prints once,
  on the end. `formatRange()` still returns the one-line form ("8–10am") for
  the week grid and override list, where a range sits inside a dense row.
- Each block is a bordered box, and **box height carries duration**:
  `boxHeight()` in `TimelineRow` is `40 + 0.58 × minutes`, capped at 190px.
  Linear enough that 3h reads about twice 1h (a square-root curve was tried
  first and the difference was too subtle to notice), capped so the 8-hour
  sleep block doesn't turn the page into a scroll marathon. It is a
  *min*-height, so the live block — set at display size — simply takes the
  room it needs. Two constants tune the whole feel.
- **Blocks that touch are drawn as one run.** Adjacent boxes overlap by a
  pixel so their borders collapse into a single hairline, and corners round
  only where a run begins and ends. 08:00–09:00 and 09:00–12:00 therefore
  read as one continuous stretch of problem-solving rather than two floating
  cards. The payoff is that a visible gap on the timeline always *means*
  something: unstructured time.
- The header carries the **day's theme** — the area most of the structural
  hours go to ("Wednesday · Income Work"), from `getDayTheme()`.
- **Now** is the strongest element on the screen: the area jumps to ~2×
  type size, the block name goes full contrast, and the rail beside it turns
  into the clock — an accent track that fills as the block runs out. Time
  remaining sits with the NOW tag, not in the time column.
- **Next** is always tagged, whether or not a block is live. Nothing else is
  dimmed: an earlier version faded later blocks progressively and made the
  day unreadable. Past blocks only step their *text* back a shade (and their
  border a little) — the box never loses opacity, so the whole day stays
  legible and the live block leads on size and accent alone.
- A single hairline under the header shows progress through the day's
  blocked span (first start → last end). No percentages, no statistics.
- An unassigned block renders **empty** — no em dash, no invented phrase.
  A block with nothing pointed at it is open time, and hardcoded copy
  ("Available capacity") reads as content when it isn't. If a block should
  carry a phrase, it gets assigned one in Week like any other area.
- Relaxed types (thinking, hobby, buffer) never take extra weight, even when
  they're the live block.

### Week

Rows are the recurring blocks, columns are Mon–Sun, and a cell holds one
thing: the area that block points at. Today's column carries a faint accent
wash; weekends are quieter. Clicking a cell opens a small popover — one
input, a row of one-tap areas drawn from what you already use, Enter to
save. Edits here change the template, so they apply every week.

### Settings

Blocks are edited in place — start, end, name, type, order — with fields
that stay invisible until hovered. Below that, **a single date**: step to a
day and type over any block to override it. Empty puts the block back on
template. The weekly rhythm is never touched.

## Data model

Three flat arrays, no tasks — see `lib/direction/types.ts`.

```ts
TimeBlock      { id, name, start, end, type, order }
WeekAssignment { day, blockId, focus, note?, label? }  // recurring template
DateOverride   { date, blockId, focus }                // one date, template untouched
```

`note` is a quieter second line under the area — what that area means on
that day ("Client mid-week delivery push"). It is not a task: nothing can be
completed, ordered or checked off.

`label` renames the block for one day. Some days genuinely use a slot
differently — Saturday 9–12 is skit filming, Sunday 6pm is family time — and
calling those by the weekday name would simply be wrong. The block still
owns the hours; only its name changes.

Resolution splits along those lines: an override replaces the **area**, so
the template's `note` goes with it (a note written for a different area is
stale), while `label` survives — how the day uses the slot doesn't change
because the area did. `setAssignment` follows the same rule.

### Where the seed data comes from

`default-plan.ts` was generated from a 30-minute weekly schedule export
whose cells read `Block - Area - Detail`. Blocks are the spans the weekday
pattern settles into, and each cell contributed its area (`focus`), its
detail (`note`), and where that day names the slot differently, its own
block name (`label`). The CSV isn't kept in the repo — this file is the
source of truth now.

**The whole day is modelled**, 07:00 to 07:00: morning routine, exercise,
meals, wind-down and sleep included. An earlier cut modelled only the working
window, which left holes at lunch and dinner and made the app go blank
exactly when you'd glance at it. Life blocks carry no area — just a name —
so they stay quiet and never win the day's theme.

Two blocks share the name "Complex Problem Solving" on purpose: 08:00 is the
interview-prep hour, 09:00 the main build session. Same mode of work,
different area — the CSV names them the same, so this does too.

There is no separate list of areas. **The plan is its own vocabulary**: an
area exists because some block points at it, and `focus.ts` offers the ones
already in use, most-used first. Two earlier attempts at a canonical list —
derived from `lib/hierarchy-data.ts`, then hand-maintained — were both
redundant with the assignments themselves. The hierarchy and the schedule
overlap but are not the same thing (one models where value comes from, the
other what a slot is aimed at, in its own shorthand), so neither should be
generated from the other.

Cells with no real area — buffer, open time — carry an empty `focus`. That
is not missing data: those blocks have no single area, and the note (or
nothing at all) says everything worth saying.

Resolution is `override ?? assignment ?? ""`, computed in
`getDaySchedule()`, which also decides status (past / current / upcoming),
minutes remaining and progress through the live block.

`end <= start` means the block **wraps into the next day**: sleep is
`23:00–07:00`, and `blockEndMinutes()` returns 1860 so its duration is 8h.
Current-block detection measures the small hours against the previous
evening (03:00 reads as 1620, inside 23:00–07:00), and `20:00–00:00` still
lands exactly on 1440. Day progress spans first start → last end, so a day
that ends after midnight is one span, not two.

`order` always follows the clock, so reordering a block in Settings swaps
its times with its neighbour's. Anything else would leave the list sorted
differently than it reads.

## Layers

| File                             | Responsibility                                   |
| -------------------------------- | ------------------------------------------------ |
| `lib/direction/types.ts`         | The model.                                       |
| `lib/direction/default-plan.ts`  | Local seed data — the shipped week. No database.  |
| `lib/direction/block-types.ts`   | Block type → emphasis, tone, and empty-state copy.|
| `lib/direction/schedule.ts`      | Pure derivation: time math, current block, day resolution, progress. |
| `lib/direction/plan-ops.ts`      | Every mutation, as pure `plan → plan` functions.  |
| `lib/direction/focus.ts`         | Which areas to suggest, read off the plan itself.  |
| `lib/direction/storage.ts`       | localStorage read/write.                          |
| `lib/direction/plan-store.ts`    | External store (subscribe/getSnapshot) over the above. |
| `components/Direction/*`         | Views. No plan logic — they call `plan-ops`.      |

Persistence is **localStorage only** (`bandwidth.direction.plan.v1`),
matching the rest of the app's no-backend posture. A stored plan replaces
the seed wholesale rather than merging, so edits never get surprise entries
back when `default-plan.ts` changes. Settings → Reset drops the stored plan.

The plan is read through `useSyncExternalStore` rather than copied into
component state: it is genuinely external (localStorage), shared by three
views, and can change in another tab. `useNow` follows the same shape and
ticks every 30s. Both return `null` on the server and during hydration, so
nothing time- or storage-dependent can hydrate-mismatch; views hold quiet
space until the value lands.

`Popover` renders through a portal and positions itself from the clicked
element's rect. That's not incidental: the week grid scrolls horizontally,
and a panel inside that container would be clipped by it.

## Visual rules

- **One typeface: Manrope**, loaded once in the root layout. Columns of
  digits use `tabular-nums` (the `NUM` token) plus right alignment rather
  than a second, monospace webfont — right alignment means the column stays
  flush even where tabular figures aren't available. `--font-mono` is mapped
  to a system stack so a stray `font-mono` elsewhere in the app still lands
  somewhere sensible. Manrope's uppercase is wide, so label tracking is
  0.11em where a grotesque took 0.16em.
- **Surfaces, not outlines.** Blocks, the week matrix and the settings table
  sit on `--surface` cards with 16px corners. The live block is the one
  filled surface in the app: a soft green→teal gradient with faint grain
  (`.grain`), white text, and the area set extrabold at display size. It is
  fully rounded and raised above the run rather than squared off inside it.
  That is the app's only gradient and its only use of grain — everything
  else stays flat and monochrome. There are deliberately no per-type
  colours: a hue per category is what turns this back into a dashboard.
- One accent — a muted green (`--accent` in `app/globals.css`) — reserved
  for a single meaning: **now**. Today's column in Week and the active nav
  underline are the only other places it appears, and always at low opacity.
- Everything else is monochrome zinc. Hierarchy comes from type scale,
  weight, and space — never from colour, cards, or containers.
- Hairlines over borders, borderless fields over form controls, no
  gradients, no shadows except the popover's, no statistics.
- The section opts into the Geist face via `font-sans` on its own shell,
  leaving the rest of the app's typography untouched.
- Today is read-only on purpose. If the app needs maintenance during the
  day, it has failed.
