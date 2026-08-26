"use client";

import { useState } from "react";
import { cx, FAINT, FIELD, LABEL_XS } from "./ui";

interface FocusEditorProps {
  /** Context line, e.g. "Monday · Execution". */
  title: string;
  initialValue: string;
  suggestions: string[];
  /** Shown when there is something to remove (an area, or an override). */
  clearLabel: string | null;
  onCommit: (focus: string) => void;
  onClear: () => void;
  onCancel: () => void;
}

/**
 * The feature's only text-entry surface: one line, some one-tap areas, and
 * nothing else. Enter commits, Escape cancels, and clicking away commits —
 * whichever way you leave, you don't lose the edit.
 *
 * Callers key this by the cell being edited so a new selection remounts it.
 */
export default function FocusEditor({
  title,
  initialValue,
  suggestions,
  clearLabel,
  onCommit,
  onClear,
  onCancel,
}: FocusEditorProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onCommit(value);
      }}
    >
      <div className={cx(LABEL_XS, FAINT)}>{title}</div>

      <input
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
          }
        }}
        placeholder="Area / focus"
        aria-label="Area or focus"
        className={cx(FIELD, "mt-2 border-black/10 dark:border-white/15")}
      />

      {suggestions.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onCommit(suggestion)}
              className="rounded-full border border-black/10 px-2 py-0.5 text-[11px] text-zinc-600 transition-colors hover:border-accent/40 hover:text-zinc-900 dark:border-white/15 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {clearLabel && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onClear}
            className={cx("text-[11px] transition-colors", FAINT, "hover:text-zinc-900 dark:hover:text-zinc-100")}
          >
            {clearLabel}
          </button>
        </div>
      )}
    </form>
  );
}
