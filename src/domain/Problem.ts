import * as Schema from "effect/Schema";

/** One answer on the 1 to 5 scale used by every judging question. */
export const Score = Schema.Literals([1, 2, 3, 4, 5]);
export type Score = typeof Score.Type;

/** The four questions that produce a verdict. */
export const Answers = Schema.Struct({
  /** How much does it hurt today? 1 = barely, 5 = daily. */
  pain: Score,
  /** How bad is it if I do nothing? 1 = harmless, 5 = disaster. */
  risk: Score,
  /** How much better would fixed be? 1 = slightly, 5 = hugely. */
  gain: Score,
  /** How much effort is the fix? 1 = an hour, 5 = months. */
  cost: Score,
});
export type Answers = typeof Answers.Type;

export const Verdict = Schema.Literals(["FixNow", "NotNow", "GoodEnough"]);
export type Verdict = typeof Verdict.Type;

/** What the user wrote down and answered when judging. */
export const Assessment = Schema.Struct({
  today: Schema.String,
  properSolution: Schema.String,
  /** How close today is to the proper solution, 0 to 100. */
  closeness: Schema.Number,
  answers: Answers,
  /** What the answers said, kept so an overruled verdict stays visible. */
  suggested: Verdict,
  judgedAt: Schema.String,
});
export type Assessment = typeof Assessment.Type;

export const Step = Schema.Struct({
  id: Schema.String,
  text: Schema.String,
  done: Schema.Boolean,
});
export type Step = typeof Step.Type;

export const Trigger = Schema.Union([
  Schema.TaggedStruct("OnDate", { date: Schema.String }),
  Schema.TaggedStruct("OnCondition", { text: Schema.String, happened: Schema.Boolean }),
]);
export type Trigger = typeof Trigger.Type;

/** Where a problem stands. Only `FixNow` carries steps. */
export const Outcome = Schema.Union([
  Schema.TaggedStruct("Unjudged", {}),
  Schema.TaggedStruct("FixNow", {
    why: Schema.String,
    effort: Schema.String,
    /** Closeness the planned steps are expected to reach, 0 to 100. */
    target: Schema.Number,
    steps: Schema.Array(Step),
  }),
  Schema.TaggedStruct("Parked", { reason: Schema.String, trigger: Trigger }),
  Schema.TaggedStruct("GoodEnough", { reason: Schema.String, closedAt: Schema.String }),
]);
export type Outcome = typeof Outcome.Type;

export const Problem = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  createdAt: Schema.String,
  /** Absent until the problem has been judged once. */
  assessment: Schema.optional(Assessment),
  outcome: Outcome,
});
export type Problem = typeof Problem.Type;

export const Problems = Schema.Array(Problem);
