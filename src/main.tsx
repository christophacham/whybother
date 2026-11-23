import { RegistryProvider } from "@effect/atom-react";
import * as Effect from "effect/Effect";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { checkStorage } from "./state/problems.ts";
import { App } from "./ui/App.tsx";
import { StorageBlocked } from "./ui/StorageBlocked.tsx";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root element");

// Check storage before the atoms read (and could overwrite) it. `checkStorage` never fails.
void Effect.runPromise(checkStorage).then((check) => {
  createRoot(root).render(
    <StrictMode>
      {check._tag === "Blocked" ? (
        <StorageBlocked reason={check.reason} />
      ) : (
        <RegistryProvider>
          <App unreadableBackupKey={check.backupKey} />
        </RegistryProvider>
      )}
    </StrictMode>,
  );
});
