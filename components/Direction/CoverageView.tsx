"use client";

import { useMemo, useState } from "react";
import { getCoverageRows, type CoverageRow } from "@/lib/direction/coverage";
import { formatHours } from "@/lib/direction/rollup";
import { useDirectionPlan } from "./useDirectionPlan";
import { CARD, cx, FAINT, LABEL, LABEL_XS, MUTED, STRONG } from "./ui";

/** Master functions and their categories open; stages are a click away. */
const DEFAULT_OPEN_DEPTH = 1;

export default function CoverageView() {
  const { plan } = useDirectionPlan();
  const rows = useMemo(() => (plan ? getCoverageRows(plan) : null), [plan]);
  /** Ids whose open/closed state differs from the depth default. */
  const [toggled, setToggled] = useState<Set<string>>(new Set());

  if (!rows) return <div className="h-40" aria-hidden />;

  const isOpen = (row: CoverageRow) => {
    const openByDefault = row.depth <= DEFAULT_OPEN_DEPTH;
    return toggled.has(row.node.id) ? !openByDefault : openByDefault;
  };

  // A row shows when every ancestor is open. Walking the flat list keeps this
  // O(n) and avoids rebuilding a nested tree on every toggle.
  const visible: CoverageRow[] = [];
  const openIds = new Set<string | null>([null]);
  for (const row of rows) {
    if (!openIds.has(row.parentId)) continue;
    visible.push(row);
    if (row.hasChildren && isOpen(row)) openIds.add(row.node.id);
  }

  const gaps = rows.filter((row) => row.state === "gap" && row.node.level !== "task");

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
      <header>
        <div className={cx(LABEL, FAINT)}>Coverage</div>
        <h1 className={cx("mt-1.5 text-[15px] font-medium tracking-[-0.01em]", STRONG)}>
          Does everything have a place?
        </h1>
        {gaps.length > 0 && (
          <p className={cx("mt-2 text-[13px]", MUTED)}>
            {gaps.length} {gaps.length === 1 ? "part" : "parts"} of the tree get no
            time: {gaps.map((row) => row.node.label).join(", ")}.
          </p>
        )}
      </header>

      <ul className={cx(CARD, "mt-6 px-2 py-1 sm:px-3")}>
        {visible.map((row) => {
          const isTask = row.node.level === "task";
          const open = row.hasChildren && isOpen(row);

          return (
            <li
              key={row.node.id}
              className="border-b border-black/[0.04] last:border-b-0 dark:border-white/[0.06]"
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
    </section>
  );
}
