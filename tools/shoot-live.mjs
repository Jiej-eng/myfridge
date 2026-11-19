/**
 * Verifies the deployed build on GitHub Pages.
 *
 * Usage: node tools/shoot-live.mjs
 * Captures docs/shots/08-deployed.png and reports whether the service worker
 * registers on the live HTTPS URL (i.e. the site is installable as a PWA).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SITE = 'https://jiej-eng.github.io/myfridge/';
const OUT = 'docs/shots';
const PORT = 9334;

fs.mkdirSync(OUT, { recursive: true });

const profile = path.join(os.tmpdir(), `myfridge-live-${Date.now()}`);
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
    await wait(500);
  }
  throw new Error('Edge DevTools endpoint never came up');
}

await waitForDevtools();
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${PORT}` });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(`${SITE}?demo=1`, { waitUntil: 'networkidle0' });
await wait(1200);

const report = await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.getRegistration().catch(() => null);
  return {
    title: document.title,
    itemCards: document.querySelectorAll('.item-card').length,
    swScope: reg ? reg.scope : null,
    controlled: !!navigator.serviceWorker.controller
  };
});
console.log(JSON.stringify(report, null, 2));

await page.screenshot({ path: `${OUT}/08-deployed.png` });
console.log('shot docs/shots/08-deployed.png');

await browser.disconnect();
edge.kill();
