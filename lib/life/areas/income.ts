// Cash now — work that pays today.

import type { Area } from "../schema";

export const income = {
  id: "income",
  label: "Income Work",
  about: "Cash now — work that pays today. Two streams: client website work, and product sales.",
  children: [
    {
      id: "web",
      label: "Websites",
      about:
        "Freelance website design/build for clients — current primary income source.",
      stages: [
        {
          id: "pipeline",
          label: "Pipeline",
          about:
            "Finding and approaching work: cold outreach, follow-ups, referrals, and the case studies that make them land. Fed by Aftercare — the loop closes here.",
          tasks: {
            outreach: "Cold outreach to prospects",
            followup: "Follow up on existing leads",
            referral: "Ask past clients for referrals",
            portfolio: "Portfolio / case study updates",
          },
        },
        {
          id: "scoping",
          label: "Scoping",
          about:
            "Turning interest into a defined job: discovery, requirements, architecture, pricing, the proposal. Thinking work — it belongs in a thinking slot, not between builds.",
          tasks: {
            discovery: "Discovery call + requirements",
            proposal: "Write proposal / quote",
            pricing: "Pricing / package review",
          },
        },
        {
          id: "build",
          label: "Build",
          about:
            "Design and development against an agreed scope, plus fixes and launch.",
          tasks: {
            dev: "Client website development",
            debug: "Debugging / fixes",
          },
        },
        {
          id: "payment",
          label: "Payment",
          about:
            "How a job actually ends: invoice, chase, reconcile. A stage of its own because unpaid work is unfinished work, however finished the site is.",
          tasks: {
            invoice: "Invoicing",
            chase: "Chase + reconcile payments",
          },
        },
        {
          id: "aftercare",
          label: "Aftercare",
          about:
            "Check-ins, maintenance, upsells after handover — and where referrals come from, which is why this feeds back into Pipeline.",
          tasks: {
            checkin: "Client check-in call",
            upsell: "Upsell (maintenance / SEO)",
          },
        },
      ],
    },
    {
      id: "dp",
      label: "Digital Products",
      about:
        "Stickers/paintings and similar products to sell — new, early-stage income stream.",
      stages: [
        {
          id: "design",
          label: "Design",
          about: "Making the thing — the painting or sticker itself.",
          tasks: { make: "Design a sticker / painting" },
        },
        {
          id: "listing",
          label: "Listing",
          about:
            "Photograph, write, price, publish. Designed-but-unlisted is the state this stage exists to prevent.",
          tasks: { publish: "Photograph, price and publish" },
        },
        {
          id: "fulfilment",
          label: "Fulfilment",
          about:
            "Orders, packing, shipping, buyer questions. Event-driven — no recurring slot, because it only exists once something sells.",
          tasks: { ship: "Pack and ship orders" },
        },
      ],
    },
  ],
} as const satisfies Area;
