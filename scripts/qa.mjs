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
  await page.addInitScript(() => {
    window.openingAnimations = [];
    document.addEventListener("animationstart", (event) => {
      if (event.animationName !== "opening-land" || !event.target.matches(".canvas-stage")) return;
      document.querySelectorAll(".canvas-stage, #hero .story-copy").forEach((target) => {
        const animation = target.getAnimations()[0];
        window.openingAnimations.push({
          target: target.className,
          start: animation.startTime,
          duration: animation.effect.getTiming().duration,
        });
      });
    });
  });
  page.on("console", (message) => {
    const text = message.text();
    const headlessReadbackWarning = text.includes("GPU stall due to ReadPixels");
    if (["error", "warning"].includes(message.type()) && !headlessReadbackWarning) {
      errors.push(`${label}:console:${message.type()}:${text}`);
    }
  });
  page.on("pageerror", (error) => errors.push(`${label}:pageerror:${error.message}`));
  page.on("requestfailed", (request) => errors.push(`${label}:request:${request.url()}:${request.failure()?.errorText}`));
  // Hold hydration so the initial loading surface is checked deterministically.
  let releaseScripts;
  const scriptsReady = new Promise((resolve) => { releaseScripts = resolve; });
  const holdScript = async (route) => { await scriptsReady; await route.continue(); };
  await page.route(/\/_next\/.*\.js(?:\?.*)?$/, holdScript);
  const navigation = page.goto(baseUrl, { waitUntil: "networkidle" });
  try {
    await page.waitForFunction(() => {
      const loader = document.querySelector(".loader.active");
      return loader && getComputedStyle(loader).position === "fixed";
    });
    assert.equal(await page.locator(".canvas-stage").evaluate((node) => getComputedStyle(node).opacity), "1", "WebGL must initialize on a visible surface behind the opaque loader");
  } finally {
    releaseScripts();
    await navigation;
    await page.unroute(/\/_next\/.*\.js(?:\?.*)?$/, holdScript);
  }
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.locator(".loader").waitFor({ state: "hidden", timeout: 30000 });
  await page.waitForTimeout(2500);
  assert.equal(await page.locator(".experience").getAttribute("data-opening"), "complete", "Opening must finish after the rendered scene is ready");
  const initialImage = (await page.locator("canvas").screenshot()).toString("base64");
  const scannerPixels = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const surface = document.createElement("canvas");
    surface.width = image.width;
    surface.height = image.height;
    const context = surface.getContext("2d");
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, surface.width, surface.height);
    let tealPixels = 0;
    const mobile = innerWidth <= 800;
    for (let y = 0; y < surface.height * (mobile ? 0.5 : 1); y++) {
      for (let x = mobile ? 0 : Math.floor(surface.width / 2); x < surface.width; x++) {
        const pixel = (y * surface.width + x) * 4;
        if (data[pixel + 1] - data[pixel] > 15 && data[pixel + 2] - data[pixel] > 15) tealPixels++;
      }
    }
    return tealPixels;
  }, initialImage);
  assert.ok(scannerPixels > 100, `${label}: the scanner must be drawn before any click, scroll, or pointer input`);
  const entrance = await page.evaluate(() => window.openingAnimations);
  if (await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    assert.deepEqual(entrance, [], "Reduced motion must skip the spatial entrance");
  } else {
    assert.deepEqual(entrance.map(({ target }) => target).sort(), ["canvas-stage", "story-copy"], "Only the scanner and opening copy should land");
    assert.equal(entrance[0].start, entrance[1].start, "Text and scanner must start together");
    assert.equal(entrance[0].duration, entrance[1].duration, "Text and scanner must land together");
  }
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

// Returning to the hero must be independent of where motion preferences changed.
const heroCanvas = await desktop.locator("canvas").screenshot();
for (const [progress, reducedMotion] of [[0.25, "reduce"], [0.82, "no-preference"]]) {
  await desktop.evaluate((value) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * value), progress);
  await desktop.waitForTimeout(700);
  await desktop.emulateMedia({ reducedMotion });
  await desktop.waitForTimeout(700);
  await desktop.evaluate(() => window.scrollTo(0, 0));
  await desktop.waitForTimeout(700);
  assert.deepEqual(await desktop.locator("canvas").screenshot(), heroCanvas, "Motion preference changes must preserve the original assembled hero");
}

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
assert.equal(await desktop.evaluate(() => window.openingAnimations.length), 2, "Returning to the hero must not replay the opening");

await desktop.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await desktop.waitForTimeout(1200);
const explorerScene = await desktop.locator(".nav-status span").first().textContent();
await desktop.getByRole("button", { name: "X-ray source" }).click();
await desktop.waitForTimeout(400);
const selection = (await desktop.locator(".component-list button[aria-expanded=true]").textContent()).trim();
assert.equal(await desktop.getByRole("region", { name: "X-ray source", exact: true }).isVisible(), true);
await capture(desktop, "/tmp/ct-explorer-qa.png");
await desktop.waitForTimeout(1300);
await desktop.mouse.click(1030, 440);
await desktop.waitForFunction(() => document.querySelector("#component-source").getAttribute("aria-expanded") === "false");
assert.equal(await desktop.locator(".component-detail:visible").count(), 0, "Hidden scanner geometry must not intercept clicks on the isolated source");
for (const label of ["Gantry housing", "Rotation system", "Detector array", "Patient table"]) {
  const button = desktop.getByRole("button", { name: label, exact: true });
  await button.click();
  assert.equal(await button.getAttribute("aria-expanded"), "true");
  assert.equal(await desktop.locator(".component-detail:visible").count(), 1, "Only the selected explanation should be expanded");
  const detail = desktop.getByRole("region", { name: label, exact: true });
  assert.equal(await detail.locator("p").count(), 2);
}
const tableButton = desktop.getByRole("button", { name: "Patient table", exact: true });
await tableButton.focus();
await tableButton.press("Enter");
assert.equal(await tableButton.getAttribute("aria-expanded"), "false");
assert.equal(await desktop.locator(".component-detail:visible").count(), 0, "Closing a row should collapse all explanation details");
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
assert.equal(await mobile.getByRole("button", { name: "Detector array", exact: true }).getAttribute("aria-expanded"), "true");
assert.equal(await mobile.getByRole("region", { name: "Detector array", exact: true }).isVisible(), true);
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

const shortMobile = await browser.newPage({ viewport: { width: 320, height: 568 } });
await inspectPage(shortMobile, "short-mobile");
await shortMobile.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await shortMobile.locator(".nav-status span").first().filter({ hasText: /^12$/ }).waitFor();
await shortMobile.getByRole("button", { name: "X-ray source", exact: true }).click();
await shortMobile.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await shortMobile.waitForTimeout(1200);
const shortLayout = await shortMobile.locator(".explorer-copy").evaluate((copy) => ({
  top: copy.getBoundingClientRect().top,
  bottom: copy.getBoundingClientRect().bottom,
  navBottom: document.querySelector(".navigation").getBoundingClientRect().bottom,
  height: innerHeight,
}));
assert.ok(shortLayout.top >= Math.max(shortLayout.navBottom, shortLayout.height * 0.4), "Explorer copy must stay below navigation and the model lane");
assert.ok(shortLayout.bottom <= shortLayout.height, "Explorer copy must fit the short viewport");
await shortMobile.getByRole("button", { name: "Patient table", exact: true }).click();
assert.equal(await shortMobile.getByRole("region", { name: "Patient table", exact: true }).isVisible(), true, "All rows must remain reachable in the scrolling copy panel");
await capture(shortMobile, "/tmp/ct-short-mobile-qa.png");
await shortMobile.close();

const reduced = await browser.newPage({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
const reducedInfo = await inspectPage(reduced, "reduced");
await reduced.locator(".loader").waitFor({ state: "hidden", timeout: 20000 }).catch(() => {});
reducedInfo.loaderVisible = await reduced.locator(".loader").evaluate((element) => getComputedStyle(element).visibility);
await reduced.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.25));
await reduced.waitForTimeout(500);
const reducedScene = await reduced.locator(".nav-status span").first().textContent();
await reduced.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await reduced.getByRole("button", { name: "X-ray source", exact: true }).click();
assert.equal(await reduced.getByRole("region", { name: "X-ray source", exact: true }).isVisible(), true);
await capture(reduced, "/tmp/ct-reduced-focus-qa.png");

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
