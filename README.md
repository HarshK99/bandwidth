# Bandwidth

A personal direction tool. It answers one question at any moment of the day:
**what block am I in, what area is it for, and what's next?** — and, one step
back, whether everything that matters actually has a place in the week.

Not a task manager. Tasks live in Apple Notes.

```bash
npm run dev   # http://localhost:3000
```

Next.js App Router, React 19, Tailwind v4. No backend: the hierarchy is a
checked-in file, the plan lives in localStorage.

## Sections

| Route | What it's for |
| --- | --- |
| `/direction` | Today, Week, Hours, Settings — the schedule. |
| `/coverage` | The hierarchy with hours attached. |
| `/time` | Life in dots. |

## Docs

- [docs/DIRECTION.md](docs/DIRECTION.md) — the feature: views, model, layers,
  visual rules.
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — the two data files and the id
  that joins them.
