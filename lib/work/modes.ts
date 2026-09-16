import type { Effort, WorkMode } from "./types";

export const WORK_MODES: Record<Effort, WorkMode> = {
  deep: { label: "Deep work", guide: "Think · Solve · Decide · Discuss" },
  production: { label: "Production", guide: "Build · Write · Edit · Refine" },
  light: { label: "Light work", guide: "Research · Post · Follow up · Admin" },
  recovery: { label: "Recovery" },
};
