import { test, expect } from "@playwright/test";

test("합격증 확대, 닫기, 자동 재생 정지와 반응형 화면", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("내신의 빈틈을 채우고");
  await expect(
    page.locator(".marquee-group").first().locator("button"),
  ).toHaveCount(16);
  await page.locator("#motion-toggle").click();
  await expect(page.locator("#motion-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page
    .locator(".marquee-group")
    .first()
    .locator("button")
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#dialog-title")).toContainText("POSTECH");
  await expect(page.locator("#dialog-image")).toHaveJSProperty(
    "naturalWidth",
    1190,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.locator(".marquee-group").first().locator("button").first(),
  ).toBeFocused();
  await page.locator("#motion-toggle").click();
  await expect(page.locator("#motion-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
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
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-hero.png`,
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

test("수업 소개는 스크롤 방향에 따라 단계를 바꾸고 작은 화면에서는 모두 보여준다", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const story = page.locator(".lesson-story");
  if (testInfo.project.name === "mobile") {
    await expect(story).toHaveClass(/is-static/);
    await expect(page.locator(".teacher-note")).toHaveCSS("opacity", "1");
    await expect(page.locator(".lesson-stage")).toHaveCSS("position", "static");
  } else {
    for (const [target, step] of [
      ["read-step", "0"],
      ["evidence-step", "1"],
      ["explain-step", "2"],
      ["read-step", "0"],
    ]) {
      await page.evaluate((id) => {
        const element = document.getElementById(id);
        scrollTo({
          top:
            scrollY + element.getBoundingClientRect().top - innerHeight * 0.3,
          behavior: "instant",
        });
      }, target);
      await expect(story).toHaveAttribute("data-step", step);
      if (step === "1") {
        await expect(page.locator(".lesson-stage")).toHaveCSS(
          "position",
          "sticky",
        );
        const stage = await page.locator(".lesson-stage").boundingBox();
        expect(stage.y).toBeGreaterThanOrEqual(88);
        expect(stage.y + stage.height).toBeLessThanOrEqual(1000);
        await page.screenshot({ path: "test-results/desktop-lesson.png" });
      }
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(story).toHaveClass(/is-static/);
    await expect(page.locator(".teacher-note")).toHaveCSS("opacity", "1");
    await expect(page.locator(".lesson-stage")).toHaveCSS("position", "static");
  }
  await expect(page.locator(".hero-visual img")).toHaveJSProperty(
    "naturalWidth",
    1536,
  );
});

test("좁은 화면에서도 가로 넘침 없이 수업 바로가기가 작동한다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.locator('.course-shortcuts a[href="#school-course"]').click();
  await expect(page).toHaveURL(/#school-course$/);
  await expect(page.locator("#school-course")).toBeInViewport();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
