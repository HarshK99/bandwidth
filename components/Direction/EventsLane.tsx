"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  formatEventRange,
  formatEventStart,
  minutesInto,
} from "@/lib/calendar/day-events";
import type { CalendarEvent } from "@/lib/calendar/types";
import { blockDurationMinutes, toMinutes } from "@/lib/direction/schedule";
import type { DayEntry } from "@/lib/direction/schedule";
import { cx, LABEL_XS, SURFACE } from "./ui";

interface EventsLaneProps {
  /** Events already filtered to the viewed day and sorted by start. */
  events: CalendarEvent[];
  /** The <ol> the timeline rows render into — the lane measures against it. */
  timelineRef: RefObject<HTMLOListElement | null>;
  entries: DayEntry[];
  date: Date;
  /** Changes on the clock tick — a reason to re-measure. */
  nowMs: number;
}

/** One block's rendered box, in reading-order minutes and screen pixels. */
interface Segment {
  startMin: number;
  endMin: number;
  top: number;
  bottom: number;
}

interface Geometry {
  segments: Segment[];
  /** Clock minutes at which the day (and the timeline) begins. */
  dayStartMin: number;
}

const MINUTES_PER_DAY = 1440;

/**
 * The timeline runs in reading order — from the day's first block round to
 * the same time next morning, not from midnight. So a 1pm event and an 11pm
 * block are both measured against that rotated clock; without it, anything
 * after the start time maps past the end of the day.
 */
function readingOrder(clockMin: number, dayStartMin: number): number {
  return (
    (((clockMin - dayStartMin) % MINUTES_PER_DAY) + MINUTES_PER_DAY) %
    MINUTES_PER_DAY
  );
}

function measure(container: HTMLElement, entries: DayEntry[]): Geometry {
  const boxes = container.querySelectorAll<HTMLElement>("[data-timeline-box]");
  const base = container.getBoundingClientRect().top;
  const dayStartMin = entries[0] ? toMinutes(entries[0].block.start) : 0;

  const segments: Segment[] = [];
  boxes.forEach((box, index) => {
    const entry = entries[index];
    if (!entry) return;
    const rect = box.getBoundingClientRect();
    const startMin = readingOrder(toMinutes(entry.block.start), dayStartMin);
    segments.push({
      startMin,
      endMin: startMin + blockDurationMinutes(entry.block),
      top: rect.top - base,
      bottom: rect.bottom - base,
    });
  });
  return { segments, dayStartMin };
}

/**
 * Reading-order minute → y inside the timeline. Linear within a block's own
 * box, linear across the gaps between boxes, clamped past both ends — the
 * same piecewise scale the ruler uses.
 */
function yOf(minute: number, segments: Segment[]): number {
  if (segments.length === 0) return 0;
  const first = segments[0];
  const last = segments[segments.length - 1];
  if (minute <= first.startMin) return first.top;
  if (minute >= last.endMin) return last.bottom;

  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    if (minute >= segment.startMin && minute <= segment.endMin) {
      const t =
        (minute - segment.startMin) /
        Math.max(1, segment.endMin - segment.startMin);
      return segment.top + t * (segment.bottom - segment.top);
    }
    const next = segments[i + 1];
    if (next && minute > segment.endMin && minute < next.startMin) {
      const t =
        (minute - segment.endMin) / Math.max(1, next.startMin - segment.endMin);
      return segment.bottom + t * (next.top - segment.bottom);
    }
  }
  return last.bottom;
}

const MIN_CARD_HEIGHT = 24;

export default function EventsLane({
  events,
  timelineRef,
  entries,
  date,
  nowMs,
}: EventsLaneProps) {
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const remeasure = useCallback(() => {
    const container = timelineRef.current;
    if (container) setGeometry(measure(container, entries));
  }, [timelineRef, entries]);

  useLayoutEffect(() => {
    remeasure();
    // A second pass after paint catches late reflow (web font, the live card).
    const raf = requestAnimationFrame(remeasure);
    return () => cancelAnimationFrame(raf);
  }, [remeasure, nowMs, date]);

  useEffect(() => {
    const container = timelineRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => remeasure());
    observer.observe(container);
    window.addEventListener("resize", remeasure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", remeasure);
    };
  }, [timelineRef, remeasure]);

  useEffect(() => {
    if (!openId) return;
    const close = () => setOpenId(null);
    const timer = window.setTimeout(
      () => document.addEventListener("click", close),
      0
    );
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", close);
    };
  }, [openId]);

  const segments = geometry?.segments ?? [];
  const dayStartMin = geometry?.dayStartMin ?? 0;

  // Place each card by the map, then push any that would collide with the one
  // above — under contention, legibility beats an exact vertical position.
  const placed: { event: CalendarEvent; top: number; height: number }[] = [];
  let lastBottom = -Infinity;
  for (const event of events) {
    const roStart = readingOrder(minutesInto(date, event.startMs), dayStartMin);
    let roEnd = readingOrder(minutesInto(date, event.endMs), dayStartMin);
    if (roEnd <= roStart) roEnd += MINUTES_PER_DAY;

    const rawTop = yOf(roStart, segments);
    const rawBottom = yOf(roEnd, segments);
    const height = Math.max(MIN_CARD_HEIGHT, rawBottom - rawTop);
    const top = Math.max(rawTop, lastBottom + 3);
    placed.push({ event, top, height });
    lastBottom = top + height;
  }

  return (
    <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-[4.5rem]">
      {segments.length > 0 &&
        placed.map(({ event, top, height }) => {
          const open = openId === event.id;
          return (
            <div
              key={event.id}
              className="pointer-events-auto absolute right-0 left-0"
              style={{ top, height }}
            >
              <button
                type="button"
                onClick={(clickEvent) => {
                  clickEvent.stopPropagation();
                  setOpenId(open ? null : event.id);
                }}
                aria-label={`${formatEventRange(event.startMs, event.endMs)} — ${event.title}`}
                className={cx(
                  // Near-opaque surface + blur + dashed edge: reads as a card
                  // laid on top of the block it overlaps, while the planned
                  // block's text stays faintly legible behind it.
                  "flex h-full w-full flex-col gap-0.5 overflow-hidden rounded-md border border-dashed px-1.5 py-1 text-left backdrop-blur-[2px]",
                  "border-[var(--type-admin)] bg-surface/85",
                  open && "ring-1 ring-black/15 dark:ring-white/20"
                )}
              >
                <span className="whitespace-nowrap text-[9px] font-semibold tabular-nums text-zinc-400 dark:text-zinc-500">
                  {formatEventStart(event.startMs)}
                </span>
                <span className="truncate text-[10px] leading-tight text-zinc-600 dark:text-zinc-300">
                  {event.title}
                </span>
              </button>

              {open && (
                <div
                  className={cx(
                    SURFACE,
                    "absolute top-0 right-full z-20 mr-2 w-52 max-w-[70vw] rounded-xl p-3"
                  )}
                >
                  <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                    {event.title}
                  </p>
                  <p className="mt-1 text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                    {formatEventRange(event.startMs, event.endMs)}
                  </p>
                  <p
                    className={cx(
                      LABEL_XS,
                      "mt-1.5 text-zinc-400 dark:text-zinc-500"
                    )}
                  >
                    Google Calendar
                  </p>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
