"use client";

import { BLOCK_TYPE_META } from "@/lib/direction/block-types";
import {
  assignmentKey,
  dayName,
  formatRange,
  indexAssignments,
  shortDayName,
  sortBlocks,
  WEEK_DAYS,
} from "@/lib/direction/schedule";
import { getFocusSuggestions } from "@/lib/direction/focus";
import { setAssignment } from "@/lib/direction/plan-ops";
import type { DayOfWeek, DirectionPlan } from "@/lib/direction/types";
import FocusEditor from "./FocusEditor";
import Popover from "./Popover";
import { CARD, cx, FAINT, LABEL, LABEL_XS, MUTED, NUM } from "./ui";

export interface EditingCell {
  blockId: string;
  day: DayOfWeek;
  /** The clicked cell, so the popover can anchor to it. */
  anchor: HTMLElement;
}

interface WeekGridProps {
  plan: DirectionPlan;
  today: DayOfWeek | null;
  editing: EditingCell | null;
  onEdit: (cell: EditingCell | null) => void;
  update: (fn: (plan: DirectionPlan) => DirectionPlan) => void;
}

/**
 * The week as a rhythm, not a calendar: rows are the recurring blocks,
 * columns are days, and a cell holds one thing — the area that block points
 * at. No durations, no proportional heights, no events.
 */
export default function WeekGrid({
  plan,
  today,
  editing,
  onEdit,
  update,
}: WeekGridProps) {
  const days = WEEK_DAYS;
  const blocks = sortBlocks(plan.blocks);
  const index = indexAssignments(plan.assignments);
  const suggestions = getFocusSuggestions(plan, 6);

  const columns = `minmax(8rem, 1fr) repeat(${days.length}, minmax(6rem, 1fr))`;

  const editingBlock = editing
    ? (blocks.find((block) => block.id === editing.blockId) ?? null)
    : null;
  const editingFocus = editing
    ? (index.get(assignmentKey(editing.day, editing.blockId))?.focus ?? "")
    : "";

  const commit = (blockId: string, day: DayOfWeek, focus: string) => {
    update((current) => setAssignment(current, day, blockId, focus));
    onEdit(null);
  };

  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8">
      <div className={cx(CARD, "min-w-[52rem] overflow-hidden")}>
        {/* Day header */}
        <div
          className="grid border-b border-black/[0.07] px-1 pt-3 pb-2.5 dark:border-white/[0.08]"
          style={{ gridTemplateColumns: columns }}
        >
          <div />
          {days.map((day) => {
            const isToday = day === today;
            const isWeekend = day === 0 || day === 6;
            return (
              <div
                key={day}
                className={cx(
                  LABEL_XS,
                  "px-2.5",
                  isToday
                    ? "text-accent"
                    : isWeekend
                      ? FAINT
                      : "text-zinc-600 dark:text-zinc-400"
                )}
              >
                {shortDayName(day)}
              </div>
            );
          })}
        </div>

        {/* One row per block */}
        {blocks.map((block) => {
          const meta = BLOCK_TYPE_META[block.type];
          return (
            <div
              key={block.id}
              className="grid border-b border-black/[0.05] px-1 last:border-b-0 dark:border-white/[0.07]"
              style={{ gridTemplateColumns: columns }}
            >
              <div className="py-3.5 pr-4 pl-2.5">
                <div className={cx(NUM, "text-[11px] font-medium", FAINT)}>
                  {formatRange(block)}
                </div>
                <div
                  className={cx(
                    LABEL,
                    "mt-1",
                    meta.tone === "relaxed" && "font-normal tracking-[0.13em]",
                    meta.emphasis === "strong"
                      ? "text-zinc-700 dark:text-zinc-300"
                      : MUTED
                  )}
                >
                  {block.name}
                </div>
              </div>

              {days.map((day) => {
                const assignment = index.get(assignmentKey(day, block.id));
                const focus = assignment?.focus ?? "";
                // A day that renames the slot says so, quietly, above the
                // area — that difference is part of the week's shape.
                const label =
                  assignment?.label && assignment.label !== block.name
                    ? assignment.label
                    : null;
                const isToday = day === today;
                const isOpen =
                  editing?.blockId === block.id && editing.day === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={(event) =>
                      onEdit(
                        isOpen
                          ? null
                          : { blockId: block.id, day, anchor: event.currentTarget }
                      )
                    }
                    aria-label={`${dayName(day)}, ${block.name} — ${focus || "unassigned"}`}
                    className={cx(
                      "group h-full min-h-[3.75rem] rounded-lg px-2.5 py-3.5 text-left text-[13px] leading-snug transition-colors",
                      "border-l border-black/[0.04] dark:border-white/[0.06]",
                      isOpen
                        ? "bg-accent/10"
                        : isToday
                          ? "bg-accent/[0.045] hover:bg-accent/[0.08]"
                          : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                    )}
                  >
                    {label && (
                      <span className={cx(LABEL_XS, "block pb-0.5", FAINT)}>
                        {label}
                      </span>
                    )}
                    {focus ? (
                      <span className="text-zinc-800 dark:text-zinc-200">{focus}</span>
                    ) : label ? null : (
                      <span className="text-transparent transition-colors group-hover:text-zinc-400 dark:group-hover:text-zinc-600">
                        ·
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* One panel for the whole grid — it portals out, so it doesn't need
          to live in the cell it points at. */}
      <Popover anchor={editing?.anchor ?? null} onDismiss={() => onEdit(null)}>
        {editingBlock && editing && (
          <FocusEditor
            key={`${editing.blockId}:${editing.day}:${editingFocus}`}
            title={`${dayName(editing.day)} · ${editingBlock.name}`}
            initialValue={editingFocus}
            suggestions={suggestions}
            clearLabel={editingFocus ? "Clear" : null}
            onCommit={(next) => commit(editing.blockId, editing.day, next)}
            onClear={() => commit(editing.blockId, editing.day, "")}
            onCancel={() => onEdit(null)}
          />
        )}
      </Popover>
    </div>
  );
}
