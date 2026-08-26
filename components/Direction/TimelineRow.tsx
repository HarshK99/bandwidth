"use client";

import { BLOCK_TYPE_META } from "@/lib/direction/block-types";
import {
  blockDurationMinutes,
  formatDuration,
  formatRangeParts,
} from "@/lib/direction/schedule";
import type { DayEntry } from "@/lib/direction/schedule";
import { cx, FAINT, LABEL, LABEL_XS, MUTED, STRONG } from "./ui";

interface TimelineRowProps {
  entry: DayEntry;
  isNext: boolean;
  isLast: boolean;
}

/**
 * A block's box height, in px, from its duration.
 *
 * Deliberately *not* proportional: a square-root curve means 3h reads
 * clearly taller than 30m (≈1.6×, not 6×) so the whole day still fits on
 * one screen and the page never turns into a calendar grid. It's a
 * min-height, so a block whose content needs more room — the live one, at
 * display type size — simply takes it.
 */
function boxHeight(minutes: number): number {
  return Math.round(40 + 6 * Math.sqrt(Math.max(0, minutes)));
}

export default function TimelineRow({ entry, isNext, isLast }: TimelineRowProps) {
  const { block, name, focus, note, status, minutesRemaining, progress, isOverride } =
    entry;
  const meta = BLOCK_TYPE_META[block.type];
  const isCurrent = status === "current";
  const isPast = status === "past";
  const relaxed = meta.tone === "relaxed";
  const time = formatRangeParts(block);

  return (
    <li className="grid grid-cols-[3rem_1rem_minmax(0,1fr)] pb-3 sm:grid-cols-[3.25rem_1.25rem_minmax(0,1fr)]">
      {/* Time — stacked, so the column stays out of the way */}
      <div
        className={cx(
          "pt-3.5 pr-2 text-right font-mono text-[10px] leading-[1.5] tracking-tight whitespace-nowrap sm:pr-2.5 sm:text-[11px]",
          isCurrent ? "text-accent" : FAINT
        )}
      >
        <div>{time.start}</div>
        <div className={isCurrent ? "text-accent/60" : "opacity-70"}>{time.end}</div>
      </div>

      {/* Rail */}
      <div className="relative flex justify-center" aria-hidden>
        <div
          className={cx(
            "absolute w-px bg-black/[0.09] dark:bg-white/[0.12]",
            isLast ? "top-0 h-6" : "inset-y-0"
          )}
        />
        {isCurrent ? (
          // The rail beside the live block doubles as the clock: it fills as
          // the block runs out. No calendar grid, no numbers.
          <div className="absolute top-0 bottom-3 w-[3px] overflow-hidden rounded-full bg-accent/20">
            <div
              className="w-full bg-accent transition-[height] duration-500"
              style={{ height: `${Math.max(2, Math.min(100, progress * 100))}%` }}
            />
          </div>
        ) : (
          <div
            className={cx(
              "relative mt-[18px] h-[7px] w-[7px] rounded-full border",
              isPast
                ? "border-transparent bg-black/20 dark:bg-white/25"
                : "border-black/20 bg-[var(--background)] dark:border-white/25"
            )}
          />
        )}
      </div>

      {/* The block itself */}
      <div
        className={cx(
          "flex flex-col rounded-md border px-4 py-3.5 transition-colors",
          isCurrent
            ? "border-accent/35 bg-accent/[0.045]"
            : isPast
              ? "border-black/[0.05] dark:border-white/[0.07]"
              : "border-black/[0.09] dark:border-white/[0.12]"
        )}
        style={{ minHeight: boxHeight(blockDurationMinutes(block)) }}
      >
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h3
            className={cx(
              LABEL,
              relaxed && "font-normal tracking-[0.13em]",
              isCurrent
                ? STRONG
                : isPast
                  ? FAINT
                  : meta.emphasis === "strong"
                    ? "text-zinc-700 dark:text-zinc-300"
                    : MUTED
            )}
          >
            {name}
          </h3>
          {isCurrent && (
            <>
              <span className={cx(LABEL_XS, "text-accent")}>Now</span>
              <span className="font-mono text-[10px] tracking-tight text-accent/70">
                {formatDuration(minutesRemaining)} left
              </span>
            </>
          )}
          {isNext && <span className={cx(LABEL_XS, FAINT)}>Next</span>}
          {isOverride && (
            <span
              title="Overrides the weekly template for this date"
              className={cx(LABEL_XS, FAINT)}
            >
              Override
            </span>
          )}
        </div>

        {/* No focus means no line: an unassigned block is open time, and the
            app doesn't write copy to fill the space. */}
        {focus && (
          <p
            className={cx(
              "mt-1.5",
              isCurrent
                ? "text-[1.75rem] leading-[1.15] tracking-[-0.02em] sm:text-4xl"
                : relaxed
                  ? "text-[15px] leading-relaxed sm:text-base"
                  : "text-[15px] leading-snug sm:text-base",
              // Relaxed blocks never take extra weight — thinking and hobby
              // time shouldn't shout, even when it's the live block.
              isCurrent && !relaxed ? "font-medium" : "font-normal",
              isCurrent ? STRONG : isPast ? MUTED : "text-zinc-700 dark:text-zinc-300"
            )}
          >
            {focus}
          </p>
        )}

        {/* What that area means today — quieter than the area, and never a
            task: nothing here can be completed, ordered or checked off. */}
        {note && (
          <p
            className={cx(
              "mt-1.5 max-w-prose text-[13px] leading-relaxed",
              focus ? FAINT : MUTED
            )}
          >
            {note}
          </p>
        )}
      </div>
    </li>
  );
}
