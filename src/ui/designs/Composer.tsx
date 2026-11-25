import "@fontsource-variable/inter";

import { useRef } from "react";

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

const EXAMPLES = [
  "The deploy takes 20 minutes",
  "I never know which invoices are unpaid",
  "My desk chair squeaks",
];

/** One lifted surface in the middle of the page, like a message box. */
export function Composer({ inbox }: { inbox: Inbox }) {
  const input = useRef<HTMLTextAreaElement>(null);
  return (
    <main className="mx-auto max-w-[34rem] px-5 py-11">
      <p className="mb-2.5 text-center text-[13px] font-semibold text-muted">whybother</p>
      <h1 className="mb-5.5 text-center text-3xl leading-tight font-semibold tracking-tight">
        What's bothering you?
      </h1>
      <CaptureForm
        inbox={inbox}
        className="rounded-box bg-surface pt-4.5 pr-3.5 pb-3 pl-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_12px_32px_rgb(0_0_0/0.45)] outline-2 outline-transparent focus-within:outline-accent"
      >
        <CaptureInput
          ref={input}
          inbox={inbox}
          placeholder="The deploy takes 20 minutes"
          className="min-h-13 text-lg outline-none"
        />
        <div className="mt-2 flex items-center gap-2.5">
          <p className="flex-1 text-[13px] text-muted">The problem, not the fix.</p>
          <kbd className="rounded-md border border-line px-1.5 py-0.5 font-sans text-xs text-muted">
            ↵
          </kbd>
          <AddButton
            inbox={inbox}
            className="grid size-9 place-items-center rounded-full bg-accent text-on-accent disabled:bg-fg/10 disabled:text-muted"
          >
            <svg
              aria-hidden="true"
              className="size-4 fill-none stroke-current stroke-2"
              viewBox="0 0 16 16"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
            </svg>
          </AddButton>
        </div>
      </CaptureForm>
      <SaveError inbox={inbox} className="mt-3 text-center" />
      <Waiting inbox={inbox} className="mt-7">
        {inbox.waiting.length === 0 ? (
          <div className="text-center text-[13px] text-muted">
            <p className="mb-2.5">Not sure what counts? Try one of these.</p>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                className="mx-0.5 mb-1.5 cursor-pointer rounded-full bg-surface px-3 py-1.5 text-fg hover:bg-fg/15"
                onClick={() => {
                  inbox.setDraft(example);
                  input.current?.focus();
                }}
              >
                {example}
              </button>
            ))}
            <p className="mt-4">
              Each one waits here until you judge it:
              <br />
              fix now, park it, or good enough.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mx-1.5 mb-2.5 flex justify-between text-[13px] font-semibold text-muted">
              Waiting for a verdict <span>{inbox.waiting.length}</span>
            </h2>
            <ul className="flex flex-col gap-1.5">
              {inbox.waiting.map((problem) => (
                <li
                  key={problem.id}
                  className="land flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-[14px] bg-surface py-3 pr-2 pl-4.5"
                >
                  <Title
                    problem={problem}
                    className="basis-full text-[15px] font-medium sm:flex-1 sm:basis-0"
                  />
                  <Age
                    inbox={inbox}
                    problem={problem}
                    className="mr-auto text-xs text-muted sm:mr-0"
                  />
                  <JudgeButton
                    inbox={inbox}
                    problem={problem}
                    className="rounded-lg px-2 py-1.5 text-[13px] font-semibold text-accent hover:bg-fg/10"
                  >
                    Judge ›
                  </JudgeButton>
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
          </>
        )}
      </Waiting>
      <Notice inbox={inbox} className="mt-3 text-center text-sm text-muted" />
    </main>
  );
}
