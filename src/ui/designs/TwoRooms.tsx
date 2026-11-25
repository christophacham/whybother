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
  ["It waits here", "No date, no priority, no to-do."],
  ["You judge it", "Four questions about what it costs you and what fixing it would take."],
  ["It gets one outcome", "Fix now, Parked or Good enough. Only Fix now gets steps."],
] as const;

/** Writing down and judging get separate halves, so the capture box never moves. */
export function TwoRooms({ inbox }: { inbox: Inbox }) {
  const count = inbox.waiting.length;
  // The grid fills the screen down to the 4rem of room App leaves for the design switcher.
  return (
    <div className="grid min-h-[calc(100dvh-4rem)] grid-rows-[auto_1fr] md:grid-cols-[46%_1fr] md:grid-rows-1">
      {/* The green half is lighter than the page, so its quiet text and lines get lighter too. */}
      <CaptureForm
        inbox={inbox}
        className="flex flex-col gap-4.5 bg-surface p-6 [--color-line:#7ba79b] [--color-muted:#bddad1] md:items-end"
      >
        <div className="flex w-full max-w-md flex-1 flex-col gap-4.5">
          <span className="text-[19px] font-bold tracking-tight">whybother</span>
          <h1 className="mt-3.5 text-3xl leading-[1.12] font-semibold tracking-tight md:mt-11">
            What's bothering you?
          </h1>
          <p className="text-muted">One sentence. Nothing becomes a task until you've judged it.</p>
          <CaptureInput
            inbox={inbox}
            placeholder="For example: the printer jams every Monday"
            className="min-h-28 flex-1 rounded-box bg-black/30 p-4 text-[22px] leading-snug focus-visible:outline-2 focus-visible:outline-accent md:min-h-44"
          />
          <SaveError inbox={inbox} />
          <div className="flex items-center justify-between gap-3 text-sm text-muted">
            Enter to add
            <AddButton
              inbox={inbox}
              className="min-h-10 rounded-lg border border-accent bg-accent px-4 font-semibold text-on-accent disabled:border-line disabled:bg-transparent disabled:text-muted"
            >
              Add problem
            </AddButton>
          </div>
        </div>
      </CaptureForm>
      <main className="flex min-w-0 max-w-xl flex-col p-6">
        <Nav
          className="flex gap-4.5 text-sm text-muted"
          currentClassName="py-1.5 text-fg shadow-[inset_0_-2px_var(--color-accent)]"
        >
          {count === 0 ? "" : ` ${count}`}
        </Nav>
        <Waiting inbox={inbox} className="mt-9">
          {count === 0 ? (
            <>
              <h2 className="mb-1 text-[22px] font-semibold tracking-tight">Nothing is waiting</h2>
              <p className="text-muted">Here's what happens to a problem you add.</p>
              <div className="mt-5 grid gap-5.5">
                {STEPS.map(([title, text]) => (
                  <p key={title} className="text-muted">
                    <b className="block text-base text-fg">{title}</b>
                    {text}
                  </p>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-1 text-[22px] font-semibold tracking-tight">
                {count} waiting for a verdict
              </h2>
              <ul>
                {inbox.waiting.map((problem) => (
                  <li key={problem.id} className="land border-b border-fg/15 py-4.5">
                    <Title
                      problem={problem}
                      className="block text-[17px] leading-snug font-medium"
                    />
                    <div className="mt-2.5 flex items-center gap-3">
                      <Age inbox={inbox} problem={problem} className="text-[13px] text-muted" />
                      <RemoveButton
                        inbox={inbox}
                        problem={problem}
                        className="ml-auto px-1 py-1.5 text-[13px] text-muted hover:text-fg hover:underline"
                      />
                      <JudgeButton
                        inbox={inbox}
                        problem={problem}
                        className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-accent hover:text-accent"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Waiting>
        <Notice inbox={inbox} className="mt-auto pt-3.5 text-sm text-muted" />
      </main>
    </div>
  );
}
