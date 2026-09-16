"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { BLOCK_TYPE_META } from "@/lib/direction/block-types";
import { rememberToday } from "@/lib/direction/navigation";
import { blockDurationMinutes, formatDuration } from "@/lib/direction/schedule";
import type { RulerTick } from "@/lib/direction/schedule";
import type { BlockType, DayEntry } from "@/lib/direction/types";
import { WORK_MODES } from "@/lib/work/modes";
import { cx, MUTED, NUM } from "./ui";

interface TimelineRowProps {
  entry: DayEntry;
  date: string;
  isNext: boolean;
  isLast: boolean;
  attachedAbove: boolean;
  attachedBelow: boolean;
  openMinutesAfter: number;
  ticks: RulerTick[];
}
function boxHeight(minutes: number): number {
  return Math.round(Math.min(190, 62 + 0.62 * Math.max(0, minutes)));
}
function gapHeight(minutes: number): number {
  return minutes <= 0 ? 12 : Math.round(Math.min(56, 12 + 0.28 * minutes));
}
function radiusClass(above: boolean, below: boolean): string {
  return above && below ? "rounded-none" : above ? "rounded-b-2xl" : below ? "rounded-t-2xl" : "rounded-2xl";
}
export default function TimelineRow({
  entry, date, isNext, isLast, attachedAbove, attachedBelow, openMinutesAfter, ticks,
}: TimelineRowProps) {
  const { block, name, status, minutesRemaining, progress } = entry;
  const meta = BLOCK_TYPE_META[block.type];
  const guide = block.type === "break" ? undefined : WORK_MODES[block.type].guide;
  const isCurrent = status === "current";
  const isPast = status === "past";
  return (
    <li
      data-current={isCurrent ? "" : undefined}
      data-next={isNext ? "" : undefined}
      className="grid grid-cols-[2.5rem_0.75rem_minmax(0,1fr)] sm:grid-cols-[2.75rem_1rem_minmax(0,1fr)]"
      style={{ paddingBottom: attachedBelow ? 0 : gapHeight(openMinutesAfter) }}
    >
      {/* Time — a continuous hour ruler rather than this block's own range.
          Each mark sits at its proportional position *inside* the block, so
          the clock never skips even though block heights don't scale with
          duration. */}
      <div className="relative">
        {ticks.map((tick) => (
          <span
            key={`${tick.offset}-${tick.label}`}
            className={cx(
              NUM,
              "absolute right-1 text-[11px] leading-none font-medium whitespace-nowrap sm:right-1.5",
              isCurrent ? "text-accent" : MUTED,
              tick.offHour && "opacity-75"
            )}
            style={{ top: `${tick.offset * 100}%`, transform: "translateY(-50%)" }}
          >
            {tick.label}
          </span>
        ))}
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
            className="absolute top-0 w-[3px] overflow-hidden rounded-full bg-accent/20"
            style={{ bottom: attachedBelow ? 0 : gapHeight(openMinutesAfter) }}
          >
            <div
              className="w-full bg-accent transition-[height] duration-500"
              style={{ height: `${Math.max(2, Math.min(100, progress * 100))}%` }}
            />
          </div>
        ) : (
          <div
            className={cx(
              "absolute top-0 h-[7px] w-[7px] -translate-y-1/2 rounded-full border",
              isPast
                ? "border-transparent bg-black/20 dark:bg-white/25"
                : "border-black/20 bg-[var(--background)] dark:border-white/25"
            )}
          />
        )}
      </div>

      <BlockBox
        type={block.type}
        blockId={block.id}
        date={date}
        className={cx(
          "relative flex flex-col justify-center border transition-colors",
          isCurrent ? "rounded-2xl" : radiusClass(attachedAbove, attachedBelow),
          attachedAbove && "-mt-px",
          isCurrent
            ? "grain z-10 border-transparent bg-linear-to-br from-hero-from to-hero-to px-4 py-4 text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]"
            : "px-3.5 py-3"
        )}
        style={{
          minHeight: boxHeight(blockDurationMinutes(block)),
          ...(!isCurrent ? { backgroundColor: meta.fill, borderColor: meta.border } : {}),
        }}
      >
        {(isCurrent || isNext) && (
          <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[11px]">
            <span className={cx("font-semibold uppercase tracking-[0.09em]", !isCurrent && MUTED)}>{isCurrent ? "Now" : "Next"}</span>
            {isCurrent && <span className={cx(NUM, "text-white/80")}>{formatDuration(minutesRemaining)} left</span>}
          </div>
        )}
        <h3 className={cx(
          "break-words font-semibold leading-snug",
          isCurrent ? "text-[1.4rem] tracking-[-0.02em] sm:text-[1.7rem]" : "text-[17px]",
          !isCurrent && (isPast ? MUTED : "text-zinc-800 dark:text-zinc-100"),
        )}>{name}</h3>
        {guide && <p className={cx("mt-1.5 break-words text-pretty text-[12px] leading-normal", isCurrent ? "text-white/85" : MUTED)}>{guide}</p>}
      </BlockBox>
    </li>
  );
}

function BlockBox({ type, blockId, date, className, style, children }: {
  type: BlockType;
  blockId: string;
  date: string;
  className: string;
  style: CSSProperties;
  children: ReactNode;
}) {
  const id = `direction-block-${blockId}`;
  if (type === "break") {
    return <div id={id} tabIndex={-1} data-timeline-box="" className={className} style={style}>{children}</div>;
  }
  return (
    <Link
      id={id}
      href={`/coverage?effort=${type}&fromDate=${date}`}
      onNavigate={() => rememberToday(date, blockId)}
      data-timeline-box=""
      className={cx(className, "cursor-pointer hover:ring-1 hover:ring-black/10 dark:hover:ring-white/15 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none")}
      style={style}
    >{children}</Link>
  );
}
