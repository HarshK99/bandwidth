// Attention/platform you own — reach independent of any single venture.

import type { Area } from "../schema";

export const audience = {
  id: "audience",
  label: "Audience",
  about: "Attention/platform you own — reach independent of any single venture.",
  children: [
    {
      id: "brand",
      label: "Personal Brand",
      about: "Skits/content — separate audience-building asset, not tied to Wave.",
      // One pipeline, several purposes: a slot's `serves` says when a given
      // session is aimed at Wave or Digital Products rather than at the page
      // itself. See docs/DIRECTION.md.
      stages: [
        {
          id: "script",
          label: "Scripting",
          about: "Ideas and scripts — thinking work, not production.",
          tasks: { ideas: "Skit scripting / ideas" },
        },
        {
          id: "shoot",
          label: "Shooting",
          about: "Filming. Needs daylight, so it takes daytime slots.",
          tasks: { film: "Skit filming" },
        },
        {
          id: "edit",
          label: "Editing",
          about: "Cutting and assembling — low-stakes evening work.",
          tasks: { cut: "Skit editing" },
        },
        {
          id: "growth",
          label: "Distribution / Growth",
          about:
            "Posting, replying, engaging. The stage that actually grows the page, and the easiest one to skip.",
          tasks: { post: "Post, reply and engage" },
        },
      ],
    },
  ],
} as const satisfies Area;
