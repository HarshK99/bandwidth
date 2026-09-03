# Upgrades — the internal problems, one at a time

A standing, ordered record of the things about *how you operate* that you've
been fixing: what's done, the one you're working on now, and a loose pool of
what's next. "For years I woke up late; I set out to fix it and worked at it
for weeks" — this is the page that knows that, and what came before it, and
what's after.

It is deliberately **not** three things it could be mistaken for:

- **Not Milestones** (`lib/milestones.ts`, shown on the Time page). Those are
  external life events on a calendar — a wedding, a move. An upgrade has no
  fixed date and often no date at all; it's internal, and it's *work*.
- **Not Goals** (`docs/PLAN_GOALS.md`, parked). Those hang off tree nodes and
  carry a target — "Wave: 50 users." An upgrade isn't attached to an area of
  the map; it's about the operator, not the work.
- **Not a task manager.** No completion checkbox, no progress bar, no
  reordering UI. A fixed upgrade is *struck through and moved behind you*, the
  same way this app has always treated done things — state is current truth,
  not a log.

## Data — `lib/upgrades.ts`

A plain module, the same shape and spirit as `lib/milestones.ts`: a typed
value and a small formatter, no store, no `localStorage`, no version ladder.
It ships with the build and is edited in the file.

```ts
export interface Upgrade {
  id: string;
  title: string;   // "Waking up late"
  note?: string;   // one line — what the problem is, or what "fixed" looks like
  date?: string;   // ISO "YYYY-MM-DD", optional and coarse (rendered month + year)
}

export const upgrades: {
  past: Upgrade[];    // chronological, oldest → newest
  active: Upgrade;    // the one being worked on now
  future: Upgrade[];  // a pool, not a queue — authored order carries no promise
};
```

State is **which bucket an entry sits in**, not a field on the entry — there
is no `status: "done"` to fall out of sync with where the item actually is.
`active` is required: there is always a current focus. `note` and `date` are
optional per entry and render only when present — no invented placeholder
copy, matching the rest of the app.

Why `past` / `active` / `future` as three lists rather than one array with an
`activeId`: the future is explicitly unordered ("the order for that is not
decided, it's mostly a list") while the past is strictly chronological. Two
different orderings in one array would need a sort key the past doesn't want
and the future can't provide.

## The view — `/upgrades`

A fourth top-level tab: **Direction · Coverage · Time · Upgrades**. No section
sub-nav (like Coverage, unlike Direction) — the tab bar names the page and
nothing else competes with it. No count line, no "6 fixed" — the app shows no
statistics.

One vertical scroll column — a **path down the centre**, read the way you're
travelling it: what's ahead is above, where you are is in the middle, what's
done is below and receding.

- **The path** is a run of nodes strung on the Direction rail's hairline
  (`w-px`, `bg-black/[0.09] dark:bg-white/[0.12]`). Each stop is a node
  centred on the line with its label directly beneath; the connector above
  each node is the visible thread between stops. Solid, not dotted —
  hairlines over everything.
- **Ahead** sits at the top, **collapsed** behind an `Ahead · 3` toggle —
  the order up there isn't decided, so it isn't shown until asked for. When
  open, entries are hollow dots and quiet titles, nearest-term nearest the
  active card.
- **Now** sits just below the toggle: a saturated card with faint grain, the
  same treatment Direction gives the block you're in — but its **own
  royal-purple surface** (`--upgrade-from` / `--upgrade-to`), not the accent
  green. The green means *now* on the Direction screen and nothing else
  borrows it; this is a different page's "now." Display-size title, a `Now`
  tag, `since Sep 2026` when dated. The note is folded away like everywhere
  else here — the card is the toggle, tapped to open it. Its node is the
  accent dot.
- **Behind** descends from there, **newest first**, oldest at the bottom.
  Filled dots; titles muted and struck through; a coarse date (`Jul 2026`)
  beside the title; the note behind a tap so finished work never competes
  with the present.

The page **opens at the top** — the `Ahead` toggle, then the active card,
then the road behind falling away below. With the future collapsed there's
nothing above the active card worth scrolling past, so it needs no
scroll-into-view on mount.

## Files

| File | |
| --- | --- |
| `lib/upgrades.ts` | new — the data |
| `app/upgrades/page.tsx` | new — route + metadata, hands off to the view |
| `components/Upgrades/UpgradesView.tsx` | new — the path, the ahead/behind ordering, the collapsed-ahead toggle |
| `app/globals.css` | +2 tokens — `--upgrade-from` / `--upgrade-to`, the active card's purple |
| `components/Upgrades/UpgradeRow.tsx` | new — one stop on the path, three visual states |
| `components/AppTabs.tsx` | +1 line — the tab |

Nothing else is touched. No `localStorage`, no plan migration, no change to
Milestones or the tree.

## Not building

Editing UI, progress of any kind, a completion state, reordering, per-entry
icons or colours (the reference image's icon circles), dates as a timeline,
or linking an upgrade to a tree node. The tree's `sustain.psych`
("Psychological Fitness" — confidence, fluency, fear of being judged) is
thematically next door and a future version could cross-reference it; not
now.
