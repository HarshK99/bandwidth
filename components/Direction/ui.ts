// components/Direction/ui.ts
// Shared class strings for the Direction feature, so Today / Week / Settings
// stay one visual system. Monochrome zinc plus a single muted green accent,
// which is reserved for one meaning: *now*. Hierarchy comes from type scale,
// weight and space — not from colour or containers.

/**
 * Tiny tracked caption: block names, column headers, section titles.
 * Tracking is tighter than a grotesque would take — Manrope's uppercase is
 * already wide, and 0.16em opened it into a rash of loose letters.
 */
export const LABEL = "text-[11px] font-semibold uppercase tracking-[0.11em]";
/** Even quieter caption, for meta lines inside dense UI. */
export const LABEL_XS = "text-[10px] font-semibold uppercase tracking-[0.09em]";

/**
 * Digits that sit in a column. Right-aligned as well, so the column stays
 * flush even if the face's tabular figures aren't available.
 */
export const NUM = "tabular-nums";

export const STRONG = "text-zinc-900 dark:text-zinc-100";
export const MUTED = "text-zinc-500 dark:text-zinc-400";
export const FAINT = "text-zinc-400 dark:text-zinc-500";

/**
 * Inline text field: invisible until you touch it. Editing should feel like
 * correcting a line of text, not filling in a form.
 */
export const FIELD =
  "min-h-8 w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm " +
  "transition-colors hover:border-black/10 focus:border-black/20 focus:bg-black/[0.02] " +
  "focus:outline-none dark:hover:border-white/15 dark:focus:border-white/25 " +
  "dark:focus:bg-white/[0.04]";

/** Quiet action — the default for everything. */
export const BUTTON =
  "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-full px-2.5 text-[13px] " +
  "text-zinc-600 transition-colors hover:bg-black/[0.05] hover:text-zinc-900 " +
  "disabled:pointer-events-none disabled:opacity-30 " +
  "dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-zinc-100";

/** Text-only action that sits in body copy. */
export const BUTTON_INLINE =
  "text-[13px] text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-900 " +
  "hover:underline dark:text-zinc-400 dark:hover:text-zinc-100";

/** Raised panel (popover). Softer corners and a deeper, wider shadow than
 *  a hairline box — it should read as a card lifted off the page. */
export const SURFACE =
  "rounded-2xl border border-black/[0.07] bg-white shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] " +
  "dark:border-white/10 dark:bg-[#141414]";

/** A block, field group or cell resting on the page. */
export const CARD =
  "rounded-2xl border border-black/[0.07] bg-surface dark:border-white/[0.08]";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
