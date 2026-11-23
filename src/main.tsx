import { RegistryProvider } from "@effect/atom-react";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { rescueUnreadable } from "./state/problems.ts";
import { App } from "./ui/App.tsx";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root element");

// Move unreadable saved data aside before the atoms read (and could overwrite) it.
void Effect.runPromise(rescueUnreadable).then((backupKey) => {
  createRoot(root).render(
    <StrictMode>
      <RegistryProvider>
        <App unreadableBackupKey={Option.getOrUndefined(backupKey)} />
      </RegistryProvider>
    </StrictMode>,
  );
});
