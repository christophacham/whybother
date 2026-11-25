import { type Page, expect, test } from "@playwright/test";

/** Every design in the trial. A literal list, so a name that falls back to Tidy fails here. */
const DESIGNS = [
  "tidy",
  "composer",
  "editorial",
  "docket",
  "workbench",
  "open-question",
  "two-rooms",
  "top-of-pile",
  "sorting-board",
  "one-list",
];

const KEY = "whybother:problems:v1";
const SHORT = "The laptop is slow in the morning";
/** Long, and ending in one unbroken word, which is the hardest thing to keep on a phone. */
const LONG = `${"A long problem description ".repeat(6)}${"x".repeat(120)}`;

const capture = (page: Page) => page.getByLabel("What's bothering you?");
const titles = (page: Page) => page.getByRole("listitem").getByTestId("title");
const waiting = (page: Page, n: number) =>
  page.getByRole("region", { name: `Waiting for a verdict (${n})` });

const add = async (page: Page, title: string) => {
  await capture(page).fill(title);
  await capture(page).press("Enter");
  await expect(capture(page)).toHaveValue("");
};

const open = async (page: Page, design: string) => {
  await page.goto(`/?design=${design}`);
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-design", design);
};

for (const design of DESIGNS) {
  test(`${design}: add, remove, undo, and no sideways scrolling`, async ({ page }) => {
    await open(page, design);
    await expect(waiting(page, 0)).toBeVisible();
    await expect(page.getByRole("button", { name: "Add problem" })).toBeDisabled();

    await add(page, SHORT);
    await add(page, LONG);
    await expect(titles(page)).toHaveText([LONG, SHORT]);

    const overflows = () =>
      page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(await overflows()).toBe(false);

    // The notice repeats the removed title, so it has to wrap as well.
    await page.getByRole("button", { name: `Remove: ${LONG}` }).click();
    await expect(titles(page)).toHaveText([SHORT]);
    expect(await overflows()).toBe(false);
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(titles(page)).toHaveText([LONG, SHORT]);
    await expect(waiting(page, 2)).toBeVisible();
    await expect(page.getByRole("button", { name: "Undo" })).toHaveCount(0);
  });
}

test("switching design keeps the draft, and the choice survives a bare address", async ({
  page,
}) => {
  await open(page, "tidy");
  await capture(page).fill("Half a thought");

  const html = page.locator("html");
  const pill = page.getByRole("button", { name: /^Design: / });
  const inList = (name: string) => page.getByRole("button", { name, exact: true });

  // A click on the pill opens the list.
  await pill.click();
  await inList("Docket").click();
  await expect(html).toHaveAttribute("data-design", "docket");
  await expect(page).toHaveURL(/[?&]design=docket$/);
  await expect(capture(page)).toHaveValue("Half a thought");
  await expect(inList("Docket")).toBeHidden();

  // A double-click goes straight to the next design and leaves the list closed.
  await pill.dblclick();
  await expect(html).toHaveAttribute("data-design", "workbench");
  await expect(pill).toHaveAccessibleName("Design: Workbench");
  await expect(inList("Docket")).toBeHidden();

  await page.goto("/");
  await expect(html).toHaveAttribute("data-design", "workbench");
  await page.goto("/?design=nonsense");
  await expect(html).toHaveAttribute("data-design", "workbench");
});

test("top of the pile: showing the next one goes round every problem", async ({ page }) => {
  await open(page, "top-of-pile");
  await add(page, "First");
  await add(page, "Second");
  await add(page, "Third");

  const front = page.getByRole("article").getByTestId("title");
  const next = page.getByRole("button", { name: "Show the next one" });
  await expect(front).toHaveText("Third");
  // By keyboard, without finding the button again: it has to keep focus from press to press.
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(front).toHaveText("Second");
  await page.keyboard.press("Enter");
  await expect(front).toHaveText("First");
  await page.keyboard.press("Enter");
  await expect(front).toHaveText("Third");
});

test("one list: the inbox can be worked from the keyboard", async ({ page }) => {
  await open(page, "one-list");
  await add(page, "First");
  await add(page, "Second");

  // Down from the capture box goes into the list, and Delete removes the row it is on.
  await capture(page).press("ArrowDown");
  await expect(page.getByRole("listitem").first()).toBeFocused();
  await page.keyboard.press("Delete");
  await expect(titles(page)).toHaveText(["First"]);
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();

  await expect(page.getByRole("listitem")).toBeFocused();
  await page.keyboard.press("j");
  await expect(page.getByRole("status")).toContainText("Judge is the next screen");
});

test("only the tab that removed a problem can put it back", async ({ page, context }) => {
  await open(page, "tidy");
  await add(page, SHORT);

  // This tab never hears about other tabs' saves, so it still shows the problem after the
  // first tab has removed it.
  const stale = await context.newPage();
  await stale.addInitScript(() =>
    window.addEventListener("storage", (event) => event.stopImmediatePropagation(), true),
  );
  await stale.goto("/?design=tidy");
  await expect(titles(stale)).toHaveText([SHORT]);

  await page.getByRole("button", { name: `Remove: ${SHORT}` }).click();
  await expect(titles(page)).toHaveCount(0);

  await stale.getByRole("button", { name: `Remove: ${SHORT}` }).click();
  await expect(titles(stale)).toHaveCount(0);
  await expect(stale.getByRole("button", { name: "Undo" })).toHaveCount(0);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(titles(page)).toHaveText([SHORT]);
  const stored = await page.evaluate((key) => window.localStorage.getItem(key), KEY);
  expect(JSON.parse(stored ?? "[]")).toHaveLength(1);
});
