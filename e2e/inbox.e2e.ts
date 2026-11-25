import { type BrowserContext, type Page, expect, test } from "@playwright/test";

const KEY = "whybother:problems:v1";

const capture = (page: Page) => page.getByLabel("What's bothering you?");
/** The titles, in order. A row also holds an age and buttons, so the row's text is more. */
const items = (page: Page) => page.getByRole("listitem").getByTestId("title");
const heading = (page: Page, n: number) =>
  page.getByRole("region", { name: `Waiting for a verdict (${n})` });

/** Types an entry and presses Enter, without waiting to see what comes of it. */
const submit = async (page: Page, title: string) => {
  await capture(page).fill(title);
  await capture(page).press("Enter");
};

/** Adds a problem and waits for the save: the box clears only once it is stored. */
const add = async (page: Page, title: string) => {
  await submit(page, title);
  await expect(capture(page)).toHaveValue("");
};

/** Opens another tab of the app. `init` runs in it before any page script. */
const openTab = async (context: BrowserContext, init?: () => void) => {
  const tab = await context.newPage();
  if (init) await tab.addInitScript(init);
  await tab.goto("/");
  return tab;
};

const stored = (page: Page) => page.evaluate((key) => window.localStorage.getItem(key), KEY);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(capture(page)).toBeVisible();
});

test.describe("capture", () => {
  test("starts with an empty inbox", async ({ page }) => {
    await expect(heading(page, 0)).toBeVisible();
    await expect(items(page)).toHaveCount(0);
  });

  test("adds a problem with the button, trimmed, and clears the box", async ({ page }) => {
    await capture(page).fill("  The laptop is slow in the morning  ");
    await page.getByRole("button", { name: "Add problem" }).click();

    await expect(items(page)).toHaveText(["The laptop is slow in the morning"]);
    await expect(capture(page)).toHaveValue("");
    await expect(heading(page, 1)).toBeVisible();
  });

  test("adds with Enter and puts the newest first", async ({ page }) => {
    await add(page, "The laptop is slow in the morning");
    await add(page, "Nobody can find our onboarding notes");

    await expect(items(page)).toHaveText([
      "Nobody can find our onboarding notes",
      "The laptop is slow in the morning",
    ]);
    await expect(heading(page, 2)).toBeVisible();
  });

  test("keeps spaces inside a title and turns line breaks into single spaces", async ({ page }) => {
    await capture(page).fill('Replace "a  b" with "a b"\n  everywhere');
    await capture(page).press("Enter");

    await expect(items(page)).toHaveCount(1);
    const saved = JSON.parse((await stored(page)) ?? "[]");
    expect(saved[0].title).toBe('Replace "a  b" with "a b" everywhere');
  });

  test("ignores an empty or blank entry", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Add problem" })).toBeDisabled();
    await submit(page, "     ");

    await expect(items(page)).toHaveCount(0);
    expect(JSON.parse((await stored(page)) ?? "[]")).toEqual([]);
  });

  test("accepts whatever is typed, including a solution (no solution check in v1)", async ({
    page,
  }) => {
    await add(page, "Buy a NAS");
    await expect(items(page)).toHaveText(["Buy a NAS"]);
  });

  test("shows markup as plain text", async ({ page }) => {
    await add(page, "<b>bold</b> <img src=x onerror=alert(1)>");

    await expect(items(page)).toHaveText(["<b>bold</b> <img src=x onerror=alert(1)>"]);
    await expect(items(page).locator("b, img")).toHaveCount(0);
  });
});

test.describe("storage", () => {
  test("keeps problems across a reload, in the v1 shape", async ({ page }) => {
    await add(page, "The laptop is slow in the morning");
    await add(page, "Nobody can find our onboarding notes");
    await page.reload();

    await expect(items(page)).toHaveCount(2);
    const saved = JSON.parse((await stored(page)) ?? "[]");
    expect(saved).toHaveLength(2);
    expect(saved[0]).toEqual({
      id: expect.any(String),
      title: "Nobody can find our onboarding notes",
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      outcome: { _tag: "Unjudged" },
    });
  });

  for (const [what, raw] of [
    ["data the schema rejects", '[{"id":1,"title":"old shape"}]'],
    ["data that is not JSON", "{not json"],
  ] as const) {
    test(`never drops ${what}: it is backed up and the user is told`, async ({ page }) => {
      await page.evaluate(({ key, value }) => window.localStorage.setItem(key, value), {
        key: KEY,
        value: raw,
      });
      await page.reload();

      const alert = page.getByRole("alert");
      await expect(alert).toContainText("could not be read");
      const backupKey = (await alert.locator("code").textContent()) ?? "";
      expect(backupKey).toMatch(/^whybother:problems:v1:unreadable:/);
      expect(await page.evaluate((key) => window.localStorage.getItem(key), backupKey)).toBe(raw);

      // The app keeps working, and new saves do not touch the backup.
      await add(page, "New after the reset");
      await expect(items(page)).toHaveText(["New after the reset"]);
      expect(await page.evaluate((key) => window.localStorage.getItem(key), backupKey)).toBe(raw);
    });
  }

  test("shows no notice when the saved data is fine", async ({ page }) => {
    await add(page, "The laptop is slow in the morning");
    await page.reload();
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("two tabs do not overwrite each other", async ({ page, context }) => {
    const other = await context.newPage();
    await other.goto("/");
    await expect(capture(other)).toBeVisible();

    await add(other, "Added in the other tab");
    await expect(items(page)).toHaveText(["Added in the other tab"]);

    await add(page, "Added in this tab");
    await other.reload();
    await expect(items(other)).toHaveText(["Added in this tab", "Added in the other tab"]);
  });

  test("a tab that has not heard about another tab's save still keeps it", async ({
    page,
    context,
  }) => {
    // This tab never receives storage events, so its list is stale when it saves.
    const deaf = await openTab(context, () =>
      window.addEventListener("storage", (event) => event.stopImmediatePropagation(), true),
    );
    await expect(capture(deaf)).toBeVisible();

    await add(page, "Saved in the first tab");
    await expect(items(page)).toHaveText(["Saved in the first tab"]);
    await add(deaf, "Saved in the stale tab");

    await expect(items(deaf)).toHaveText(["Saved in the stale tab", "Saved in the first tab"]);
    await page.reload();
    await expect(items(page)).toHaveText(["Saved in the stale tab", "Saved in the first tab"]);
  });

  test("a tab that hears about another tab's save does not write it back", async ({
    page,
    context,
  }) => {
    const listener = await openTab(context, () => {
      const write = Storage.prototype.setItem;
      Object.assign(window, { storageWrites: 0 });
      Storage.prototype.setItem = function (key, value) {
        Object.assign(window, { storageWrites: Reflect.get(window, "storageWrites") + 1 });
        write.call(this, key, value);
      };
    });
    await expect(capture(listener)).toBeVisible();
    const writes = () => listener.evaluate(() => Reflect.get(window, "storageWrites") as number);
    const before = await writes();

    await add(page, "First save");
    await add(page, "Second save");
    await expect(items(listener)).toHaveText(["Second save", "First save"]);
    await page.evaluate(() => window.localStorage.clear());
    await expect(items(listener)).toHaveCount(0);
    expect(await writes()).toBe(before);
    expect(await stored(page)).toBeNull();
  });

  test("a save waits for the lock every tab shares", async ({ page, context }) => {
    const other = await openTab(context);
    // Hold the lock in the other tab until told to let go.
    await other.evaluate(
      (key) =>
        new Promise<void>((acquired) => {
          void navigator.locks.request(key, () => {
            acquired();
            return new Promise<void>((release) => Object.assign(window, { release }));
          });
        }),
      KEY,
    );

    await submit(page, "Waits for the lock");
    await page.waitForTimeout(300);
    expect(await stored(page)).toBeNull();

    await other.evaluate(() => (Reflect.get(window, "release") as () => void)());
    await expect(items(page)).toHaveText(["Waits for the lock"]);
    expect(JSON.parse((await stored(page)) ?? "[]")).toHaveLength(1);
  });

  test("clearing storage in another tab empties this tab too", async ({ page, context }) => {
    await add(page, "Will be cleared");
    const other = await openTab(context);
    await expect(items(other)).toHaveText(["Will be cleared"]);

    await other.evaluate(() => window.localStorage.clear());
    await expect(items(page)).toHaveCount(0);

    await add(page, "After the clear");
    await other.reload();
    await expect(items(other)).toHaveText(["After the clear"]);
  });
});

test("a failed save keeps the typed text and says so", async ({ context }) => {
  const tab = await openTab(context, () => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (Reflect.get(window, "storageFull") === true) {
        throw new DOMException("Storage is full", "QuotaExceededError");
      }
      write.call(this, key, value);
    };
  });
  await expect(capture(tab)).toBeVisible();
  await tab.evaluate(() => Object.assign(window, { storageFull: true }));

  await submit(tab, "Must not be lost");
  await expect(tab.getByRole("alert")).toContainText("Could not save");
  await expect(capture(tab)).toHaveValue("Must not be lost");
  await expect(items(tab)).toHaveCount(0);

  // Once there is room again, the same text saves and the message goes away.
  await tab.evaluate(() => Object.assign(window, { storageFull: false }));
  await capture(tab).press("Enter");
  await expect(items(tab)).toHaveText(["Must not be lost"]);
  await expect(capture(tab)).toHaveValue("");
  await expect(tab.getByRole("alert")).toHaveCount(0);
});

test.describe("when starting could lose data", () => {
  test("does not start if the browser blocks storage", async ({ context }) => {
    const tab = await openTab(context, () =>
      Object.defineProperty(window, "localStorage", {
        get: () => {
          throw new DOMException("Storage is disabled", "SecurityError");
        },
      }),
    );
    await expect(tab.getByRole("alert")).toContainText("does not allow the site to store data");
    await expect(capture(tab)).toHaveCount(0);
  });

  test("does not start if unreadable data cannot be backed up", async ({ page, context }) => {
    const raw = '[{"id":1,"title":"old shape"}]';
    await page.evaluate(({ key, value }) => window.localStorage.setItem(key, value), {
      key: KEY,
      value: raw,
    });
    const tab = await openTab(context, () => {
      const write = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key.includes(":unreadable:")) {
          throw new DOMException("Storage is full", "QuotaExceededError");
        }
        write.call(this, key, value);
      };
    });

    await expect(tab.getByRole("alert")).toContainText("no room to keep a backup");
    await expect(capture(tab)).toHaveCount(0);
    expect(await stored(tab)).toBe(raw);
  });
});

test("fits the screen without sideways scrolling", async ({ page }) => {
  await add(page, "A long problem description ".repeat(10));
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
});
