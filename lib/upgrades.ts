// lib/upgrades.ts
// Upgrades — the internal problems being worked through, one at a time.
// See docs/UPGRADES.md. Static data, edited here; no store, no localStorage.
//
// State is which list an entry sits in, never a field on the entry:
//   past    completed, chronological (oldest → newest)
//   active  the one being worked on now (always exactly one)
//   future  a pool, not a queue — authored order carries no promise

export interface Upgrade {
  id: string;
  /** The problem, named as a problem: "Waking up late". */
  title: string;
  /** One line — what it is, or what "fixed" looks like. Optional. */
  note?: string;
  /** ISO "YYYY-MM-DD". Coarse and optional — rendered as month + year. */
  date?: string;
}

export const upgrades: {
  past: Upgrade[];
  active: Upgrade;
  future: Upgrade[];
} = {
  // Seed entries — replace with the real ones.
  past: [
    {
      id: "phone-mornings",
      title: "Phone-first mornings",
      note: "Reaching for the phone before getting out of bed. Fixed by charging it in another room.",
      date: "2026-03-01",
    },
    {
      id: "open-ended-nights",
      title: "Open-ended late nights",
      note: "No hard stop in the evening, which wrecked the next morning. Set a wind-down block.",
      date: "2026-06-01",
    },
    {
      id: "wake-early",
      title: "Waking up late",
      note: "Years of it. Fixed over about six weeks — earlier wind-down, alarm across the room, no snooze, morning light straight away.",
      date: "2026-07-01",
    },
  ],
  active: {
    id: "formidable",
    title: "Being formidable",
    note: "Hard to dismiss — presence, directness, saying the difficult thing, following through where people can see it.",
    date: "2026-09-01",
  },
  future: [
    {
      id: "context-switching",
      title: "Context-switching mid-block",
      note: "Jumping between tasks inside a focus block instead of holding one.",
    },
    {
      id: "saying-yes-fast",
      title: "Saying yes too fast",
      note: "Committing in the moment, resenting the calendar later.",
    },
    {
      id: "breaks-become-scrolling",
      title: "Breaks that turn into scrolling",
      note: "A five-minute break becoming thirty on a feed.",
    },
  ],
};

/** "Aug 2026" — these aren't day-precise, so the day is dropped. */
export function formatUpgradeDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}
