import { test, expect } from "@playwright/test";

test("합격증 확대, 닫기, 자동 재생 정지와 반응형 화면", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("국어를 이해하는 힘");
  await expect(
    page.locator(".marquee-group").first().locator("button"),
  ).toHaveCount(16);
  await page.locator("#hero-certificates button").nth(1).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#dialog-title")).toContainText("POSTECH");
  await expect(page.locator("#dialog-image")).toHaveJSProperty(
    "naturalWidth",
    1190,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.locator("#motion-toggle").click();
  await expect(page.locator("#motion-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const width = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    window: innerWidth,
  }));
  expect(width.doc).toBeLessThanOrEqual(width.window);
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "메뉴" }).click();
    await expect(page.locator("#navigation")).toBeVisible();
    await page
      .locator("#navigation")
      .getByRole("link", { name: "수업 안내" })
      .click();
    await expect(page.locator(".menu-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  }
  for (const image of await page
    .locator(".marquee-group")
    .first()
    .locator("img")
    .all()) {
    const src = await image.getAttribute("src");
    const response = await page.request.get(src);
    expect(response.ok(), src).toBeTruthy();
  }
  expect(errors).toEqual([]);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-homepage.png`,
    fullPage: true,
  });
});

test("움직임 최소화 환경에서는 합격증이 자동으로 움직이지 않는다", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#certificate-track")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await expect(page.locator("#motion-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
