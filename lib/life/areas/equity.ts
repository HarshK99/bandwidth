// Ownership stakes in a growing venture — long-horizon, compounding bets.

import type { Area } from "../schema";

export const equity = {
  id: "equity",
  label: "Equity",
  about: "Ownership stakes in a growing venture — long-horizon, compounding bets.",
  children: [
    {
      id: "wave",
      label: "Wave",
      about:
        "Main long-term company bet. The product is built — the whole job now is getting users, so its children are an outreach system and the outreach itself, not features.",
      stages: [
        {
          id: "system",
          label: "Outreach System",
          about:
            "The machine: who to contact, what to say, how to follow up, what to measure. Built once and sharpened, not improvised per batch.",
          tasks: {
            icp: "Define ICP + build prospect list",
            script: "Sharpen pitch + message sequences",
            review: "Review outreach numbers + iterate",
          },
        },
        {
          id: "outreach",
          label: "Outreach Execution",
          about: "Running the machine — batches of calls, DMs and follow-ups.",
          tasks: {
            batch: "Outreach batch — calls / DMs",
            followup: "Follow-ups + booked calls",
          },
        },
      ],
    },
    {
      id: "side",
      label: "Side Project",
      about:
        "Next potential startup — apps/tools, early stage. Inherits the build capacity Wave no longer needs: this is where the appetite to build goes now.",
      stages: [
        {
          id: "ideation",
          label: "Ideation",
          about: "Validate and refine the concept before building anything.",
          tasks: { brainstorm: "Brainstorm + validate concept" },
        },
        {
          id: "dev",
          label: "Development",
          about: "Actually building the thing.",
          tasks: { mvp: "Build MVP" },
        },
        {
          id: "content",
          label: "Content (Distribution)",
          about: "Content/marketing lined up so launch has somewhere to land.",
          tasks: { launch: "Create launch content/marketing" },
        },
      ],
    },
  ],
} as const satisfies Area;
