import type { Answers, Verdict } from "./Problem.ts";

export interface Judgement {
  readonly verdict: Verdict;
  /** Short clauses explaining the verdict, in the order they should be read. */
  readonly reasons: ReadonlyArray<string>;
}

/**
 * Turns the four answers and the closeness gauge into a verdict.
 *
 * The weights are a first guess carried over from the prototype (SPEC.md, "Scoring").
 * Value is what fixing buys (pain + risk + gain), scaled down the closer today already
 * is to the proper solution, minus what the fix costs.
 */
export const judge = (answers: Answers, closeness: number): Judgement => {
  const value = answers.pain + answers.risk + answers.gain;
  const room = (100 - closeness) / 100;
  const score = value * (0.5 + room / 2) - answers.cost * 1.5;

  const reasons: Array<string> = [];
  if (answers.risk >= 4) reasons.push("doing nothing is risky");
  else if (answers.risk <= 2) reasons.push("doing nothing costs little");
  if (answers.pain >= 4) reasons.push("it hurts often");
  else if (answers.pain <= 2) reasons.push("it rarely hurts");
  if (answers.gain >= 4) reasons.push("the fix is a big step up");
  else if (answers.gain <= 2) reasons.push("the fix changes little");
  if (answers.cost >= 4) reasons.push("the fix is expensive");
  else if (answers.cost <= 2) reasons.push("the fix is cheap");
  if (closeness >= 75) reasons.push("you are already most of the way there");

  const verdict: Verdict =
    closeness >= 90 || value <= 6 ? "GoodEnough" : score >= 4.5 ? "FixNow" : "NotNow";
  return { verdict, reasons };
};
