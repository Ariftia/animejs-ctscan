import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Exercise the actual shared phantom rasterizer without a separate unit-test runtime.
const acquisitionSource = await readFile(new URL("../components/scanner/acquisition.ts", import.meta.url), "utf8");
const acquisitionModule = ts.transpileModule(acquisitionSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { createPhantomSlice, PHANTOM_VOLUME } = await import(`data:text/javascript;base64,${Buffer.from(acquisitionModule).toString("base64")}`);
const phantomSize = 257;
const firstSlice = createPhantomSlice(0, phantomSize);
const lastSlice = createPhantomSlice(PHANTOM_VOLUME.sliceCount - 1, phantomSize);
const tissuePixel = (x, y) => {
  const column = Math.round((x / PHANTOM_VOLUME.width + 0.5) * (phantomSize - 1));
  const row = Math.round((y / PHANTOM_VOLUME.height + 0.5) * (phantomSize - 1));
  return firstSlice.slice((row * phantomSize + column) * 4, (row * phantomSize + column) * 4 + 4);
};
assert.ok(tissuePixel(-0.16, 0.08)[0] < tissuePixel(0, 0)[0], "Left lung must reconstruct darker than the body");
assert.ok(tissuePixel(0.16, 0.08)[0] < tissuePixel(0, 0)[0], "Right lung must reconstruct darker than the body");
assert.ok(tissuePixel(0, -0.28)[0] > tissuePixel(0, 0)[0], "The spine must reconstruct brighter than the body");
assert.equal(tissuePixel(0.5, 0.6)[3], 0, "Pixels outside the scanned object must be transparent");
for (let pixel = 3; pixel < firstSlice.length; pixel += 4) {
  assert.equal(firstSlice[pixel], lastSlice[pixel], "All slice silhouettes must match the scanned extruded phantom");
}

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
assert.equal(await desktop.locator(".debug-panel").isVisible(), false, "Debug controls must be hidden on the normal page");
await capture(desktop, "/tmp/ct-hero-qa.png");
assert.equal(await desktop.locator(".signal-journey").count(), 0, "The beam-to-volume progress track must be removed");
const fixedCamera = await desktop.locator("[data-camera]").count() ? await desktop.locator("[data-camera]").textContent() : null;

// These boundaries differ from equal twelfths and must update in both directions.
for (const [progress, scene] of [[0.05, "02"], [0.04, "01"], [0.05, "02"]]) {
  await desktop.evaluate((value) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * value), progress);
  await desktop.locator(".nav-status span").first().filter({ hasText: new RegExp(`^${scene}$`) }).waitFor({ timeout: 10000 });
}

await desktop.evaluate(() => window.scrollTo(0, document.getElementById("explode").offsetTop));
await desktop.waitForTimeout(900);
await capture(desktop, "/tmp/ct-explode-qa.png");

await desktop.evaluate(() => window.scrollTo(0, document.getElementById("xray").offsetTop));
await desktop.waitForTimeout(900);
const midScene = await desktop.locator(".nav-status span").first().textContent();
await capture(desktop, "/tmp/ct-xray-qa.png");

await desktop.evaluate(() => window.scrollTo(0, document.getElementById("projection").offsetTop));
await desktop.waitForFunction(() => Array.from(document.querySelectorAll(".projection-label")).every((label) => Number(getComputedStyle(label).opacity) > 0.5));
assert.deepEqual(await desktop.locator(".projection-label").allTextContents(), ["ATTENUATION", "0°", "45°", "90°", "135°", "180°", "DETECTOR POSITION →"]);
await capture(desktop, "/tmp/ct-projection-qa.png");

await desktop.evaluate(() => window.scrollTo(0, document.getElementById("sinogram").offsetTop));
await desktop.waitForTimeout(900);
await capture(desktop, "/tmp/ct-sinogram-qa.png");

await desktop.evaluate(() => window.scrollTo(0, document.getElementById("reconstruction").offsetTop));
await desktop.waitForTimeout(900);
await capture(desktop, "/tmp/ct-reconstruction-qa.png");
if (fixedCamera) assert.equal(await desktop.locator("[data-camera]").textContent(), fixedCamera, "Scrolling must not pan, zoom, or orbit the story camera");

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
await mobile.evaluate(() => window.scrollTo(0, document.getElementById("projection").offsetTop));
await mobile.waitForFunction(() => Array.from(document.querySelectorAll(".projection-label")).every((label) => Number(getComputedStyle(label).opacity) > 0.5));
const clippedLabels = await mobile.locator(".projection-label").evaluateAll((labels) => labels.filter((label) => {
  const bounds = label.getBoundingClientRect();
  return bounds.left < 0 || bounds.right > innerWidth;
}).map((label) => label.textContent));
assert.deepEqual(clippedLabels, [], "Projection labels must fit the mobile viewport");
await capture(mobile, "/tmp/ct-projection-mobile-qa.png");
const framingBounds = [];
for (const progress of [0.87, 0.90, 0.93, 0.95, 0.93, 0.90, 0.87]) {
  await mobile.evaluate((value) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * value), progress);
  await mobile.waitForFunction((value) => Math.abs(Number(getComputedStyle(document.documentElement).getPropertyValue("--experience-progress")) - value) < 0.001, progress);
  framingBounds.push(await mobile.locator(".canvas-stage").boundingBox());
}
for (const bounds of framingBounds) {
  assert.deepEqual(bounds, framingBounds[0], "The scanner viewport must stay fixed during forward/reverse scrolling");
}
await mobile.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await mobile.locator(".nav-status span").first().filter({ hasText: /^12$/ }).waitFor();
await mobile.getByRole("button", { name: "Detector array" }).click();
await mobile.waitForTimeout(900);
const explorerStyle = await mobile.locator(".explorer-copy").evaluate((node) => ({
  background: getComputedStyle(node).backgroundColor,
  pointerEvents: getComputedStyle(node).pointerEvents,
}));
assert.equal(explorerStyle.background, "rgba(0, 0, 0, 0)", "Explorer overlay must be transparent");
assert.equal(explorerStyle.pointerEvents, "none", "Empty overlay space must allow model interaction");
assert.deepEqual(await mobile.locator(".canvas-stage").boundingBox(), framingBounds[0], "Entering the explorer must not shrink or reposition the canvas");
assert.equal(await mobile.locator(".component-detail strong").textContent(), "Detector array");
await capture(mobile, "/tmp/ct-mobile-explorer-qa.png");
const explorerScroll = await mobile.evaluate(() => scrollY);
await mobile.locator("#explorer h2").hover();
await mobile.mouse.wheel(0, -400);
await mobile.waitForFunction((previous) => scrollY < previous, explorerScroll);
await mobile.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
for (const width of [320, 800, 1024, 1920]) {
  await mobile.setViewportSize({ width, height: 844 });
  const layout = await mobile.evaluate(() => ({
    overflow: document.body.scrollWidth > innerWidth,
    clippedHeadings: Array.from(document.querySelectorAll("h1, h2")).filter((heading) => heading.scrollWidth > heading.clientWidth + 1).map((heading) => heading.textContent),
  }));
  assert.equal(layout.overflow, false, `Page overflow at ${width}px`);
  assert.deepEqual(layout.clippedHeadings, [], `Clipped headings at ${width}px`);
}
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

for (const info of [desktopInfo, mobileInfo, reducedInfo]) {
  assert.equal(info.overlay, false);
  assert.equal(info.canvas.length, 1);
  assert.equal(info.loaderVisible, "hidden");
  assert.equal(info.bodyWidth, info.viewportWidth);
}
assert.equal(midScene, "05");
assert.equal(reverseScene, "01");
assert.equal(explorerScene, "12");
assert.equal(selection, "X-ray source");
assert.deepEqual(errors, []);
