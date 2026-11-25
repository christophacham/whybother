import "@fontsource-variable/inter";

import {
  AddButton,
  Age,
  CaptureForm,
  CaptureInput,
  JudgeButton,
  Nav,
  Notice,
  RemoveButton,
  SaveError,
  Title,
  Waiting,
} from "~/ui/parts.tsx";
import type { Inbox } from "~/ui/useInbox.ts";

const STEPS = [
  ["Write it down", "Anything that bugs you, in one sentence."],
  ["Judge it", "Four quick questions about pain, risk, gain and cost."],
  ["Get a verdict", "Fix now, park it, or accept it is good enough."],
] as const;

/** The first layout with its problems fixed: one left edge, and the input is the largest thing. */
export function Tidy({ inbox }: { inbox: Inbox }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-6 sm:px-8">
      <header className="mb-9 flex items-center gap-5 text-sm">
        <span className="font-bold">whybother</span>
        <Nav className="flex gap-4 text-muted" currentClassName="font-semibold text-fg" />
      </header>
      <h1 className="mb-3.5 text-[28px] leading-tight font-semibold tracking-tight">
        What's bothering you?
      </h1>
      <CaptureForm
        inbox={inbox}
        className="flex items-end gap-2.5 rounded-box border border-line bg-surface py-3 pr-3 pl-4 focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/30"
      >
        <CaptureInput
          inbox={inbox}
          placeholder="The deploy takes 20 minutes"
          className="py-1 text-[17px] outline-none"
        />
        <AddButton
          inbox={inbox}
          className="flex h-[34px] items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-on-accent disabled:bg-fg/10 disabled:text-muted"
        >
          Add <kbd className="font-sans text-xs opacity-80">↵</kbd>
        </AddButton>
      </CaptureForm>
      <p className="mt-2 text-[13px] text-muted">
        One sentence. Describe the problem, not the fix.
      </p>
      <SaveError inbox={inbox} className="mt-2" />
      <Waiting inbox={inbox} className="mt-8">
        {inbox.waiting.length === 0 ? (
          <div className="grid gap-1.5 sm:grid-cols-3">
            {STEPS.map(([title, text], index) => (
              <div key={title} className="rounded-box bg-surface px-4 py-3.5">
                <span className="text-xs font-semibold text-accent">{index + 1}</span>
                <b className="mt-1.5 mb-1 block text-sm font-semibold">{title}</b>
                <p className="text-[13px] text-muted">{text}</p>
              </div>
            ))}
          </div>
        ) : (
          <>
            <h2 className="mb-2.5 text-sm font-semibold">
              Waiting for a verdict{" "}
              <span className="ml-1 font-medium text-muted">{inbox.waiting.length}</span>
            </h2>
            <ul className="flex flex-col gap-1.5">
              {inbox.waiting.map((problem) => (
                <li
                  key={problem.id}
                  className="land flex flex-wrap items-center gap-x-3 gap-y-2 rounded-box bg-surface py-3 pr-2.5 pl-4"
                >
                  <Title
                    problem={problem}
                    className="basis-full text-[15px] font-medium sm:flex-1 sm:basis-0"
                  />
                  <Age
                    inbox={inbox}
                    problem={problem}
                    className="mr-auto text-[13px] text-muted sm:mr-0"
                  />
                  <JudgeButton
                    inbox={inbox}
                    problem={problem}
                    className="h-[30px] rounded-lg border border-line px-3 text-[13px] font-semibold hover:bg-fg/10"
                  />
                  <RemoveButton
                    inbox={inbox}
                    problem={problem}
                    className="size-[30px] rounded-lg text-lg leading-none text-muted hover:bg-fg/10 hover:text-fg"
                  >
                    ×
                  </RemoveButton>
                </li>
              ))}
            </ul>
          </>
        )}
      </Waiting>
      <Notice inbox={inbox} className="mt-3 text-sm text-muted" />
    </main>
  );
}
