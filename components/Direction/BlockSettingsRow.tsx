"use client";

import { BLOCK_TYPES, BLOCK_TYPE_META } from "@/lib/direction/block-types";
import {
  blockDurationMinutes,
  blockWraps,
  formatDuration,
} from "@/lib/direction/schedule";
import type { BlockType, TimeBlock } from "@/lib/direction/types";
import { BUTTON, cx, FAINT, FIELD, NUM } from "./ui";

interface BlockSettingsRowProps {
  block: TimeBlock;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<Omit<TimeBlock, "id">>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

export const BLOCK_COLUMNS =
  "grid-cols-[4.5rem_4.5rem_minmax(0,1fr)_6.5rem_5.5rem]";

/** One block, edited in place — no dialog, no save button. */
export default function BlockSettingsRow({
  block,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: BlockSettingsRowProps) {
  const wraps = blockWraps(block);

  return (
    <li
      className={cx(
        "grid items-center gap-x-2 border-b border-black/[0.05] py-2 last:border-b-0 dark:border-white/[0.07]",
        BLOCK_COLUMNS
      )}
    >
      <input
        type="time"
        value={block.start}
        onChange={(event) => onChange({ start: event.target.value })}
        aria-label={`${block.name} start time`}
        className={cx(FIELD, NUM, "text-[13px]")}
      />

      <div>
        <input
          type="time"
          value={block.end}
          onChange={(event) => onChange({ end: event.target.value })}
          aria-label={`${block.name} end time`}
          className={cx(FIELD, NUM, "text-[13px]")}
        />
        {wraps && (
          <span className={cx("mt-0.5 block px-1.5 text-[10px]", FAINT)}>
            next day · {formatDuration(blockDurationMinutes(block))}
          </span>
        )}
      </div>

      <input
        value={block.name}
        onChange={(event) => onChange({ name: event.target.value })}
        aria-label="Block name"
        className={FIELD}
      />

      <select
        value={block.type}
        onChange={(event) => onChange({ type: event.target.value as BlockType })}
        aria-label={`${block.name} type`}
        className={cx(FIELD, "cursor-pointer appearance-none text-[13px]")}
      >
        {BLOCK_TYPES.map((type) => (
          <option key={type} value={type}>
            {BLOCK_TYPE_META[type].label}
          </option>
        ))}
      </select>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={isFirst}
          aria-label={`Move ${block.name} earlier`}
          className={cx(BUTTON, "w-7 px-0")}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={isLast}
          aria-label={`Move ${block.name} later`}
          className={cx(BUTTON, "w-7 px-0")}
        >
          ↓
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${block.name}`}
          className={cx(BUTTON, "w-7 px-0 hover:text-zinc-900 dark:hover:text-zinc-100")}
        >
          ×
        </button>
      </div>
    </li>
  );
}
