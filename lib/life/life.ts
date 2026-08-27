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
 * Sleep runs 00:00–07:00: a genuinely later start than the rest of the day,
 * not a wrap. `sortBlocks` in schedule.ts still reads it as the day's last
 * block, not its first — the day's *reading order* starts at 07:00 (see
 * `DAY_STARTS_AT_MINUTES` there), independent of which block has the
 * smallest clock time.
 *
 * Start and end are both explicit. The day is usually contiguous, but a real
 * gap is a real thing to be able to say: Deep Study runs weekdays only, so weekends
 * genuinely have nothing between 08:00 and 09:30.
 */
export const DAY = [
  { id: "blk-morning", label: "Morning Routine", start: "07:00", end: "08:00", type: "custom" },
  // Weekdays only. Seven-days-a-week study with no rest day is how it
  // quietly becomes theatre. Named "Deep Study" rather than "Prep" — the
  // generic name undersold what actually belongs in the morning: focused,
  // effortful study, the same register as the block right after it.
  { id: "blk-prep", label: "Deep Study", start: "08:00", end: "09:30", type: "focus", days: "mon-fri" },
  { id: "blk-deep", label: "Deep Work", start: "09:30", end: "13:00", type: "focus" },
  { id: "blk-lunch", label: "Lunch", start: "13:00", end: "13:30", type: "buffer" },
  // End held at 14:30 rather than shifting the afternoon: only the start
  // moved, so the block that shrank is genuinely this one, not a relabelled
  // hour taken from Reset.
  { id: "blk-admin", label: "Admin", start: "13:30", end: "14:30", type: "admin" },
  // Deliberately light: it lands in the post-lunch slump and lunch sometimes
  // runs to 2pm, so it holds reading and practice, never heavy work.
  { id: "blk-reset", label: "Reset", start: "14:30", end: "15:30", type: "buffer" },
  // Owned work, placed where energy is back and where outreach gets answered.
  { id: "blk-push", label: "Second Push", start: "15:30", end: "17:00", type: "execution" },
  { id: "blk-ctp", label: "CTP", start: "17:00", end: "19:00", type: "thinking" },
  { id: "blk-dinner", label: "Dinner", start: "19:00", end: "20:00", type: "buffer" },
  { id: "blk-hobbies", label: "Hobbies", start: "20:00", end: "21:00", type: "hobby" },
  { id: "blk-exercise", label: "Exercise", start: "21:00", end: "22:00", type: "custom" },
  // Genuinely unassigned on purpose — no WEEK entry below. Opened up by
  // moving sleep earlier; nothing pointed at it yet (crosswords, mostly).
  { id: "blk-free", label: "Free Time", start: "22:00", end: "23:30", type: "hobby" },
  { id: "blk-winddown", label: "Wind-down", start: "23:30", end: "00:00", type: "hobby" },
  { id: "blk-sleep", label: "Sleep", start: "00:00", end: "07:00", type: "custom" },
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
 * `all` means every day the block runs, so Deep Study needs one line rather than
 * five identical ones. `do` names the node's own tasks instead of retyping
 * them as prose; a `note` overrides both, for the days where what you're
 * doing is more specific than any standing task.
 *
 * Life-support blocks — morning routine, lunch, sleep — appear nowhere here.
 * They carry no area on purpose: counting sleep as capacity spent on a bet
 * would drown every rollup.
 */
export const WEEK = {
  "blk-prep": {
    all: { node: "career.prep", do: ["technical"] },
  },

  "blk-deep": {
    mon: { node: "web.build", note: "Client build — clear the week's deadlines" },
    "tue thu": { node: "side.dev", do: ["mvp"] },
    wed: { node: "web.build", do: ["dev"] },
    fri: { node: "web.build", note: "Client wrap-up + handover" },
    sat: { node: "brand.shoot", label: "Content", note: "Skit filming — needs daylight" },
    sun: { node: "side.ideation", note: "Optional — brainstorm, else rest" },
  },

  "blk-admin": {
    mon: { node: "career.apply", do: ["send"] },
    tue: { node: "web.aftercare", do: ["checkin"] },
    // Posting grows the page, but this slot is aimed at moving products.
    wed: { node: "brand.growth", do: ["post"], serves: "dp" },
    thu: { node: "career.apply", do: ["send", "track"] },
    fri: { node: "web.payment", do: ["invoice", "chase"] },
    sat: { node: "lifeadmin", do: ["errands"], label: "Life Admin" },
    sun: { node: "financial", do: ["trading"], label: "Financial Health" },
  },

  "blk-reset": {
    mon: { node: "learning", note: "Reading: startup-SaaS strategy" },
    tue: { node: "psych.confidence", note: "Speaking practice out loud" },
    wed: { node: "learning", note: "Reading: web design / client trends" },
    thu: { node: "psych.fluency", do: ["explainsimple"] },
    fri: { node: "learning", note: "Reading: creator economy craft" },
    // Was Friday CTP. Sunday's Reset had no assignment (only weekdays did),
    // so the week's close-out lands on an already-open slot rather than
    // displacing something else.
    sun: { node: "rest", do: ["review"], label: "Review" },
  },

  "blk-push": {
    mon: { node: "web.pipeline", do: ["outreach", "followup"] },
    tue: { node: "wave.outreach", do: ["batch"] },
    wed: { node: "web.pipeline", do: ["referral", "followup"] },
    thu: { node: "wave.outreach", do: ["followup"] },
    fri: { label: "Catch-up" },
  },

  "blk-ctp": {
    mon: { node: "brand.script", do: ["ideas"] },
    tue: { node: "wave.system", do: ["script", "review"] },
    wed: { node: "web.scoping", do: ["discovery", "proposal"] },
    // Same pipeline, different purpose: Thursday's script is marketing.
    thu: { node: "brand.script", note: "Scripting + competitor research", serves: "wave" },
    // Provisional — this slot's old content (the week's review) moved to
    // Sunday's Reset. Side-project ideation is the placeholder: it answers
    // "when do I actually plan the side project", which had no home before
    // Sunday's optional, easily-skipped Deep Work slot. Swap it for whatever
    // you actually want Friday evenings for.
    fri: { node: "side.ideation", do: ["brainstorm"], label: "Ideas" },
    sat: { label: "Free/Flex" },
    sun: { node: "relationships", label: "Relationships" },
  },

  "blk-dinner": {
    sat: { node: "rest", do: ["hobbies"], label: "Hobbies" },
    sun: { node: "relationships", label: "Relationships" },
  },

  "blk-hobbies": {
    mon: { node: "dp.design", do: ["make"] },
    tue: { node: "brand.edit", do: ["cut"] },
    wed: { node: "rest", do: ["hobbies"] },
    thu: { node: "brand.edit", do: ["cut"], serves: "wave" },
    fri: { node: "dp.listing", do: ["publish"] },
    sat: { node: "rest", do: ["hobbies"] },
    sun: { node: "relationships", label: "Relationships" },
  },

  "blk-exercise": {
    all: "health",
  },

  "blk-winddown": {
    all: { note: "Book reading" },
  },
} as const satisfies Week &
  Partial<Readonly<Record<BlockId, Readonly<Record<string, Slot>>>>>;
