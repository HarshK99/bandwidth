// Protects and replenishes the capacity to keep Building.
//
// Shallower than Build on purpose: most of these don't move through phases,
// they just need to happen. Depth is derived from nesting, so a branch that
// stops one level early costs nothing.

import type { Area } from "../schema";

export const sustain = {
  id: "sustain",
  label: "Sustain",
  about: "Protects and replenishes the capacity to keep Building. Ongoing, protective.",
  children: [
    {
      id: "health",
      label: "Physical Health",
      about: "Exercise, meals, sleep quality, checkups.",
      tasks: { workout: "Daily workout" },
    },
    {
      id: "relationships",
      label: "Relationships",
      about: "Family, friends — protected time.",
      tasks: { time: "Protected family/friends time" },
    },
    {
      id: "rest",
      label: "Rest / Reflection",
      about: "Hobbies, journaling, weekly review.",
      tasks: {
        hobbies: "Painting / Netflix / hobbies",
        review: "Weekly review + next week planning",
      },
    },
    {
      id: "financial",
      label: "Financial Health",
      about: "Trading/portfolio, budgeting, taxes.",
      tasks: { trading: "Trading research + portfolio review" },
    },
    {
      id: "lifeadmin",
      label: "Life Admin",
      about: "Bills, errands, home maintenance, appointments.",
      tasks: { errands: "Errands, bills, upkeep" },
    },
    {
      id: "learning",
      label: "Learning (general)",
      about: "Non-domain-specific reading/learning — buffer rotation.",
      url: "https://linkshelf-three.vercel.app/",
      tasks: { reading: "Reading rotation (day-themed)" },
    },
    {
      id: "psych",
      label: "Psychological Fitness",
      about:
        "Confidence, communication, and emotional resilience — the internal capacity Build execution actually runs on.",
      stages: [
        {
          id: "confidence",
          label: "Confidence / Public Speaking",
          about: "Comfort taking up space and speaking without needing permission.",
          tasks: {
            speakup: "Speak up unprompted",
            toast: "Give a short toast / speech",
            recordwatch: "Record & rewatch a talk",
          },
        },
        {
          id: "fluency",
          label: "Fluency",
          about:
            "Speaking smoothly (no stumbling/filler words) and articulating thoughts clearly — delivery and clarity together.",
          tasks: {
            impromptu: "2-min impromptu talk, no fillers",
            explainsimple: "Explain something complex, simply",
          },
        },
        {
          id: "judgment",
          label: "Fear of Being Judged",
          about: "Building tolerance for visibility and imperfection in front of others.",
          tasks: {
            postpublic: "Post publicly, unedited",
            askquestion: "Ask a question you'd hold back",
            sharework: "Share unfinished work",
          },
        },
      ],
    },
  ],
} as const satisfies Area;
