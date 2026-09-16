import { Suspense } from "react";
import TodayView from "@/components/Direction/TodayView";

export default function DirectionTodayPage() {
  return <Suspense fallback={<div className="h-40" aria-hidden />}><TodayView /></Suspense>;
}
