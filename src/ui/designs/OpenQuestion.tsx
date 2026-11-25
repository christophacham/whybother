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

/** The question is the page: one big line to write on, everything else quiet on one left edge. */
export function OpenQuestion({ inbox }: { inbox: Inbox }) {
  const count = inbox.waiting.length;
  return (
    <main className="mx-auto max-w-[46rem] px-5 pt-6 pb-8 sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[17px] font-bold tracking-tight">whybother</span>
        <Nav
          className="flex gap-4.5 text-sm text-muted"
          currentClassName="py-1.5 text-fg shadow-[inset_0_-2px_var(--color-accent)]"
        >
          {count === 0 ? "" : ` ${count}`}
        </Nav>
      </header>
      <h1 className="mt-9 text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:mt-15 sm:text-[40px]">
        What's bothering you?
      </h1>
      <p className="mt-2.5 max-w-[52ch] text-muted">
        Say it in one sentence. You decide later whether it's worth fixing, so nothing becomes a
        task yet.
      </p>
      <CaptureForm
        inbox={inbox}
        className="mt-7.5 flex flex-col gap-4 border-b-2 border-line pb-3 focus-within:border-accent sm:flex-row sm:items-end"
      >
        <CaptureInput
          inbox={inbox}
          placeholder="For example: the printer jams every Monday"
          className="text-[22px] leading-snug outline-none"
        />
        <AddButton
          inbox={inbox}
          className="min-h-10 rounded-box border border-accent bg-accent px-4 text-sm font-semibold whitespace-nowrap text-on-accent disabled:border-line disabled:bg-transparent disabled:text-muted"
        >
          Add problem
        </AddButton>
      </CaptureForm>
      <SaveError inbox={inbox} className="mt-2.5" />
      <Notice inbox={inbox} className="mt-2.5 text-sm text-muted" />
      <Waiting inbox={inbox} className="mt-8">
        {count === 0 ? (
          <p className="text-muted">Nothing is waiting for a verdict.</p>
        ) : (
          <>
            <h2 className="mb-1.5 text-[15px] font-semibold">{count} waiting for a verdict</h2>
            <ul>
              {inbox.waiting.map((problem) => (
                <li
                  key={problem.id}
                  className="land flex flex-wrap items-center gap-x-3.5 gap-y-1 border-b border-fg/15 py-3.5 last:border-0"
                >
                  <div className="min-w-0 basis-full sm:flex-1 sm:basis-0">
                    <Title problem={problem} className="block text-[17px] font-medium" />
                    <Age inbox={inbox} problem={problem} className="text-[13px] text-muted" />
                  </div>
                  <RemoveButton
                    inbox={inbox}
                    problem={problem}
                    className="ml-auto px-1 py-1.5 text-[13px] text-muted hover:text-fg hover:underline"
                  />
                  <JudgeButton
                    inbox={inbox}
                    problem={problem}
                    className="rounded-box border border-line px-3 py-1.5 text-sm font-semibold hover:border-accent hover:text-accent"
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </Waiting>
    </main>
  );
}
