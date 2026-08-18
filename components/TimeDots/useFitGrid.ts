"use client";

import { useEffect, useRef, useState } from "react";

interface GridLayout {
  columns: number;
  rows: number;
  dotSize: number;
  gap: number;
}

// Gap as a fraction of dot size, kept constant across dot sizes so the grid
// looks proportionate whether it's showing 52 dots or 365.
const GAP_RATIO = 0.32;
const MIN_DOT_SIZE = 3;
const MAX_DOT_SIZE = 44;

function layoutForColumns(
  width: number,
  height: number,
  count: number,
  columns: number
): GridLayout | null {
  const rows = Math.ceil(count / columns);
  const dotSizeW = width / (columns + (columns - 1) * GAP_RATIO);
  const dotSizeH = height / (rows + (rows - 1) * GAP_RATIO);
  const dotSize = Math.min(dotSizeW, dotSizeH);
  if (dotSize <= 0) return null;
  return { columns, rows, dotSize, gap: dotSize * GAP_RATIO };
}

// Searches column counts to find the layout that maximizes dot size while
// still fitting `count` dots inside width x height with no overflow/scroll.
// Pass `fixedColumns` to skip the search (e.g. a calendar-style grid where
// the column count is meaningful — one column per week — not just whatever
// packs tightest).
function computeLayout(
  width: number,
  height: number,
  count: number,
  fixedColumns?: number
): GridLayout | null {
  if (width <= 0 || height <= 0 || count <= 0) return null;

  let best: GridLayout | null = null;
  if (fixedColumns) {
    best = layoutForColumns(width, height, count, fixedColumns);
  } else {
    for (let columns = 1; columns <= count; columns++) {
      const candidate = layoutForColumns(width, height, count, columns);
      if (candidate && (!best || candidate.dotSize > best.dotSize)) {
        best = candidate;
      }
    }
  }
  if (!best) return null;

  const dotSize = Math.min(MAX_DOT_SIZE, Math.max(MIN_DOT_SIZE, best.dotSize));
  return { ...best, dotSize, gap: dotSize * GAP_RATIO };
}

// Fits `count` dots into the observed container size, recomputing on resize
// so the grid never scrolls — dots shrink/grow instead. `fixedColumns` locks
// the grid to a specific column count instead of auto-packing.
export function useFitGrid(count: number, fixedColumns?: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<GridLayout | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const recompute = () => {
      setLayout(computeLayout(el.clientWidth, el.clientHeight, count, fixedColumns));
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(el);
    return () => observer.disconnect();
  }, [count, fixedColumns]);

  return { containerRef, layout };
}
