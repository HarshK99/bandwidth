"use client";

import { useMemo, useState } from "react";
import { BLOCK_TYPES, BLOCK_TYPE_META } from "@/lib/direction/block-types";
import { getCoverageRows, type CoverageRow } from "@/lib/direction/coverage";
import { formatHours } from "@/lib/direction/rollup";
import type { BlockType } from "@/lib/direction/types";
import { useDirectionPlan } from "./useDirectionPlan";
import { CARD, cx, FAINT, FIELD, LABEL, LABEL_XS, MUTED, STRONG } from "./ui";

/** Master functions and their categories open; stages are a click away. */
const DEFAULT_OPEN_DEPTH = 1;

/**
 * Every id a type filter should keep: nodes directly scheduled in a block of
 * that type, their ancestors (so the path down to a match stays legible),
 * and their descendants (so a matching stage still shows what it names —
 * Payment matching keeps Invoicing and Chase + reconcile visible under it,
 * even though those individual tasks never carry a slot of their own; see
 * CoverageRow.slotTypes).
 */
function matchedIds(rows: CoverageRow[], type: BlockType): Set<string> {
  const direct = new Set(rows.filter((row) => row.slotTypes.includes(type)).map((row) => row.node.id));
  const parentOf = new Map(rows.map((row) => [row.node.id, row.parentId]));

  const included = new Set(direct);

  // Ancestors: walk up from every direct match.
  for (const id of direct) {
    let parent = parentOf.get(id) ?? null;
    while (parent && !included.has(parent)) {
      included.add(parent);
      parent = parentOf.get(parent) ?? null;
    }
  }

  // Descendants: rows are depth-first, so a match's subtree is the run of
  // rows right after it whose depth is greater — no second tree walk needed.
  let openMatchDepth: number | null = null;
  for (const row of rows) {
    if (direct.has(row.node.id)) {
      openMatchDepth = row.depth;
    } else if (openMatchDepth !== null && row.depth > openMatchDepth) {
      included.add(row.node.id);
    } else {
      openMatchDepth = null;
    }
  }

  return included;
}

export default function CoverageView() {
  const { plan } = useDirectionPlan();
  const rows = useMemo(() => (plan ? getCoverageRows(plan) : null), [plan]);
  /** Ids whose open/closed state differs from the depth default. */
  const [toggled, setToggled] = useState<Set<string>>(new Set());
  /** "" is the unfiltered, everything-shown state. */
  const [filterType, setFilterType] = useState<BlockType | "">("");

  const included = useMemo(
    () => (rows && filterType ? matchedIds(rows, filterType) : null),
    [rows, filterType]
  );

  if (!rows) return <div className="h-40" aria-hidden />;

  const isOpen = (row: CoverageRow) => {
    if (included) return true; // a filter's whole point is nothing to click open
    const openByDefault = row.depth <= DEFAULT_OPEN_DEPTH;
    return toggled.has(row.node.id) ? !openByDefault : openByDefault;
  };

  // A row shows when every ancestor is open. Walking the flat list keeps this
  // O(n) and avoids rebuilding a nested tree on every toggle. Under a filter,
  // "open" is unconditionally true above, so this reduces to "is it included."
  const visible: CoverageRow[] = [];
  const openIds = new Set<string | null>([null]);
  for (const row of rows) {
    if (included && !included.has(row.node.id)) continue;
    if (!openIds.has(row.parentId)) continue;
    visible.push(row);
    if (row.hasChildren && isOpen(row)) openIds.add(row.node.id);
  }

  const gaps = rows.filter((row) => row.state === "gap" && row.node.kind !== "task");

  const toggle = (row: CoverageRow) => {
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(row.node.id)) next.delete(row.node.id);
      else next.add(row.node.id);
      return next;
    });
  };

  return (
    <section className="mx-auto w-full max-w-3xl px-3 pt-6 pb-20 sm:px-6 sm:pt-8">
      <header className="flex items-center justify-between gap-4">
        <div className={cx(LABEL, FAINT)}>Coverage</div>
        <select
          value={filterType}
          onChange={(event) => setFilterType(event.target.value as BlockType | "")}
          aria-label="Filter by block type"
          className={cx(FIELD, "w-auto max-w-[9.5rem] cursor-pointer appearance-none text-[13px]")}
        >
          <option value="">All types</option>
          {BLOCK_TYPES.map((type) => (
            <option key={type} value={type}>
              {BLOCK_TYPE_META[type].label}
            </option>
          ))}
        </select>
      </header>

      {visible.length === 0 ? (
        <p className={cx("mt-6 text-[13px]", MUTED)}>
          Nothing is scheduled in a {BLOCK_TYPE_META[filterType as BlockType].label}-type
          slot right now.
        </p>
      ) : (
        <>
      <ul className={cx(CARD, "mt-4 px-2 py-1 sm:px-3")}>
        {visible.map((row) => {
          const isTask = row.node.kind === "task";
          const open = row.hasChildren && isOpen(row);

          return (
            <li
              key={row.node.id}
              className="border-b border-black/[0.04] last:border-b-0 dark:border-white/[0.06]"
              // A wash per node kind, not per branch: area/stage/task is a
              // fixed, three-value vocabulary the same way block type is on
              // Today, so it stays a structural cue rather than a rainbow
              // key you'd need a legend for.
              style={{ backgroundColor: `var(--kind-${row.node.kind}-fill)` }}
            >
              {/* The whole row toggles — a 12px caret is a poor target, and
                  every part of the row means the same thing. */}
              {(() => {
                const inner = (
                  <>
                    <div
                      className="flex min-w-0 items-baseline gap-1.5"
                      style={{ paddingLeft: `${row.depth * 0.9}rem` }}
                    >
                      <span
                        aria-hidden
                        className={cx(
                          "-ml-3.5 w-3 shrink-0 text-[9px]",
                          row.hasChildren ? FAINT : "opacity-0"
                        )}
                      >
                        {open ? "▾" : "▸"}
                      </span>

                      <span
                        className={cx(
                          "min-w-0 truncate",
                          row.depth === 0
                            ? cx(LABEL, STRONG)
                            : isTask
                              ? "text-[12px]"
                              : "text-[13px]",
                          row.depth === 1 && "font-medium",
                          row.state === "gap"
                            ? "text-zinc-400 dark:text-zinc-500"
                            : row.state === "inherited"
                              ? MUTED
                              : ""
                        )}
                      >
                        {row.node.label}
                      </span>

                      {row.state === "gap" && (
                        <span className={cx(LABEL_XS, "shrink-0 text-accent")}>
                          no time
                        </span>
                      )}

                      {row.slots.length > 0 && (
                        <span className={cx("truncate text-[11px]", FAINT)}>
                          {row.slots.join(", ")}
                        </span>
                      )}
                    </div>

                    <span
                      className={cx(
                        "text-right text-[12px] tabular-nums",
                        row.state === "covered"
                          ? row.depth === 0
                            ? STRONG
                            : MUTED
                          : FAINT
                      )}
                    >
                      {row.state === "covered"
                        ? formatHours(row.minutes)
                        : row.state === "inherited"
                          ? "↑"
                          : "—"}
                      {row.viaMinutes > 0 && (
                        <span className={cx("ml-1.5 text-[10px]", FAINT)}>
                          +{formatHours(row.viaMinutes)}
                        </span>
                      )}
                    </span>
                  </>
                );

                const layout =
                  "grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 py-1.5";

                return row.hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggle(row)}
                    aria-expanded={open}
                    className={cx(
                      layout,
                      "rounded-lg px-1 text-left transition-colors",
                      "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                    )}
                  >
                    {inner}
                  </button>
                ) : (
                  <div className={cx(layout, "px-1")}>{inner}</div>
                );
              })()}
            </li>
          );
        })}
      </ul>

      <p className={cx("mt-4 text-[12px] leading-relaxed", FAINT)}>
        <span className="tabular-nums">↑</span> means the work happens inside a
        parent&apos;s hours without a block naming it — real time, just not called
        out. Blocks point at stages, never at individual tasks.
      </p>
        </>
      )}

      {/* The audit framing closes the page rather than opening it — with a
          filter in hand this is a "find a substitute" tool first, and the
          whole-tree question is the thing you leave with, not the thing you
          arrive to. */}
      <footer className="mt-10 border-t border-black/[0.07] pt-5 dark:border-white/[0.09]">
        <h2 className={cx("text-[15px] font-medium tracking-[-0.01em]", STRONG)}>
          Does everything have a place?
        </h2>
        {gaps.length > 0 && (
          <p className={cx("mt-2 text-[13px]", MUTED)}>
            {gaps.length} {gaps.length === 1 ? "part" : "parts"} of the tree get no
            time: {gaps.map((row) => row.node.label).join(", ")}.
          </p>
        )}
      </footer>
    </section>
  );
}
