import type { KeyboardEvent } from "react";

import type { Problem } from "~/domain/Problem.ts";
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

const ROW = "grid grid-cols-[24px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2 px-5 sm:px-6";
const WIDE = "sm:grid-cols-[24px_minmax(0,1fr)_auto]";
const NUMBER = "text-right font-mono text-sm text-muted";
const KEYS = [
  ["Enter", "Add"],
  ["↑ ↓", "Move"],
  ["J", "Judge"],
  ["Del", "Remove"],
] as const;

const focus = (element: Element | null | undefined) => {
  if (element instanceof HTMLElement) element.focus();
};

/** There is no form to find: you write into the first line of the list, and can stay on the keyboard. */
export function OneList({ inbox }: { inbox: Inbox }) {
  const count = inbox.waiting.length;

  const onRowKey = (event: KeyboardEvent<HTMLLIElement>, problem: Problem) => {
    // Keys pressed on the buttons inside a row belong to those buttons.
    if (event.target !== event.currentTarget) return;
    const row = event.currentTarget;
    const above = row.previousElementSibling ?? row.closest("section")?.querySelector("textarea");
    if (event.type === "keyup") {
      // Delete acts when the key is let go. Acting on the press would move focus while the key
      // is still down, and its repeats would then remove more rows or eat into the draft.
      if (event.key !== "Delete") return;
      focus(row.nextElementSibling ?? above);
      inbox.remove(problem);
    } else if (event.key === "ArrowDown") focus(row.nextElementSibling);
    else if (event.key === "ArrowUp") focus(above);
    else if (event.key.toLowerCase() === "j" && !event.ctrlKey && !event.metaKey && !event.altKey)
      inbox.judge(problem);
    else return;
    event.preventDefault();
  };

  return (
    <main className="mx-auto max-w-3xl py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6">
        <span className="text-[17px] font-bold tracking-tight">whybother</span>
        <Nav
          className="flex gap-4.5 text-sm text-muted"
          currentClassName="py-1.5 text-fg shadow-[inset_0_-2px_var(--color-accent)]"
        >
          {count === 0 ? "" : ` ${count}`}
        </Nav>
      </header>
      <p className="mt-6.5 px-5 text-muted sm:px-6">
        Write down what bothers you. Judge each line when you have time: Fix now, Parked or Good
        enough.
      </p>
      <Waiting inbox={inbox} className="mt-5">
        <div
          onKeyDown={(event) => {
            // Down from the end of the text goes into the list.
            const box = event.target;
            if (event.key !== "ArrowDown" || event.nativeEvent.isComposing) return;
            if (!(box instanceof HTMLTextAreaElement)) return;
            if (box.selectionStart !== box.value.length) return;
            focus(event.currentTarget.nextElementSibling?.firstElementChild);
          }}
        >
          <CaptureForm
            inbox={inbox}
            className={`${ROW} ${WIDE} bg-surface py-5 focus-within:shadow-[inset_0_0_0_2px_var(--color-accent)]`}
          >
            <span aria-hidden="true" className="text-right font-mono text-2xl text-accent">
              +
            </span>
            <CaptureInput
              inbox={inbox}
              placeholder="What's bothering you?"
              className="text-xl font-medium outline-none"
            />
            <AddButton
              inbox={inbox}
              className="col-start-2 min-h-10 justify-self-start rounded-lg border border-accent bg-accent px-4 text-sm font-semibold text-on-accent disabled:border-line disabled:bg-transparent disabled:text-muted sm:col-start-3"
            >
              Add
            </AddButton>
          </CaptureForm>
        </div>
        {count === 0 ? (
          <>
            <div className={`${ROW} min-h-14.5 border-t border-fg/15 py-3 text-muted`}>
              <span className={NUMBER}>1</span>
              Your first problem goes here and waits for a verdict.
            </div>
            <div className="h-14.5 border-t border-fg/15" />
            <div className="h-14.5 border-t border-fg/15" />
          </>
        ) : (
          <ul>
            {inbox.waiting.map((problem, index) => (
              <li
                key={problem.id}
                tabIndex={0}
                className={`land ${ROW} ${WIDE} border-t border-fg/15 py-3 -outline-offset-2 focus-within:bg-fg/5 hover:bg-fg/5 focus-visible:outline-2 focus-visible:outline-accent`}
                onKeyDown={(event) => onRowKey(event, problem)}
                onKeyUp={(event) => onRowKey(event, problem)}
              >
                <span aria-hidden="true" className={NUMBER}>
                  {count - index}
                </span>
                <div className="min-w-0">
                  <Title problem={problem} className="block" />
                  <Age inbox={inbox} problem={problem} className="text-[13px] text-muted" />
                </div>
                <div className="col-start-2 flex items-center gap-3.5 sm:col-start-3">
                  <RemoveButton
                    inbox={inbox}
                    problem={problem}
                    className="py-1.5 text-[13px] text-muted hover:text-fg hover:underline"
                  />
                  <JudgeButton
                    inbox={inbox}
                    problem={problem}
                    className="rounded-lg border border-line px-3 py-1 text-sm font-semibold hover:border-accent hover:text-accent"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Waiting>
      <p className="flex flex-wrap gap-x-4.5 gap-y-1.5 border-t border-fg/15 px-5 pt-4 text-[13px] text-muted sm:px-6">
        {KEYS.map(([key, what]) => (
          <span key={key}>
            <kbd className="mr-1.5 rounded border border-line px-1.5 py-px font-mono text-xs text-fg">
              {key}
            </kbd>
            {what}
          </span>
        ))}
      </p>
      <SaveError inbox={inbox} className="mt-3 px-5 sm:px-6" />
      <Notice inbox={inbox} className="mt-3 px-5 text-sm text-muted sm:px-6" />
    </main>
  );
}
