import type { Metadata } from "next";
import UpgradesView from "@/components/Upgrades/UpgradesView";

export const metadata: Metadata = {
  title: "Upgrades — Bandwidth",
  description:
    "The internal problems I'm working through — what's fixed, what I'm on now, and what's next.",
};

export default function UpgradesPage() {
  return (
    <div className="h-full w-full overflow-hidden">
      <UpgradesView />
    </div>
  );
}
