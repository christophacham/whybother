import { DesignSwitcher, useDesign } from "~/ui/DesignSwitcher.tsx";
import { DESIGNS } from "~/ui/designs/index.ts";
import { useInbox } from "~/ui/useInbox.ts";

interface AppProps {
  /** Set when saved data could not be read at startup and was moved to this key. */
  readonly unreadableBackupKey: string | undefined;
}

/** Walking skeleton: capture and inbox only. The rest of the flow is in SPEC.md. */
export function App({ unreadableBackupKey }: AppProps) {
  // Above the design, so a draft, a pending Undo and a save error survive switching design.
  const inbox = useInbox();
  const [design, choose] = useDesign();
  const { Design } = DESIGNS[design];

  return (
    <>
      {unreadableBackupKey === undefined ? null : (
        <p
          role="alert"
          className="mx-auto mt-4 max-w-2xl rounded-xl border border-amber-700 bg-amber-950 p-4 text-sm text-amber-100"
        >
          Your saved problems could not be read, so the list starts empty. The original data is kept
          in this browser under <code className="font-mono">{unreadableBackupKey}</code>.
        </p>
      )}
      <Design inbox={inbox} />
      {/* Room to scroll the last row clear of the switcher in the corner. */}
      <div className="h-16" />
      <DesignSwitcher design={design} choose={choose} />
    </>
  );
}
