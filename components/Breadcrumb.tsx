"use client";

import type { HierarchyNode } from "@/lib/hierarchy-data";

interface BreadcrumbProps {
  path: HierarchyNode[];
  onNavigate: (id: string) => void;
}

export default function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Hierarchy breadcrumb"
      className="flex items-center gap-0.5 overflow-x-auto whitespace-nowrap border-b border-black/10 bg-white/80 px-2 text-sm backdrop-blur dark:border-white/10 dark:bg-black/80"
    >
      {path.map((node, i) => {
        const isLast = i === path.length - 1;
        return (
          <span key={node.id} className="flex shrink-0 items-center gap-0.5">
            {i > 0 && <span className="text-zinc-400">/</span>}
            <button
              type="button"
              onClick={() => !isLast && onNavigate(node.id)}
              disabled={isLast}
              className={
                "min-h-11 rounded px-1.5 py-2 " +
                (isLast
                  ? "font-medium text-zinc-950 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 active:bg-black/5 dark:text-zinc-400 dark:hover:text-zinc-100 dark:active:bg-white/10")
              }
            >
              {node.label}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
