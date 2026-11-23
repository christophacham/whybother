# whybother

A problem-first planner: judge whether a problem is worth fixing before it becomes a task.
See [SPEC.md](./SPEC.md) for what v1 is and [docs/prototype/app.html](./docs/prototype/app.html)
for the clickable prototype it is built from.

## How it flows

### Problem lifecycle

Every problem ends up in one of three outcomes, and all three can come back for a new verdict.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/flow/lifecycle-dark.svg">
  <img alt="Problem lifecycle: Capture, Inbox, Judge, Verdict, then Fix now, Parked or Good enough, each looping back to Judge again" src="./docs/flow/lifecycle-light.svg" width="712">
</picture>

### Screen map

How the user moves between the four screens. Edge labels are the controls they click. Only
the Inbox exists in the app so far; the dashed screens are in the prototype.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/flow/screens-dark.svg">
  <img alt="Screen map: Inbox and Overview tabs, Judge reached from Inbox, Overview and Detail, Detail reached from Overview" src="./docs/flow/screens-light.svg" width="712">
</picture>

## Develop

Needs Node 26.13.1 and pnpm 12.21.0 (`mise install` sets up both).

```sh
pnpm install
pnpm dev        # http://localhost:5810
pnpm check      # format check, lint, typecheck, tests
pnpm build
```

End-to-end tests run in a real browser with Playwright, on desktop and mobile viewports.
They start their own dev server on port 5811.

```sh
pnpm exec playwright install chromium   # once
pnpm test:e2e
```
