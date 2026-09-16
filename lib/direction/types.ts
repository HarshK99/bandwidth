import type { Effort } from "../work/types";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type BlockType = Effort | "break";

export interface TimeBlock {
  id: string;
  name: string;
  start: string;
  end: string;
  type: BlockType;
}
export interface DirectionPlan {
  version: 2;
  week: Record<DayOfWeek, TimeBlock[]>;
}
export type BlockStatus = "past" | "current" | "upcoming";
export interface DayEntry {
  block: TimeBlock;
  name: string;
  status: BlockStatus;
  minutesRemaining: number;
  progress: number;
}
export interface DaySchedule {
  blocks: TimeBlock[];
  entries: DayEntry[];
  current: DayEntry | null;
  next: DayEntry | null;
  minutesUntilNext: number | null;
}
export interface PlanIssue { field: string; message: string }
export type PlanChange =
  | { ok: true; plan: DirectionPlan }
  | { ok: false; issues: PlanIssue[] };
