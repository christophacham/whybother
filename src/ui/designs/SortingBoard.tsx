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

// Each lane has its own colour, which no other design needs.
const LANES = [
  ["FixNow", "Fix now", "[--lane:#74d6a0]", "Worth doing. The only lane that gets steps."],
  [
    "Parked",
    "Parked",
    "[--lane:#ebc266]",
    "Not now. Comes back on a date or when something happens.",
  ],
  ["GoodEnough", "Good enough", "[--lane:#92bdec]", "Closed. Left as it is, with the reason kept."],
] as const;

const LANE_TITLE = "flex justify-between gap-1.5 text-[13px] font-semibold sm:text-[15px]";

/** The three outcomes are always in view, so it is clear every problem ends up in one of them. */
export function SortingBoard({ inbox }: { inbox: Inbox }) {
  const count = inbox.waiting.length;
  return (
    <main className="mx-auto max-w-5xl px-4.5 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[17px] font-bold tracking-tight">whybother</span>
        <Nav
          className="flex gap-4.5 text-sm text-muted"
          currentClassName="py-1.5 text-fg shadow-[inset_0_-2px_var(--color-accent)]"
        >
          {count === 0 ? "" : ` ${count}`}
        </Nav>
      </header>
      <CaptureForm inbox={inbox} className="mt-6 rounded-box bg-surface px-4.5 pt-4 pb-4.5">
        <h1 className="text-[22px] font-semibold tracking-tight">What's bothering you?</h1>
        <div className="mt-2.5 flex flex-col gap-3.5 sm:flex-row sm:items-center">
          <CaptureInput
            inbox={inbox}
            placeholder="For example: the printer jams every Monday"
            className="rounded-lg border border-line bg-bg px-3.5 py-2.5 text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          <AddButton
            inbox={inbox}
            className="min-h-10 rounded-lg border border-accent bg-accent px-4 text-sm font-semibold whitespace-nowrap text-on-accent disabled:border-line disabled:bg-transparent disabled:text-muted"
          >
            Add problem
          </AddButton>
        </div>
        <SaveError inbox={inbox} className="mt-2.5" />
      </CaptureForm>
      <div className="mt-4.5 grid grid-cols-3 gap-2.5 md:grid-cols-[2.35fr_1fr_1fr_1fr]">
        <Waiting
          inbox={inbox}
          className="col-span-full rounded-[10px] bg-fg/5 p-3.5 md:col-span-1 md:min-h-85"
        >
          <h2 className={`${LANE_TITLE} text-accent`}>
            Waiting for a verdict <span>{count}</span>
          </h2>
          {count === 0 ? (
            <p className="mt-2 text-[15px] text-fg/80">
              Nothing is waiting. Add a problem and it stays here until you judge it. Judging moves
              it into one of the three lanes.
            </p>
          ) : (
            <ul>
              {inbox.waiting.map((problem) => (
                <li key={problem.id} className="land mt-2.5 rounded-lg bg-fg/10 p-3">
                  <Title problem={problem} className="block leading-snug font-medium" />
                  <div className="mt-2 flex items-center gap-2">
                    <Age inbox={inbox} problem={problem} className="text-[13px] text-muted" />
                    <RemoveButton
                      inbox={inbox}
                      problem={problem}
                      className="ml-auto px-1 py-1.5 text-[13px] text-muted hover:text-fg hover:underline"
                    />
                    <JudgeButton
                      inbox={inbox}
                      problem={problem}
                      className="rounded-lg border border-line px-2.5 py-1 text-sm font-semibold hover:border-accent hover:text-accent"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Waiting>
        {LANES.map(([tag, label, colour, text]) => (
          <section
            key={tag}
            className={`${colour} rounded-[10px] bg-(--lane)/10 px-3 py-3.5 md:min-h-85`}
          >
            <h2 className={`${LANE_TITLE} text-(--lane)`}>
              {label}{" "}
              <span>{inbox.problems.filter((problem) => problem.outcome._tag === tag).length}</span>
            </h2>
            <p className="mt-2 hidden text-[13px] text-fg/80 sm:block">{text}</p>
          </section>
        ))}
      </div>
      <Notice inbox={inbox} className="mt-3 text-sm text-muted" />
    </main>
  );
}
