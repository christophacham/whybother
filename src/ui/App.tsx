import { useAtom } from "@effect/atom-react";
import * as Option from "effect/Option";
import { useEffect, useState } from "react";

import { STORAGE_KEY, decodeStoredProblems, newProblem, problemsAtom } from "~/state/problems.ts";

interface AppProps {
  /** Set when saved data could not be read at startup and was moved to this key. */
  readonly unreadableBackupKey: string | undefined;
}

/** Walking skeleton: capture and inbox only. The rest of the flow is in SPEC.md. */
export function App({ unreadableBackupKey }: AppProps) {
  const [problems, setProblems] = useAtom(problemsAtom);
  const [draft, setDraft] = useState("");
  const unjudged = problems.filter((problem) => problem.outcome._tag === "Unjudged");

  // Another tab saved: take its list, so this tab's next save does not overwrite it.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue === null) return setProblems([]);
      Option.match(decodeStoredProblems(event.newValue), {
        onNone: () => undefined,
        onSome: setProblems,
      });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setProblems]);

  const add = () => {
    const title = draft.trim();
    if (!title) return;
    setProblems([newProblem(title), ...problems]);
    setDraft("");
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      {unreadableBackupKey === undefined ? null : (
        <p
          role="alert"
          className="rounded-xl border border-amber-400 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
        >
          Your saved problems could not be read, so the list starts empty. The original data is kept
          in this browser under <code className="font-mono">{unreadableBackupKey}</code>.
        </p>
      )}
      <form
        className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <label className="text-lg font-semibold" htmlFor="capture">
          What's bothering you?
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="capture"
            className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
            placeholder="Describe the problem in one sentence"
            autoComplete="off"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
          >
            Add problem
          </button>
        </div>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          Waiting for a verdict ({unjudged.length})
        </h2>
        {unjudged.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700">
            Nothing is waiting.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {unjudged.map((problem) => (
              <li
                key={problem.id}
                className="rounded-xl border border-neutral-200 px-4 py-3 font-medium dark:border-neutral-800"
              >
                {problem.title}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
