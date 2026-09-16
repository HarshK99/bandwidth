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
  operationalMinutesInto,
} from "@/lib/calendar/day-events";
import type { CalendarEvent } from "@/lib/calendar/types";
import { blockDurationMinutes, operationalMinute } from "@/lib/direction/schedule";
import type { DayEntry } from "@/lib/direction/types";
import { BUTTON, cx, LABEL_XS, MUTED } from "./ui";
import Popover from "./Popover";

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
}

function measure(container: HTMLElement, entries: DayEntry[]): Geometry {
  const boxes = container.querySelectorAll<HTMLElement>("[data-timeline-box]");
  const base = container.getBoundingClientRect().top;

  const segments: Segment[] = [];
  boxes.forEach((box, index) => {
    const entry = entries[index];
    if (!entry) return;
    const rect = box.getBoundingClientRect();
    const startMin = operationalMinute(entry.block.start);
    segments.push({
      startMin,
      endMin: startMin + blockDurationMinutes(entry.block),
      top: rect.top - base,
      bottom: rect.bottom - base,
    });
  });
  container.querySelectorAll<HTMLElement>("[data-open-start]").forEach((box) => {
    const rect = box.getBoundingClientRect();
    segments.push({ startMin: Number(box.dataset.openStart), endMin: Number(box.dataset.openEnd), top: rect.top - base, bottom: rect.bottom - base });
  });
  segments.sort((a, b) => a.startMin - b.startMin);
  return { segments };
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
  const [selection, setSelection] = useState<{ id: string; anchor: HTMLButtonElement } | null>(null);

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

  const segments = geometry?.segments ?? [];
  const selectedEvent = events.find((event) => event.id === selection?.id);

  // Keep events inside the day. Colliding cards share columns instead of
  // being pushed into a later block or beyond the timeline.
  const placed: { event: CalendarEvent; top: number; height: number; column: number; columns: number }[] = [];
  const dayBottom = segments.at(-1)?.bottom ?? 0;
  for (const event of events) {
    const roStart = operationalMinutesInto(date, event.startMs);
    const roEnd = operationalMinutesInto(date, event.endMs);

    const rawTop = yOf(roStart, segments);
    const rawBottom = yOf(roEnd, segments);
    const height = Math.min(dayBottom, Math.max(MIN_CARD_HEIGHT, rawBottom - rawTop));
    const top = Math.max(0, Math.min(rawTop, dayBottom - height));
    placed.push({ event, top, height, column: 0, columns: 1 });
  }
  placed.sort((a, b) => a.top - b.top || b.height - a.height);
  let group: typeof placed = [];
  let columnEnds: number[] = [];
  const finishGroup = () => { for (const item of group) item.columns = columnEnds.length; };
  for (const item of placed) {
    if (columnEnds.length && item.top >= Math.max(...columnEnds)) {
      finishGroup(); group = []; columnEnds = [];
    }
    const free = columnEnds.findIndex((end) => end <= item.top);
    item.column = free < 0 ? columnEnds.length : free;
    columnEnds[item.column] = item.top + item.height;
    group.push(item);
  }
  finishGroup();

  return (
    <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-[4.5rem]">
      {segments.length > 0 &&
        placed.map(({ event, top, height, column, columns }) => {
          const open = selection?.id === event.id;
          return (
            <div
              key={event.id}
              className="pointer-events-auto absolute"
              style={{ top, height, left: `${column / columns * 100}%`, width: `${100 / columns}%` }}
            >
              <button
                type="button"
                onClick={(clickEvent) => {
                  setSelection({ id: event.id, anchor: clickEvent.currentTarget });
                }}
                aria-haspopup="dialog"
                aria-expanded={open}
                title={`${formatEventRange(event.startMs, event.endMs)} — ${event.title}`}
                aria-label={`${formatEventRange(event.startMs, event.endMs)} — ${event.title}`}
                className={cx(
                  // Dashed, neutral events sit beside the planned blocks.
                  "flex h-full w-full flex-col gap-0.5 overflow-hidden rounded-md border border-dashed px-1.5 py-1 text-left backdrop-blur-[2px]",
                  "border-[var(--type-light)] bg-surface focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1",
                  open && "ring-1 ring-black/15 dark:ring-white/20"
                )}
              >
                <span className={cx("whitespace-nowrap text-[9px] font-semibold tabular-nums", MUTED)}>
                  {formatEventStart(event.startMs)}
                </span>
                <span className="truncate text-[10px] leading-tight text-zinc-600 dark:text-zinc-300">
                  {event.title}
                </span>
              </button>

            </div>
          );
        })}
      {selectedEvent && selection && (
        <Popover anchor={selection.anchor} label="Calendar event" onDismiss={() => {
          selection.anchor.focus({ preventScroll: true });
          setSelection(null);
        }}>
          <p className="break-words text-[13px] font-semibold">{selectedEvent.title}</p>
          <p className={cx("mt-1 text-[12px] tabular-nums", MUTED)}>{formatEventRange(selectedEvent.startMs, selectedEvent.endMs)}</p>
          <p className={cx(LABEL_XS, "mt-2", MUTED)}>Google Calendar · read-only</p>
          <button type="button" className={cx(BUTTON, "mt-3 min-h-11")} onClick={() => {
            selection.anchor.focus({ preventScroll: true });
            setSelection(null);
          }}>Close</button>
        </Popover>
      )}
    </div>
  );
}
