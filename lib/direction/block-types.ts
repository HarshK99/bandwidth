// lib/direction/block-types.ts
// The one place block type → presentation is decided. Kept tiny on purpose:
// a type shifts emphasis and mood, it never gets its own colour.

import type { BlockType } from "./types";

interface BlockTypeMeta {
  label: string;
  /**
   * "strong" = work the day is built around (full-contrast block name),
   * "soft"   = supporting time (recedes).
   */
  emphasis: "strong" | "soft";
  /**
   * "structured" = tight, tracked, deliberate.
   * "relaxed"    = lighter weight and looser leading — thinking and hobby
   * time shouldn't read as an obligation.
   */
  tone: "structured" | "relaxed";
  /**
   * CSS variable holding this type's hairline colour (see app/globals.css).
   * Named rather than classed so Tailwind has nothing to purge, and so the
   * whole ramp is tuned in one place.
   */
  border: string;
}

/**
 * An unassigned block renders empty — the app never invents an area for it.
 * A block with nothing pointed at it *is* open time, and saying so in
 * hardcoded copy ("Available capacity") reads as content when it isn't.
 * If a block should carry a phrase, assign it one in Week.
 */
export const BLOCK_TYPE_META: Record<BlockType, BlockTypeMeta> = {
  focus: {
    label: "Focus",
    emphasis: "strong",
    tone: "structured",
    border: "var(--type-focus)",
  },
  execution: {
    label: "Execution",
    emphasis: "strong",
    tone: "structured",
    border: "var(--type-execution)",
  },
  thinking: {
    label: "Thinking",
    emphasis: "strong",
    tone: "relaxed",
    border: "var(--type-thinking)",
  },
  admin: {
    label: "Admin",
    emphasis: "soft",
    tone: "structured",
    border: "var(--type-admin)",
  },
  buffer: {
    label: "Buffer",
    emphasis: "soft",
    tone: "relaxed",
    border: "var(--type-buffer)",
  },
  hobby: {
    label: "Hobby",
    emphasis: "soft",
    tone: "relaxed",
    border: "var(--type-hobby)",
  },
  custom: {
    label: "Custom",
    emphasis: "soft",
    tone: "structured",
    border: "var(--type-custom)",
  },
};

export const BLOCK_TYPES = Object.keys(BLOCK_TYPE_META) as BlockType[];
