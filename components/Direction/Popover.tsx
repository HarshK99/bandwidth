"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx, SURFACE } from "./ui";

interface PopoverProps {
  anchor: HTMLElement | null;
  label: string;
  onDismiss: () => void;
  children: ReactNode;
}

/** Native dialog supplies keyboard containment and Escape handling. */
export default function Popover({ anchor, label, onDismiss, children }: PopoverProps) {
  const panelRef = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const position = () => {
      const viewport = window.visualViewport;
      const leftEdge = (viewport?.offsetLeft ?? 0) + 12;
      const topEdge = (viewport?.offsetTop ?? 0) + 12;
      const width = (viewport?.width ?? window.innerWidth) - 24;
      const height = (viewport?.height ?? window.innerHeight) - 24;
      panel.style.width = `${Math.min(320, width)}px`;
      panel.style.maxHeight = `${height}px`;
      const rect = anchor.getBoundingClientRect();
      const size = panel.getBoundingClientRect();
      panel.style.left = `${Math.max(leftEdge, Math.min(rect.left, leftEdge + width - size.width))}px`;
      const preferredTop = rect.bottom + 6 + size.height <= topEdge + height ? rect.bottom + 6 : rect.top - size.height - 6;
      panel.style.top = `${Math.max(topEdge, Math.min(preferredTop, topEdge + height - size.height))}px`;
    };
    panel.showModal();
    position();
    const observer = new ResizeObserver(position);
    observer.observe(panel);
    window.addEventListener("resize", position);
    window.visualViewport?.addEventListener("resize", position);
    window.visualViewport?.addEventListener("scroll", position);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", position);
      window.visualViewport?.removeEventListener("resize", position);
      window.visualViewport?.removeEventListener("scroll", position);
      document.body.style.overflow = previousOverflow;
      panel.close();
    };
  }, [anchor]);

  if (!anchor) return null;
  return createPortal(
    <dialog ref={panelRef} aria-label={label}
      onCancel={(event) => { event.preventDefault(); onDismiss(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onDismiss();
      }}
      className={cx(SURFACE, "fixed inset-auto m-0 max-w-none overflow-y-auto p-4 text-foreground backdrop:bg-black/10")}>
      {children}
    </dialog>, document.body,
  );
}
