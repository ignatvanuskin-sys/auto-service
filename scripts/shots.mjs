import { chromium } from "@playwright/test";

const shots = [
  { w: 390, h: 844, path: "/", file: "shot-mobile-home.png" },
  { w: 1440, h: 900, path: "/", file: "shot-desktop-home.png" },
  { w: 390, h: 844, path: "/booking?step=3", file: "shot-mobile-booking.png" },
];

async function main() {
  const browser = await chromium.launch();
  for (const s of shots) {
    const page = await (await browser.newContext({ viewport: { width: s.w, height: s.h } })).newPage();
    await page.goto("http://localhost:3000" + s.path, { waitUntil: "networkidle" });
    await page.screenshot({ path: `C:/Users/73B5~1/AppData/Local/Temp/opencode/${s.file}`, fullPage: true });
    await page.close();
  }
  await browser.close();
  console.log("SHOTS DONE");
}
main();
