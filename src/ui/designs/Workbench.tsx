import "@fontsource-variable/inter";

import {
  AddButton,
  Age,
  CaptureForm,
  CaptureInput,
  JudgeButton,
  Notice,
  RemoveButton,
  SaveError,
  Title,
  Waiting,
} from "~/ui/parts.tsx";
import type { Inbox } from "~/ui/useInbox.ts";

const OUTCOMES = [
  ["FixNow", "Fix now", "bg-[#3ecf8e]"],
  ["Parked", "Parked", "bg-[#f0b849]"],
  ["GoodEnough", "Good enough", "bg-[#7f8896]"],
] as const;

const ITEM = "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm";
const COUNT = "ml-auto pl-2 text-xs font-medium text-muted";

/** Built for the screens to come: a sidebar with the three outcomes, capture as a bar on top. */
export function Workbench({ inbox }: { inbox: Inbox }) {
  const count = inbox.waiting.length;
  // The grid fills the screen down to the 4rem of room App leaves for the design switcher.
  return (
    <div className="grid min-h-[calc(100dvh-4rem)] grid-rows-[auto_1fr] sm:grid-cols-[172px_1fr] sm:grid-rows-1">
      <aside className="flex flex-wrap items-center gap-0.5 border-b border-fg/15 bg-black/30 px-2.5 py-3 sm:flex-col sm:flex-nowrap sm:items-stretch sm:border-r sm:border-b-0 sm:py-5">
        <span className="px-2.5 text-[15px] font-bold sm:pb-4">whybother</span>
        <span className={`${ITEM} bg-surface font-semibold`}>
          <i className="size-2 rounded-full bg-fg" />
          Inbox<span className={COUNT}>{count}</span>
        </span>
        <span className="hidden px-2.5 pt-3.5 pb-1.5 text-[11px] font-semibold text-muted sm:block">
          Judged
        </span>
        {OUTCOMES.map(([tag, label, dot]) => (
          <span key={tag} className={`${ITEM} text-fg/75`}>
            <i className={`size-2 rounded-full ${dot}`} />
            {label}
            <span className={COUNT}>
              {inbox.problems.filter((problem) => problem.outcome._tag === tag).length}
            </span>
          </span>
        ))}
      </aside>
      <main className="min-w-0 max-w-3xl px-5 py-5 sm:px-6">
        <CaptureForm
          inbox={inbox}
          className="flex items-start gap-2.5 rounded-box border border-line bg-surface py-2.5 pr-2.5 pl-3.5 focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/25"
        >
          <span aria-hidden="true" className="text-xl leading-[26px] text-muted">
            +
          </span>
          <CaptureInput
            inbox={inbox}
            placeholder="What's bothering you?"
            className="leading-[26px] outline-none"
          />
          <AddButton
            inbox={inbox}
            className="h-7 rounded-[7px] bg-accent px-2.5 text-[13px] font-semibold whitespace-nowrap text-on-accent disabled:bg-fg/10 disabled:text-muted"
          >
            Add ↵
          </AddButton>
        </CaptureForm>
        <SaveError inbox={inbox} className="mt-2" />
        <h1 className="mt-7 text-[22px] font-semibold tracking-tight">Inbox</h1>
        <p className="mt-1 mb-3.5 text-[13px] text-muted">
          {count === 0 ? "All caught up" : `${count} waiting for a verdict`}
        </p>
        <Waiting inbox={inbox}>
          {count === 0 ? (
            <div className="rounded-box border border-dashed border-line px-5 py-6 text-center">
              <b className="mb-1.5 block text-[15px] font-semibold">
                Nothing is waiting for a verdict
              </b>
              <p className="text-[13px] text-muted">
                Add what bothers you above. Judging it sorts it into one of three piles.
              </p>
              <p className="mt-3.5 flex flex-wrap justify-center gap-1.5">
                {OUTCOMES.map(([tag, label, dot]) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-medium"
                  >
                    <i className={`size-[7px] rounded-full ${dot}`} />
                    {label}
                  </span>
                ))}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {inbox.waiting.map((problem) => (
                <li
                  key={problem.id}
                  className="land flex items-center gap-3 rounded-box bg-surface py-3 pr-3 pl-4"
                >
                  <div className="min-w-0 flex-1">
                    <Title problem={problem} className="block text-[15px] font-medium" />
                    <Age
                      inbox={inbox}
                      problem={problem}
                      className="mt-0.5 block text-xs text-muted"
                    />
                  </div>
                  <JudgeButton
                    inbox={inbox}
                    problem={problem}
                    className="h-[30px] rounded-lg bg-fg/10 px-3 text-[13px] font-semibold hover:bg-accent hover:text-on-accent"
                  />
                  <RemoveButton
                    inbox={inbox}
                    problem={problem}
                    className="size-7 rounded-lg text-[17px] leading-none text-muted hover:bg-fg/10 hover:text-fg"
                  >
                    ×
                  </RemoveButton>
                </li>
              ))}
            </ul>
          )}
        </Waiting>
        <Notice inbox={inbox} className="mt-3 text-sm text-muted" />
      </main>
    </div>
  );
}
