import { useAtomRefresh, useAtomSet, useAtomValue } from "@effect/atom-react";
import { useEffect, useState } from "react";

import type { Problem } from "~/domain/Problem.ts";
import {
  STORAGE_KEY,
  addProblemAtom,
  problemsAtom,
  removeStored,
  restoreStored,
  withStorageLock,
} from "~/state/problems.ts";

/** Everything a design may show or do. Designs never touch atoms or storage themselves. */
export interface Inbox {
  readonly problems: ReadonlyArray<Problem>;
  /** The problems waiting for a verdict, newest first. */
  readonly waiting: ReadonlyArray<Problem>;
  /** The time to measure ages from. Moves on every minute, so "5 minutes ago" stays true. */
  readonly now: number;
  readonly draft: string;
  readonly setDraft: (draft: string) => void;
  readonly saving: boolean;
  /** Why the last change was not saved, to show as an alert. */
  readonly failure: string | undefined;
  /** What the last change did, to show as a status line. */
  readonly notice: string | undefined;
  readonly add: () => void;
  readonly remove: (problem: Problem) => void;
  /** Puts the last removed problem back. Undefined when there is nothing to put back. */
  readonly undo: (() => void) | undefined;
  readonly judge: (problem: Problem) => void;
}

/**
 * A title is one line: a textarea lets Shift+Enter and paste put line breaks in. Each break
 * becomes one space. Spaces inside a line are kept as typed, because they can carry meaning.
 */
const oneLine = (text: string) =>
  // Each run of whitespace is matched once, so a long run of pasted spaces stays quick.
  text.trim().replace(/\s+/g, (run) => (/[\r\n]/.test(run) ? " " : run));

export function useInbox(): Inbox {
  const problems = useAtomValue(problemsAtom);
  const addProblem = useAtomSet(addProblemAtom);
  const reload = useAtomRefresh(problemsAtom);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string>();
  // What the last change did. A removal carries the problem, so it can be put back until the
  // next change replaces the notice.
  const [notice, setNotice] = useState<{ text: string; removed?: Problem }>();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(tick);
  }, []);

  // Another tab saved or cleared storage: show what is stored now. Reloading never writes, so
  // a tab cannot put an older list back.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key === null || event.key === STORAGE_KEY) reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [reload]);

  const add = () => {
    const title = oneLine(draft);
    if (!title || saving) return;
    setSaving(true);
    setFailure(undefined);
    // Clear the box only once the problem is saved, so a failed save keeps what was typed.
    void withStorageLock(() => addProblem(title)).then(
      () => {
        setDraft((current) => (oneLine(current) === title ? "" : current));
        // Naming it makes each notice different, so a screen reader announces every add.
        setNotice({ text: `Added “${title}”.` });
        setSaving(false);
      },
      () => {
        setFailure("Could not save. Your text is still in the box, so you can try again.");
        setSaving(false);
      },
    );
  };

  const remove = (problem: Problem) => {
    setFailure(undefined);
    void withStorageLock(() => removeStored(problem.id)).then(
      (gone) => {
        reload();
        // Nothing was removed if another tab, or an earlier click, got there first. Then
        // there is nothing of ours to put back, and the notice we have stays.
        if (gone) setNotice({ text: `Removed “${gone.title}”.`, removed: gone });
      },
      () => setFailure("Could not remove it. Nothing was changed."),
    );
  };

  const undo = (problem: Problem) => {
    setFailure(undefined);
    void withStorageLock(() => restoreStored(problem)).then(
      () => {
        reload();
        setNotice({ text: "Put back." });
      },
      // The notice keeps the problem, so Undo can be tried again.
      () => setFailure("Could not put it back. You can try Undo again."),
    );
  };

  const removed = notice?.removed;
  return {
    problems,
    waiting: problems.filter((problem) => problem.outcome._tag === "Unjudged"),
    now,
    draft,
    setDraft,
    saving,
    failure,
    notice: notice?.text,
    add,
    remove,
    undo: removed ? () => undo(removed) : undefined,
    // The Judge screen is step 2 of the build order. Until it exists, the button says so.
    judge: () => setNotice({ text: "Judge is the next screen to be built." }),
  };
}
