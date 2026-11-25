import { useEffect, useRef, useState } from "react";

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

// The card is light on a dark page, so the tokens are set again for everything inside it.
const CARD =
  "relative flex min-h-62 flex-col rounded-box bg-[#f5ecf0] px-7 pt-6.5 pb-6 text-fg [--color-accent:#652d70] [--color-fg:#2c1a33] [--color-line:#9d8aa3] [--color-muted:#6c5873] [--color-on-accent:#fff]";
const BIG = "font-display text-[29px] leading-tight font-medium tracking-tight";
const GO =
  "min-h-10 rounded-lg border border-accent bg-accent px-4 text-sm font-semibold text-on-accent disabled:border-line disabled:bg-transparent disabled:text-muted";
const QUIET = "px-1 py-1.5 text-[13px] text-muted hover:text-fg hover:underline";
const OUTLINED =
  "rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-accent hover:text-accent";

/** One problem is brought forward to judge. An empty inbox turns its card into the place to write. */
export function TopOfPile({ inbox }: { inbox: Inbox }) {
  const [featuredId, setFeaturedId] = useState<string>();
  const input = useRef<HTMLTextAreaElement>(null);
  const { waiting } = inbox;
  const at = Math.max(
    0,
    waiting.findIndex((problem) => problem.id === featuredId),
  );
  const featured = waiting[at];
  // The others in turn, starting after the one in front, so "next" goes round all of them.
  const rest = [...waiting.slice(at + 1), ...waiting.slice(0, at)];
  const empty = featured === undefined;

  // Adding the first problem moves the capture box from the card to the dock, which makes a new
  // textarea. Keep the cursor in it so the next problem can be typed straight away. Emptying
  // the inbox moves it back, but then nobody was typing, so focus is left alone.
  const wasEmpty = useRef(empty);
  useEffect(() => {
    if (wasEmpty.current && !empty) input.current?.focus();
    wasEmpty.current = empty;
  }, [empty]);

  return (
    <main className="mx-auto max-w-[36rem] px-5 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[17px] font-bold tracking-tight">whybother</span>
        <Nav
          className="flex gap-4.5 text-sm text-muted"
          currentClassName="py-1.5 text-fg shadow-[inset_0_-2px_var(--color-accent)]"
        >
          {empty ? "" : ` ${waiting.length}`}
        </Nav>
      </header>
      <Waiting inbox={inbox} className="mt-10">
        {empty ? (
          <CaptureForm
            inbox={inbox}
            className={`${CARD} outline-fg focus-within:outline-2 focus-within:-outline-offset-8`}
          >
            <span className="text-[15px] font-semibold">What's bothering you?</span>
            <CaptureInput
              ref={input}
              inbox={inbox}
              placeholder="One sentence, however it comes out"
              className={`${BIG} mt-3.5 mb-6 flex-1 outline-none`}
            />
            <AddButton inbox={inbox} className={`${GO} self-start`}>
              Add problem
            </AddButton>
          </CaptureForm>
        ) : (
          <>
            {/* Local view state only: showing the next one never reorders what is stored. */}
            <ul>
              <li className="relative pb-6.5">
                {rest.length > 1 ? (
                  <div className="absolute inset-x-7 bottom-0 h-15 rounded-[14px] bg-[#857087]" />
                ) : null}
                {rest.length > 0 ? (
                  <div className="absolute inset-x-3.5 bottom-3.25 h-15 rounded-[14px] bg-[#b9a6b4]" />
                ) : null}
                <article className={CARD}>
                  {/* Only the words are replaced when the next one comes forward. The buttons
                      stay, so "Show the next one" keeps keyboard focus from press to press. */}
                  <div key={featured.id} className="land flex flex-1 flex-col">
                    <Age inbox={inbox} problem={featured} className="text-[13px] text-muted" />
                    <Title problem={featured} className={`${BIG} mt-3.5 mb-6 block flex-1`} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
                    <JudgeButton inbox={inbox} problem={featured} className={GO} />
                    {rest[0] ? (
                      <button
                        type="button"
                        className={`${OUTLINED} cursor-pointer`}
                        onClick={() => setFeaturedId(rest[0]?.id)}
                      >
                        Show the next one
                      </button>
                    ) : null}
                    <RemoveButton inbox={inbox} problem={featured} className={`${QUIET} ml-auto`} />
                  </div>
                </article>
              </li>
            </ul>
            {rest.length > 0 ? (
              <>
                <h2 className="mt-5 mb-0.5 text-sm font-semibold text-muted">
                  {rest.length} more waiting for a verdict
                </h2>
                <ul>
                  {rest.map((problem) => (
                    <li
                      key={problem.id}
                      className="land flex flex-wrap items-center gap-x-3.5 py-2"
                    >
                      <Title problem={problem} className="basis-full sm:flex-1 sm:basis-0" />
                      <RemoveButton
                        inbox={inbox}
                        problem={problem}
                        className={`${QUIET} ml-auto`}
                      />
                      <JudgeButton inbox={inbox} problem={problem} className={OUTLINED} />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </>
        )}
      </Waiting>
      {empty ? (
        <p className="mt-5 text-center text-muted">
          It waits here until you judge it: Fix now, Parked or Good enough.
        </p>
      ) : (
        <CaptureForm
          inbox={inbox}
          className="mt-5 flex items-center gap-3 rounded-[14px] bg-surface py-2 pr-2 pl-4.5 outline-accent focus-within:outline-2 focus-within:outline-offset-2"
        >
          <CaptureInput
            ref={input}
            inbox={inbox}
            placeholder="What else is bothering you?"
            className="py-2 outline-none"
          />
          <AddButton inbox={inbox} className={GO}>
            Add
          </AddButton>
        </CaptureForm>
      )}
      <SaveError inbox={inbox} className="mt-3 text-center" />
      <Notice inbox={inbox} className="mt-3 text-center text-sm text-muted" />
    </main>
  );
}
