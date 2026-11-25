import type { ReactNode } from "react";

import type { Inbox } from "~/ui/useInbox.ts";

import { Composer } from "./Composer.tsx";
import { Docket } from "./Docket.tsx";
import { Editorial } from "./Editorial.tsx";
import { OneList } from "./OneList.tsx";
import { OpenQuestion } from "./OpenQuestion.tsx";
import { SortingBoard } from "./SortingBoard.tsx";
import { Tidy } from "./Tidy.tsx";
import { TopOfPile } from "./TopOfPile.tsx";
import { TwoRooms } from "./TwoRooms.tsx";
import { Workbench } from "./Workbench.tsx";

/**
 * The design trial: ten layouts of the one Inbox screen, switched with the pill in the
 * bottom-right corner (or `?design=<id>`). They share `useInbox` and `parts.tsx` and differ
 * only in layout and in their token values in `styles.css`.
 *
 * When one has won:
 * 1. Delete the other nine files here, this file, `DesignSwitcher.tsx` and
 *    `e2e/designs.e2e.ts`, and render the winner directly in `App.tsx`.
 * 2. In `styles.css`, move the winner's `[data-design]` values into `@theme` as
 *    `light-dark(light, dark)` pairs, delete the ten blocks, and set the `color-scheme` meta
 *    in `index.html` back to `light dark`.
 * 3. Remove the font packages the winner does not import, and the trial line in SPEC.md.
 */
export const DESIGNS = {
  tidy: { name: "Tidy", Design: Tidy },
  composer: { name: "Composer", Design: Composer },
  editorial: { name: "Editorial", Design: Editorial },
  docket: { name: "Docket", Design: Docket },
  workbench: { name: "Workbench", Design: Workbench },
  "open-question": { name: "Open question", Design: OpenQuestion },
  "two-rooms": { name: "Two rooms", Design: TwoRooms },
  "top-of-pile": { name: "Top of the pile", Design: TopOfPile },
  "sorting-board": { name: "Sorting board", Design: SortingBoard },
  "one-list": { name: "One list", Design: OneList },
} satisfies Record<string, { name: string; Design: (props: { inbox: Inbox }) => ReactNode }>;

export type DesignId = keyof typeof DESIGNS;
