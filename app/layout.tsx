import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppTabs from "@/components/AppTabs";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Used for times and anything that should line up in a column.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-dvh antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden">
        <div className="min-h-0 flex-1">{children}</div>
        <AppTabs />
      </body>
    </html>
  );
}
