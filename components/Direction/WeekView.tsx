"use client";

import { useRef, useState } from "react";
import { BLOCK_TYPE_META } from "@/lib/direction/block-types";
import { copyDay, removeBlock, upsertBlock } from "@/lib/direction/plan-ops";
import { blockDurationMinutes, dayName, formatRange, getOperationalDate, operationalMinute, sortBlocks, WEEK_DAYS } from "@/lib/direction/schedule";
import type { DayOfWeek, DirectionPlan, PlanChange, PlanIssue, TimeBlock } from "@/lib/direction/types";
import BlockEditor from "./BlockEditor";
import Popover from "./Popover";
import WeekGrid, { type EditingCell } from "./WeekGrid";
import { useDirectionPlan } from "./useDirectionPlan";
import { useNow } from "./useNow";
import { BUTTON, CARD, cx, FIELD, MUTED, NUM } from "./ui";

type Editor = EditingCell & { block: TimeBlock; isNew: boolean };
function clockAt(minute: number): string {
  const clock = (minute + 420) % 1440;
  return `${String(Math.floor(clock / 60)).padStart(2, "0")}:${String(clock % 60).padStart(2, "0")}`;
}
function newBlock(blocks: TimeBlock[]): TimeBlock {
  let start = 0;
  let end = 1440;
  for (const block of sortBlocks(blocks)) {
    const nextStart = operationalMinute(block.start);
    if (nextStart > start) { end = nextStart; break; }
    start = nextStart + blockDurationMinutes(block);
  }
  const hasGap = start < end;
  return {
    id: crypto.randomUUID(), name: "Deep work", type: "deep",
    start: hasGap ? clockAt(start) : "", end: hasGap ? clockAt(Math.min(start + 60, end)) : "",
  };
}

export default function WeekView() {
  const { plan, update, notSaved } = useDirectionPlan();
  const now = useNow();
  const today = now ? getOperationalDate(now).getDay() as DayOfWeek : null;
  const [chosenDay, setChosenDay] = useState<DayOfWeek | null>(null);
  const day = chosenDay ?? today ?? 1;
  const [editing, setEditing] = useState<Editor | null>(null);
  const [copying, setCopying] = useState<{ source: DayOfWeek; target: DayOfWeek; anchor: HTMLElement } | null>(null);
  const [copyIssues, setCopyIssues] = useState<PlanIssue[]>([]);
  const [notice, setNotice] = useState("");
  const daySelect = useRef<HTMLSelectElement>(null);
  if (!plan) return <div className="h-40" aria-hidden />;

  const dismiss = () => {
    const anchor = editing?.anchor ?? copying?.anchor;
    setEditing(null);
    setCopying(null);
    requestAnimationFrame(() => {
      const target = anchor?.isConnected && anchor.getClientRects().length ? anchor : daySelect.current;
      target?.focus({ preventScroll: true });
    });
  };
  const apply = (operation: (current: DirectionPlan) => PlanChange, message: string): PlanIssue[] => {
    let issues: PlanIssue[] = [];
    const accepted = update((current) => {
      const change = operation(current);
      if (!change.ok) { issues = change.issues; return current; }
      return change.plan;
    });
    if (!accepted) return [{ field: "plan", message: "Another tab saved a newer schedule while this tab has unsaved changes. Your edits are still here. Copy any changes you want to keep before reloading the latest schedule." }];
    if (!issues.length) { setNotice(message); dismiss(); }
    return issues;
  };
  const edit = (cell: EditingCell | null) => {
    if (!cell) { dismiss(); return; }
    const block = plan.week[cell.day].find((item) => item.id === cell.blockId);
    if (block) setEditing({ ...cell, block: { ...block }, isNew: false });
  };
  const blocks = sortBlocks(plan.week[day]);
  // Include real open intervals in the selected-day view, including an empty day.
  const items: ({ kind: "block"; block: TimeBlock } | { kind: "gap"; start: number; end: number })[] = [];
  let cursor = 0;
  for (const block of blocks) {
    const start = operationalMinute(block.start);
    if (start > cursor) items.push({ kind: "gap", start: cursor, end: start });
    items.push({ kind: "block", block });
    cursor = start + blockDurationMinutes(block);
  }
  if (cursor < 1440) items.push({ kind: "gap", start: cursor, end: 1440 });

  return (
    <section className="mx-auto w-full min-w-0 max-w-6xl pt-9 pb-16 sm:pt-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-sm font-semibold">Weekly template</h1>
          <p className={cx(MUTED, "mt-1 text-[12px]")}>Each day repeats weekly, from 07:00 to next 07:00.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-[12px]">Day
            <select ref={daySelect} value={day} onChange={(event) => setChosenDay(Number(event.target.value) as DayOfWeek)}
              className={cx(FIELD, "mt-1 min-h-11 border-black/10 dark:border-white/15")}>
              {WEEK_DAYS.map((value) => <option key={value} value={value}>{dayName(value)}</option>)}
            </select>
          </label>
          <button type="button" aria-haspopup="dialog" className={cx(BUTTON, "min-h-11")}
            aria-label={`Add block to ${dayName(day)}`} onClick={(event) => {
              const block = newBlock(plan.week[day]);
              setEditing({ day, block, blockId: block.id, isNew: true, anchor: event.currentTarget });
            }}>Add block</button>
          <button type="button" aria-haspopup="dialog" className={cx(BUTTON, "min-h-11")}
            onClick={(event) => {
              setCopyIssues([]);
              setCopying({ source: day, target: WEEK_DAYS.find((value) => value !== day)!, anchor: event.currentTarget });
            }}>Copy day</button>
        </div>
      </div>
      {notSaved && <p role="status" className={cx("mb-4 text-[13px]", MUTED)}>Changes are not saved on this device. They remain available in this tab.</p>}
      <p role="status" className={cx(MUTED, notice ? "mb-3 text-[12px]" : "sr-only")}>{notice}</p>
      <WeekGrid plan={plan} today={today} editing={editing} onEdit={edit} />
      <div className={cx(CARD, "p-3 lg:hidden")}>
        <h2 className="mb-3 text-sm font-semibold">{dayName(day)}</h2>
        <ol className="space-y-2">
          {items.map((item) => {
            if (item.kind === "gap") return <li key={`gap-${item.start}`} className={cx(MUTED, "px-3 py-3 text-[12px]")}>
              <span className={NUM}>{clockAt(item.start)}–{clockAt(item.end)}</span> · Open time
            </li>;
            const block = item.block, meta = BLOCK_TYPE_META[block.type];
            return <li key={block.id}>
              <button type="button" aria-haspopup="dialog" aria-expanded={editing?.day === day && editing.blockId === block.id}
                onClick={(event) => edit({ day, blockId: block.id, anchor: event.currentTarget })}
                style={{ backgroundColor: meta.fill, borderColor: meta.border }}
                className="min-h-11 w-full rounded-lg border-l-2 p-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2">
                <span className={cx(NUM, MUTED, "block text-[12px]")}>{formatRange(block)}</span>
                <span className="mt-1 block break-words">{block.name}</span>
                {block.name !== meta.label && <span className={cx(MUTED, "block text-[12px]")}>{meta.label}</span>}
              </button>
            </li>;
          })}
        </ol>
      </div>
      <Popover anchor={editing?.anchor ?? copying?.anchor ?? null} label={editing ? `${dayName(editing.day)} block` : "Copy day"} onDismiss={dismiss}>
        {editing && <BlockEditor key={`${editing.day}:${editing.blockId}`} block={editing.block}
          title={`${dayName(editing.day)} · ${editing.isNew ? "Add block" : "Edit block"}`} onCancel={dismiss}
          onCommit={(block) => apply((current) => {
            const exists = current.week[editing.day].some((item) => item.id === block.id);
            if (editing.isNew ? exists : !exists) return { ok: false, issues: [{ field: "blockId", message: "This day changed in another tab. Cancel and reopen the editor." }] };
            return upsertBlock(current, editing.day, block);
          }, `${dayName(editing.day)} updated.`)}
          onRemove={editing.isNew ? undefined : () => apply((current) => removeBlock(current, editing.day, editing.blockId), `${dayName(editing.day)} block removed; the time is now open.`)} />}
        {copying && <form onSubmit={(event) => {
          event.preventDefault();
          setCopyIssues(apply((current) => copyDay(current, copying.source, copying.target), `${dayName(copying.source)} copied to ${dayName(copying.target)}.`));
        }}>
          <h2 className="text-sm font-semibold">Copy {dayName(copying.source)}</h2>
          <label className="mt-3 block text-[12px]">Destination
            <select autoFocus value={copying.target} onChange={(event) => {
              setCopying({ ...copying, target: Number(event.target.value) as DayOfWeek });
              setCopyIssues([]);
            }} className={cx(FIELD, "mt-1 min-h-11 border-black/10 dark:border-white/15")}>
              {WEEK_DAYS.filter((value) => value !== copying.source).map((value) => <option key={value} value={value}>{dayName(value)}</option>)}
            </select>
          </label>
          <p className={cx(MUTED, "mt-3 text-[13px]")}>Replace all {dayName(copying.target)} blocks with {dayName(copying.source)} blocks? This repeats every week. Other days and Calendar events stay unchanged.</p>
          {copyIssues.map((issue, index) => <p key={index} role="alert" className="mt-2 text-[12px]">{issue.message}</p>)}
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={dismiss} className={cx(BUTTON, "min-h-11")}>Cancel</button>
            <button type="submit" className={cx(BUTTON, "min-h-11 border border-black/10 dark:border-white/15")}>Replace {dayName(copying.target)}</button>
          </div>
        </form>}
      </Popover>
    </section>
  );
}
