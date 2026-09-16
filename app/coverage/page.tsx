import { Suspense } from "react";
import type { Metadata } from "next";
import CoverageView from "@/components/Direction/CoverageView";

export const metadata: Metadata = {
  title: "Coverage — Bandwidth",
  description:
    "A compact menu of reusable activities, filtered by area and effort.",
};

export default function CoveragePage() {
  return (
    <div className="h-full w-full overflow-y-auto">
      {/* CoverageView reads area/effort via useSearchParams; a static page that
          does that needs a Suspense boundary or the production build fails. */}
      <Suspense fallback={<div className="h-40" aria-hidden />}>
        <CoverageView />
      </Suspense>
    </div>
  );
}
