# Plan: Today block → Coverage link

**Status: planned, not built.** Design + rationale only. Pairs with the v4
schedule in [PLAN_SCHEDULE.md](./PLAN_SCHEDULE.md).

## The problem

Today answers "what block am I in, what's the one task." It deliberately
shows a single thing per block. But real days diverge: the task's done
early, it's blocked, or it doesn't fit the energy you actually have. At that
moment Today is a dead end — it shows one line and no alternatives. You have
to switch to the Coverage tab and reconstruct the context yourself.

## The fix

Make each block on Today a **link to Coverage, filtered to that block's
type** — `focus`, `execution`, `admin`, `hobby`, `buffer`, `custom`. You're
in Deep Work, the task's done: one tap shows everything in the tree that's
scheduled in a *focus*-type slot — the full set of work that deserves that
same deep-focus energy. Pick the next real thing and get back to it.

**Why type, not area:** the decision at that moment is "what should I do with
the energy I have right now," not "what else is in Websites." The block's
type already encodes the energy level (`focus` = deep, `admin` = light,
`hobby` = relaxed). Coverage's existing filter is *already* by type — this
just wires it to the block.

## Why it's cheap

`CoverageView` already has the whole mechanism: the type `<select>`,
`matchedIds(rows, type)`, the `included` set, the `visible` walk. Two small
additions:

1. **URL param** — `CoverageView` reads `?type=<BlockType>` on mount (via
   `useSearchParams`), seeds its `filterType` state from it, and the
   `<select>` writes it back so the URL stays in sync.
2. **The link on Today** — `TimelineRow` wraps the block card in `next/link`
   to `/coverage?type=<entry.block.type>`. `block.type` is always present, so
   **every block is linkable** with no per-block special-casing.

No new filter code, no `nodes.ts` change, no area plumbing.

## Behaviour notes

- **Buffer blocks (Lunch, Break, Dinner) will land on an empty state** —
  nothing in v4 is assigned to a `buffer`-type slot, so Coverage shows
  "Nothing is scheduled in a Buffer-type slot right now." Options: let them
  link anyway (harmless, consistent), or skip the link for `buffer`. Lean:
  skip `buffer` — a link to an empty page is a dead end of its own.
- **Decompress** (`hobby`, now → `rest`) and **Wind-down** (`hobby`) both
  link to the `hobby` filter — rest, hobbies, Sunday reading. Fine.
- **Today stays read-only.** This is navigation, not editing. The card
  gaining a tap target is the only behaviour change; no plan mutation.
- **The card's look shouldn't change.** Coverage already treats the whole
  row as one target; Today can do the same — a hover/press state, no caret,
  no button.
- **`/coverage` is a top-level tab.** The link is a cross-tab navigation; the
  Coverage tab lights up, browser back returns to the day. No custom "back"
  affordance unless it feels abrupt in use.

## Open questions (for when we build it)

1. **Whole card is the link, or just a line on it?** Lean: whole card.
2. **Skip the link on `buffer` blocks** (empty target), or keep it for
   consistency? Lean: skip.
3. **Does the `<select>` change also push a URL update** (so a manual filter
   is shareable / survives refresh), or only read on mount? Lean: full
   two-way sync — it's nearly free once the read side exists.
