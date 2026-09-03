"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/direction", label: "Direction" },
  { href: "/coverage", label: "Coverage" },
  { href: "/time", label: "Time" },
  { href: "/upgrades", label: "Upgrades" },
] as const;

export default function AppTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App sections"
      className="flex shrink-0 items-stretch justify-around border-t border-black/10 bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-white/10 dark:bg-black/80"
    >
      {TABS.map((tab) => {
        // Sections with sub-routes (e.g. /direction/week) keep their tab lit.
        const isActive =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              "flex min-h-14 flex-1 items-center justify-center text-sm font-medium " +
              (isActive
                ? "text-zinc-950 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 active:bg-black/5 dark:text-zinc-400 dark:hover:text-zinc-100 dark:active:bg-white/10")
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
