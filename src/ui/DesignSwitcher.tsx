import { useLayoutEffect, useState } from "react";

import { DESIGNS, type DesignId } from "~/ui/designs/index.ts";

/** A preference, not data: it is kept apart from the problems and goes when the trial ends. */
const KEY = "whybother:design";

const isDesign = (value: string | null): value is DesignId =>
  value !== null && Object.hasOwn(DESIGNS, value);

const IDS = Object.keys(DESIGNS).filter(isDesign);

/** The address says what this tab shows. A bare address shows the design chosen last. */
const initialDesign = (): DesignId => {
  const fromAddress = new URLSearchParams(window.location.search).get("design");
  if (isDesign(fromAddress)) return fromAddress;
  const chosenLast = window.localStorage.getItem(KEY);
  return isDesign(chosenLast) ? chosenLast : "tidy";
};

export function useDesign() {
  const [design, setDesign] = useState(initialDesign);

  // The tokens in styles.css hang off this attribute.
  useLayoutEffect(() => {
    document.documentElement.dataset["design"] = design;
  }, [design]);

  /** Storage is written here only, never on load, so opening the app changes nothing stored. */
  const choose = (next: DesignId) => {
    setDesign(next);
    const address = new URL(window.location.href);
    address.searchParams.set("design", next);
    window.history.replaceState(window.history.state, "", address);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // Storage is full. The address still carries the choice.
    }
  };

  return [design, choose] as const;
}

interface DesignSwitcherProps {
  readonly design: DesignId;
  readonly choose: (design: DesignId) => void;
}

// A swatch carries a design's name as `data-design`, so the token blocks in styles.css colour
// it and no colour is written down twice.
const SWATCH =
  "size-3 flex-none rounded-full border border-white/25 bg-[linear-gradient(135deg,var(--color-accent)_50%,var(--color-bg)_50%)]";

/**
 * A small pill in the bottom-right corner. It is a tool for the trial, not part of any design,
 * so it has its own fixed colours and font instead of the design tokens, and looks the same
 * over all ten. A click opens the list; a double-click goes straight to the next design.
 */
export function DesignSwitcher({ design, choose }: DesignSwitcherProps) {
  const next = IDS[(IDS.indexOf(design) + 1) % IDS.length];

  return (
    <div className="font-[family-name:ui-sans-serif,system-ui,sans-serif] text-xs text-[#e7e7ea]">
      <button
        type="button"
        popoverTarget="designs"
        aria-label={`Design: ${DESIGNS[design].name}`}
        title="Click for the list, double-click for the next design"
        className="fixed right-4 bottom-4 z-10 flex cursor-pointer items-center gap-2 rounded-full border border-[#2e2e33] bg-[#0b0b0c]/95 py-1.5 pr-3 pl-2.5 shadow-lg shadow-black/50 select-none"
        onDoubleClick={() => {
          if (next) choose(next);
        }}
      >
        <span data-design={design} className={SWATCH} />
        {DESIGNS[design].name}
        <span className="text-[10px] text-[#8e8e96]">▲</span>
      </button>
      {/* A double-click is two clicks, which open and close the list before it counts as one.
          The list fades in after a short wait, so that never shows as a flicker. */}
      <div
        id="designs"
        popover="auto"
        className="fixed inset-auto right-4 bottom-14 m-0 w-48 rounded-[10px] border border-[#2e2e33] bg-[#0b0b0c] p-1 text-[#e7e7ea] shadow-xl shadow-black/60 transition-opacity delay-200 duration-100 starting:open:opacity-0"
      >
        {IDS.map((id) => (
          <button
            key={id}
            type="button"
            popoverTarget="designs"
            popoverTargetAction="hide"
            aria-current={id === design}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-[#19191c] aria-[current=true]:bg-[#19191c] aria-[current=true]:font-semibold"
            onClick={() => choose(id)}
          >
            <span data-design={id} className={SWATCH} />
            {DESIGNS[id].name}
          </button>
        ))}
      </div>
    </div>
  );
}
