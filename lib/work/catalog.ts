import type { ActivityArea, ActivityNode, Effort } from "./types";

const activity = (id: string, label: string, ...efforts: Effort[]): ActivityNode => ({
  id, kind: "activity", label, efforts,
});

// Reusable choices, independent of the schedule. Multi-effort work is one leaf.
export const ACTIVITY_AREAS: readonly ActivityArea[] = [
  {
    id: "wave", label: "Wave Link", children: [
      activity("wave.customer-discovery", "Customer discovery", "deep"),
      activity("wave.positioning", "Positioning", "deep"),
      activity("wave.lead-research", "Lead research", "light"),
      activity("wave.outreach", "Outreach", "deep", "light"),
      activity("wave.review-feedback", "Review usage and user feedback", "deep", "light"),
      activity("wave.product-changes", "Decide product changes", "deep"),
      activity("wave.product-development", "Product development", "deep", "production"),
    ],
  },
  {
    id: "freelance", label: "Freelance", children: [
      activity("freelance.discovery", "Market and customer discovery", "deep"),
      activity("freelance.positioning-offer", "Positioning and offer", "deep"),
      activity("freelance.lead-research", "Lead research", "light"),
      activity("freelance.outreach", "Outreach", "deep", "light"),
      activity("freelance.sales", "Sales", "deep"),
      activity("freelance.scoping-proposals", "Scoping and proposals", "deep"),
      activity("freelance.website-production", "Website production", "deep", "production"),
      activity("freelance.payments", "Invoice and follow up on payments", "light"),
      activity("freelance.client-check-ins", "Check in with clients and ask for referrals", "deep", "light"),
    ],
  },
  {
    id: "content", label: "Content", children: [
      activity("content.writing", "Content writing", "deep"),
      activity("content.recording-editing", "Recording and editing", "production"),
      activity("content.publishing-engagement", "Publishing and engagement", "light"),
    ],
  },
  {
    id: "side-projects", label: "Side projects", children: [
      activity("side-projects.explore-test", "Explore and test an idea", "deep", "production"),
    ],
  },
  {
    id: "jobs", label: "Jobs", children: [
      activity("jobs.find-apply", "Find and apply for suitable roles", "light"),
      activity("jobs.interviews", "Prepare for or attend interviews", "deep"),
    ],
  },
  {
    id: "recovery", label: "Recovery and life", children: [
      activity("recovery.exercise", "Exercise", "recovery"),
      { id: "recovery.hobbies", kind: "group", label: "Hobbies", children: [
        activity("recovery.hobbies.painting", "Painting", "recovery"),
        activity("recovery.hobbies.crossword", "Crossword", "recovery"),
        activity("recovery.hobbies.language", "Language", "recovery"),
      ] },
      { id: "recovery.family-friends", kind: "group", label: "Family and friends", children: [
        activity("recovery.family-friends.call", "Call", "recovery"),
        activity("recovery.family-friends.meet", "Meet", "recovery"),
      ] },
      { id: "recovery.life-admin", kind: "group", label: "Life admin and finances", children: [
        activity("recovery.life-admin.bills-finances", "Pay bills and review finances", "light"),
        activity("recovery.life-admin.errands", "Run errands", "light"),
      ] },
    ],
  },
];
