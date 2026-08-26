"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx, SURFACE } from "./ui";

const WIDTH = 244;
/** Rough panel height, used only to decide whether to flip above the anchor. */
const ESTIMATED_HEIGHT = 190;
const GAP = 6;
const MARGIN = 12;

interface PopoverProps {
  /** The element the panel hangs off. null closes it. */
  anchor: HTMLElement | null;
  /** Outside click, Escape, or a scroll — the caller decides what that means. */
  onDismiss: () => void;
  children: ReactNode;
}

/**
 * Small panel anchored to an element, rendered in a portal and positioned
 * fixed. The portal matters: the week grid scrolls horizontally, and a panel
 * inside that container would be clipped by it.
 */
export default function Popover({ anchor, onDismiss, children }: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchor) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchor.contains(target)) return;
      onDismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    // Fixed positioning is measured once, so any scroll detaches the panel.
    const onScroll = () => onDismiss();

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [anchor, onDismiss]);

  // Never rendered on the server: an anchor only exists after a real click.
  if (!anchor) return null;

  const rect = anchor.getBoundingClientRect();
  const flipUp =
    rect.bottom + GAP + ESTIMATED_HEIGHT > window.innerHeight &&
    rect.top > ESTIMATED_HEIGHT;

  const left = Math.max(
    MARGIN,
    Math.min(rect.left, window.innerWidth - WIDTH - MARGIN)
  );
  const top = flipUp ? rect.top - GAP : rect.bottom + GAP;

  return createPortal(
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        left,
        top,
        width: WIDTH,
        transform: flipUp ? "translateY(-100%)" : undefined,
      }}
      className={cx(SURFACE, "z-50 p-3")}
    >
      {children}
    </div>,
    document.body
  );
}
