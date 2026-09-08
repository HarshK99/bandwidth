// lib/life/life.ts
// The day, and which day goes where. The other half of the model — what the
// work *is* — lives in areas/, and this file points at it by id.
//
// Reading order is the order you'd say it out loud: here's the shape of my
// day, and here's what each block is for.

import type { DayBlock, Week } from "./schema";
import type { NodeId } from "./areas";

/**
 * The shape of a day, 07:00 to 07:00 — the whole thing, not just the working
 * window. An earlier cut modelled only work hours, which left holes at lunch
 * and dinner and made the app go blank exactly when you'd glance at it.
 *
 * Two pushes only — Websites (pays now) and Wave (the long bet, whose whole
 * job is users). Everything else is a keystone habit, a weekly slot, or
 * weekend-only. See docs/PLAN_SCHEDULE.md for the reasoning.
 *
 * The day's "must" ends at lunch: Study, then one deep session. The
 * afternoon is upside. `Decompress` is a real block — the post-lunch dip is
 * biological, so it gets named rather than pretended away.
 *
 * Morning and afternoon point at the *same domain* most days (see `WEEK`),
 * so there's no cold restart mid-afternoon and "what's today?" has a
 * one-word answer. `Loose Ends` is the deliberate exception: after the 5pm
 * meal break it works the coverage backlog — one otherwise-homeless stage
 * per weekday.
 *
 * Sleep runs 23:30–07:00 — a genuinely later start than the rest of the day.
 * `sortBlocks` in schedule.ts reads it as the day's last block regardless:
 * the day's *reading order* starts at 07:00 (`DAY_STARTS_AT_MINUTES` there).
 *
 * Start and end are both explicit. The day is contiguous bar one gap —
 * 09:15–09:30, between Study and Deep Work — which breaks up what would
 * otherwise be ~5h of unbroken focus. Block times are the same all seven
 * days; Sunday wanting its own shape is a known model gap (see
 * docs/PLAN_SCHEDULE.md).
 */
export const DAY = [
  { id: "blk-morning", label: "Morning Routine", start: "07:00", end: "08:00", type: "custom" },
  // Product-sense practice — the job hunt is live, and this is the keystone
  // that carries it. Mon–Sat: a weekday-only habit reads as anxiety opening
  // every workday, but skipping it entirely on Saturday isn't the deal
  // either. Sunday is off.
  { id: "blk-study", label: "Study", start: "08:00", end: "09:15", type: "focus", days: "mon-sat" },
  // The day's one guaranteed deep session, on the day's domain. Runs to the
  // start of lunch; the 15-min gap before it is the one break in the morning.
  { id: "blk-deep", label: "Deep Work", start: "09:30", end: "13:00", type: "focus" },
  { id: "blk-lunch", label: "Lunch", start: "13:00", end: "13:30", type: "buffer" },
  // Post-lunch recovery — ~2h, pointed at `rest` because that's what it is.
  // Rest/Reflection reading as heavily covered is correct, not a leak: it's
  // a Sustain area, not a bet the rollup needs shielding from.
  { id: "blk-decompress", label: "Decompress", start: "13:30", end: "15:30", type: "hobby" },
  // Self-directed building. Default target is the Side Project; client work
  // preempts it whenever a build or deadline is live that week (see the
  // override note in docs/PLAN_SCHEDULE.md).
  { id: "blk-build", label: "Build", start: "15:30", end: "17:00", type: "execution" },
  // The 5pm meal break — out of the house, a real context switch, which is
  // why nothing heavy is scheduled after it.
  { id: "blk-break", label: "Break", start: "17:00", end: "17:45", type: "buffer" },
  // The coverage backlog gets a home here: one otherwise-unscheduled stage
  // per weekday (scoping, aftercare, scripting, posting, DP listing, side
  // ideation). Days are swappable; the point is the set gets covered.
  { id: "blk-loose", label: "Loose Ends", start: "17:45", end: "19:00", type: "admin" },
  { id: "blk-dinner", label: "Dinner", start: "19:00", end: "19:30", type: "buffer" },
  // Light work only — editing, admin, design, people. Nothing that needs the
  // tank full.
  { id: "blk-evening", label: "Evening", start: "19:30", end: "21:00", type: "admin" },
  { id: "blk-exercise", label: "Exercise", start: "21:00", end: "22:00", type: "custom" },
  // Genuinely down. Sunday carries the week's one real reading session.
  { id: "blk-winddown", label: "Wind-down", start: "22:00", end: "23:30", type: "hobby" },
  { id: "blk-sleep", label: "Sleep", start: "23:30", end: "07:00", type: "custom" },
] as const satisfies readonly DayBlock[];

export type BlockId = (typeof DAY)[number]["id"];

/** A cell, with node ids checked against the tree at compile time. */
type Slot =
  | NodeId
  | {
      readonly node?: NodeId;
      readonly do?: readonly string[];
      readonly note?: string | readonly string[];
      readonly label?: string;
      readonly serves?: NodeId;
    };

/**
 * blockId → days → what it's for.
 *
 * `all` means every day *the block itself* runs, not every day of the week —
 * relevant for a block whose `days` (see `DAY` above) is narrower than
 * seven. `do` names the node's own tasks instead of retyping them as prose;
 * a `note` overrides both, for the days where what you're doing is more
 * specific than any standing task.
 *
 * Life-support blocks — morning routine, lunch, the 5pm break, dinner,
 * sleep — appear nowhere here. They carry no area on purpose: counting a
 * meal as capacity spent on a bet would drown every rollup.
 *
 * The week has a theme a day: Mon/Wed/Fri Websites, Tue/Thu Wave, Sat
 * Content, Sun Review. Deep Work and Build point at that theme; Loose Ends
 * works the off-theme backlog; the Evening carries the theme's admin tail.
 */
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

  // Post-lunch recovery. Rest is genuinely what happens here, so it's named
  // rather than left blank — which also makes the block link somewhere.
  "blk-decompress": {
    all: { node: "rest", do: ["hobbies"] },
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

  // The coverage backlog, one stage a weekday. Sunday is left open — it
  // wants its own day shape, which the model can't express yet.
  "blk-loose": {
    mon: { node: "web.scoping", do: ["proposal", "pricing"] },
    tue: { node: "brand.growth", do: ["post"], label: "Post & engage" },
    wed: { node: "web.aftercare", do: ["checkin", "upsell"] },
    thu: { node: "brand.script", do: ["ideas"], label: "Scripting" },
    fri: { node: "dp.listing", do: ["publish"] },
    sat: { node: "side.ideation", do: ["brainstorm"], label: "Ideas" },
  },

  "blk-evening": {
    mon: { node: "dp.design", do: ["make"] },
    tue: { node: "career.apply", do: ["send", "track"], label: "Applications" },
    wed: { node: "brand.edit", do: ["cut"] },
    // Wave day: the machine gets sharpened in the morning, so running a batch
    // of follow-ups here keeps the loop closed without needing deep energy.
    thu: { node: "wave.outreach", do: ["followup"], label: "Outreach follow-ups" },
    fri: { node: "web.payment", do: ["invoice", "chase"], label: "Invoicing + wrap-up" },
    sat: { node: "rest", do: ["hobbies"] },
    sun: { node: "relationships", label: "Relationships" },
  },

  "blk-exercise": {
    all: { node: "health", do: ["workout"] },
  },

  "blk-winddown": {
    sun: { node: "learning", do: ["reading"], label: "Reading" },
  },
} as const satisfies Week &
  Partial<Readonly<Record<BlockId, Readonly<Record<string, Slot>>>>>;
