interface StorageBlockedProps {
  readonly reason: "unavailable" | "backup-failed";
}

/** Shown instead of the app when starting it could lose saved problems. */
export function StorageBlocked({ reason }: StorageBlockedProps) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-10">
      <h1 className="text-lg font-semibold">whybother can't start</h1>
      <p role="alert" className="text-neutral-700 dark:text-neutral-300">
        {reason === "unavailable"
          ? "This browser does not allow the site to store data, and whybother keeps everything in browser storage. Allow site data for this page, then reload."
          : "Your saved problems could not be read, and there was no room to keep a backup copy. The app has not started, so nothing was overwritten. Free some browser storage for this site, then reload."}
      </p>
    </main>
  );
}
