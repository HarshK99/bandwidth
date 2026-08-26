"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx, LABEL_XS } from "./ui";

const LINKS = [
  { href: "/direction", label: "Today" },
  { href: "/direction/week", label: "Week" },
  { href: "/direction/settings", label: "Settings" },
] as const;

/**
 * Section nav. Three words, no icons, no chrome — the underline marks where
 * you are and nothing else competes with the page.
 */
export default function DirectionNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Direction views" className="flex items-center gap-7">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              LABEL_XS,
              "relative flex min-h-11 items-center transition-colors",
              active
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
            )}
          >
            {link.label}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-px h-px bg-accent"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
