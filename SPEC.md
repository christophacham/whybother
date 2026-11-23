# whybother: spec for v1

A problem-first planner. You write down what bothers you, compare where you are with where
you would properly be, and get a verdict on whether it is worth fixing now. Tasks exist only
under a "yes", each under the reason it is worth doing.

The clickable reference for every screen and rule below is `docs/prototype/app.html`.

## Decisions (22 Nov 2026)

| Topic                     | Decision                                        |
| ------------------------- | ----------------------------------------------- |
| Storage in v1             | Browser only (localStorage). No server.         |
| Accounts                  | None yet. Single user per browser.              |
| Solution-vs-problem check | None. Whatever is typed is accepted.            |
| Backend, when it comes    | Own server: Effect on Node with a SQLite file.  |
| UI                        | React 19 without a framework, built with Vite+. |
| Logic and state           | Effect v4 (Schema, atoms, KeyValueStore).       |

## Scope of v1

### Flow

1. **Capture.** One sentence, added to the inbox. No other fields.
2. **Judge.** Write "Today" and "Proper solution" (both optional), set how close today is
   (0 to 100), answer four questions on a 1 to 5 scale. The verdict appears once all four are
   answered.
3. **Decide.** Accept the verdict or overrule it. An overrule is recorded and stays visible.
4. **Follow up**, depending on the outcome:
   - **Fix now:** needs at least one step. Also takes a one-line why, an effort label and
     the closeness the steps should reach.
   - **Parked:** needs a trigger, either a date or a condition in words. Takes a reason.
   - **Good enough:** closed without doing anything. Takes a reason.
5. **Come back.** A parked problem returns for a new verdict when its date passes or the
   user marks its condition as happened. A fix-now problem asks for a new verdict when all its
   steps are done; finishing steps never marks it solved by itself.

### Screens

- **Inbox:** capture box and the problems waiting for a verdict. Remove is allowed here.
- **Judge:** the form above, used for first judging and every re-judging.
- **Overview:** counts, then "Back for a new verdict", "Fix now" (with progress bar and
  checkable steps), "Parked" (with trigger) and "Good enough".
- **Detail:** the full case file for one problem: answers, verdict, overrule, steps or trigger.

### Also in v1

- **Export and import** as one JSON file. With browser-only storage this is the only backup.

### Not in v1

Accounts, sync between devices, payments, AI rewrites, the solution check, reminders or
notifications, tags or areas, sharing.

## Data model

Defined once as Effect schemas in `src/domain/Problem.ts`; stored data is decoded with them
on load.

- **Problem:** `id`, `title`, `createdAt`, optional `assessment`, `outcome`.
- **Assessment** (absent until judged): `today`, `properSolution`, `closeness` (0 to 100),
  `answers` (`pain`, `risk`, `gain`, `cost`, each 1 to 5), `suggested` (what the answers
  said), `judgedAt`.
- **Outcome**, one of:
  - `Unjudged`
  - `FixNow`: `why`, `effort`, `target` (0 to 100), `steps` (`id`, `text`, `done`)
  - `Parked`: `reason`, `trigger` (`OnDate` with `date`, or `OnCondition` with `text` and
    `happened`)
  - `GoodEnough`: `reason`, `closedAt`

A verdict was overruled when `assessment.suggested` differs from the outcome.

Progress shown on a fix-now card is `closeness + (target - closeness) * done / total`.

## Scoring

`src/domain/verdict.ts`, covered by tests. Carried over from the prototype and still a first
guess:

```
value = pain + risk + gain
room  = (100 - closeness) / 100
score = value * (0.5 + room / 2) - cost * 1.5

GoodEnough  if closeness >= 90 or value <= 6
FixNow      if score >= 4.5
NotNow      otherwise
```

## Tech

- **Runtime:** Node 26.13.1 and pnpm 12.21.0, pinned in `mise.toml`.
- **Build, test, lint, format:** Vite+ (`vp`), the same toolchain as t3code.
- **Typecheck:** `effect-tsgo` with t3code's Effect language service rules
  (`tsconfig.effect.json`).
- **UI:** React 19.3, Tailwind 4.
- **State:** `@effect/atom-react`. Persisted atoms read and write Effect's `KeyValueStore`,
  backed by `BrowserKeyValueStore.layerLocalStorage`. Not `Atom.kvs`: it writes its default
  when the key is missing and overwrites values it cannot decode. Saves run under a Web Lock
  shared by all tabs.
- **Layout:** one package. `src/domain` is pure and has no React or browser imports, so it
  can move into a shared package when the server arrives.

```
src/domain   schemas and verdict logic (pure, tested)
src/state    atoms and storage
src/ui       React components
```

### Storage rules

- One key, `whybother:problems:v1`, holding the array of problems.
- A change to the schema that old data cannot decode needs a new key version and a migration
  from the previous one. Never drop stored data silently.

## Later: backend

When sync or accounts are needed: an Effect HTTP API on Node with SQLite on a server you run.
The atoms keep their shape; the storage layer behind them changes. Auth is undecided and gets
its own decision then.

## Build order

1. Scaffold, schemas, verdict logic, capture and inbox. **Done.**
2. Judge screen with live verdict and the three follow-ups.
3. Overview with steps, progress and the "back for a new verdict" section.
4. Detail screen and re-judging.
5. Export and import.
6. Deploy as a static site and use it for two weeks.

## Open questions

1. **Scoring:** keep the formula as is for the test, or drop the computed verdict and let the
   four questions inform a manual choice?
2. **Routing:** four screens need URLs. Default is TanStack Router (as in t3code) unless you
   want plain state-based switching.
3. **Hosting:** where the static site goes for the two-week test (Cloudflare Pages, GitHub
   Pages, your own server).
4. **Name:** `whybother` is a working name.
