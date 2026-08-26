"use client";

import { useMemo, useState } from "react";
import { getAreaLabel, getAreaOptions } from "@/lib/direction/nodes";
import { cx, FAINT, FIELD, LABEL_XS, MUTED } from "./ui";

interface FocusEditorProps {
  /** Context line, e.g. "Monday · Second Push". */
  title: string;
  nodeId: string;
  onCommit: (nodeId: string) => void;
  onClear: () => void;
  onCancel: () => void;
}

/**
 * Picks the part of the hierarchy a block points at. A filter box rather than
 * a free-text field: areas are a fixed vocabulary that lives in
 * lib/hierarchy-data.ts, and letting them be typed is how the same area ends
 * up spelled three ways and missing from every total.
 *
 * Callers key this by the cell being edited so a new selection remounts it.
 */
export default function FocusEditor({
  title,
  nodeId,
  onCommit,
  onClear,
  onCancel,
}: FocusEditorProps) {
  const [query, setQuery] = useState("");
  const options = useMemo(() => getAreaOptions(), []);

  const needle = query.trim().toLowerCase();
  const matches = options
    .filter((node) => {
      if (!needle) return true;
      return (
        node.label.toLowerCase().includes(needle) ||
        getAreaLabel(node.id).toLowerCase().includes(needle)
      );
    })
    .slice(0, 7);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (matches[0]) onCommit(matches[0].id);
      }}
    >
      <div className={cx(LABEL_XS, FAINT)}>{title}</div>

      <input
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
          }
        }}
        placeholder="Filter areas"
        aria-label="Filter areas"
        className={cx(FIELD, "mt-2 border-black/10 dark:border-white/15")}
      />

      <ul className="mt-2 max-h-60 overflow-y-auto">
        {matches.map((node) => {
          const area = getAreaLabel(node.id);
          const selected = node.id === nodeId;
          return (
            <li key={node.id}>
              <button
                type="button"
                onClick={() => onCommit(node.id)}
                className={cx(
                  "flex w-full flex-col items-start rounded-lg px-2 py-1.5 text-left transition-colors",
                  selected
                    ? "bg-accent/10 text-zinc-900 dark:text-zinc-100"
                    : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                )}
              >
                <span className="text-[13px]">{node.label}</span>
                {area !== node.label && (
                  <span className={cx("text-[11px]", FAINT)}>{area}</span>
                )}
              </button>
            </li>
          );
        })}
        {matches.length === 0 && (
          <li className={cx("px-2 py-1.5 text-[12px]", MUTED)}>
            Nothing matches — areas come from the hierarchy.
          </li>
        )}
      </ul>

      {nodeId && (
        <div className="mt-2 flex justify-end border-t border-black/[0.07] pt-2 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onClear}
            className={cx("text-[11px] transition-colors", FAINT, "hover:text-zinc-900 dark:hover:text-zinc-100")}
          >
            Clear
          </button>
        </div>
      )}
    </form>
  );
}
