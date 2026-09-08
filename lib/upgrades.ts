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
      id: "wake-early",
      title: "Waking up at 7am",
      note: "Years of it. Fixed over about six weeks — earlier wind-down, alarm across the room, no snooze, morning light straight away.",
      date: "2026-07-01",
    },
  ],
  active: {
    id: "formidable",
    title: "Being formidable",
    note: "One who gets what he wants; focuses on goals not the path or obstacle.",
    date: "2026-09-01",
  },
  future: [
    {
      id: "charming",
      title: "Become charming",
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
