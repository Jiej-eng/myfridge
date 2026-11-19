/**
 * Captures the screenshots used in the Part A report.
 *
 * Usage:
 *   1. npm run build && npm run preview   (serves the app on :4173)
 *   2. node tools/shoot.mjs
 *
 * Edge is started in headless mode with a throwaway profile and puppeteer
 * attaches to it over the DevTools protocol, which gives exact CSS pixel
 * viewports no matter what display scaling Windows uses.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:4173';
const OUT = 'docs/shots';
const PORT = 9333;

fs.mkdirSync(OUT, { recursive: true });

const PHONE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const DESKTOP = { width: 1280, height: 900, deviceScaleFactor: 1.5 };

const profile = path.join(os.tmpdir(), `myfridge-shots-${Date.now()}`);
const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`
  ],
  { stdio: 'ignore', detached: false }
);

async function waitForDevtools() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (response.ok) return;
    } catch {
      /* not listening yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('Edge DevTools endpoint never came up');
}

await waitForDevtools();
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${PORT}` });

async function shot(name, viewport, { url = '/?demo=1', full = false } = {}, interact) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  // The app registers a service worker; bypass it so the screenshot always
  // reflects the bundle that was just built rather than a precached copy.
  await page.setBypassServiceWorker(true).catch(() => {});
  const cdp = await page.createCDPSession();
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.goto(BASE + url, { waitUntil: 'networkidle0' });
  await wait(500);
  if (interact) await interact(page);
  await wait(300);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  console.log('shot', name, await page.evaluate(() => `${innerWidth}x${innerHeight}`));
  await page.close();
}

const pause = (page, ms = 250) => wait(ms);

// 1. Home screen on a phone
await shot('01-mobile-home', PHONE);

// 2. Filtered view: "Use soon" tab + a search term
await shot('02-mobile-filter', PHONE, {}, async (page) => {
  await page.click('.status-tab:nth-child(2)');
  await page.type('.search-field input', 'spin');
  await pause(page);
});

// 3. Create form, filled in
await shot('03-mobile-form', PHONE, {}, async (page) => {
  await page.click('.fab');
  await pause(page, 400);
  await page.type('.field input[type=text]', 'Cheddar cheese');
  await page.evaluate(() => {
    // React tracks the previous value, so set it through the native setter
    // before dispatching an input event, otherwise the controlled input snaps back.
    const date = document.querySelector('input[type=date]');
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setValue.call(date, '2026-12-02');
    date.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.type('textarea', 'Half used for toast');
  await pause(page);
});

// 4. Delete confirmation dialog
await shot('04-mobile-confirm', PHONE, {}, async (page) => {
  await page.click('.item-card .icon-button--danger');
  await pause(page, 400);
});

// 5. Desktop layout (three-column grid)
await shot('05-desktop-home', DESKTOP, { full: true });

// 5b. Desktop viewport (single screen, used on the UI/UX slide)
await shot('07-desktop-view', DESKTOP);

// 6. Empty state
await shot('06-mobile-empty', PHONE, {}, async (page) => {
  await page.evaluate(() => window.localStorage.clear());
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
  await pause(page);
});

await browser.disconnect();
edge.kill();
console.log('done');

