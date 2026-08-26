import type { Metadata } from "next";
import DirectionNav from "@/components/Direction/DirectionNav";

export const metadata: Metadata = {
  title: "Direction — Bandwidth",
  description:
    "What kind of work belongs in the block you're in right now, and which area it should be aimed at.",
};

/**
 * Shell for the Direction feature. The root layout owns the outer scroll
 * lock, so the section header stays put and only the view scrolls.
 */
export default function DirectionLayout({ children }: LayoutProps<"/direction">) {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-black/[0.09] px-3 dark:border-white/[0.12] sm:px-6">
        <DirectionNav />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-6">{children}</div>
    </div>
  );
}
