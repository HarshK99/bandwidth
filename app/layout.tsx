import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppTabs from "@/components/AppTabs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bandwidth",
  description:
    "A zoomable, drill-down mind-map of your life/work capacity — narrow down through Build and Sustain to decide what to work on right now.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-dvh antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden">
        <div className="min-h-0 flex-1">{children}</div>
        <AppTabs />
      </body>
    </html>
  );
}
