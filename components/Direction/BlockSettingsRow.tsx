"use client";

import { BLOCK_TYPES, BLOCK_TYPE_META } from "@/lib/direction/block-types";
import {
  blockDurationMinutes,
  blockRunsOn,
  blockWraps,
  formatDuration,
  shortDayName,
  WEEK_DAYS,
} from "@/lib/direction/schedule";
import type { BlockType, DayOfWeek, TimeBlock } from "@/lib/direction/types";
import { BUTTON, cx, FAINT, FIELD, MUTED, NUM } from "./ui";

interface BlockSettingsRowProps {
  block: TimeBlock;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<Omit<TimeBlock, "id">>) => void;
  onToggleDay: (day: DayOfWeek) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

export const BLOCK_COLUMNS =
  "grid-cols-[4.5rem_4.5rem_minmax(0,1fr)_6.5rem_8.5rem_5.5rem]";

/** One block, edited in place — no dialog, no save button. */
export default function BlockSettingsRow({
  block,
  isFirst,
  isLast,
  onChange,
  onToggleDay,
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

      {/* Which days this block runs. Seven letters rather than a multi-select:
          the whole point is to see the shape at a glance, and a closed control
          would hide exactly the thing being edited. */}
      <div className="flex items-center gap-px px-1">
        {WEEK_DAYS.map((day) => {
          const runs = blockRunsOn(block, day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onToggleDay(day)}
              aria-pressed={runs}
              aria-label={`${block.name} on ${shortDayName(day)}`}
              title={shortDayName(day)}
              className={cx(
                "h-6 w-[1.05rem] rounded text-[10px] font-semibold uppercase transition-colors",
                runs
                  ? cx(MUTED, "bg-black/[0.05] dark:bg-white/[0.08]")
                  : cx(FAINT, "opacity-45 hover:opacity-100")
              )}
            >
              {shortDayName(day).slice(0, 1)}
            </button>
          );
        })}
      </div>

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
