import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const errors = [];
const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
const capture = (page, path) => page.screenshot({ path, animations: "disabled", timeout: 90000 });

async function inspectPage(page, label) {
  page.on("console", (message) => {
    const text = message.text();
    const headlessReadbackWarning = text.includes("GPU stall due to ReadPixels");
    if (["error", "warning"].includes(message.type()) && !headlessReadbackWarning) {
      errors.push(`${label}:console:${message.type()}:${text}`);
    }
  });
  page.on("pageerror", (error) => errors.push(`${label}:pageerror:${error.message}`));
  page.on("requestfailed", (request) => errors.push(`${label}:request:${request.url()}:${request.failure()?.errorText}`));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.locator(".loader").waitFor({ state: "hidden", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);
  return page.evaluate(() => ({
    title: document.title,
    textLength: document.body.innerText.trim().length,
    overlay: Boolean(document.querySelector("[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay")),
    canvas: Array.from(document.querySelectorAll("canvas")).map((canvas) => ({ width: canvas.width, height: canvas.height })),
    loaderVisible: getComputedStyle(document.querySelector(".loader")).visibility,
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
}

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const desktopInfo = await inspectPage(desktop, "desktop");
await capture(desktop, "/tmp/ct-hero-qa.png");

await desktop.evaluate(() => window.scrollTo(0, document.getElementById("explode").offsetTop));
await desktop.waitForTimeout(900);
await capture(desktop, "/tmp/ct-explode-qa.png");

await desktop.evaluate(() => window.scrollTo(0, document.getElementById("xray").offsetTop));
await desktop.waitForTimeout(900);
const midScene = await desktop.locator(".nav-status span").first().textContent();
await capture(desktop, "/tmp/ct-xray-qa.png");

await desktop.evaluate(() => window.scrollTo(0, document.getElementById("sinogram").offsetTop));
await desktop.waitForTimeout(900);
await capture(desktop, "/tmp/ct-sinogram-qa.png");

await desktop.evaluate(() => window.scrollTo(0, document.getElementById("reconstruction").offsetTop));
await desktop.waitForTimeout(900);
await capture(desktop, "/tmp/ct-reconstruction-qa.png");

await desktop.evaluate(() => window.scrollTo(0, 0));
await desktop.waitForTimeout(700);
const reverseScene = await desktop.locator(".nav-status span").first().textContent();

await desktop.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await desktop.waitForTimeout(1200);
const explorerScene = await desktop.locator(".nav-status span").first().textContent();
await desktop.getByRole("button", { name: "X-ray source" }).click();
await desktop.waitForTimeout(400);
const selection = await desktop.locator(".component-detail strong").textContent();
await capture(desktop, "/tmp/ct-explorer-qa.png");
await desktop.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const mobileInfo = await inspectPage(mobile, "mobile");
await mobile.locator(".loader").waitFor({ state: "hidden", timeout: 20000 }).catch(() => {});
mobileInfo.loaderVisible = await mobile.locator(".loader").evaluate((element) => getComputedStyle(element).visibility);
await capture(mobile, "/tmp/ct-mobile-qa.png");
await mobile.close();

const reduced = await browser.newPage({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
const reducedInfo = await inspectPage(reduced, "reduced");
await reduced.locator(".loader").waitFor({ state: "hidden", timeout: 20000 }).catch(() => {});
reducedInfo.loaderVisible = await reduced.locator(".loader").evaluate((element) => getComputedStyle(element).visibility);
await reduced.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.25));
await reduced.waitForTimeout(500);
const reducedScene = await reduced.locator(".nav-status span").first().textContent();

console.log(JSON.stringify({ desktopInfo, midScene, reverseScene, explorerScene, selection, mobileInfo, reducedInfo, reducedScene, errors }, null, 2));
await browser.close();
