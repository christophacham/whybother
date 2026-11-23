import { type Page, expect, test } from "@playwright/test";

const KEY = "whybother:problems:v1";

const capture = (page: Page) => page.getByLabel("What's bothering you?");
const items = (page: Page) => page.getByRole("listitem");
const heading = (page: Page, n: number) => page.getByText(`Waiting for a verdict (${n})`);

const add = async (page: Page, title: string) => {
  await capture(page).fill(title);
  await capture(page).press("Enter");
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
    await expect(page.getByText("Nothing is waiting.")).toBeVisible();
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

  test("ignores an empty or blank entry", async ({ page }) => {
    await page.getByRole("button", { name: "Add problem" }).click();
    await add(page, "     ");

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
});

test("fits the screen without sideways scrolling", async ({ page }) => {
  await add(page, "A long problem description ".repeat(10));
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
});
