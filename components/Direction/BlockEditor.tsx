"use client";

import { useId, useState } from "react";
import { BLOCK_TYPES, BLOCK_TYPE_META } from "@/lib/direction/block-types";
import type { BlockType, PlanIssue, TimeBlock } from "@/lib/direction/types";
import { BUTTON, cx, FIELD, MUTED } from "./ui";

interface BlockEditorProps {
  title: string;
  block: TimeBlock;
  onCommit: (block: TimeBlock) => PlanIssue[];
  onRemove?: () => PlanIssue[];
  onCancel: () => void;
}
export default function BlockEditor({ title, block, onCommit, onRemove, onCancel }: BlockEditorProps) {
  const [draft, setDraft] = useState(block);
  const [issues, setIssues] = useState<PlanIssue[]>([]);
  const id = useId();
  const errors = (field: string) => issues.filter((issue) => issue.field === field).map((issue) => issue.message).join(" ");
  const changeMode = (type: BlockType) => setDraft((current) => ({
    ...current, type,
    name: !current.name.trim() || BLOCK_TYPES.some((mode) => BLOCK_TYPE_META[mode].label === current.name)
      ? BLOCK_TYPE_META[type].label : current.name,
  }));
  return (
    <form noValidate onSubmit={(event) => {
      event.preventDefault();
      const nextIssues = onCommit(draft);
      setIssues(nextIssues);
      if (nextIssues.length) {
        const field = event.currentTarget.elements.namedItem(nextIssues[0].field);
        if (field instanceof HTMLElement) field.focus();
      }
    }}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className={cx("mt-1 text-[12px]", MUTED)}>07:00 to next 07:00 · times in 24-hour format</p>
      {(["name", "start", "end"] as const).map((field) => (
        <div key={field} className="mt-3">
          <label htmlFor={`${id}-${field}`} className="text-[12px]">{field === "name" ? "Name" : field === "start" ? "Start" : "End"}</label>
          <input id={`${id}-${field}`} name={field} autoFocus={field === "name"} type="text"
            placeholder={field === "name" ? "Block name" : "HH:MM"} value={draft[field]}
            onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))}
            aria-invalid={Boolean(errors(field))} aria-describedby={errors(field) ? `${id}-${field}-error` : undefined}
            className={cx(FIELD, "mt-1 min-h-11 border-black/10 dark:border-white/15")} />
          {errors(field) && <p id={`${id}-${field}-error`} role="alert" className="mt-1 text-[12px]">{errors(field)}</p>}
        </div>
      ))}
      <label className="mt-3 block text-[12px]">
        Mode
        <select name="type" value={draft.type} onChange={(event) => changeMode(event.target.value as BlockType)}
          aria-invalid={Boolean(errors("type"))} aria-describedby={errors("type") ? `${id}-type-error` : undefined}
          className={cx(FIELD, "mt-1 min-h-11 border-black/10 dark:border-white/15")}>
          {BLOCK_TYPES.map((value) => <option key={value} value={value}>{BLOCK_TYPE_META[value].label}</option>)}
        </select>
      </label>
      {errors("type") && <p id={`${id}-type-error`} role="alert" className="mt-1 text-[12px]">{errors("type")}</p>}
      {issues.filter((issue) => !["name", "start", "end", "type"].includes(issue.field)).map((issue, index) => (
        <p key={index} role="alert" className="mt-2 text-[12px]">{issue.message}</p>
      ))}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {onRemove && <button type="button" onClick={() => setIssues(onRemove())} className={cx(BUTTON, "mr-auto min-h-11")}>Remove</button>}
        <button type="button" onClick={onCancel} className={cx(BUTTON, "min-h-11")}>Cancel</button>
        <button type="submit" className={cx(BUTTON, "min-h-11 border border-black/10 dark:border-white/15")}>Save</button>
      </div>
    </form>
  );
}
