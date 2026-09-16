import type { DayOfWeek, DirectionPlan, TimeBlock } from "../direction/types";

const REFERENCE_DAY: readonly TimeBlock[] = [
  { id: "morning", name: "Morning routine", start: "07:00", end: "08:00", type: "recovery" },
  { id: "deep-morning", name: "Deep work", start: "08:00", end: "11:00", type: "deep" },
  { id: "deep-midday", name: "Deep work", start: "11:00", end: "13:00", type: "deep" },
  { id: "lunch", name: "Lunch", start: "13:00", end: "14:00", type: "break" },
  { id: "light", name: "Light work", start: "14:00", end: "15:30", type: "light" },
  { id: "production", name: "Production", start: "15:30", end: "17:00", type: "production" },
  { id: "break", name: "Break", start: "17:00", end: "18:00", type: "break" },
  { id: "deep-evening", name: "Deep work", start: "18:00", end: "19:30", type: "deep" },
  { id: "dinner", name: "Dinner and downtime", start: "19:30", end: "21:00", type: "recovery" },
  { id: "exercise", name: "Exercise", start: "21:00", end: "22:00", type: "recovery" },
  { id: "wind-down", name: "Wind-down", start: "22:00", end: "00:00", type: "recovery" },
  { id: "sleep", name: "Sleep", start: "00:00", end: "07:00", type: "recovery" },
];

export function createDefaultPlan(): DirectionPlan {
  const week = {} as DirectionPlan["week"];
  for (let day = 0; day < 7; day++) {
    week[day as DayOfWeek] = REFERENCE_DAY
      .filter((block) => day !== 0 || block.type === "recovery" || block.type === "break")
      .map((block) => ({ ...block }));
  }
  return { version: 2, week };
}
