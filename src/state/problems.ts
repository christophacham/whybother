import * as BrowserKeyValueStore from "@effect/platform-browser/BrowserKeyValueStore";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Atom from "effect/reactivity/Atom";
import * as Schema from "effect/Schema";
import * as KeyValueStore from "effect/persistence/KeyValueStore";

import { type Problem, Problems } from "~/domain/Problem.ts";

/** The one storage key for v1 (SPEC.md, "Storage rules"). */
export const STORAGE_KEY = "whybother:problems:v1";

/**
 * All persistence goes through Effect's KeyValueStore, so moving from the browser to a
 * server later means swapping this layer, not the atoms or the UI.
 */
const storage = Atom.runtime(BrowserKeyValueStore.layerLocalStorage);

/** Every problem the user has captured, decoded with the schema on load. */
export const problemsAtom = Atom.kvs({
  runtime: storage,
  key: STORAGE_KEY,
  schema: Problems,
  defaultValue: (): ReadonlyArray<Problem> => [],
});

/** The same JSON codec `Atom.kvs` uses, so a stored string decodes here exactly as it does there. */
const decodeStored = Schema.decodeUnknownOption(
  Schema.fromJsonString(Schema.toCodecJson(Problems)),
);

/** Decodes a raw stored value, for example one written by another tab. */
export const decodeStoredProblems = (raw: string): Option.Option<ReadonlyArray<Problem>> =>
  decodeStored(raw);

/**
 * `Atom.kvs` treats a value it cannot decode as missing and overwrites it on the next save.
 * Run before the app starts: an unreadable value is copied to a backup key first, so it is
 * never dropped silently. Returns the backup key when that happened.
 */
export const rescueUnreadable: Effect.Effect<Option.Option<string>> = Effect.gen(function* () {
  const store = yield* KeyValueStore.KeyValueStore;
  const raw = yield* store.get(STORAGE_KEY);
  if (raw === undefined || Option.isSome(decodeStored(raw))) return Option.none();
  const now = yield* DateTime.now;
  const backupKey = `${STORAGE_KEY}:unreadable:${DateTime.formatIso(now)}`;
  yield* store.set(backupKey, raw);
  yield* store.remove(STORAGE_KEY);
  return Option.some(backupKey);
}).pipe(
  // Storage errors here must not stop the app from starting.
  Effect.orElseSucceed(() => Option.none()),
  Effect.provide(BrowserKeyValueStore.layerLocalStorage),
);

export const newProblem = (title: string): Problem => ({
  id: crypto.randomUUID(),
  title,
  createdAt: new Date().toISOString(),
  outcome: { _tag: "Unjudged" },
});
