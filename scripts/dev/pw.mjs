/**
 * Developer helper for automated browser checks (not part of the app).
 * Uses playwright-core with an already-installed Chromium.
 *
 *   import { launch } from './scripts/dev/pw.mjs';
 *   const browser = await launch();
 *   const page = await browser.newPage({ viewport: { width: 375, height: 740 } });
 *
 * Set CHROME_PATH to use another Chromium/Chrome binary.
 */
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const CANDIDATES = [
  process.env.CHROME_PATH,
  join(homedir(), '.cache/ms-playwright/chromium-1228/chrome-linux64/chrome'),
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
].filter(Boolean);

export async function launch(opts = {}) {
  const executablePath = CANDIDATES.find((p) => existsSync(p));
  if (!executablePath) throw new Error('No Chromium found. Set CHROME_PATH.');
  return chromium.launch({ executablePath, args: ['--no-sandbox'], ...opts });
}
