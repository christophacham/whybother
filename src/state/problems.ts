import * as BrowserKeyValueStore from "@effect/platform-browser/BrowserKeyValueStore";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as KeyValueStore from "effect/persistence/KeyValueStore";
import * as Atom from "effect/reactivity/Atom";
import * as Schema from "effect/Schema";

import { type Problem, Problems } from "~/domain/Problem.ts";

/** The one storage key for v1 (SPEC.md, "Storage rules"). */
export const STORAGE_KEY = "whybother:problems:v1";

/** The JSON codec for the stored list (the same one `Atom.kvs` would use). */
const storedCodec = Schema.fromJsonString(Schema.toCodecJson(Problems));
const decodeStored = Schema.decodeUnknownOption(storedCodec);
const encodeStored = Schema.encodeSync(storedCodec);

/**
 * All persistence goes through Effect's KeyValueStore, so moving from the browser to a
 * server later means swapping this layer, not the atoms or the UI. localStorage is
 * synchronous, so these run synchronously.
 */
const runStore = <A>(
  f: (store: KeyValueStore.KeyValueStore) => Effect.Effect<A, KeyValueStore.KeyValueStoreError>,
): A =>
  Effect.runSync(
    KeyValueStore.KeyValueStore.use(f).pipe(Effect.provide(BrowserKeyValueStore.layerLocalStorage)),
  );

/**
 * Reads the stored list. A missing key is an empty list and is not written, so reading never
 * changes storage. Unreadable values are moved aside by `checkStorage` before the app starts.
 */
const readProblems = (): ReadonlyArray<Problem> => {
  const raw = runStore((store) => store.get(STORAGE_KEY));
  return raw === undefined ? [] : Option.getOrElse(decodeStored(raw), () => []);
};

const writeProblems = (problems: ReadonlyArray<Problem>): void =>
  runStore((store) => store.set(STORAGE_KEY, encodeStored(problems)));

/**
 * Every problem the user has captured. Not `Atom.kvs`: that writes its default whenever the key
 * is missing and overwrites values it cannot decode. Refreshing this atom re-reads storage.
 */
export const problemsAtom = Atom.writable(
  () => readProblems(),
  (ctx, value: ReadonlyArray<Problem>) => {
    writeProblems(value);
    ctx.setSelf(value);
  },
);

/** Adds to the latest stored list, so a capture another tab saved a moment ago is kept. */
export const addProblemAtom = Atom.writable(
  () => undefined,
  (ctx, title: string) => ctx.set(problemsAtom, [newProblem(title), ...readProblems()]),
);

/**
 * Runs `f` while holding a lock every tab shares, so two tabs cannot both read the list before
 * either writes. Resolves once `f` has run and rejects if it throws, for example when storage
 * is full. Web Locks need a secure context (HTTPS or localhost); elsewhere `f` runs unlocked.
 */
export const withStorageLock = (f: () => void): Promise<void> =>
  "locks" in navigator
    ? navigator.locks.request(STORAGE_KEY, f)
    : new Promise((resolve) => {
        f();
        resolve();
      });

/** What the startup check found. */
export type StorageCheck =
  /** Safe to start. `backupKey` is set when unreadable data was moved there. */
  | { readonly _tag: "Ready"; readonly backupKey: string | undefined }
  /** Do not start: the browser blocks storage, or unreadable data could not be backed up. */
  | { readonly _tag: "Blocked"; readonly reason: "unavailable" | "backup-failed" };

const ready = (backupKey: string | undefined): StorageCheck => ({ _tag: "Ready", backupKey });
const blocked = (reason: "unavailable" | "backup-failed"): StorageCheck => ({
  _tag: "Blocked",
  reason,
});

/**
 * Run before the app starts. `Atom.kvs` treats a value it cannot decode as missing and
 * overwrites it on the next save, so an unreadable value is copied to a backup key first and
 * never dropped silently. If that copy fails, or storage is blocked, the app must not start.
 */
export const checkStorage: Effect.Effect<StorageCheck> = Effect.gen(function* () {
  const store = yield* KeyValueStore.KeyValueStore;
  const raw = yield* store.get(STORAGE_KEY);
  if (raw === undefined || Option.isSome(decodeStored(raw))) return ready(undefined);
  const now = yield* DateTime.now;
  const backupKey = `${STORAGE_KEY}:unreadable:${DateTime.formatIso(now)}`;
  const copied = yield* store.set(backupKey, raw).pipe(
    Effect.as(true),
    Effect.orElseSucceed(() => false),
  );
  if (!copied) return blocked("backup-failed");
  // The copy is safe now. If removing the original fails, the next save replaces it anyway.
  yield* Effect.ignore(store.remove(STORAGE_KEY));
  return ready(backupKey);
}).pipe(
  Effect.provide(BrowserKeyValueStore.layerLocalStorage),
  // Blocked storage throws while the layer is built, which is a defect, not a failure.
  Effect.catchCause(() => Effect.succeed(blocked("unavailable"))),
);

export const newProblem = (title: string): Problem => ({
  id: crypto.randomUUID(),
  title,
  createdAt: new Date().toISOString(),
  outcome: { _tag: "Unjudged" },
});
