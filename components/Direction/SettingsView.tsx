"use client";

import { useState } from "react";
import {
  addBlock,
  moveBlock,
  removeBlock,
  toggleBlockDay,
  updateBlock,
} from "@/lib/direction/plan-ops";
import { sortBlocks } from "@/lib/direction/schedule";
import BlockSettingsRow, { BLOCK_COLUMNS } from "./BlockSettingsRow";
import CalendarSettings from "./CalendarSettings";
import DateOverrides from "./DateOverrides";
import { useDirectionPlan } from "./useDirectionPlan";
import { useNow } from "./useNow";
import { BUTTON_INLINE, CARD, cx, FAINT, LABEL, LABEL_XS, MUTED } from "./ui";

/**
 * Structure, not content: which blocks a day is made of, and the exceptions
 * for one date. The areas each block points at live in Week — this screen is
 * the shape those areas hang on.
 */
export default function SettingsView() {
  const { plan, update, reset } = useDirectionPlan();
  const now = useNow();
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (!plan || !now) return <div className="h-40" aria-hidden />;

  const blocks = sortBlocks(plan.blocks);

  return (
    <section className="mx-auto w-full max-w-3xl pt-9 pb-20 sm:pt-12">
      <div className={cx(CARD, "px-3 py-1")}>
        <div
          className={cx(
            "grid gap-x-2 border-b border-black/[0.07] pt-2 pb-2 dark:border-white/[0.08]",
            BLOCK_COLUMNS
          )}
        >
          <span className={cx(LABEL_XS, FAINT, "px-2")}>Start</span>
          <span className={cx(LABEL_XS, FAINT, "px-2")}>End</span>
          <span className={cx(LABEL_XS, FAINT, "px-2")}>Block</span>
          <span className={cx(LABEL_XS, FAINT, "px-2")}>Type</span>
          <span className={cx(LABEL_XS, FAINT, "px-1")}>Days</span>
          <span />
        </div>

        <ul>
          {blocks.map((block, index) => (
            <BlockSettingsRow
              key={block.id}
              block={block}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
              onChange={(patch) =>
                update((current) => updateBlock(current, block.id, patch))
              }
              onToggleDay={(day) =>
                update((current) => toggleBlockDay(current, block.id, day))
              }
              onMove={(direction) =>
                update((current) => moveBlock(current, block.id, direction))
              }
              onRemove={() => update((current) => removeBlock(current, block.id))}
            />
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => update((current) => addBlock(current))}
        className={cx(BUTTON_INLINE, "mt-3")}
      >
        + Add block
      </button>

      <div className="mt-16 border-t border-black/[0.09] pt-9 dark:border-white/[0.12]">
        <DateOverrides plan={plan} today={now} update={update} />
      </div>

      <div className="mt-16 border-t border-black/[0.09] pt-9 dark:border-white/[0.12]">
        <CalendarSettings />
      </div>

      <div className="mt-16 border-t border-black/[0.09] pt-9 dark:border-white/[0.12]">
        <h2 className={cx(LABEL, "text-zinc-700 dark:text-zinc-300")}>Reset</h2>
        {confirmingReset ? (
          <div className="mt-3 flex items-center gap-4">
            <span className={cx("text-[13px]", MUTED)}>Reset everything?</span>
            <button
              type="button"
              onClick={() => {
                reset();
                setConfirmingReset(false);
              }}
              className={cx(BUTTON_INLINE, "text-zinc-900 dark:text-zinc-100")}
            >
              Yes, reset
            </button>
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              className={BUTTON_INLINE}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className={cx(BUTTON_INLINE, "mt-3")}
          >
            Reset to defaults
          </button>
        )}
      </div>
    </section>
  );
}
