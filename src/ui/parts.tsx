import type { ReactNode, Ref } from "react";

import { age } from "~/domain/age.ts";
import type { Problem } from "~/domain/Problem.ts";
import type { Inbox } from "~/ui/useInbox.ts";

/**
 * The pieces every design is built from. They own the behaviour and the accessible names the
 * end-to-end tests rely on; a design only places them and gives them classes. Only problems
 * are list items, so a design must not use `li` for anything else.
 */

interface Styled {
  readonly className?: string;
  readonly children?: ReactNode;
}
interface WithInbox extends Styled {
  readonly inbox: Inbox;
}
interface WithProblem extends WithInbox {
  readonly problem: Problem;
}

const cx = (...classes: ReadonlyArray<string | undefined>) => classes.filter(Boolean).join(" ");

export function CaptureForm({ inbox, className, children }: WithInbox) {
  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        inbox.add();
        // Keep typing after clicking the button: the next problem goes in the same box.
        event.currentTarget.querySelector("textarea")?.focus();
      }}
    >
      {children}
    </form>
  );
}

interface CaptureInputProps extends WithInbox {
  readonly placeholder: string;
  readonly ref?: Ref<HTMLTextAreaElement>;
}

/** Grows with its text where the browser supports `field-sizing`, and scrolls elsewhere. */
export function CaptureInput({ inbox, className, placeholder, ref }: CaptureInputProps) {
  return (
    <textarea
      ref={ref}
      rows={1}
      aria-label="What's bothering you?"
      autoComplete="off"
      placeholder={placeholder}
      className={cx(
        "block field-sizing-content w-full min-w-0 resize-none placeholder:text-muted",
        className,
      )}
      value={inbox.draft}
      onChange={(event) => inbox.setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" || event.shiftKey) return;
        // Enter that confirms an input-method choice is not a submit. Safari reports that one
        // after composition has ended, with only the 229 key code to tell it apart.
        if (event.nativeEvent.isComposing || event.keyCode === 229) return;
        event.preventDefault();
        event.currentTarget.form?.requestSubmit();
      }}
    />
  );
}

/** Named "Add problem" whatever a design writes on it. Off until there is something to add. */
export function AddButton({ inbox, className, children }: WithInbox) {
  return (
    <button
      type="submit"
      aria-label="Add problem"
      disabled={inbox.saving || !inbox.draft.trim()}
      className={cx("cursor-pointer disabled:cursor-default", className)}
    >
      {children}
    </button>
  );
}

/** The region holding the waiting problems, or a design's empty state when there are none. */
export function Waiting({ inbox, className, children }: WithInbox) {
  return (
    <section aria-label={`Waiting for a verdict (${inbox.waiting.length})`} className={className}>
      {children}
    </section>
  );
}

export function Title({ problem, className }: Omit<WithProblem, "inbox">) {
  return (
    <span data-testid="title" className={cx("min-w-0 wrap-anywhere", className)}>
      {problem.title}
    </span>
  );
}

export function Age({ inbox, problem, className }: WithProblem) {
  const text = age(problem.createdAt, inbox.now);
  return text === undefined ? null : <span className={className}>{text}</span>;
}

export function JudgeButton({ inbox, problem, className, children = "Judge" }: WithProblem) {
  return (
    <button
      type="button"
      aria-label={`Judge: ${problem.title}`}
      className={cx("cursor-pointer", className)}
      onClick={() => inbox.judge(problem)}
    >
      {children}
    </button>
  );
}

export function RemoveButton({ inbox, problem, className, children = "Remove" }: WithProblem) {
  return (
    <button
      type="button"
      aria-label={`Remove: ${problem.title}`}
      className={cx("cursor-pointer", className)}
      onClick={() => inbox.remove(problem)}
    >
      {children}
    </button>
  );
}

/** Says what the last change did. Always rendered, so screen readers hear it change. */
export function Notice({ inbox, className }: WithInbox) {
  return (
    <p role="status" className={cx("min-h-6 wrap-anywhere", className)}>
      {inbox.notice}
      {inbox.undo ? (
        <button
          type="button"
          className="ml-2 cursor-pointer text-accent underline underline-offset-3"
          onClick={inbox.undo}
        >
          Undo
        </button>
      ) : null}
    </p>
  );
}

export function SaveError({ inbox, className }: WithInbox) {
  return inbox.failure === undefined ? null : (
    <p role="alert" className={cx("text-sm text-red-300", className)}>
      {inbox.failure}
    </p>
  );
}

interface NavProps extends Styled {
  readonly currentClassName?: string;
}

/** Inbox is the only screen so far. Overview is shown, switched off, where a design has tabs. */
export function Nav({ className, currentClassName, children }: NavProps) {
  return (
    <nav aria-label="Main" className={className}>
      <span aria-current="page" className={currentClassName}>
        Inbox{children}
      </span>
      <button type="button" disabled title="Overview is a later screen">
        Overview
      </button>
    </nav>
  );
}
