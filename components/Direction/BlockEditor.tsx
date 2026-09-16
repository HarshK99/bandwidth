"use client";

import { useState } from "react";
import { BLOCK_TYPES, BLOCK_TYPE_META } from "@/lib/direction/block-types";
import type { BlockType } from "@/lib/direction/types";
import { BUTTON, cx, FIELD, MUTED } from "./ui";

interface BlockEditorProps {
  title: string;
  type: BlockType;
  onCommit: (type: BlockType) => string | null;
  onCancel: () => void;
}
export default function BlockEditor({ title, type, onCommit, onCancel }: BlockEditorProps) {
  const [mode, setMode] = useState(type);
  const [error, setError] = useState<string | null>(null);
  return (
    <form onSubmit={(event) => { event.preventDefault(); setError(onCommit(mode)); }}>
      <p className={cx("text-[12px] leading-snug", MUTED)}>{title}</p>
      <label className="mt-3 block text-[12px]">
        Mode
        <select autoFocus value={mode} onChange={(event) => { setMode(event.target.value as BlockType); setError(null); }}
          aria-invalid={Boolean(error)} aria-describedby={error ? "block-mode-error" : undefined}
          className={cx(FIELD, "mt-1 min-h-10 border-black/10 dark:border-white/15")}>
          {BLOCK_TYPES.map((value) => <option key={value} value={value}>{BLOCK_TYPE_META[value].label}</option>)}
        </select>
      </label>
      {error && <p id="block-mode-error" role="alert" className="mt-2 text-[12px]">{error}</p>}
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={cx(BUTTON, "min-h-10")}>Cancel</button>
        <button type="submit" className={cx(BUTTON, "min-h-10 border border-black/10 dark:border-white/15")}>Save</button>
      </div>
    </form>
  );
}
