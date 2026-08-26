"use client";

import { BLOCK_TYPE_META } from "@/lib/direction/block-types";
import { blockDurationMinutes, formatDuration } from "@/lib/direction/schedule";
import type { DayEntry, RulerTick } from "@/lib/direction/schedule";
import { cx, FAINT, LABEL_XS, MUTED, NUM } from "./ui";

interface TimelineRowProps {
  entry: DayEntry;
  isNext: boolean;
  isLast: boolean;
  /** The block before this one ends exactly when it starts. */
  attachedAbove: boolean;
  /** The block after this one starts exactly when it ends. */
  attachedBelow: boolean;
  /** Hour marks falling inside this block, from `getDayRuler`. */
  ticks: RulerTick[];
}

/**
 * A block's box height, in px, from its duration.
 *
 * Linear enough to actually feel — 3h is roughly double 1h — but capped, so
 * the 8-hour sleep block doesn't turn the page into a scroll marathon.
 *
 * This is the *only* thing that may set a non-current card's height: a two-
 * line note used to be able to push a 1-hour block visibly taller than a
 * 1.5-hour block sitting next to it with a one-line note, which quietly broke
 * the one promise this number makes — that height tracks duration. The card
 * now shrinks its own text to fit this instead of growing past it; see
 * `pickLeadTier` below. The live block is the deliberate exception: it's a
 * min-height there, so the block you're actually in takes whatever room its
 * content needs at display size.
 */
function boxHeight(minutes: number): number {
  return Math.round(Math.min(190, 62 + 0.62 * Math.max(0, minutes)));
}

/**
 * Pick the smallest lead size that plausibly fits a resting card's text in
 * its fixed box (see boxHeight above). Clamping to a fixed number of lines
 * used to hide the overflow instead of solving it — a bulleted note would
 * cut off mid-word with no ellipsis, because `-webkit-line-clamp` on a list
 * of block-level `<li>`s doesn't reliably clip at a line boundary the way it
 * does on plain text. Shrinking the type is what the box actually has room
 * to offer: every word stays visible.
 *
 * There's no live DOM measurement here, only an estimate — chars-per-line
 * and line-height are guesses at this card's typical width, not a real
 * layout pass. That's a deliberate trade, not an oversight: the constants
 * below are the only thing to retune if real rendering disagrees.
 */
const LEAD_TIERS = [
  { cls: "text-[17px] leading-snug", lineHeight: 23, charsPerLine: 24 },
  { cls: "text-[15px] leading-snug", lineHeight: 21, charsPerLine: 27 },
  { cls: "text-[13px] leading-snug", lineHeight: 18, charsPerLine: 32 },
] as const;

const CARD_PAD = 24; // py-3, top + bottom
const EYEBROW_ROW = 16; // the block-name row above the lead
const LEAD_GAP = 6; // mt-1.5 above the lead
const CAPTION_GAP = 6; // mt-1.5 above the caption
const CAPTION_LINE = 16; // the caption's own single line
const BULLET_GAP = 4; // space-y-1 between bullets

function linesFor(text: string, charsPerLine: number): number {
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

function leadHeight(lead: string[], tier: (typeof LEAD_TIERS)[number]): number {
  if (lead.length <= 1) {
    return linesFor(lead[0] ?? "", tier.charsPerLine) * tier.lineHeight;
  }
  const perLine = lead.reduce(
    (sum, line) => sum + linesFor(line, tier.charsPerLine) * tier.lineHeight,
    0
  );
  return perLine + (lead.length - 1) * BULLET_GAP;
}

function pickLeadTier(
  lead: string[],
  hasCaption: boolean,
  boxHeightPx: number
): (typeof LEAD_TIERS)[number] {
  const budget =
    boxHeightPx -
    CARD_PAD -
    EYEBROW_ROW -
    LEAD_GAP -
    (hasCaption ? CAPTION_GAP + CAPTION_LINE : 0);
  return (
    LEAD_TIERS.find((tier) => leadHeight(lead, tier) <= budget) ??
    LEAD_TIERS[LEAD_TIERS.length - 1]
  );
}

/** Corners are rounded only where a run of touching blocks begins and ends. */
function radiusClass(attachedAbove: boolean, attachedBelow: boolean): string {
  if (attachedAbove && attachedBelow) return "rounded-none";
  if (attachedAbove) return "rounded-b-2xl";
  if (attachedBelow) return "rounded-t-2xl";
  return "rounded-2xl";
}

export default function TimelineRow({
  entry,
  isNext,
  isLast,
  attachedAbove,
  attachedBelow,
  ticks,
}: TimelineRowProps) {
  const { block, name, focus, notes, serves, status, minutesRemaining, progress, isOverride } =
    entry;
  const meta = BLOCK_TYPE_META[block.type];
  const isCurrent = status === "current";
  const isPast = status === "past";
  const relaxed = meta.tone === "relaxed";

  // What the block is *for* leads; the area explains it underneath; the
  // block's own name is the quiet eyebrow above both. A block with neither
  // (sleep, lunch) promotes its name into the lead so the card is never
  // headed by nothing.
  const lead = notes.length > 0 ? notes : focus ? [focus] : [];
  const caption = notes.length > 0 ? focus : "";
  const nameIsLead = lead.length === 0;
  const multi = lead.length > 1;

  // Only a resting card's size is content-driven — the live block always
  // reads at its own display size, unconstrained.
  const restingTier = pickLeadTier(lead, Boolean(caption), boxHeight(blockDurationMinutes(block)));

  const leadClass = cx(
    isCurrent
      ? multi
        ? "text-[1.35rem] leading-[1.25] sm:text-[1.6rem]"
        : "text-[1.9rem] leading-[1.1] tracking-[-0.025em] text-balance sm:text-[2.6rem]"
      : restingTier.cls,
    // Relaxed blocks never take extra weight — thinking and hobby time
    // shouldn't shout, even when it's the live block.
    relaxed ? "font-medium" : isCurrent ? "font-extrabold" : "font-semibold",
    isCurrent
      ? "text-white"
      : isPast
        ? MUTED
        : "text-zinc-800 dark:text-zinc-100"
  );

  const captionClass = cx(
    "font-medium",
    isCurrent ? "text-[15px] text-white/70 sm:text-base" : "text-[12px]",
    !isCurrent && (isPast ? FAINT : MUTED)
  );

  return (
    <li
      className={cx(
        "grid grid-cols-[3.25rem_1rem_minmax(0,1fr)] sm:grid-cols-[3.5rem_1.25rem_minmax(0,1fr)]",
        attachedBelow ? "pb-0" : "pb-3"
      )}
    >
      {/* Time — a continuous hour ruler rather than this block's own range.
          Each mark sits at its proportional position *inside* the block, so
          the clock never skips even though block heights don't scale with
          duration. */}
      <div className="relative">
        {ticks.map((tick) => (
          <span
            key={`${tick.offset}-${tick.label}`}
            className={cx(
              NUM,
              "absolute right-2 text-[11px] leading-none font-medium whitespace-nowrap sm:right-2.5",
              isCurrent ? "text-accent" : FAINT,
              tick.offHour && "opacity-60"
            )}
            style={{ top: `${tick.offset * 100}%`, transform: "translateY(-50%)" }}
          >
            {tick.label}
          </span>
        ))}
      </div>

      {/* Rail */}
      <div className="relative flex justify-center" aria-hidden>
        <div
          className={cx(
            "absolute w-px bg-black/[0.09] dark:bg-white/[0.12]",
            isLast ? "top-0 h-6" : "inset-y-0"
          )}
        />
        {isCurrent ? (
          // The rail beside the live block doubles as the clock: it fills as
          // the block runs out. No calendar grid, no numbers.
          <div
            className={cx(
              "absolute top-0 w-[3px] overflow-hidden rounded-full bg-accent/20",
              attachedBelow ? "bottom-0" : "bottom-3"
            )}
          >
            <div
              className="w-full bg-accent transition-[height] duration-500"
              style={{ height: `${Math.max(2, Math.min(100, progress * 100))}%` }}
            />
          </div>
        ) : (
          <div
            className={cx(
              "absolute top-0 h-[7px] w-[7px] -translate-y-1/2 rounded-full border",
              isPast
                ? "border-transparent bg-black/20 dark:bg-white/25"
                : "border-black/20 bg-[var(--background)] dark:border-white/25"
            )}
          />
        )}
      </div>

      {/* The block itself. Touching blocks overlap by a pixel so their
          borders collapse into one hairline and the run reads as continuous
          time — a visible gap then means there really is one. */}
      <div
        className={cx(
          "relative flex flex-col border transition-colors",
          // The live block is lifted out of the run — fully rounded and
          // raised — so it reads as a card sitting on the stack rather than
          // a mid-run segment with square corners.
          isCurrent ? "rounded-2xl" : radiusClass(attachedAbove, attachedBelow),
          attachedAbove && "-mt-px",
          isCurrent
            ? // The block you're in: the one saturated surface in the app.
              "grain z-10 overflow-hidden border-transparent bg-linear-to-br " +
              "from-hero-from to-hero-to px-4 py-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]"
            : "overflow-hidden px-3.5 py-3"
        )}
        style={{
          // Fixed for a resting card — its text clamps instead of growing
          // past this, so height stays a true reading of duration. The live
          // block keeps it as a floor: it's the one card whose content should
          // win.
          [isCurrent ? "minHeight" : "height"]: boxHeight(
            blockDurationMinutes(block)
          ),
          // The type colours the whole box, not just its edge: a hairline is
          // read second, a fill is read first, and telling a day's blocks
          // apart at a glance is the whole job. The live block is the
          // exception — it has its own surface, and its type is already the
          // loudest thing on the screen.
          ...(isCurrent
            ? null
            : { backgroundColor: meta.fill, borderColor: meta.border }),
        }}
      >
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h3
            className={cx(
              nameIsLead
                ? leadClass
                : cx(
                    LABEL_XS,
                    isCurrent
                      ? "text-white/60"
                      : isPast
                        ? FAINT
                        : MUTED
                  )
            )}
          >
            {name}
          </h3>
          {isCurrent && (
            <>
              <span className={cx(LABEL_XS, "text-white")}>Now</span>
              <span className={cx(NUM, "text-[11px] font-medium text-white/60")}>
                {formatDuration(minutesRemaining)} left
              </span>
            </>
          )}
          {isNext && <span className={cx(LABEL_XS, FAINT)}>Next</span>}
          {isOverride && (
            <span
              title="Overrides the weekly template for this date"
              className={cx(LABEL_XS, FAINT)}
            >
              Override
            </span>
          )}
        </div>

        {/* Sized rather than clipped: a resting card's type shrinks to what
            pickLeadTier estimates will fit (see above), so a wordy note
            stays fully readable instead of being cut off mid-word. The live
            block is never resized — its box grows to fit instead. */}
        {!nameIsLead &&
          (multi ? (
            <ul className={cx(leadClass, "mt-1.5 space-y-1")}>
              {lead.map((line) => (
                <li key={line} className="flex gap-2">
                  <span aria-hidden className="opacity-40">
                    &bull;
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={cx(leadClass, "mt-1.5")}>{lead[0]}</p>
          ))}

        {caption && (
          <p className={cx(captionClass, "mt-1.5", !isCurrent && "line-clamp-1")}>
            {caption}
            {/* Where this session's output is aimed, when that isn't where
                the work sits in the tree. */}
            {serves && <span className="opacity-60"> → {serves}</span>}
          </p>
        )}
      </div>
    </li>
  );
}
