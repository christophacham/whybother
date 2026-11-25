import "@fontsource-variable/inter";
// Editorial sets its question and placeholder in true italics at display size, which the
// package's default file (upright, weight axis only) cannot draw.
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";

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

/** Type does the work: a large serif question, an underline in place of a box, no cards. */
export function Editorial({ inbox }: { inbox: Inbox }) {
  const count = inbox.waiting.length;
  return (
    <main className="mx-auto max-w-2xl px-5 py-7 sm:px-10">
      <header className="mb-10 flex justify-between text-xs tracking-widest text-muted uppercase">
        <b className="font-semibold text-fg">whybother</b>
        <Nav className="flex gap-3 [&>button]:uppercase" />
      </header>
      <h1 className="mb-6 font-display text-4xl leading-none tracking-tight sm:text-[46px]">
        What's <em className="text-accent">bothering</em> you?
      </h1>
      <CaptureForm
        inbox={inbox}
        className="flex items-end gap-4 border-b-[1.5px] border-line pb-2.5 focus-within:border-accent"
      >
        <CaptureInput
          inbox={inbox}
          placeholder="The deploy takes twenty minutes"
          className="font-display text-[22px] leading-snug outline-none placeholder:italic"
        />
        <AddButton
          inbox={inbox}
          className="pb-1 text-sm font-semibold whitespace-nowrap text-accent disabled:text-muted"
        >
          Write it down ↵
        </AddButton>
      </CaptureForm>
      <p className="mt-2.5 text-[13px] text-muted">One sentence. The problem, not the fix.</p>
      <SaveError inbox={inbox} className="mt-2" />
      <Waiting inbox={inbox} className="mt-10">
        {count === 0 ? (
          <p className="max-w-[30em] border-t border-fg/15 pt-4.5 font-display text-[19px] text-fg/85">
            Nothing written down yet. Most things that bother you are{" "}
            <em className="text-accent">not worth fixing</em>. Write one down and find out which.
          </p>
        ) : (
          <>
            <div className="mb-1.5 flex items-baseline justify-between">
              <h2 className="font-display text-xl">Waiting for a verdict</h2>
              <span className="text-[13px] text-muted">
                {count} {count === 1 ? "problem" : "problems"}
              </span>
            </div>
            <ul>
              {inbox.waiting.map((problem, index) => (
                <li
                  key={problem.id}
                  className="land flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-fg/15 py-3.5"
                >
                  <span className="w-5 font-mono text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Title problem={problem} className="flex-1 basis-3/4 text-[17px] sm:basis-0" />
                  <Age
                    inbox={inbox}
                    problem={problem}
                    className="mr-auto text-[13px] text-muted sm:mr-0"
                  />
                  <JudgeButton
                    inbox={inbox}
                    problem={problem}
                    className="text-sm font-semibold text-accent hover:underline"
                  >
                    Judge →
                  </JudgeButton>
                  <RemoveButton
                    inbox={inbox}
                    problem={problem}
                    className="text-[13px] text-muted hover:text-fg hover:underline"
                  />
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
