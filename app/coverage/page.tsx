import { Suspense } from "react";
import type { Metadata } from "next";
import CoverageView from "@/components/Direction/CoverageView";

export const metadata: Metadata = {
  title: "Coverage — Bandwidth",
  description:
    "The hierarchy with the week's hours attached: what has a place, what happens inside something else, and what gets no time at all.",
};

export default function CoveragePage() {
  return (
    <div className="h-full w-full overflow-y-auto">
      {/* CoverageView reads ?type= via useSearchParams; a static page that
          does that needs a Suspense boundary or the production build fails. */}
      <Suspense fallback={<div className="h-40" aria-hidden />}>
        <CoverageView />
      </Suspense>
    </div>
  );
}
