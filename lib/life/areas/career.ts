// Alternative paths — employment, optionality outside self-employment.
//
// Stages sit straight on the value category: inventing a domain layer here
// would add a node that means nothing. The whole branch is `temporary`, which
// flows down to its stages and tasks.

import type { Area } from "../schema";

export const career = {
  id: "career",
  label: "Career Options",
  about: "Alternative paths — employment, optionality outside self-employment.",
  temporary: true,
  stages: [
    {
      id: "prep",
      label: "Preparation",
      about: "Getting good enough to pass: technical practice, stories, mock interviews.",
      tasks: {
        technical: "Interview technical prep",
        behavioural: "Resume tailoring / STAR stories / mock interviews",
      },
    },
    {
      id: "apply",
      label: "Applications",
      about: "Targeting, tailoring, sending, tracking.",
      tasks: {
        send: "Applications + research",
        track: "Track + follow up",
      },
    },
    {
      id: "interview",
      label: "Interviews",
      about:
        "The rounds themselves. Event-driven: no recurring slot, and when one lands it takes a morning from something else.",
      tasks: { rounds: "Interview rounds + debrief notes" },
    },
    {
      id: "offer",
      label: "Offers",
      about: "Negotiation and the decision. Rare, high-stakes, unschedulable.",
      tasks: { negotiate: "Negotiate offer + decide" },
    },
  ],
} as const satisfies Area;
