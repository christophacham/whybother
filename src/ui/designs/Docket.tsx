import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";

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

const LABEL = "font-mono text-[11px] tracking-widest text-muted uppercase";
const COLUMNS = "sm:grid sm:grid-cols-[3.5rem_1fr_7rem_8.5rem_4rem_2rem] sm:gap-3";

/** A case number that stays the same for a problem, read from the id it already has. */
const caseNumber = (problem: Problem) => `#${problem.id.slice(0, 4).toUpperCase()}`;

/** Problems are cases with a number and a status, in a ruled table with square corners. */
export function Docket({ inbox }: { inbox: Inbox }) {
  return (
    <main>
      <header className="flex justify-between border-b border-fg/20 px-5 sm:px-7">
        <span className="py-4 font-mono text-sm font-bold tracking-wide">
          WHYBOTHER<span className="text-accent">?</span>
        </span>
        <Nav
          className="flex items-stretch gap-5 font-mono text-xs tracking-wider text-muted uppercase [&>button]:uppercase"
          currentClassName="flex items-center border-b-2 border-accent text-fg"
        >
          {` (${inbox.waiting.length})`}
        </Nav>
      </header>
      <div className="mx-auto max-w-3xl px-5 pt-7 pb-4 sm:px-7">
        <p className={`${LABEL} mb-2`}>File a problem</p>
        <h1 className="mb-3.5 text-2xl font-semibold tracking-tight">What's bothering you?</h1>
        <CaptureForm
          inbox={inbox}
          className="flex items-stretch rounded-box border border-line bg-surface focus-within:border-accent focus-within:ring-1 focus-within:ring-accent"
        >
          <span className="border-r border-fg/20 px-3 pt-4 font-mono text-xs text-muted">NEW</span>
          <CaptureInput
            inbox={inbox}
            placeholder="The deploy takes 20 minutes"
            className="px-3.5 py-3 outline-none"
          />
          <AddButton
            inbox={inbox}
            className="bg-accent px-4 font-mono text-xs font-bold tracking-wider whitespace-nowrap text-on-accent uppercase disabled:bg-fg/10 disabled:text-muted"
          >
            File it ↵
          </AddButton>
        </CaptureForm>
        <p className="mt-2 font-mono text-[11px] text-muted">
          One sentence. State the problem, not the remedy.
        </p>
        <SaveError inbox={inbox} className="mt-2" />
        <Waiting inbox={inbox} className="mt-7">
          <div className={`${LABEL} ${COLUMNS} hidden border-b border-line pb-2`}>
            <span>Case</span>
            <span>Problem</span>
            <span>Filed</span>
            <span>Status</span>
          </div>
          {inbox.waiting.length === 0 ? (
            <p className="border-b border-fg/20 py-6 font-mono text-[13px] leading-relaxed text-muted">
              <b className="font-medium text-fg">No cases pending.</b>
              <br />
              Every case gets a hearing: four questions, then a verdict.
              <br />
              FIX NOW · PARKED · GOOD ENOUGH
            </p>
          ) : (
            <ul>
              {inbox.waiting.map((problem) => (
                <li
                  key={problem.id}
                  className={`land ${COLUMNS} flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-fg/20 py-3`}
                >
                  <span className="font-mono text-xs text-muted">{caseNumber(problem)}</span>
                  <Title problem={problem} className="basis-4/5 text-[15px] font-medium" />
                  {/* Always there, so a problem without a readable date keeps its columns. */}
                  <span className="font-mono text-xs text-muted">
                    <Age inbox={inbox} problem={problem} />
                  </span>
                  <span className="mr-auto rounded-box border border-accent px-1.5 py-0.5 text-center font-mono text-[10px] font-bold tracking-wide whitespace-nowrap text-accent">
                    AWAITING VERDICT
                  </span>
                  <JudgeButton
                    inbox={inbox}
                    problem={problem}
                    className="text-left font-mono text-xs font-bold hover:text-accent"
                  >
                    Judge →
                  </JudgeButton>
                  <RemoveButton
                    inbox={inbox}
                    problem={problem}
                    className="px-2.5 py-1.5 leading-none text-muted hover:text-fg"
                  >
                    ×
                  </RemoveButton>
                </li>
              ))}
            </ul>
          )}
        </Waiting>
        <Notice inbox={inbox} className="mt-3 font-mono text-xs text-muted" />
      </div>
    </main>
  );
}
