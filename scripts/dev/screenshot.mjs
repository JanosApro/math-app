/**
 * Screenshot a page of the running dev server.
 *   node scripts/dev/screenshot.mjs "http://localhost:5173/#/dev/gallery" out.png [width=375] [--dark] [--full]
 */
import { launch } from './pw.mjs';

const [url, out, w] = process.argv.slice(2);
const dark = process.argv.includes('--dark');
const full = process.argv.includes('--full');
const browser = await launch();
const page = await browser.newPage({ viewport: { width: Number(w) || 375, height: 760 }, colorScheme: dark ? 'dark' : 'light', deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE ERROR:', m.text()));
await page.goto(url);
await page.waitForTimeout(800);
await page.screenshot({ path: out, fullPage: full });
await browser.close();
console.log('saved', out);
