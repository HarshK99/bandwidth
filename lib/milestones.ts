// lib/milestones.ts
// Data prep for milestone dots — no real dates yet. Populate this array once
// milestone data is available; index mapping (which dot a date lands on, per
// scope) already lives in lib/time-dots.ts and needs no changes to pick these up.

export interface Milestone {
  id: string;
  label: string;
  date: string; // ISO "YYYY-MM-DD"
}

export const milestones: Milestone[] = [];
