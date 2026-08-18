// lib/milestones.ts
// Milestone dots — index mapping (which dot a date lands on, per scope)
// lives in lib/time-dots.ts and picks up new entries here automatically.

export interface Milestone {
  id: string;
  label: string;
  date: string; // ISO "YYYY-MM-DD"
}

export const milestones: Milestone[] = [
  // Day is a placeholder (mid-month) — only "April 2028" was given.
  { id: "milestone-wedding", label: "Get Married", date: "2028-04-15" },
];

export function formatMilestoneDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
