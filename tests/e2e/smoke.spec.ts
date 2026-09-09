import { test, expect } from "@playwright/test";

test("homepage: hero + CTA + trust", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("без звонков");
  await expect(page.getByRole("link", { name: "Записаться онлайн" }).first()).toBeVisible();
  await expect(page.getByText("4.9", { exact: false }).first()).toBeVisible();
});

test("booking flow: 4 шага до подтверждения (mobile 390px)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/booking?step=1");
  // шаг 1 → 2
  await page.getByRole("button", { name: /Далее/ }).click();
  await expect(page).toHaveURL(/step=2/);
  // шаг 2: авто
  await page.getByPlaceholder("Toyota").fill("Toyota");
  await page.getByPlaceholder("Camry").fill("Camry");
  await page.getByRole("button", { name: /Далее/ }).click();
  await expect(page).toHaveURL(/step=3/);
  // шаг 3: первый день со свободными слотами
  const dayButtons = page.locator("button", { hasText: /^\d\d\.\d\d$/ });
  let picked = false;
  for (let i = 0; i < (await dayButtons.count()); i++) {
    await dayButtons.nth(i).click();
    await page.waitForTimeout(800);
    const slots = page.locator("button", { hasText: /^\d\d:\d\d$/ });
    if ((await slots.count()) > 0) {
      await slots.first().click();
      picked = true;
      break;
    }
  }
  expect(picked).toBe(true);
  await page.getByRole("button", { name: /Далее/ }).click();
  await expect(page).toHaveURL(/step=4/);
  // шаг 4: контакт
  await page.getByPlaceholder(/Ваше имя/).fill("E2E Тест");
  await page.getByPlaceholder("+7 700 123-45-67").fill(`+7703${Date.now().toString().slice(-7)}`);
  await page.locator("#agree").check();
  await page.getByRole("button", { name: /Подтвердить запись/ }).click();
  await expect(page.getByText("Запись подтверждена!")).toBeVisible({ timeout: 15000 });
});

test("admin: owner login → dashboard; master ограничен", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("email").fill("owner@gearflow.kz");
  await page.getByPlaceholder("пароль").fill(process.env.ADMIN_PASSWORD ?? "ChangeMe123!");
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.getByRole("heading", { name: "Админка — сегодня" })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Заявки и лиды")).toBeVisible();
});

test("master: только свои записи, остальное скрыто", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("email").fill("master@gearflow.kz");
  await page.getByPlaceholder("пароль").fill("Master123!");
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.getByRole("heading", { name: "Админка — сегодня" })).toBeVisible({ timeout: 10000 });
  // мастеру недоступны разделы owner/admin
  await expect(page.getByText("Заявки и лиды")).toHaveCount(0);
  await page.goto("/admin/bookings");
  await expect(page.getByRole("heading", { name: "Записи" })).toBeVisible({ timeout: 10000 });
});

test("no horizontal overflow (360/390/768/1440)", async ({ page }) => {
  for (const w of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width: w, height: 800 });
    for (const path of ["/", "/services", "/prices", "/booking"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} @${w}px`).toBeLessThanOrEqual(1);
    }
  }
});
