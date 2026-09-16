import { WORK_MODES } from "../work/modes";
import type { BlockType } from "./types";

interface BlockTypeMeta { label: string; border: string; fill: string }

export const BLOCK_TYPE_META: Record<BlockType, BlockTypeMeta> = {
  deep: { label: WORK_MODES.deep.label, border: "var(--type-deep)", fill: "var(--type-deep-fill)" },
  production: { label: WORK_MODES.production.label, border: "var(--type-production)", fill: "var(--type-production-fill)" },
  light: { label: WORK_MODES.light.label, border: "var(--type-light)", fill: "var(--type-light-fill)" },
  recovery: { label: WORK_MODES.recovery.label, border: "var(--type-recovery)", fill: "var(--type-recovery-fill)" },
  break: { label: "Break", border: "var(--type-break)", fill: "var(--type-break-fill)" },
};
export const BLOCK_TYPES = Object.keys(BLOCK_TYPE_META) as BlockType[];
