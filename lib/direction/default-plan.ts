// lib/direction/default-plan.ts
// The local seed data for the Direction feature: the recurring day shape and
// the area each block points at on each day. A plain, hand-editable data
// file — same posture as lib/hierarchy-data.ts, no database.
//
// Generated from a 30-minute weekly schedule export whose cells read
// `Block - Area - Detail`. Blocks are the spans the weekday pattern settles
// into; a day's cell contributed its area (focus), its detail (note), and —
// where that day uses the slot differently — its own block name (label).
// That CSV is not kept in the repo: this file is the source of truth.
//
// Only the working window is modelled. Morning routine, exercise, meals,
// wind-down and sleep are in the CSV but not here: they are life, not
// direction, and the app has nothing useful to say about them. The gaps they
// leave (12:00–13:00, 19:00–20:00) read as "between blocks" on Today.
//
// Once anything is edited the stored plan (localStorage, see
// lib/direction/storage.ts) wins entirely and this file is only read again
// on a reset.

import type { DirectionPlan, TimeBlock, WeekAssignment } from "./types";

/**
 * Two blocks share the name "Complex Problem Solving" on purpose: 08:00 is
 * the interview-prep hour and 09:00 is the main build session. Same mode of
 * work, different area — the CSV names them the same, so this does too.
 */
const DEFAULT_BLOCKS: TimeBlock[] = [
  {
    id: "blk-morning",
    name: "Morning Routine",
    start: "07:00",
    end: "07:30",
    type: "custom",
    order: 0,
  },
  {
    id: "blk-exercise",
    name: "Exercise",
    start: "07:30",
    end: "08:00",
    type: "custom",
    order: 1,
  },
  {
    id: "blk-prep",
    name: "Complex Problem Solving",
    start: "08:00",
    end: "09:00",
    type: "focus",
    order: 2,
  },
  {
    id: "blk-deep",
    name: "Complex Problem Solving",
    start: "09:00",
    end: "12:00",
    type: "focus",
    order: 3,
  },
  {
    id: "blk-lunch",
    name: "Lunch",
    start: "12:00",
    end: "13:00",
    type: "buffer",
    order: 4,
  },
  {
    id: "blk-admin",
    name: "Routine Admin",
    start: "13:00",
    end: "14:30",
    type: "admin",
    order: 5,
  },
  {
    id: "blk-buffer",
    name: "Buffer",
    start: "14:30",
    end: "17:00",
    type: "buffer",
    order: 6,
  },
  {
    id: "blk-ctp",
    name: "CTP",
    start: "17:00",
    end: "18:00",
    type: "thinking",
    order: 7,
  },
  {
    id: "blk-interview",
    name: "Interview Prep (Behavioral)",
    start: "18:00",
    end: "19:00",
    type: "focus",
    order: 8,
  },
  {
    id: "blk-dinner",
    name: "Dinner",
    start: "19:00",
    end: "20:00",
    type: "buffer",
    order: 9,
  },
  {
    id: "blk-hobbies",
    name: "Hobbies",
    start: "20:00",
    end: "22:00",
    type: "hobby",
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

/**
 * The recurring week. An empty `focus` is deliberate — buffer and open time
 * have no single area — and a `label` marks the days that use a slot
 * differently (Saturday morning is filming, Sunday evening is family time).
 */
const DEFAULT_ASSIGNMENTS: WeekAssignment[] = [
  // Exercise · 07:30–08:00
  { day: 1, blockId: "blk-exercise", focus: "Physical Health" }, // Mon
  { day: 2, blockId: "blk-exercise", focus: "Physical Health" }, // Tue
  { day: 3, blockId: "blk-exercise", focus: "Physical Health" }, // Wed
  { day: 4, blockId: "blk-exercise", focus: "Physical Health" }, // Thu
  { day: 5, blockId: "blk-exercise", focus: "Physical Health" }, // Fri
  { day: 6, blockId: "blk-exercise", focus: "Physical Health" }, // Sat
  { day: 0, blockId: "blk-exercise", focus: "Physical Health" }, // Sun

  // Complex Problem Solving · 08:00–09:00
  { day: 1, blockId: "blk-prep", focus: "Career Transition", note: "Interview technical prep (DSA/system design)" }, // Mon
  { day: 2, blockId: "blk-prep", focus: "Career Transition", note: "Interview technical prep (DSA/system design)" }, // Tue
  { day: 3, blockId: "blk-prep", focus: "Career Transition", note: "Interview technical prep (DSA/system design)" }, // Wed
  { day: 4, blockId: "blk-prep", focus: "Career Transition", note: "Interview technical prep (DSA/system design)" }, // Thu
  { day: 5, blockId: "blk-prep", focus: "Career Transition", note: "Interview technical prep (DSA/system design)" }, // Fri
  { day: 6, blockId: "blk-prep", focus: "Career Transition", note: "Interview technical prep (DSA/system design)" }, // Sat
  { day: 0, blockId: "blk-prep", focus: "Career Transition", note: "Interview technical prep (DSA/system design)" }, // Sun

  // Complex Problem Solving · 09:00–12:00
  { day: 1, blockId: "blk-deep", focus: "Income Work", note: "Clear client deadlines from prior week" }, // Mon
  { day: 2, blockId: "blk-deep", focus: "Company Building", note: "Wave build (compressed)" }, // Tue
  { day: 3, blockId: "blk-deep", focus: "Income Work", note: "Client mid-week delivery push" }, // Wed
  { day: 4, blockId: "blk-deep", focus: "Company Building", note: "Wave build (compressed)" }, // Thu
  { day: 5, blockId: "blk-deep", focus: "Income Work", note: "Client wrap-up" }, // Fri
  { day: 6, blockId: "blk-deep", focus: "Personal Brand", note: "Skit filming (needs daylight)", label: "Hobbies (Ad-hoc)" }, // Sat
  { day: 0, blockId: "blk-deep", focus: "Future Bet", note: "Optional Wave/side-project if energized (else rest)" }, // Sun

  // Lunch · 12:00–13:00 — no area anywhere else: it's lunch
  { day: 6, blockId: "blk-lunch", focus: "", label: "Free/Flex" }, // Sat

  // Routine Admin · 13:00–14:30
  { day: 1, blockId: "blk-admin", focus: "Career Transition", note: "Job applications + company research" }, // Mon
  { day: 2, blockId: "blk-admin", focus: "Business Admin", note: "Light triage" }, // Tue
  { day: 3, blockId: "blk-admin", focus: "Company Building", note: "Outreach batch (calls/DMs for Wave users)" }, // Wed
  { day: 4, blockId: "blk-admin", focus: "Career Transition", note: "Job applications + follow-ups" }, // Thu
  { day: 5, blockId: "blk-admin", focus: "Business Admin", note: "Invoicing + admin cleanup" }, // Fri
  { day: 6, blockId: "blk-admin", focus: "", note: "Errands", label: "Life Admin" }, // Sat
  { day: 0, blockId: "blk-admin", focus: "", label: "Free/Flex" }, // Sun

  // Buffer · 14:30–17:00
  { day: 1, blockId: "blk-buffer", focus: "", note: "Loose end / Mon reading: startup-SaaS strategy / admin backlog" }, // Mon
  { day: 2, blockId: "blk-buffer", focus: "", note: "Loose end / Tue reading: technical/dev deep-dives / admin backlog" }, // Tue
  { day: 3, blockId: "blk-buffer", focus: "", note: "Loose end / Wed reading: web design/client trends / admin backlog" }, // Wed
  { day: 4, blockId: "blk-buffer", focus: "", note: "Loose end / Thu reading: indie-hacking/side-project inspiration / admin backlog" }, // Thu
  { day: 5, blockId: "blk-buffer", focus: "", note: "Loose end / Fri reading: content/creator economy craft / admin backlog" }, // Fri
  { day: 6, blockId: "blk-buffer", focus: "", label: "Free/Flex" }, // Sat
  { day: 0, blockId: "blk-buffer", focus: "", label: "Free/Flex" }, // Sun

  // CTP · 17:00–18:00
  { day: 1, blockId: "blk-ctp", focus: "Personal", note: "Plan the week + skit scripting" }, // Mon
  { day: 2, blockId: "blk-ctp", focus: "Company Building", note: "Wave content/product strategy" }, // Tue
  { day: 3, blockId: "blk-ctp", focus: "Income Work", note: "Client proposals/site architecture" }, // Wed
  { day: 4, blockId: "blk-ctp", focus: "Personal Brand", note: "Skit scripting + competitor research" }, // Thu
  { day: 5, blockId: "blk-ctp", focus: "Rest/Reflection", note: "Week review + next week planning" }, // Fri
  { day: 6, blockId: "blk-ctp", focus: "", label: "Free/Flex" }, // Sat
  { day: 0, blockId: "blk-ctp", focus: "", note: "Trading research + portfolio review + execute trades", label: "Financial Health" }, // Sun

  // Interview Prep (Behavioral) · 18:00–19:00
  { day: 1, blockId: "blk-interview", focus: "Career Transition", note: "Resume/STAR stories/mock interview" }, // Mon
  { day: 2, blockId: "blk-interview", focus: "Career Transition", note: "Lighter day - review notes/questions" }, // Tue
  { day: 3, blockId: "blk-interview", focus: "Career Transition", note: "Resume/STAR stories/mock interview" }, // Wed
  { day: 4, blockId: "blk-interview", focus: "Career Transition", note: "Lighter day - review notes/questions" }, // Thu
  { day: 5, blockId: "blk-interview", focus: "Career Transition", note: "Resume/STAR stories/mock interview" }, // Fri
  { day: 6, blockId: "blk-interview", focus: "Personal", note: "Dinner", label: "Dinner/Break" }, // Sat
  { day: 0, blockId: "blk-interview", focus: "", note: "Protected family/friends time (no work talk)", label: "Relationships" }, // Sun

  // Dinner · 19:00–20:00
  { day: 6, blockId: "blk-dinner", focus: "Rest", note: "Painting / Netflix", label: "Hobbies" }, // Sat
  { day: 0, blockId: "blk-dinner", focus: "", note: "Protected family/friends time (no work talk)", label: "Relationships" }, // Sun

  // Hobbies · 20:00–22:00
  { day: 1, blockId: "blk-hobbies", focus: "Rest", note: "Painting / Netflix / skit editing" }, // Mon
  { day: 2, blockId: "blk-hobbies", focus: "Rest", note: "Painting / Netflix / skit editing" }, // Tue
  { day: 3, blockId: "blk-hobbies", focus: "Rest", note: "Painting / Netflix / skit editing" }, // Wed
  { day: 4, blockId: "blk-hobbies", focus: "Rest", note: "Painting / Netflix / skit editing" }, // Thu
  { day: 5, blockId: "blk-hobbies", focus: "Rest", note: "Painting / Netflix / skit editing" }, // Fri
  { day: 6, blockId: "blk-hobbies", focus: "Rest", note: "Painting / Netflix" }, // Sat
  { day: 0, blockId: "blk-hobbies", focus: "", note: "Protected family/friends time (no work talk)", label: "Relationships" }, // Sun
  // Wind-down · 22:00–23:00
  { day: 1, blockId: "blk-winddown", focus: "", note: "Book reading" }, // Mon
  { day: 2, blockId: "blk-winddown", focus: "", note: "Book reading" }, // Tue
  { day: 3, blockId: "blk-winddown", focus: "", note: "Book reading" }, // Wed
  { day: 4, blockId: "blk-winddown", focus: "", note: "Book reading" }, // Thu
  { day: 5, blockId: "blk-winddown", focus: "", note: "Book reading" }, // Fri
  { day: 6, blockId: "blk-winddown", focus: "", note: "Book reading" }, // Sat
  { day: 0, blockId: "blk-winddown", focus: "", note: "Book reading" }, // Sun
];

export function createDefaultPlan(): DirectionPlan {
  // Deep-copied so callers can mutate freely without touching the seed.
  return {
    blocks: DEFAULT_BLOCKS.map((block) => ({ ...block })),
    assignments: DEFAULT_ASSIGNMENTS.map((assignment) => ({ ...assignment })),
    overrides: [],
  };
}
