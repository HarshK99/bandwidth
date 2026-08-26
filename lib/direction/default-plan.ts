// lib/direction/default-plan.ts
// The recurring day shape, and which part of the hierarchy each block points
// at on each day. A plain, hand-editable data file — no database.
//
// Every assignment names a node from lib/hierarchy-data.ts rather than a
// typed area. That is the whole point of the pairing: the hierarchy says what
// the work is and why it matters, this file says when it happens, and the two
// can be reconciled — "which parts of the tree get no time?" becomes a query
// instead of a manual count. Free-text areas made that impossible, and let
// Relationships and Financial Health show zero hours while occupying four.
//
// The day is modelled end to end, 07:00 to 07:00. Morning routine, meals,
// wind-down and sleep carry no node: they are life, not capacity spent on a
// bet, and counting them would drown every rollup.
//
// Once anything is edited the stored plan (localStorage, see
// lib/direction/storage.ts) wins entirely and this file is only read again on
// a reset.

import { PLAN_VERSION } from "./types";
import type { DirectionPlan, TimeBlock, WeekAssignment } from "./types";

/**
 * Two things worth knowing about the shape:
 *
 * - The old 2.5h Buffer is split. `Reset` (14:30) is deliberately light —
 *   it lands in the post-lunch slump and lunch sometimes runs to 2pm, so it
 *   holds reading, never heavy work. `Second Push` (15:30) is owned work,
 *   placed where energy is back and where outreach actually gets answered.
 * - Prep runs weekdays only. Seven-days-a-week prep with no rest day is how
 *   preparation quietly becomes theatre.
 */
const DEFAULT_BLOCKS: TimeBlock[] = [
  {
    id: "blk-morning",
    name: "Morning Routine",
    start: "07:00",
    end: "08:00",
    type: "custom",
    order: 0,
  },
  {
    id: "blk-prep",
    name: "Prep",
    start: "08:00",
    end: "09:30",
    type: "focus",
    order: 1,
    // Weekdays only, stated on the block rather than implied by leaving the
    // weekend cells empty: Prep on a Sunday isn't unplanned, it doesn't
    // happen. Saturday and Sunday start at Deep Work instead.
    days: [1, 2, 3, 4, 5],
  },
  {
    id: "blk-deep",
    name: "Deep Work",
    start: "09:30",
    end: "12:00",
    type: "focus",
    order: 2,
  },
  {
    id: "blk-lunch",
    name: "Lunch",
    start: "12:00",
    end: "13:00",
    type: "buffer",
    order: 3,
  },
  {
    id: "blk-admin",
    name: "Admin",
    start: "13:00",
    end: "14:30",
    type: "admin",
    order: 4,
  },
  {
    id: "blk-reset",
    name: "Reset",
    start: "14:30",
    end: "15:30",
    type: "buffer",
    order: 5,
  },
  {
    id: "blk-push",
    name: "Second Push",
    start: "15:30",
    end: "17:00",
    type: "execution",
    order: 6,
  },
  {
    id: "blk-ctp",
    name: "CTP",
    start: "17:00",
    end: "19:00",
    type: "thinking",
    order: 7,
  },
  {
    id: "blk-dinner",
    name: "Dinner",
    start: "19:00",
    end: "20:00",
    type: "buffer",
    order: 8,
  },
  {
    id: "blk-hobbies",
    name: "Hobbies",
    start: "20:00",
    end: "21:00",
    type: "hobby",
    order: 9,
  },
  {
    id: "blk-exercise",
    name: "Exercise",
    start: "21:00",
    end: "22:00",
    type: "custom",
    order: 10,
  },
  {
    id: "blk-winddown",
    name: "Wind-down",
    start: "22:00",
    end: "23:00",
    type: "hobby",
    order: 11,
  },
  {
    id: "blk-sleep",
    name: "Sleep",
    start: "23:00",
    end: "07:00",
    type: "custom",
    order: 12,
  },
];

const DEFAULT_ASSIGNMENTS: WeekAssignment[] = [
  // Prep · 08:00–09:30
  { day: 1, blockId: "blk-prep", nodeId: "sub-career-prep", note: "Interview technical prep" }, // Mon
  { day: 2, blockId: "blk-prep", nodeId: "sub-career-prep", note: "Interview technical prep" }, // Tue
  { day: 3, blockId: "blk-prep", nodeId: "sub-career-prep", note: "Interview technical prep" }, // Wed
  { day: 4, blockId: "blk-prep", nodeId: "sub-career-prep", note: "Interview technical prep" }, // Thu
  { day: 5, blockId: "blk-prep", nodeId: "sub-career-prep", note: "Interview technical prep" }, // Fri

  // Deep Work · 09:30–12:00
  { day: 1, blockId: "blk-deep", nodeId: "sub-web-build", note: "Client build — clear the week's deadlines" }, // Mon
  { day: 2, blockId: "blk-deep", nodeId: "sub-sideproject-dev", note: "Build MVP" }, // Tue
  { day: 3, blockId: "blk-deep", nodeId: "sub-web-build", note: "Website dev" }, // Wed
  { day: 4, blockId: "blk-deep", nodeId: "sub-sideproject-dev", note: "Build MVP" }, // Thu
  { day: 5, blockId: "blk-deep", nodeId: "sub-web-build", note: "Client wrap-up + handover" }, // Fri
  { day: 6, blockId: "blk-deep", nodeId: "sub-brand-shoot", note: "Skit filming — needs daylight", label: "Content" }, // Sat
  { day: 0, blockId: "blk-deep", nodeId: "sub-sideproject-ideation", note: "Optional — brainstorm, else rest" }, // Sun

  // Admin · 13:00–14:30
  { day: 1, blockId: "blk-admin", nodeId: "sub-career-apply", note: "Job applications + company research" }, // Mon
  { day: 2, blockId: "blk-admin", nodeId: "sub-web-aftercare", note: "Client check-ins + updates" }, // Tue
  { day: 3, blockId: "blk-admin", nodeId: "sub-brand-growth", note: "Post, reply, engage", serves: "dom-digitalproducts" }, // Wed
  { day: 4, blockId: "blk-admin", nodeId: "sub-career-apply", note: "Applications + follow-ups" }, // Thu
  { day: 5, blockId: "blk-admin", nodeId: "sub-web-payment", note: "Invoicing + chase overdue" }, // Fri
  { day: 6, blockId: "blk-admin", nodeId: "dom-lifeadmin", note: "Errands", label: "Life Admin" }, // Sat
  { day: 0, blockId: "blk-admin", nodeId: "dom-financial", note: "Trading research + portfolio review", label: "Financial Health" }, // Sun

  // Reset · 14:30–15:30
  { day: 1, blockId: "blk-reset", nodeId: "dom-learning", note: "Reading: startup-SaaS strategy" }, // Mon
  { day: 2, blockId: "blk-reset", nodeId: "sub-psych-confidence", note: "Speaking practice out loud" }, // Tue
  { day: 3, blockId: "blk-reset", nodeId: "dom-learning", note: "Reading: web design / client trends" }, // Wed
  { day: 4, blockId: "blk-reset", nodeId: "sub-psych-fluency", note: "Explain a complex idea simply, out loud" }, // Thu
  { day: 5, blockId: "blk-reset", nodeId: "dom-learning", note: "Reading: content / creator economy craft" }, // Fri

  // Second Push · 15:30–17:00
  { day: 1, blockId: "blk-push", nodeId: "sub-web-pipeline", note: "Cold outreach + follow-ups" }, // Mon
  { day: 2, blockId: "blk-push", nodeId: "sub-wave-outreach", note: "Outreach batch — calls / DMs" }, // Tue
  { day: 3, blockId: "blk-push", nodeId: "sub-web-pipeline", note: "Referrals + follow-ups" }, // Wed
  { day: 4, blockId: "blk-push", nodeId: "sub-wave-outreach", note: "Follow-ups + booked calls" }, // Thu
  { day: 5, blockId: "blk-push", label: "Catch-up" }, // Fri

  // CTP · 17:00–19:00
  { day: 1, blockId: "blk-ctp", nodeId: "sub-brand-script", note: "Skit scripting / ideas" }, // Mon
  { day: 2, blockId: "blk-ctp", nodeId: "sub-wave-system", note: ["Sharpen pitch + sequences", "Review outreach numbers"] }, // Tue
  { day: 3, blockId: "blk-ctp", nodeId: "sub-web-scoping", note: "Discovery, requirements, proposals" }, // Wed
  { day: 4, blockId: "blk-ctp", nodeId: "sub-brand-script", note: "Scripting + competitor research", serves: "dom-wave" }, // Thu
  { day: 5, blockId: "blk-ctp", nodeId: "dom-rest", note: "Week review + next week planning", label: "Review" }, // Fri
  { day: 6, blockId: "blk-ctp", label: "Free/Flex" }, // Sat
  { day: 0, blockId: "blk-ctp", nodeId: "dom-relationships", note: "Protected family/friends time", label: "Relationships" }, // Sun

  // Dinner · 19:00–20:00
  { day: 6, blockId: "blk-dinner", nodeId: "dom-rest", note: "Painting / Netflix", label: "Hobbies" }, // Sat
  { day: 0, blockId: "blk-dinner", nodeId: "dom-relationships", label: "Relationships" }, // Sun

  // Hobbies · 20:00–21:00
  { day: 1, blockId: "blk-hobbies", nodeId: "sub-dp-design", note: "Design a sticker / painting" }, // Mon
  { day: 2, blockId: "blk-hobbies", nodeId: "sub-brand-edit", note: "Skit editing" }, // Tue
  { day: 3, blockId: "blk-hobbies", nodeId: "dom-rest", note: "Painting / Netflix" }, // Wed
  { day: 4, blockId: "blk-hobbies", nodeId: "sub-brand-edit", note: "Skit editing", serves: "dom-wave" }, // Thu
  { day: 5, blockId: "blk-hobbies", nodeId: "sub-dp-listing", note: "Photograph, price and publish" }, // Fri
  { day: 6, blockId: "blk-hobbies", nodeId: "dom-rest", note: "Painting / Netflix" }, // Sat
  { day: 0, blockId: "blk-hobbies", nodeId: "dom-relationships", label: "Relationships" }, // Sun

  // Exercise · 21:00–22:00
  { day: 1, blockId: "blk-exercise", nodeId: "dom-health" }, // Mon
  { day: 2, blockId: "blk-exercise", nodeId: "dom-health" }, // Tue
  { day: 3, blockId: "blk-exercise", nodeId: "dom-health" }, // Wed
  { day: 4, blockId: "blk-exercise", nodeId: "dom-health" }, // Thu
  { day: 5, blockId: "blk-exercise", nodeId: "dom-health" }, // Fri
  { day: 6, blockId: "blk-exercise", nodeId: "dom-health" }, // Sat
  { day: 0, blockId: "blk-exercise", nodeId: "dom-health" }, // Sun

  // Wind-down · 22:00–23:00
  { day: 1, blockId: "blk-winddown", note: "Book reading" }, // Mon
  { day: 2, blockId: "blk-winddown", note: "Book reading" }, // Tue
  { day: 3, blockId: "blk-winddown", note: "Book reading" }, // Wed
  { day: 4, blockId: "blk-winddown", note: "Book reading" }, // Thu
  { day: 5, blockId: "blk-winddown", note: "Book reading" }, // Fri
  { day: 6, blockId: "blk-winddown", note: "Book reading" }, // Sat
  { day: 0, blockId: "blk-winddown", note: "Book reading" }, // Sun
];

export function createDefaultPlan(): DirectionPlan {
  // Deep-copied so callers can mutate freely without touching the seed.
  return {
    version: PLAN_VERSION,
    blocks: DEFAULT_BLOCKS.map((block) => ({ ...block })),
    assignments: DEFAULT_ASSIGNMENTS.map((assignment) => ({ ...assignment })),
    overrides: [],
  };
}
