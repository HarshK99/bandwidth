export type Effort = "deep" | "production" | "light" | "recovery";
export type AreaId = "wave" | "freelance" | "content" | "side-projects" | "jobs" | "recovery";
export type ActivityNode =
  | { id: string; kind: "group"; label: string; children: readonly ActivityNode[] }
  | { id: string; kind: "activity"; label: string; efforts: readonly Effort[] };
export interface ActivityArea {
  id: AreaId;
  label: string;
  children: readonly ActivityNode[];
}
export interface CoverageFilter { area: AreaId | null; effort: Effort | null }
export interface WorkMode { label: string; guide?: string }
