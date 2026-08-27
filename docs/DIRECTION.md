# Direction — daily direction feature

It answers one question at any moment of the day: **what block am I in, what
area is it for, and what's next?**

It is not a task manager. Tasks and capture live in Apple Notes; this feature
has no entity for them and never asks for one. The only thing it stores is
the *shape* of a week.

## Routes

| Route | View | Purpose |
| --- | --- | --- |
| `/direction` | Today | Primary screen. Read-only timeline of one day. |
| `/direction/week` | Week | The recurring rhythm — block × day, click to set. |
| `/direction/hours` | Hours | Where the week goes, rolled up the hierarchy. |
| `/direction/settings` | Settings | Block structure, and single-date overrides. |
| `/coverage` | Coverage | The hierarchy with hours attached — what has a place. |

Direction is the app's home: `/` redirects to `/direction` and the tab bar
lists it first. Inside the section, four words and an accent underline
(`DirectionNav`) — no icons, no second chrome layer.

### Today

- Date stepper (‹ · Today · ›) — other days are a glance ahead, not a place
  to live, so the control is understated and the view is identical for any
  date.
- A vertical timeline: time rail on the left, block name and area on the
  right.
- The left column is a **continuous hour ruler**, not each block's own range:
  every hour from the day's first to its last, once, in order — plus a
  fainter mark where a block starts off the hour (7:30, 2:30). A meridiem
  prints only when it changes, the way a clock reads: `7am · 7:30 · 8 · 9 ·
  10 · 11 · 12pm · 1 · 2 · 2:30 · 3 …`.

  The scale is **piecewise, not uniform** (`getDayRuler()`): each mark sits
  at its proportional position *inside its own block*. That's the trade for
  keeping a day on two screens — a uniform scale would make 09:00–12:00 six
  times a 30-minute block and turn the page into a calendar. Blocks longer
  than 4h thin to every other hour, anchored to even hours so midnight stays
  on the ruler.
- **Block type colours the whole box**, as a very light wash (`--type-*-fill`)
  with the matching hairline on its edge. A hairline alone was not enough to
  tell one block from the next — the eye reads fills long before it reads
  edges, and a column of identical grey boxes has to be read word by word.
  The washes sit at roughly the weight of the plain grey they replaced, so
  the day still reads as one calm column that happens to be colour-coded.
- Each block is a bordered box, and **box height carries duration**:
  `boxHeight()` in `TimelineRow` is `40 + 0.58 × minutes`, capped at 190px.
  Linear enough that 3h reads about twice 1h (a square-root curve was tried
  first and the difference was too subtle to notice), capped so the 8-hour
  sleep block doesn't turn the page into a scroll marathon. It is a
  *min*-height, so the live block simply takes the room it needs.
- **Blocks that touch are drawn as one run.** Adjacent boxes overlap by a
  pixel so their borders collapse into a single hairline, and corners round
  only where a run begins and ends. 08:00–09:30 and 09:30–13:00 read as one
  continuous stretch rather than two floating cards. The payoff is that a
  visible gap on the timeline always *means* something: unstructured time.
- The header carries the **day's theme** — the area most of the structural
  hours go to ("Wednesday · Websites"), from `getDayTheme()`.
- Inside a block the order is **eyebrow → lead → caption**: the block's own
  name smallest, what you're actually doing biggest, the area under it at mid
  size. A block with neither note nor area (lunch, sleep) promotes its name
  into the lead, so a card is never headed by nothing. Where a slot's output
  is aimed elsewhere the caption carries it: `Personal Brand → Wave`.
- **Now** is the strongest element on the screen: the lead jumps to ~2× type
  size on a filled card, and the rail beside it turns into the clock — an
  accent track that fills as the block runs out. Time remaining sits with the
  NOW tag, not in the time column. A multi-line lead drops a size: a hero
  line works for one statement, not for a list.
- **Next** is always tagged, whether or not a block is live. Nothing else is
  dimmed: an earlier version faded later blocks progressively and made the
  day unreadable. Past blocks only step their *text* back a shade — the box
  never loses opacity, so the whole day stays legible and the live block
  leads on size and accent alone.
- An unassigned block renders **empty** — no em dash, no invented phrase. A
  block with nothing pointed at it is open time, and hardcoded copy
  ("Available capacity") reads as content when it isn't.
- Today is read-only on purpose. If the app needs maintenance during the day,
  it has failed.

### Week

Rows are the recurring blocks, columns are Mon–Sun, and a cell holds one
thing: the area that block points at. Today's column carries a faint accent
wash; weekends are quieter. Clicking a cell opens a small popover — a filter
box over the hierarchy's areas, Enter to save. Edits here change the
template, so they apply every week.

### Hours and Coverage

Two readings of the same walk (`getCoverageRows`): **Hours** asks where the
week goes, **Coverage** asks whether everything has a place.

Coverage opens one level deep — master functions and their categories — and
the whole row is the toggle. Stages are a click away rather than in the first
paint: the top of the tree is the question you arrive with, the stages are
the follow-up.

Three states, because two would lie. `covered` has scheduled time; `gap` has
none anywhere in its chain; `inherited` means an ancestor is scheduled and
this happens inside it — a task under a scheduled stage does get time, it
just isn't named by any block, and calling that a gap would bury the real
ones in noise.

Some late stages have no recurring slot and that is correct, not an
oversight: Interviews, Offers and Fulfilment only exist once something else
happens. They still show, because "when this lands it will take a morning
from something else" is worth seeing.

## Data model

Three flat arrays, no tasks — see `lib/direction/types.ts`. The data is
authored in `lib/life/`; [DATA_MODEL.md](./DATA_MODEL.md) covers that format
and why the tree and the week stay two tables.

```ts
DirectionPlan  { version, blocks, assignments, overrides }
TimeBlock      { id, name, start, end, type, order, days? }
WeekAssignment { day, blockId, nodeId?, tasks?, serves?, note?, label? }
DateOverride   { date, blockId, nodeId }   // one date, template untouched
```

`nodeId` is a **tree node id, not typed text** — checked by the compiler in
the authored week, by a picker (`FocusEditor` over `getAreaOptions()`) in the
UI. You add an area to the tree before you can point a block at it. A block
with no `nodeId` is genuinely unassigned — lunch, sleep, open time.
Life-support blocks carry no node on purpose: counting sleep as capacity
spent on a bet would drown every rollup.

`tasks` names which of the node's tasks a slot is for, written in the week
grid as `do: ["outreach", "followup"]`. Same move as `nodeId` one level down:
stop typing what you can point at. Today resolves them in order — a written
`note` first, then the named tasks, then the node's *own* tasks when there
are at most `MAX_IMPLIED_TASKS` (3) of them, then the node's label. The cap
is the line between direction and a menu: past three, the stage's own name
says more than a list does.

`serves` exists because **the tree is single-parent but some work is a shared
capability**. Content is one skill — script, shoot, edit, publish — pointed
at several goals: skits for their own sake, marketing for Wave, launch clips
for Digital Products. Modelled as one node under Audience you can't ask "how
much am I investing in marketing Wave?"; modelled as three pipelines you
duplicate stages that are really one skill, and a batched shoot day forces an
arbitrary choice anyway. So the capability stays in one place and the *slot*
carries the purpose. Hours credit both, shown apart: Personal Brand keeps its
own hours, Wave reads `5h +3h`. Coverage `state` follows owned time only —
hours aimed *at* a goal don't mean its own stages are covered. Attribution is
deliberately approximate: one session can produce two videos, so this records
primary intent, not accounting.

`days` is the days a block actually runs; omitted — the normal case — means
all seven. Before it existed, "weekdays only" could only be said by leaving
the weekend cells unassigned, which is a different statement: the block still
stood there on Saturday, empty, as if something were missing. Deep Study on a
Sunday isn't unplanned, it doesn't happen. Everything that reads a block
filters through `blockRunsOn` — the timeline, the ruler, the day-progress
bar, both rollups — so a dormant day contributes no hours anywhere.
Assignments on a switched-off day are **kept, not deleted**: they come back
intact if the day is switched on again, which is what you want while trying a
shape out. Toggling all seven back on drops the field rather than storing the
full list.

`note` is what the block is actually for on that day ("Website dev"). One
line, or an array where a block genuinely holds two things — buffer time is
loose ends *and* the day's reading, rendered as bullets. `getDaySchedule`
normalises it to `notes: string[]` so views never branch on the shape.

`label` renames the block for one day. Some days genuinely use a slot
differently — Saturday 9–12 is filming, Sunday 6pm is family time — and
calling those by the weekday name would simply be wrong. The block still owns
the hours; only its name changes.

Resolution splits along those lines: an override replaces the **area**, so
the template's `note`, `tasks` and `serves` go with it (all three described
the old area), while `label` survives — how the day uses the slot doesn't
change because the area did. `setAssignment` follows the same rule.

### Time

`end <= start` means the block **wraps into the next day**: sleep is
`23:00–07:00`, and `blockEndMinutes()` returns 1860 so its duration is 8h.
Current-block detection measures the small hours against the previous evening
(03:00 reads as 1620, inside 23:00–07:00), and `20:00–00:00` still lands
exactly on 1440. Day progress spans first start → last end, so a day that
ends after midnight is one span, not two.

`order` always follows the clock, so reordering a block in Settings swaps its
times with its neighbour's. Anything else would leave the list sorted
differently than it reads.

### The seed week

**The whole day is modelled**, 07:00 to 07:00: morning routine, exercise,
meals, wind-down and sleep included. An earlier cut modelled only the working
window, which left holes at lunch and dinner and made the app go blank
exactly when you'd glance at it. Life blocks appear nowhere in `WEEK` — they
carry no area, so they stay quiet and never win the day's theme.

Two shape decisions worth keeping in view: the old 2.5h buffer is split, with
`Reset` (14:30) deliberately light because it lands in the post-lunch slump
and lunch sometimes runs to 2pm, and `Second Push` (15:30) owned work placed
where energy is back. `Deep Study` (08:00, the block used to be called
"Prep" — renamed once it was clear that's what actually belongs there in
the morning) runs weekdays only — seven-days-a-week study with no rest day
is how it quietly becomes theatre.

Once anything is edited the stored plan wins entirely and `lib/life` is only
read again on a reset.

## Layers

| File | Responsibility |
| --- | --- |
| `lib/life/areas/*.ts` | What the work is, authored as a nested tree. |
| `lib/life/life.ts` | The day's shape, and which day goes where. |
| `lib/life/schema.ts` | Authoring types, flatten, validate, day parsing. |
| `lib/life/index.ts` | The flat arrays, checked once at import. |
| `lib/direction/types.ts` | The model. |
| `lib/direction/nodes.ts` | The bridge: id → node, ancestry, area, tasks, options. |
| `lib/direction/block-types.ts` | Block type → emphasis, tone, hairline colour. |
| `lib/direction/schedule.ts` | Pure derivation: time math, current block, day resolution, progress. |
| `lib/direction/coverage.ts` | The tree walked with hours attached. |
| `lib/direction/rollup.ts` | Weekly totals, over the same walk. |
| `lib/direction/plan-ops.ts` | Every mutation, as pure `plan → plan` functions. |
| `lib/direction/storage.ts` | localStorage read/write. |
| `lib/direction/plan-store.ts` | External store (subscribe/getSnapshot) over the above. |
| `components/Direction/*` | Views. No plan logic — they call `plan-ops`. |

A stored plan carries a `version` (`PLAN_VERSION` in `types.ts`), and
`storage.ts` runs it through `migrate()` on load — one step per version,
each responsible only for getting from n to n+1. v1 → v2 renames every node
id (`sub-web-pipeline` → `web.pipeline`), which is exactly why the number was
added a version before it was needed: without it, a plan holding the old ids
and one holding the new ones are indistinguishable, and Reset would be the
only recovery. A plan from a *newer* build is left exactly as it is rather
than guessed at or replaced.

Persistence is **localStorage only** (`bandwidth.direction.plan.v1`),
matching the rest of the app's no-backend posture. A stored plan replaces the
seed wholesale rather than merging, so edits never get surprise entries back
when `lib/life` changes. Settings → Reset drops the stored plan.

The plan is read through `useSyncExternalStore` rather than copied into
component state: it is genuinely external, shared by four views, and can
change in another tab. `useNow` follows the same shape and ticks every 30s.
Both return `null` on the server and during hydration, so nothing time- or
storage-dependent can hydrate-mismatch; views hold quiet space until the
value lands.

`Popover` renders through a portal and positions itself from the clicked
element's rect. That's not incidental: the week grid scrolls horizontally,
and a panel inside that container would be clipped by it.

## Visual rules

- **One typeface: Manrope**, loaded once in the root layout. Columns of
  digits use `tabular-nums` (the `NUM` token) plus right alignment rather
  than a second, monospace webfont. `--font-mono` is mapped to a system stack
  so a stray `font-mono` still lands somewhere sensible. Manrope's uppercase
  is wide, so label tracking is 0.11em where a grotesque took 0.16em.
- **Surfaces, not outlines.** Blocks, the week matrix and the settings table
  sit on `--surface` cards with 16px corners. The live block is the one
  filled surface in the app: a soft green→teal gradient with faint grain
  (`.grain`), white text, set at display size. It is fully rounded and raised
  above the run rather than squared off inside it. That is the app's only
  gradient and its only use of grain.
- **Block type is one hue in two strengths**: `--type-*` for hairlines and
  rules, `--type-*-fill` for the wash on a block's own surface. Both are
  applied as inline style, so there is no dynamic class for Tailwind to
  purge. The washes are around 5% alpha in light mode and 8–10% in dark, and
  are tuned per hue rather than sharing one number — at equal alpha the warm
  ones shout and slate disappears. The ramp runs cool for structured work to
  warm for the rest, with near-neutrals for buffer and custom so open time
  stays quietest, and contains **no green**: the accent remains the only
  colour meaning *now*. The Week grid uses the hairline value as a 2px left
  rule, so a type reads the same way in both views.
- One accent — a muted green (`--accent`) — reserved for a single meaning:
  **now**. Today's column in Week and the active nav underline are the only
  other places it appears, always at low opacity.
- Everything else is monochrome zinc. Hierarchy comes from type scale,
  weight, and space — never from colour, cards, or containers.
- Hairlines over borders, borderless fields over form controls, no gradients,
  no shadows except the popover's, no statistics.
