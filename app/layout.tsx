import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import AppTabs from "@/components/AppTabs";

/**
 * One family for the whole app. Manrope is geometric enough to hold a
 * display-size line without going generic, and its uppercase is wide, so
 * label tracking is set tighter here than a grotesque would need. Numerals
 * are set `tabular-nums` wherever they sit in a column — that replaces the
 * second, monospace face this app used to load.
 */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bandwidth",
  description:
    "A zoomable, drill-down mind-map of your life/work capacity — narrow down through Build and Sustain to decide what to work on right now.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-dvh antialiased`}>
      <body className="flex h-dvh flex-col overflow-hidden">
        <div className="min-h-0 flex-1">{children}</div>
        <AppTabs />
      </body>
    </html>
  );
}
