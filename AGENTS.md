# Bandwidth rebuild instructions

## Start or resume a phase

Treat `start phase N` as the complete instruction to load and execute only that phase.

Read in order:

1. `docs/APP_SOURCE_OF_TRUTH.md`
2. `docs/STATUS.md`
3. `docs/superpowers/plans/2026-09-16-bandwidth-rebuild.md`
4. `docs/phases/CONTRACTS.md`
5. The matching file under `docs/phases/` (Phase 1 Coverage, 2 Direction, 3 Week, 4 Integration, 5 Walkthrough)
6. `docs/proposals/today-final-view.html` and the prior phase outputs recorded in STATUS.

There is no Phase 0. Do not skip incomplete predecessors, repeat completed work, or start the next phase automatically. Resume the recorded phase branch if it is in progress. At every stopping point, update STATUS with decisions, actual progress, files changed, checks performed/omitted, open issues, and next starting point.

Keep handoffs compact: update the phase row and one entry of roughly five lines (status, changed files/areas, checks, open issues, next phase). Add a decision only when the next chat needs it. Do this once before the phase commit; no separate handoff-only commit, self-hash commit, rewritten history, or long final recap. Git history supplies integration evidence. Preserve honest incomplete/unchecked states.

## Branches and permitted scope

- `main_new` is the integration/main branch for the new version. Each phase branches from it and merges back into it when its deliverables are complete. This merge is authorized; do not ask for repeated permission.
- `master` and `main` are not integration targets for this rebuild. No merge or remote push to them without an explicit user instruction. No remote pushes or deployments are currently authorized.
- Reuse and update existing components and visual styles. Do not rebuild the UI from scratch.
- Destructive replacement of obsolete app data, models, and documentation is authorized within the rebuild. Preserve unrelated user changes and unrelated application/browser data. Never clear all browser storage.

## Checks and skills

- Do not run builds, tests, or code review without explicit authorization for the current phase/task. This includes indirect scripts and subagents. Starting Phase 5 is not authorization for those activities. Record permission and its scope in STATUS; it does not automatically carry to another phase.
- Specifically, do not run npm test, npm run build, or equivalent/indirect checks pre-emptively. The user will request checks at the end if desired; do not repeatedly ask during implementation.
- Manual browser walkthroughs are separate. Report agent-observed, user-reported, and unperformed checks accurately.
- Apply relevant available skills: interface-design and ui-ux-pro-max for UI; vercel-react-best-practices for React changes. Read their SKILL.md instructions. User restrictions override skill defaults for builds, tests, reviews, delegation, and phase execution.
- Do not spawn agents by default; this plan is one inline execution per fresh chat.

## Communication

Use plain words, ask one question at a time, and say what you are about to do in one line. Explain a skill the first time it is used. Do not claim something was checked when it was not. Keep responses concise and push back gently when a choice conflicts with the agreed app purpose.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
