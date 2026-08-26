"use client";

import { BLOCK_TYPE_META } from "@/lib/direction/block-types";
import {
  blockDurationMinutes,
  formatDuration,
  formatRangeParts,
} from "@/lib/direction/schedule";
import type { DayEntry } from "@/lib/direction/schedule";
import { cx, FAINT, LABEL, LABEL_XS, MUTED, NUM } from "./ui";

interface TimelineRowProps {
  entry: DayEntry;
  isNext: boolean;
  isLast: boolean;
  /** The block before this one ends exactly when it starts. */
  attachedAbove: boolean;
  /** The block after this one starts exactly when it ends. */
  attachedBelow: boolean;
}

/**
 * A block's box height, in px, from its duration.
 *
 * Linear enough to actually feel — 3h is roughly double 1h — but capped, so
 * the 8-hour sleep block doesn't turn the page into a scroll marathon. It's
 * a min-height: a block whose content needs more room, like the live one at
 * display type size, simply takes it.
 */
function boxHeight(minutes: number): number {
  return Math.round(Math.min(190, 40 + 0.58 * Math.max(0, minutes)));
}

/** Corners are rounded only where a run of touching blocks begins and ends. */
function radiusClass(attachedAbove: boolean, attachedBelow: boolean): string {
  if (attachedAbove && attachedBelow) return "rounded-none";
  if (attachedAbove) return "rounded-b-2xl";
  if (attachedBelow) return "rounded-t-2xl";
  return "rounded-2xl";
}

export default function TimelineRow({
  entry,
  isNext,
  isLast,
  attachedAbove,
  attachedBelow,
}: TimelineRowProps) {
  const { block, name, focus, note, status, minutesRemaining, progress, isOverride } =
    entry;
  const meta = BLOCK_TYPE_META[block.type];
  const isCurrent = status === "current";
  const isPast = status === "past";
  const relaxed = meta.tone === "relaxed";
  const time = formatRangeParts(block);

  return (
    <li
      className={cx(
        "grid grid-cols-[3.25rem_1rem_minmax(0,1fr)] sm:grid-cols-[3.5rem_1.25rem_minmax(0,1fr)]",
        attachedBelow ? "pb-0" : "pb-3"
      )}
    >
      {/* Time — stacked, so the column stays out of the way */}
      <div
        className={cx(
          NUM,
          "pt-3.5 pr-2 text-right text-[11px] leading-[1.45] font-medium whitespace-nowrap sm:pr-2.5",
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
          <div
            className={cx(
              "absolute top-0 w-[3px] overflow-hidden rounded-full bg-accent/20",
              attachedBelow ? "bottom-0" : "bottom-3"
            )}
          >
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

      {/* The block itself. Touching blocks overlap by a pixel so their
          borders collapse into one hairline and the run reads as continuous
          time — a visible gap then means there really is one. */}
      <div
        className={cx(
          "relative flex flex-col border transition-colors",
          // The live block is lifted out of the run — fully rounded and
          // raised — so it reads as a card sitting on the stack rather than
          // a mid-run segment with square corners.
          isCurrent ? "rounded-2xl" : radiusClass(attachedAbove, attachedBelow),
          attachedAbove && "-mt-px",
          isCurrent
            ? // The one filled surface in the app: the block you're in.
              "grain z-10 overflow-hidden border-transparent bg-linear-to-br " +
              "from-hero-from to-hero-to px-4 py-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]"
            : cx(
                "bg-surface px-3.5 py-3",
                isPast
                  ? "border-black/[0.04] dark:border-white/[0.06]"
                  : "border-black/[0.07] dark:border-white/[0.08]"
              )
        )}
        style={{ minHeight: boxHeight(blockDurationMinutes(block)) }}
      >
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h3
            className={cx(
              LABEL,
              relaxed && !isCurrent && "font-medium tracking-[0.09em]",
              isCurrent
                ? "text-white/75"
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
              <span className={cx(LABEL_XS, "text-white")}>Now</span>
              <span className={cx(NUM, "text-[11px] font-medium text-white/60")}>
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
              "mt-1",
              isCurrent
                ? "text-[1.9rem] leading-[1.1] tracking-[-0.025em] text-balance sm:text-[2.6rem]"
                : relaxed
                  ? "text-[15px] leading-relaxed sm:text-base"
                  : "text-[15px] leading-snug sm:text-base",
              // Relaxed blocks never take extra weight — thinking and hobby
              // time shouldn't shout, even when it's the live block.
              isCurrent && !relaxed ? "font-extrabold" : "font-medium",
              isCurrent ? "text-white" : isPast ? MUTED : "text-zinc-800 dark:text-zinc-200"
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
              "mt-1.5 max-w-prose text-xs leading-relaxed",
              isCurrent ? "text-white/70" : focus ? FAINT : MUTED
            )}
          >
            {note}
          </p>
        )}
      </div>
    </li>
  );
}
